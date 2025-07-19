// import { rateLimit } from "@/lib/rate-limit";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  // const session = await auth.api.getSession({ headers: await headers() });
  return {
    userId: "xTflubc1z0ZHsbnU1ZvFfsC66k0jkxlM",
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

  // const { success } = await rateLimit.limit(user.id);

  // if (!success) {
  //   throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
  // }

  return opts.next();
});
