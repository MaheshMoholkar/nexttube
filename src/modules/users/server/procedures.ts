import { db } from "@/db";
import { subscriptions, user, videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import z from "zod";
export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx }) => {
      const { userId } = ctx;

      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            viewerId: subscriptions.viewerId,
            creatorId: subscriptions.creatorId,
          })
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      const [existingUser] = await db
        .with(viewerSubscriptions)
        .select({
          ...getTableColumns(user),
          viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
            Boolean
          ),
          videoCount: db.$count(videos, eq(videos.userId, user.id)),
          subscriptionCount: db.$count(
            subscriptions,
            eq(subscriptions.creatorId, user.id)
          ),
        })
        .from(user)
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, user.id)
        )
        .where(eq(user.id, userId));

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return existingUser;
    }),
});
