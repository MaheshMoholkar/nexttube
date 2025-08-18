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
import React from "react";
import { toast } from "sonner";

function VideoMenu({
  videoId,
  variant,
  onRemove,
}: {
  videoId: string;
  variant?: "ghost" | "secondary";
  onRemove?: () => void;
}) {
  const onShare = () => {
    const url = `${env.NEXT_PUBLIC_APP_URL}/videos/${videoId}`;
    navigator.clipboard.writeText(url);
    toast("Copied to clipboard");
  };
  return (
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
        <DropdownMenuItem onClick={() => {}}>
          <ListPlusIcon className="size-4 mr-2" />
          Add to Playlist
        </DropdownMenuItem>
        {onRemove && (
          <DropdownMenuItem onClick={() => {}}>
            <Trash2Icon className="size-4 mr-2" />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default VideoMenu;
