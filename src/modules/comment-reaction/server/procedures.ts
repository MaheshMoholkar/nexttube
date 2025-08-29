import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const commentReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const { userId } = ctx;

      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.type, "like")
          )
        );

      if (existingReaction) {
        const [deletedReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId),
              eq(commentReactions.type, "like")
            )
          )
          .returning();

        return deletedReaction;
      }

      const [createdReaction] = await db
        .insert(commentReactions)
        .values({ commentId, userId, type: "like" })
        .onConflictDoUpdate({
          target: [commentReactions.commentId, commentReactions.userId],
          set: {
            type: "like",
          },
        })
        .returning();

      return createdReaction;
    }),

  dislike: protectedProcedure
    .input(z.object({ commentId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { commentId } = input;
      const { userId } = ctx;

      const [existingReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.type, "dislike")
          )
        );

      if (existingReaction) {
        const [deletedReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId),
              eq(commentReactions.type, "dislike")
            )
          )
          .returning();

        return deletedReaction;
      }

      const [createdReaction] = await db
        .insert(commentReactions)
        .values({ commentId, userId, type: "dislike" })
        .onConflictDoUpdate({
          target: [commentReactions.commentId, commentReactions.userId],
          set: {
            type: "dislike",
          },
        })
        .returning();

      return createdReaction;
    }),
});
