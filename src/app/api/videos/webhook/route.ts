import { mux } from "@/lib/mux";
import { env } from "@/env";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { headers } from "next/headers";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetDeletedWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

export const POST = async (request: Request) => {
  const headersPayload = await headers();
  const muxSignature = headersPayload.get("mux-signature");

  if (!muxSignature) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  mux.webhooks.verifySignature(
    body,
    { "mux-signature": muxSignature },
    env.MUX_WEBHOOK_SECRET
  );

  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) return new Response("No upload id", { status: 400 });

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxUploadId: data.upload_id,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];
      const playback_id = data.playback_ids?.[0]?.id;

      if (!data.upload_id || !playback_id)
        return new Response("No upload id or playback id", { status: 400 });

      const tempThumbnail = `https://image.mux.com/${playback_id}/thumbnail.jpg`;
      const tempPreview = `https://image.mux.com/${playback_id}/animated.gif`;

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const utapi = new UTApi();
      const [uploadedThumbnail, uploadedPreview] =
        await utapi.uploadFilesFromUrl([tempThumbnail, tempPreview]);

      if (!uploadedThumbnail.data || !uploadedPreview.data) {
        return new Response("Failed to upload thumbnail or preview", {
          status: 500,
        });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } =
        uploadedThumbnail.data;
      const { key: previewKey, ufsUrl: previewUrl } = uploadedPreview.data;

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxAssetId: data.id,
          muxPlaybackId: playback_id,
          muxThumbnail: thumbnailUrl,
          previewUrl: previewUrl,
          thumbnailKey,
          previewKey,
          duration,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.errored": {
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];

      if (!data.upload_id) return new Response("No upload id", { status: 400 });

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
        })
        .where(eq(videos.muxUploadId, data.upload_id));
      break;
    }
    case "video.asset.deleted": {
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

      if (!data.upload_id) return new Response("No upload id", { status: 400 });

      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
      break;
    }

    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string; // Type is not correct in the Mux SDK
      };

      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;
      if (!assetId || !trackId)
        return new Response("No asset id or track id", { status: 400 });

      await db
        .update(videos)
        .set({ muxTrackId: trackId, muxTrackStatus: status })
        .where(eq(videos.muxAssetId, assetId));
      break;
    }
  }

  return new Response("OK", { status: 200 });
};
