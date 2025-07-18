import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return {
    userId: session?.user.id,
  };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const userId = opts.ctx.userId;

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userData) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      user: userData,
    },
  });
});
