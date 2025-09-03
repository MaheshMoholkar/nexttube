"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlaylistCreateModal } from "../components/playlist-create-modal";
import { useState } from "react";
import PlaylistsSection from "../sections/playlists-section";

export const PlaylistsView = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
        <PlaylistCreateModal open={open} onOpenChange={setOpen} />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Playlists</h1>
            <p className="text-xs text-muted-foreground">All your playlists.</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Plus />
          </Button>
        </div>
        <PlaylistsSection />
      </div>
    </>
  );
};
