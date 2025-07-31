import { mux } from "@/lib/mux";
import { env } from "@/env";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { headers } from "next/headers";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetErroredWebhookEvent;

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

      const thumbnail = `https://image.mux.com/${playback_id}/thumbnail.jpg`;
      const previewUrl = `https://image.mux.com/${playback_id}/animated.gif`;

      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxAssetId: data.id,
          muxPlaybackId: playback_id,
          muxThumbnail: thumbnail,
          previewUrl,
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
  }

  return new Response("OK", { status: 200 });
};
