"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export function PlaylistHeaderSection({ playlistId }: { playlistId: string }) {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
}

const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="w-36 h-6" />
      <Skeleton className="w-32 h-4" />
    </div>
  );
};

const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: {
  playlistId: string;
}) => {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ playlistId });

  const removePlaylist = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-xs text-muted-foreground">
          Videos in this playlist.
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => removePlaylist.mutate({ playlistId })}
      >
        <Trash2 />
      </Button>
    </div>
  );
};

export default PlaylistHeaderSection;
