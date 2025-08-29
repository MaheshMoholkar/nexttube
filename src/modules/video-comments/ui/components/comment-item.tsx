"use client";

import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { VideoCommentsGetManyOutput } from "../../types";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function CommentItem({
  comment,
}: {
  comment: VideoCommentsGetManyOutput["items"][number];
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const utils = trpc.useUtils();
  const remove = trpc.videoComments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment removed");
      utils.videoComments.getMany.invalidate({
        videoId: comment.videoId,
      });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      } else {
        toast.error("Something went wrong");
      }
    },
  });
  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.videoComments.getMany.invalidate({
        videoId: comment.videoId,
      });
    },
  });
  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videoComments.getMany.invalidate({
        videoId: comment.videoId,
      });
    },
  });
  return (
    <div className="flex gap-4">
      <Link href={`/users/${comment.user?.id}`}>
        <UserAvatar
          size="lg"
          imageUrl={comment.user?.image ?? "/user-placeholder.svg"}
          name={comment.user?.name ?? "User"}
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/users/${comment.user?.id}`}>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{comment.user?.name ?? "User"}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </Link>
        <p className="text-sm mt-1">{comment.content}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="size-8"
              size="icon"
              disabled={like.isPending}
              onClick={() => like.mutate({ commentId: comment.id })}
            >
              <ThumbsUpIcon
                className={cn(
                  comment.viewerReaction === "like" && "fill-black"
                )}
              />
            </Button>
            <span className="text-xs text-muted-foreground">
              {comment.likeCount}
            </span>
            <Button
              variant="ghost"
              className="size-8"
              size="icon"
              disabled={dislike.isPending}
              onClick={() => dislike.mutate({ commentId: comment.id })}
            >
              <ThumbsDownIcon
                className={cn(
                  comment.viewerReaction === "dislike" && "fill-black"
                )}
              />
            </Button>
            <span className="text-xs text-muted-foreground">
              {comment.dislikeCount}
            </span>
          </div>
        </div>
      </div>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}}>
            <MessageSquare className="size-4 mr-2" />
            Reply
          </DropdownMenuItem>
          {session?.user.id === comment.userId && (
            <DropdownMenuItem
              onClick={() =>
                remove.mutate({
                  videoId: comment.videoId,
                  commentId: comment.id,
                })
              }
              disabled={remove.isPending}
            >
              <TrashIcon className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default CommentItem;
