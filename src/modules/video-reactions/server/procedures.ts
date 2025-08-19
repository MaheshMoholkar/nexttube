import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const videoReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { userId } = ctx;

      const [existingReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        );

      if (existingReaction) {
        const [deletedReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, "like")
            )
          )
          .returning();

        return deletedReaction;
      }

      const [createdReaction] = await db
        .insert(videoReactions)
        .values({ videoId, userId, type: "like" })
        .onConflictDoUpdate({
          target: [videoReactions.videoId, videoReactions.userId],
          set: {
            type: "like",
          },
        })
        .returning();

      return createdReaction;
    }),

  dislike: protectedProcedure
    .input(z.object({ videoId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId } = input;
      const { userId } = ctx;

      const [existingReaction] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "dislike")
          )
        );

      if (existingReaction) {
        const [deletedReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId),
              eq(videoReactions.type, "dislike")
            )
          )
          .returning();

        return deletedReaction;
      }

      const [createdReaction] = await db
        .insert(videoReactions)
        .values({ videoId, userId, type: "dislike" })
        .onConflictDoUpdate({
          target: [videoReactions.videoId, videoReactions.userId],
          set: {
            type: "dislike",
          },
        })
        .returning();

      return createdReaction;
    }),
});
