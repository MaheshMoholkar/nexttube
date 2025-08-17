import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

const THUMBNAIL_SYSTEM_PROMPT = `You are a thumbnail generator. You will be given a prompt and you will need to generate a thumbnail for a YouTube video. Prompt: `;

export const { POST } = serve(async (context) => {
  const utapi = new UTApi();
  const input = context.requestPayload as InputType;
  const { videoId, userId, prompt } = input;

  if (!videoId) {
    throw new Error("videoId is required but was not provided");
  }
  if (!userId) {
    throw new Error("userId is required but was not provided");
  }

  // Check if the AI API is available
  const apiHealthCheck = await context.run("check-api-health", async () => {
    try {
      const healthResponse = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return healthResponse.ok;
    } catch (error) {
      console.warn("AI API is not available:", error);
      return false;
    }
  });

  if (!apiHealthCheck) {
    console.log("AI API is not available, skipping thumbnail generation");
    return;
  }

  const existingVideo = await context.run("get-video", async () => {
    const [video] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

    if (!video) throw new Error("Video not found");
    return video;
  });

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-r1:1.5b",
      prompt: THUMBNAIL_SYSTEM_PROMPT + prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate thumbnail");
  }

  const result = await response.json();

  await context.run("cleanup-thumbnail", async () => {
    if (existingVideo.thumbnailKey) {
      await utapi.deleteFiles(existingVideo.thumbnailKey);
      await db
        .update(videos)
        .set({ thumbnailKey: null, muxThumbnail: null })
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));
    }
  });

  const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
    const { data } = await utapi.uploadFiles(result);
    if (!data) throw new Error("Failed to upload thumbnail");
    return data;
  });

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: uploadedThumbnail.key,
        muxThumbnail: uploadedThumbnail.ufsUrl,
      })
      .where(
        and(
          eq(videos.id, existingVideo.id),
          eq(videos.userId, existingVideo.userId)
        )
      );
  });
});
