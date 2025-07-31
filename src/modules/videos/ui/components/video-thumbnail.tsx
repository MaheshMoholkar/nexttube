import Image from "next/image";

interface VideoThumbnailProps {
  thumbnail?: string;
}

export const VideoThumbnail = ({ thumbnail }: VideoThumbnailProps) => {
  return (
    <div className="relative">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt="Video thumbnail"
          fill
          className="size-full object-cover"
        />
      </div>
    </div>
  );
};
