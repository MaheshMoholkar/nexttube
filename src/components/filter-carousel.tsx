"use client";

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

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
  return (
    <div className="relative w-full">
      {/* Left fade */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none",
          value && "hidden"
        )}
      ></div>
      {/* Right fade */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none",
          value && "hidden"
        )}
      ></div>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full px-12 select-none"
      >
        <CarouselContent className="-ml-3">
          <CarouselItem className="pl-3 basis-auto">
            <Badge
              variant={value === null ? "default" : "secondary"}
              className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm"
              onClick={() => onSelect?.(null)}
            >
              All
            </Badge>
          </CarouselItem>
          {!isLoading &&
            data.map((item) => (
              <CarouselItem key={item.value} className="pl-3 basis-auto">
                <Badge
                  variant={value === item.value ? "default" : "secondary"}
                  className="cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm"
                  onClick={() => onSelect?.(item.value)}
                >
                  {item.label}
                </Badge>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 z-20" />
        <CarouselNext className="right-0 z-20" />
      </Carousel>
    </div>
  );
};
