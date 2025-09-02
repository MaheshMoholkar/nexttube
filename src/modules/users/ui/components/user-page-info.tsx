import React from "react";
import { UserGetOneOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import SubscriptionButton from "@/modules/subscriptions/ui/components/subscription-button";
import useSubscription from "@/modules/subscriptions/hooks/use-subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

function UserPageInfo({ user }: { user: UserGetOneOutput }) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { onClick, isPending } = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
  });
  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <UserAvatar
            size="lg"
            imageUrl={user.image ?? ""}
            name={user.name}
            className="size-16"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{user.subscriptionCount} subscribers</span>
              <span>•</span>
              <span>{user.videoCount} videos</span>
            </div>
          </div>
        </div>
        {session?.user?.id === user.id ? (
          <Button
            variant="secondary"
            asChild
            className="w-full mt-3 rounded-full"
          >
            <Link href={`/studio`}>Go to Studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            onClick={onClick}
            disabled={isPending || isSessionPending}
            isSubscribed={user.viewerSubscribed}
            className="w-full mt-3"
          />
        )}
      </div>
      <div className="hidden md:flex items-start gap-4">
        <UserAvatar
          size="xl"
          imageUrl={user.image ?? ""}
          name={user.name}
          className="size-16"
        />
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span>{user.subscriptionCount} subscribers</span>
            <span>•</span>
            <span>{user.videoCount} videos</span>
          </div>
        </div>
        {session?.user?.id === user.id ? (
          <Button variant="secondary" asChild className="mt-3 rounded-full">
            <Link href={`/studio`}>Go to Studio</Link>
          </Button>
        ) : (
          <SubscriptionButton
            onClick={onClick}
            disabled={isPending || isSessionPending}
            isSubscribed={user.viewerSubscribed}
            className="mt-3"
          />
        )}
      </div>
    </div>
  );
}

export function UserPageInfoSkeleton() {
  return (
    <div className="py-6">
      <div className="flex flex-col md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-1" />
            <div className="flex items-center gap-1 mt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="w-full h-10 mt-3 rounded-full" />
      </div>
      <div className="hidden md:flex items-start gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col min-w-0">
          <Skeleton className="h-8 w-40 mb-1" />
          <div className="flex items-center gap-1 mt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 mt-3 rounded-full" />
      </div>
    </div>
  );
}

export default UserPageInfo;
