import { DEFAULT_LIMIT } from "@/constants";
import SubscriptionsView from "@/modules/subscriptions/ui/views/subscription-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

async function Page() {
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <SubscriptionsView />
    </HydrateClient>
  );
}

export default Page;
