"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../components/video-row-card";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface SuggestionSectionProps {
  videoId: string;
  isManual?: boolean;
}

export const SuggestionSection = ({
  videoId,
  isManual,
}: SuggestionSectionProps) => {
  return (
    <Suspense fallback={<SuggestionSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <SuggestionSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};

const SuggestionSectionSkeleton = () => {
  return (
    <>
      <div className="hidden md:block space-y-3">
        {Array.from({ length: 8 }).map((_, index) => {
          return <VideoRowCardSkeleton key={index} size="compact" />;
        })}
      </div>
      <div className="block md:hidden space-y-3">
        {Array.from({ length: 8 }).map((_, index) => {
          return <VideoGridCardSkeleton key={index} />;
        })}
      </div>
    </>
  );
};

function SuggestionSectionSuspense({
  videoId,
  isManual,
}: SuggestionSectionProps) {
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId,
        limit: DEFAULT_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <>
      <div className="hidden md:block space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((suggestion) => (
            <VideoRowCard
              key={suggestion.id}
              data={suggestion}
              size="compact"
            />
          ))}
      </div>
      <div className="block md:hidden space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items)
          .map((suggestion) => (
            <VideoGridCard key={suggestion.id} data={suggestion} />
          ))}
      </div>
      <InfiniteScroll
        isManual={isManual}
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  );
}

export default SuggestionSection;
