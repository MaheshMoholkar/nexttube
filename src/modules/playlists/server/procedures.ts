import { db } from "@/db";
import {
  playlists,
  user,
  playlistVideos,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

import { and, desc, eq, getTableColumns, or, lt, sql } from "drizzle-orm";

import z from "zod";
import { TRPCError } from "@trpc/server";

export const playlistsRouter = createTRPCRouter({
  remove: protectedProcedure
    .input(z.object({ playlistId: z.uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { playlistId } = input;
      const { userId } = ctx;

      const [deletedPlaylist] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
        .returning();

      if (!deletedPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedPlaylist;
    }),
  getOne: protectedProcedure
    .input(z.object({ playlistId: z.uuid() }))
    .query(async ({ input, ctx }) => {
      const { playlistId } = input;
      const { userId } = ctx;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingPlaylist;
    }),
  getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.uuid(),
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
      const { playlistId, cursor, limit } = input;
      const { userId } = ctx;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const videosFromPlaylist = db.$with("videos_from_playlist").as(
        db
          .select({
            videoId: playlistVideos.videoId,
            updatedAt: playlistVideos.updatedAt,
          })
          .from(playlistVideos)
          .where(eq(playlistVideos.playlistId, playlistId))
      );

      const data = await db
        .with(videosFromPlaylist)
        .select({
          ...getTableColumns(videos),
          user: user,
          updatedAt: videosFromPlaylist.updatedAt,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(user, eq(videos.userId, user.id))
        .innerJoin(
          videosFromPlaylist,
          eq(videosFromPlaylist.videoId, videos.id)
        )
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.uuid(),
        videoId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { userId } = ctx;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, playlistId));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingPlaylist.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (!existingPlaylistVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      return deletedPlaylistVideo;
    }),
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.uuid(),
        videoId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input;
      const { userId } = ctx;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(eq(playlists.id, playlistId));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingPlaylist.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (existingPlaylistVideo) {
        throw new TRPCError({ code: "CONFLICT" });
      }

      const [createdPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({
          playlistId,
          videoId,
        })
        .returning();

      return createdPlaylistVideo;
    }),
  getManyForVideo: protectedProcedure
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
    .query(async ({ input, ctx }) => {
      const { videoId, cursor, limit } = input;
      const { userId } = ctx;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: user,
          containsVideo: videoId
            ? sql<boolean>`(SELECT EXISTS(SELECT 1 FROM ${playlistVideos} pv WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId}))`
            : sql<boolean>`false`,
        })
        .from(playlists)
        .innerJoin(user, eq(playlists.userId, user.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
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
      const { cursor, limit } = input;
      const { userId } = ctx;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: user,
          muxThumbnail: sql<string | null>`(
            SELECT ${videos.muxThumbnail}
            FROM ${playlistVideos}
            INNER JOIN ${videos} ON ${videos.id} = ${playlistVideos.videoId}
            WHERE ${playlistVideos.playlistId} = ${playlists.id}
            ORDER BY ${playlistVideos.updatedAt} DESC
            LIMIT 1
          )`,
        })
        .from(playlists)
        .innerJoin(user, eq(playlists.userId, user.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      const { userId } = ctx;

      const [createdPlaylist] = await db
        .insert(playlists)
        .values({
          userId,
          name,
        })
        .returning();

      if (!createdPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return createdPlaylist;
    }),
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.uuid(),
            likedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { userId } = ctx;

      const viewerVideoReactions = db.$with("viewer_video_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            likedAt: videoReactions.updatedAt,
          })
          .from(videoReactions)
          .where(eq(videoReactions.userId, userId))
      );

      const data = await db
        .with(viewerVideoReactions)
        .select({
          ...getTableColumns(videos),
          user: user,
          likedAt: viewerVideoReactions.likedAt,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(user, eq(videos.userId, user.id))
        .innerJoin(
          viewerVideoReactions,
          eq(viewerVideoReactions.videoId, videos.id)
        )
        .where(
          and(
            cursor
              ? or(
                  lt(viewerVideoReactions.likedAt, cursor.likedAt),
                  and(
                    eq(viewerVideoReactions.likedAt, cursor.likedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, likedAt: lastItem.likedAt }
        : null;

      return { items, nextCursor };
    }),
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.uuid(),
            viewedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { userId } = ctx;

      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViews.videoId,
            viewedAt: videoViews.updatedAt,
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId))
      );

      const data = await db
        .with(viewerVideoViews)
        .select({
          ...getTableColumns(videos),
          user: user,
          viewedAt: viewerVideoViews.viewedAt,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ),
        })
        .from(videos)
        .innerJoin(user, eq(videos.userId, user.id))
        .innerJoin(viewerVideoViews, eq(viewerVideoViews.videoId, videos.id))
        .where(
          and(
            eq(videos.visibility, "public"),
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewedAt: lastItem.viewedAt }
        : null;

      return { items, nextCursor };
    }),
});
