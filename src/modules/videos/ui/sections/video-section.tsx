"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import React, { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoPlayer, VideoPlayerSkeleton } from "../components/video-player";
import VideoBanner from "../components/video-banner";
import VideoTopRow, { VideoTopRowSkeleton } from "../components/video-top-row";
import { authClient } from "@/lib/auth-client";

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
  const utils = trpc.useUtils();
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
  const [isClient, setIsClient] = useState(false);

  const { data: session } = authClient.useSession();

  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePlay = () => {
    if (!session?.user) return;

    createView.mutate({ videoId });
  };

  if (!isClient) {
    return <VideoSectionSkeleton />;
  }

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
          onPlay={handlePlay}
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
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  );
};

export default VideoSection;
