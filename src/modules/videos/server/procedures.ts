import { db } from "@/db";
import {
  subscriptions,
  user,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { mux } from "@/lib/mux";
import { and, desc, eq, getTableColumns, isNotNull, or, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { UTApi } from "uploadthing/server";
import { workflow } from "@/lib/qstash";
import { env } from "@/env";

export const videosRouter = createTRPCRouter({
  getManySubscribed: protectedProcedure
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
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { userId } = ctx;

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            userId: subscriptions.creatorId,
          })
          .from(subscriptions)
          .where(eq(subscriptions.viewerId, userId))
      );

      const data = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: user,
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
          viewerSubscriptions,
          eq(videos.userId, viewerSubscriptions.userId)
        )
        .where(
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
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.uuid().nullish(),
        userId: z.string().nullish(),
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
      const { cursor, limit, categoryId, userId } = input;
      const data = await db
        .select({
          ...getTableColumns(videos),
          user: user,
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
        .where(
          and(
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            userId ? eq(videos.userId, userId) : undefined,
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
  getOne: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { userId } = ctx;

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, id),
              eq(videoReactions.userId, userId)
            )
          )
      );

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            viewerId: subscriptions.viewerId,
            creatorId: subscriptions.creatorId,
          })
          .from(subscriptions)
          .where(eq(subscriptions.viewerId, userId))
      );

      const [video] = await db
        .with(viewerReactions, viewerSubscriptions)
        .select({
          ...getTableColumns(videos),
          user: {
            ...getTableColumns(user),
            subscriptionCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, user.id)
            ),
            viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ),
          },
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
          viewerReaction: viewerReactions.type,
        })
        .from(videos)
        .innerJoin(user, eq(videos.userId, user.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, user.id)
        )
        .where(eq(videos.id, id));

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return video;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policies: ["public"],
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
        static_renditions: [
          {
            resolution: "highest",
          },
        ],
      },
      cors_origin: "*", // TODO: change to the actual origin
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "Untitled",
        muxStatus: "uploading",
        muxUploadId: upload.id,
      })
      .returning();

    return { video, url: upload.url };
  }),
  generateTitle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { workflowRunId } = await workflow.trigger({
        url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      });

      return workflowRunId;
    }),
  generateDescription: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { workflowRunId } = await workflow.trigger({
        url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.id },
      });

      return workflowRunId;
    }),
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string(), prompt: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { workflowRunId } = await workflow.trigger({
        url: `${env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.id, prompt: input.prompt },
      });

      return workflowRunId;
    }),
  revalidate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (!existingVideo.muxUploadId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const upload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      );

      if (!upload || !upload.asset_id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const asset = await mux.video.assets.retrieve(upload.asset_id);

      if (!asset) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const playbackId = asset.playback_ids?.[0].id;
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: playbackId,
          muxAssetId: asset.id,
          duration,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .limit(1);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      if (video.thumbnailKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles([video.thumbnailKey]);
        await db
          .update(videos)
          .set({ thumbnailKey: null, muxThumbnail: null })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }

      const tempThumbnail = `https://image.mux.com/${video.muxPlaybackId}/thumbnail.jpg`;

      const utapi = new UTApi();
      const { data: uploadedThumbnail } =
        await utapi.uploadFilesFromUrl(tempThumbnail);

      if (!uploadedThumbnail) {
        return new Response("Failed to upload thumbnail or preview", {
          status: 500,
        });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail;

      const [updatedVideo] = await db
        .update(videos)
        .set({ muxThumbnail: thumbnailUrl, thumbnailKey })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo;
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const [video] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      if (video.muxAssetId) {
        await mux.video.assets.delete(video.muxAssetId);
      }

      return video;
    }),
  update: protectedProcedure
    .input(videoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Video ID is required",
        });
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video not found",
        });
      }

      return updatedVideo;
    }),
});
