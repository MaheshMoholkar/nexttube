import { db } from "@/db";
import { commentReactions, user, videoComments } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  eq,
  getTableColumns,
  desc,
  lt,
  and,
  or,
  inArray,
  isNull,
  count,
  isNotNull,
} from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const videoCommentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.uuid(),
        content: z.string(),
        parentId: z.uuid().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId, content, parentId } = input;
      const { userId } = ctx;

      const [existingComment] = await db
        .select()
        .from(videoComments)
        .where(inArray(videoComments.id, parentId ? [parentId] : []));

      if (!existingComment && parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      if (existingComment?.parentId && parentId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }

      const [createdComment] = await db
        .insert(videoComments)
        .values({ videoId, userId, content, parentId })
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
        parentId: z.uuid().nullish(),
        cursor: z
          .object({
            id: z.uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { videoId, parentId, cursor, limit } = input;
      const { userId } = ctx;

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const replies = db.$with("replies").as(
        db
          .select({
            parentId: videoComments.parentId,
            count: count(videoComments.id).as("count"),
          })
          .from(videoComments)
          .where(isNotNull(videoComments.parentId))
          .groupBy(videoComments.parentId)
      );

      const comments = await db
        .with(viewerReactions, replies)
        .select({
          ...getTableColumns(videoComments),
          user: user,
          totalCount: db.$count(
            videoComments,
            eq(videoComments.videoId, videoId)
          ),
          repliesCount: replies.count,
          likeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.type, "like"),
              eq(commentReactions.commentId, videoComments.id)
            )
          ),
          dislikeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.type, "dislike"),
              eq(commentReactions.commentId, videoComments.id)
            )
          ),
          viewerReaction: viewerReactions.type,
        })
        .from(videoComments)
        .where(
          and(
            eq(videoComments.videoId, videoId),
            parentId
              ? eq(videoComments.parentId, parentId)
              : isNull(videoComments.parentId),
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
        .innerJoin(user, eq(videoComments.userId, user.id))
        .leftJoin(
          viewerReactions,
          eq(viewerReactions.commentId, videoComments.id)
        )
        .leftJoin(replies, eq(videoComments.id, replies.parentId))
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
