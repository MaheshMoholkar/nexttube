import { THUMBNAIL_FALLBACK } from "@/constants";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId?: string;
  muxThumbnail?: string;
  autoplay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
  return <div className="aspect-video bg-black rounded-xl" />;
};

export const VideoPlayer = ({
  playbackId,
  muxThumbnail,
  autoplay,
  onPlay,
}: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={muxThumbnail || THUMBNAIL_FALLBACK}
      playerInitTime={0}
      autoPlay={autoplay}
      thumbnailTime={0}
      className="w-full h-full object-contain"
      accentColor="#FF2056"
      onPlay={onPlay}
    />
  );
};
