import PlaylistHeaderSection from "../sections/playlist-header-section";
import VideosSection from "../sections/videos-section";

export const VideosView = ({ playlistId }: { playlistId: string }) => {
  return (
    <div className="max-w-xl lg:max-w-4xl mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <PlaylistHeaderSection playlistId={playlistId} />
      <VideosSection playlistId={playlistId} />
    </div>
  );
};
