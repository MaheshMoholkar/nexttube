import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting. Here is the video transcript: `;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { videoId, userId } = input;

  if (!videoId) {
    throw new Error("videoId is required but was not provided");
  }
  if (!userId) {
    throw new Error("userId is required but was not provided");
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
    throw new Error("Failed to generate title");
  }

  const result = await response.json();
  const generatedTitle = result.response;

  const filteredTitle = generatedTitle.split("\n").pop()?.replace(/['"]/g, "");

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        title: filteredTitle,
      })
      .where(
        and(
          eq(videos.id, existingVideo.id),
          eq(videos.userId, existingVideo.userId)
        )
      );
  });

  await context.run("initial-setup", () => {
    console.log("Initial setup");
  });

  await context.run("second-step", async () => {
    console.log("Second step");
  });
});
