"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function HistoryVideosSection() {
  return (
    <Suspense fallback={<HistoryVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <HistoryVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
}

const HistoryVideosSectionSuspense = () => {
  const [playlists, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {playlists.pages
          .flatMap((page) => page.items)
          .map((playlist) => (
            <VideoGridCard key={playlist.id} data={playlist} />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {playlists.pages
          .flatMap((page) => page.items)
          .map((playlist) => (
            <VideoRowCard key={playlist.id} data={playlist} size="compact" />
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

const HistoryVideosSectionSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
    </>
  );
};

export default HistoryVideosSection;
