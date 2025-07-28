import { UserAvatar } from "@/components/user-avatar";
import {
  SidebarHeader,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function StudioSidebarHeader() {
  const { data: session, isPending } = authClient.useSession();
  const { state } = useSidebar();

  if (isPending)
    return (
      <SidebarHeader className="flex items-center justify-center pb-4">
        <Skeleton className="size-[112px] rounded-full" />
        <div className="flex flex-col items-center mt-2 gap-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </SidebarHeader>
    );

  if (state === "collapsed")
    return (
      <SidebarHeader className="flex items-center justify-center">
        <SidebarMenuButton tooltip="Your profile" asChild>
          <Link href="/users/current" className="flex flex-col items-center">
            <UserAvatar
              imageUrl={session?.user?.image ?? ""}
              name={session?.user?.name ?? "User"}
              size="sm"
            />
            <span className="text-sm">Your profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
    );

  return (
    <SidebarHeader className="flex flex-col items-center justify-center pb-4">
      <Link href="/users/current">
        <UserAvatar
          imageUrl={session?.user?.image ?? ""}
          name={session?.user?.name ?? "User"}
          className="size-[112px] hover:opacity-80 transition-opacity"
        />
      </Link>
      <div className="flex flex-col items-center mt-2 gap-y-2">
        <p className="text-sm font-medium">Your profile</p>
        <p className="text-xs text-muted-foreground">{session?.user?.name}</p>
      </div>
    </SidebarHeader>
  );
}

export default StudioSidebarHeader;
