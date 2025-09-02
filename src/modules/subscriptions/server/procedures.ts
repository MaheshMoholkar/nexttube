import { db } from "@/db";
import { subscriptions, user } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";

import z from "zod";

export const subscriptionsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.uuid(),
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
          ...getTableColumns(subscriptions),
          user: {
            ...getTableColumns(user),
            subscriptionCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, user.id)
            ),
          },
        })
        .from(subscriptions)
        .innerJoin(user, eq(subscriptions.creatorId, user.id))
        .where(
          and(
            eq(subscriptions.viewerId, userId),
            cursor
              ? or(
                  lt(subscriptions.updatedAt, cursor.updatedAt),
                  and(
                    eq(subscriptions.updatedAt, cursor.updatedAt),
                    lt(subscriptions.creatorId, cursor.creatorId)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { creatorId: lastItem.creatorId, updatedAt: lastItem.updatedAt }
        : null;

      return { items, nextCursor };
    }),
  create: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
      const [subscription] = await db
        .insert(subscriptions)
        .values({ viewerId: ctx.userId, creatorId: userId })
        .returning();

      return subscription;
    }),

  remove: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      if (userId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
      const [deletedSubscription] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, ctx.userId),
            eq(subscriptions.creatorId, userId)
          )
        )
        .returning();

      return deletedSubscription;
    }),
});
