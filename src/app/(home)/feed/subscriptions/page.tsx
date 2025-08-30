import { HydrateClient, trpc } from "@/trpc/server";
import { DEFAULT_LIMIT } from "@/constants";
import React from "react";
import SubscriptionView from "@/modules/home/ui/views/subscriptions-view";

export const dynamic = "force-dynamic";

function Page() {
  void trpc.videos.getManySubscribed.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <SubscriptionView />
    </HydrateClient>
  );
}

export default Page;
