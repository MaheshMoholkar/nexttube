import { THUMBNAIL_FALLBACK } from "@/constants";
import { PlaylistGetManyOutput } from "@/modules/playlists/types";

import Link from "next/link";
import PlaylistThumbnail from "./playlist-thumbnail";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./playlist-info";
import { PlaylistThumbnailSkeleton } from "./playlist-thumbnail";

interface PlaylistGridCardProps {
  playlist: PlaylistGetManyOutput["items"][number];
}

export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-5 w-full">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};

export const PlaylistGridCard = ({ playlist }: PlaylistGridCardProps) => {
  return (
    <Link href={`/playlists/${playlist.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        <PlaylistThumbnail
          imageUrl={playlist.muxThumbnail || THUMBNAIL_FALLBACK}
          title={playlist.name}
          videoCount={playlist.videoCount}
        />
        <PlaylistInfo playlist={playlist} />
      </div>
    </Link>
  );
};
