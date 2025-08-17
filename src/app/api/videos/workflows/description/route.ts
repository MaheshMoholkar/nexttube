import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused description for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the description is 3-8 words long and no more than 100 characters.
- Use markdown formatting for the description.
- ONLY return the description as plain text. Do not add quotes or any additional formatting. Here is the video transcript: `;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { videoId, userId } = input;

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
    console.log("AI API is not available, skipping description generation");
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

  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${existingVideo.muxPlaybackId}/text/${existingVideo.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    const text = await response.text();
    return text;
  });

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-r1:1.5b",
      prompt: TITLE_SYSTEM_PROMPT + transcript,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate description");
  }

  const result = await response.json();
  const generatedDescription = result.response;

  const filteredDescription = generatedDescription
    .split("</think>")
    .pop()
    ?.replace(/['"]/g, "")
    .trim();

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        description: filteredDescription,
      })
      .where(
        and(
          eq(videos.id, existingVideo.id),
          eq(videos.userId, existingVideo.userId)
        )
      );
  });
});
