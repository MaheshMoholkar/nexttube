import MuxPlayer from "@mux/mux-player-react";
import { THUMBNAIL_FALLBACK } from "../../constants";

interface VideoPlayerProps {
  playbackId?: string;
  muxThumbnail?: string;
  autoplay?: boolean;
  onPlay?: () => void;
}

export const VideoPlayerSkeleton = () => {
  return (
    <div className="w-full xs:w-[400px] lg:w-[800px] 2xl:w-[1100px] h-[225px] xs:h-[225px] lg:h-[450px] 2xl:h-[642px] bg-black rounded-xl" />
  );
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
