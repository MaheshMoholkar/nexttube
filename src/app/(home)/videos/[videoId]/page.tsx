import { DEFAULT_LIMIT } from "@/constants";
import VideoView from "@/modules/videos/ui/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import React from "react";

export const dynamic = "force-dynamic";

async function VideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;

  void trpc.videos.getOne.prefetch({ id: videoId });
  void trpc.videoComments.getMany.prefetchInfinite({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  void trpc.suggestions.getMany.prefetch({
    videoId,
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <VideoView videoId={videoId} />
    </HydrateClient>
  );
}

export default VideoPage;
