"use client";

import React from "react";
import { VideoGetOneOutput } from "../../types";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import SubscriptionButton from "@/modules/subscriptions/ui/components/subscription-button";
import UserInfo from "@/modules/users/ui/components/user-info";

function VideoOwner({
  user,
  videoId,
}: {
  user: VideoGetOneOutput["user"];
  videoId: string;
}) {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex items-center sm:items-center justify-between sm:justify-start gap-3 min-w-0">
      <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar size="lg" imageUrl={user.image ?? ""} name={user.name} />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo name={user.name} size="lg" />

            <span className="text-sm text-muted-foreground line-clamp-1">
              {0} subscribers
            </span>
          </div>
        </div>
      </Link>
      {session?.user.id === user.id ? (
        <Button variant="secondary" className="rounded-full" asChild>
          <Link href={`/studio/videos/${videoId}`}>Edit Video</Link>
        </Button>
      ) : (
        <SubscriptionButton
          onClick={() => {}}
          disabled={false}
          isSubscribed={false}
          className="flex-non"
        />
      )}
    </div>
  );
}

export default VideoOwner;
