import { PlaylistGetManyOutput } from "@/modules/playlists/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistInfoProps {
  playlist: PlaylistGetManyOutput["items"][number];
}

export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-3 w-[20%]" />
        <Skeleton className="h-5 w-[40%]" />
      </div>
    </div>
  );
};

export const PlaylistInfo = ({ playlist }: PlaylistInfoProps) => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
          {playlist.name}
        </h3>
        <p className="text-xs text-muted-foreground ">Playlist</p>
        <p className="text-sm text-muted-foreground font-semibold hover:text-primary">
          View full playlist
        </p>
      </div>
    </div>
  );
};
