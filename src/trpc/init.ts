import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return {
    user: session?.user,
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
  const user = opts.ctx.user;

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { success } = await rateLimit.limit(user.id);

  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  }

  return opts.next();
});
