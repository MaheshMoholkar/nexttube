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
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CommentForm from "./comment-form";
import CommentReplies from "./comment-replies";

interface CommentItemProps {
  comment: VideoCommentsGetManyOutput["items"][number];
  variant: "comment" | "reply";
}

function CommentItem({ comment, variant }: CommentItemProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

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
    <div>
      <div className="flex gap-4">
        <Link prefetch href={`/users/${comment.user?.id}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.user?.image ?? "/user-placeholder.svg"}
            name={comment.user?.name ?? "User"}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link prefetch href={`/users/${comment.user?.id}`}>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                {comment.user?.name ?? "User"}
              </span>
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
            {variant === "comment" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setIsReplyOpen(!isReplyOpen)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {variant === "comment" && (
              <DropdownMenuItem onClick={() => setIsReplyOpen(!isReplyOpen)}>
                <MessageSquare className="size-4 mr-2" />
                Reply
              </DropdownMenuItem>
            )}
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
      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            videoId={comment.videoId}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
            onCancel={() => setIsReplyOpen(false)}
            parentId={comment.id}
            variant="reply"
          />
        </div>
      )}
      {comment.repliesCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            variant="tertiary"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setIsRepliesOpen(!isRepliesOpen)}
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.repliesCount} replies
          </Button>
        </div>
      )}
      {comment.repliesCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies videoId={comment.videoId} parentId={comment.id} />
      )}
    </div>
  );
}

export default CommentItem;
