import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const subscriptionsRouter = createTRPCRouter({
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
