import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

function VideoReactions({
  viewerReaction,
  likeCount,
  dislikeCount,
  videoId,
}: {
  viewerReaction: "like" | "dislike" | null;
  likeCount: number;
  dislikeCount: number;
  videoId: string;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
      utils.playlists.getHistory.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      }
    },
  });

  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId });
      utils.playlists.getLiked.invalidate();
      utils.playlists.getHistory.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/");
      }
    },
  });

  return (
    <div className="flex items-center flex-none">
      <Button
        variant="secondary"
        className="rounded-l-full rounded-r-none gap-2 pr-4"
        onClick={() => like.mutate({ videoId })}
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {likeCount}
      </Button>
      <Separator orientation="vertical" className="h-7" />
      <Button
        variant="secondary"
        className="rounded-r-full rounded-l-none gap-2 pl-4"
        onClick={() => dislike.mutate({ videoId })}
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")}
        />
        {dislikeCount}
      </Button>
    </div>
  );
}

export default VideoReactions;
