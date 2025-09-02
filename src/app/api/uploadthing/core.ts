import { db } from "@/db";
import { user, videos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  bannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({ headers: await headers() });

      if (!session?.user.id) throw new UploadThingError("Unauthorized");

      const [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id));

      if (!existingUser) throw new UploadThingError("Unauthorized");

      if (existingUser.bannerKey) {
        const utapi = new UTApi();
        const deleted = await utapi.deleteFiles([existingUser.bannerKey]);
        console.log(deleted);

        await db
          .update(user)
          .set({ bannerKey: null, bannerUrl: null })
          .where(eq(user.id, existingUser.id));
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(user)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(eq(user.id, metadata.userId));
      return { uploadedBy: metadata.userId };
    }),
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string(),
      })
    )
    .middleware(async ({ input }) => {
      const session = await auth.api.getSession({ headers: await headers() });

      if (!session?.user.id) throw new UploadThingError("Unauthorized");

      const [video] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(
          and(eq(videos.id, input.videoId), eq(videos.userId, session.user.id))
        )
        .limit(1);

      if (!video) throw new UploadThingError("Video not found");

      if (video.thumbnailKey) {
        const utapi = new UTApi();
        const deleted = await utapi.deleteFiles([video.thumbnailKey]);
        console.log(deleted);

        await db
          .update(videos)
          .set({ thumbnailKey: null, muxThumbnail: null })
          .where(
            and(
              eq(videos.id, input.videoId),
              eq(videos.userId, session.user.id)
            )
          );
      }

      return { userId: session.user.id, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({
          muxThumbnail: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.userId)
          )
        );
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
