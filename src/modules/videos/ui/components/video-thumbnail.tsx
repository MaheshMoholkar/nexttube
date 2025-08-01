import Image from "next/image";
import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoThumbnailProps {
  thumbnail?: string | null;
  previewUrl?: string | null;
  title: string;
  duration: number;
}

export const VideoThumbnail = ({
  thumbnail,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={thumbnail || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          className="w-full h-full object-cover group-hover:opacity-0"
        />
        <Image
          src={previewUrl || THUMBNAIL_FALLBACK}
          alt={title}
          fill
          unoptimized={!!previewUrl}
          className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
