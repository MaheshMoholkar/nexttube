import { VideoGetManyOutput } from "@/modules/videos/types";

import Link from "next/link";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

import { VideoInfo, VideoInfoSkeleton } from "./video-info";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

export function VideoGridCard({ data, onRemove }: VideoGridCardProps) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link prefetch href={`/videos/${data.id}`}>
        <VideoThumbnail
          thumbnail={data.muxThumbnail}
          previewUrl={data.previewUrl}
          duration={data.duration}
          title={data.title}
        />
      </Link>
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
}
