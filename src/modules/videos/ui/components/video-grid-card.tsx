import { VideoGetManyOutput } from "@/modules/videos/types";

import Link from "next/link";
import { VideoThumbnail } from "./video-thumbnail";

import { VideoInfo } from "./video-info";

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoRowCardSkeleton = () => {
  return <div>Skeleton</div>;
};

export function VideoGridCard({ data, onRemove }: VideoGridCardProps) {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <Link href={`/videos/${data.id}`}>
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
