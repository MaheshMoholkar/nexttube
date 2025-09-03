import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/constants";
import React, { useMemo } from "react";
import Image from "next/image";
import { ListIcon, PlayIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

function PlaylistThumbnail({
  imageUrl,
  title,
  videoCount,
  className,
}: {
  imageUrl?: string;
  title: string;
  videoCount: number;
  className?: string;
}) {
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", { notation: "compact" }).format(videoCount);
  }, [videoCount]);

  return (
    <div className={cn("relative pt-3", className)}>
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video " />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video " />

        <div className="relative overflow-hidden w-full rounded-xl aspect-video">
          <Image
            src={imageUrl || THUMBNAIL_FALLBACK}
            fill
            alt={title}
            className="size-full object-cover"
          />

          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 text-white fill-white" />
              <span className="text-white font-medium">Play All</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 px-1 py-0 5 rounded bg-black/80 text-white text-xs font-medium flex items-center gap-x-1">
        <ListIcon className="size-4" />
        {compactViews} videos
      </div>
    </div>
  );
}

export default PlaylistThumbnail;
