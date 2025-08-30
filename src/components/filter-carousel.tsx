"use client";

import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useRef } from "react";

interface Props {
  value?: string | null;
  isLoading?: boolean;
  onSelect?: (value: string | null) => void;
  data: {
    value: string;
    label: string;
  }[];
}

export const FilterCarousel = ({ value, isLoading, onSelect, data }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="flex items-center w-full overflow-hidden max-w-full">
      {/* Fixed Left Arrow */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0"
        onClick={scrollLeft}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Scrollable Container - Only takes remaining space */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide select-none mx-2 flex-1 min-w-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Badge
          variant={!value ? "default" : "secondary"}
          className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm flex-shrink-0"
          onClick={() => onSelect?.(null)}
        >
          All
        </Badge>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 flex-shrink-0" />
            <Skeleton className="h-8 w-20 flex-shrink-0" />
            <Skeleton className="h-8 w-24 flex-shrink-0" />
            <Skeleton className="h-8 w-18 flex-shrink-0" />
            <Skeleton className="h-8 w-22 flex-shrink-0" />
            <Skeleton className="h-8 w-20 flex-shrink-0" />
            <Skeleton className="h-8 w-16 flex-shrink-0" />
            <Skeleton className="h-8 w-24 flex-shrink-0" />
            <Skeleton className="h-8 w-19 flex-shrink-0" />
            <Skeleton className="h-8 w-21 flex-shrink-0" />
            <Skeleton className="h-8 w-17 flex-shrink-0" />
            <Skeleton className="h-8 w-23 flex-shrink-0" />
            <Skeleton className="h-8 w-15 flex-shrink-0" />
            <Skeleton className="h-8 w-25 flex-shrink-0" />
            <Skeleton className="h-8 w-18 flex-shrink-0" />
            <Skeleton className="h-8 w-20 flex-shrink-0" />
            <Skeleton className="h-8 w-22 flex-shrink-0" />
            <Skeleton className="h-8 w-16 flex-shrink-0" />
            <Skeleton className="h-8 w-24 flex-shrink-0" />
            <Skeleton className="h-8 w-19 flex-shrink-0" />
          </>
        ) : (
          data.map((item) => (
            <Badge
              key={item.value}
              variant={value === item.value ? "default" : "secondary"}
              className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm flex-shrink-0"
              onClick={() => onSelect?.(item.value)}
            >
              {item.label}
            </Badge>
          ))
        )}
      </div>

      {/* Fixed Right Arrow */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0"
        onClick={scrollRight}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
