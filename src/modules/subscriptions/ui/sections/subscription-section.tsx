"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import SubscriptionItem, {
  SubscriptionItemSkeleton,
} from "../components/subscription-item";

function SubscriptionSection() {
  return (
    <Suspense fallback={<SubscriptionSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <SubscriptionSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

const SubscriptionSectionSuspense = () => {
  const utils = trpc.useUtils();
  const [subscriptions, query] =
    trpc.subscriptions.getMany.useSuspenseInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success(`Unsubscribed`);
      utils.subscriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: data.creatorId });
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });

  return (
    <>
      <div className="flex flex-col gap-4">
        {subscriptions.pages
          .flatMap((page) => page.items)
          .map((subscription) => (
            <Link
              prefetch
              href={`/users/${subscription.user.id}`}
              key={subscription.creatorId}
            >
              <SubscriptionItem
                name={subscription.user.name}
                imageUrl={subscription.user.image ?? "/placeholder.svg"}
                subscriberCount={subscription.user.subscriptionCount}
                onUnsubscribe={() =>
                  unsubscribe.mutate({ userId: subscription.creatorId })
                }
                disabled={unsubscribe.isPending}
              />
            </Link>
          ))}
      </div>
      <InfiniteScroll
        fetchNextPage={query.fetchNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        hasNextPage={query.hasNextPage}
      />
    </>
  );
};

const SubscriptionSectionSkeleton = () => {
  return (
    <>
      <div>
        <div className="flex-col gap-4">
          {Array.from({ length: 18 }).map((_, index) => (
            <SubscriptionItemSkeleton key={index} />
          ))}
        </div>
        <div className="hidden flex-col gap-4 md:flex">
          {Array.from({ length: 18 }).map((_, index) => (
            <SubscriptionItemSkeleton key={index} />
          ))}
        </div>
      </div>
    </>
  );
};

export default SubscriptionSection;
