import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRightIcon, Loader2Icon } from "lucide-react";
import CommentItem from "./comment-item";
import { Button } from "@/components/ui/button";

interface CommentRepliesProps {
  videoId: string;
  parentId: string;
}

function CommentReplies({ videoId, parentId }: CommentRepliesProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.videoComments.getMany.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT,
        videoId,
        parentId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  return (
    <div className="pl-14">
      <div className="flex flex-col gap-4 mt-2">
        {isLoading && (
          <div className="flex justify-center items-center">
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items)
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} variant="reply" />
            ))}
      </div>
      {hasNextPage && (
        <div className="flex items-center">
          <Button
            variant="tertiary"
            size="sm"
            className="h-8 text-xs"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <CornerDownRightIcon className="size-4" />
                Load more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CommentReplies;
