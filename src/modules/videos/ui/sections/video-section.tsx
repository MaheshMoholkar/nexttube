"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPlayer } from "../components/video-player";
import VideoBanner from "../components/video-banner";
import VideoTopRow from "../components/video-top-row";

function VideoSection({ videoId }: { videoId: string }) {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
}

const VideoSectionSuspense = ({ videoId }: { videoId: string }) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  return (
    <>
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        <VideoPlayer
          autoplay
          onPlay={() => {}}
          playbackId={video.muxPlaybackId || ""}
          muxThumbnail={video.muxThumbnail || ""}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  );
};

const VideoSectionSkeleton = () => {
  return <div>VideoSectionSkeleton</div>;
};

export default VideoSection;
