import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { env } from "@/env";
import {
  ListPlusIcon,
  MoreVertical,
  ShareIcon,
  Trash2Icon,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal";

function VideoMenu({
  videoId,
  variant,
  onRemove,
}: {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const onShare = () => {
    const url = `${env.NEXT_PUBLIC_APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(url);
    toast("Copied to clipboard");
  };
  return (
    <>
      <PlaylistAddModal open={open} onOpenChange={setOpen} videoId={videoId} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} className="rounded-full" size="icon">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onShare}>
            <ShareIcon className="size-4 mr-2" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            <ListPlusIcon className="size-4 mr-2" />
            Add to Playlist
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem onClick={onRemove}>
              <Trash2Icon className="size-4 mr-2" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export default VideoMenu;
