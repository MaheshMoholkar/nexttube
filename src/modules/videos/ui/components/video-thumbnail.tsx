import Image from "next/image";

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
  console.log(previewUrl);
  return (
    <div className="relative group">
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={title}
          fill
          className="w-full h-full object-cover group-hover:opacity-0"
        />
        <Image
          src={previewUrl || "/placeholder.svg"}
          alt={title}
          fill
          unoptimized
          className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
        />
      </div>

      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {duration / 1000}s
      </div>
    </div>
  );
};
