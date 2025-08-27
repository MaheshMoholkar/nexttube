import { db } from "@/db";
import { user, videoComments } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq, getTableColumns, desc, lt, and, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const videoCommentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ videoId: z.uuid(), content: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId, content } = input;
      const { userId } = ctx;

      const [createdComment] = await db
        .insert(videoComments)
        .values({ videoId, userId, content })
        .returning();

      return createdComment;
    }),
  remove: protectedProcedure
    .input(z.object({ videoId: z.uuid(), commentId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { videoId, commentId } = input;
      const { userId } = ctx;

      const [deletedComment] = await db
        .delete(videoComments)
        .where(
          and(
            eq(videoComments.videoId, videoId),
            eq(videoComments.id, commentId),
            eq(videoComments.userId, userId)
          )
        )
        .returning();

      if (!deletedComment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        cursor: z
          .object({
            id: z.uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      const comments = await db
        .select({
          ...getTableColumns(videoComments),
          user: user,
          totalCount: db.$count(
            videoComments,
            eq(videoComments.videoId, videoId)
          ),
        })
        .from(videoComments)
        .leftJoin(user, eq(videoComments.userId, user.id))
        .where(
          and(
            eq(videoComments.videoId, videoId),
            cursor
              ? or(
                  lt(videoComments.updatedAt, cursor.updatedAt),
                  and(
                    eq(videoComments.updatedAt, cursor.updatedAt),
                    lt(videoComments.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videoComments.updatedAt), desc(videoComments.id))
        .limit(limit + 1);

      const hasMore = comments.length > limit;
      const items = hasMore ? comments.slice(0, -1) : comments;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return { items, nextCursor };
    }),
});
