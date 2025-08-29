"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard } from "../components/video-row-card";
import { VideoGridCard } from "../components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface SuggestionSectionProps {
  videoId: string;
  isManual?: boolean;
}

function SuggestionSection({ videoId, isManual }: SuggestionSectionProps) {
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
