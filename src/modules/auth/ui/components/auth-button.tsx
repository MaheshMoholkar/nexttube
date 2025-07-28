"use client";

import { buttonVariants } from "@/components/ui/button";
import { UserCircle2Icon, LogOutIcon, HomeIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

function AuthButton() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  if (isPending) {
    return null;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className={buttonVariants({
          variant: "outline",
          className:
            "px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none",
        })}
      >
        <UserCircle2Icon className="size-5" />
        Sign In
      </Link>
    );
  }

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          {user?.image ? (
            <AvatarImage src={user.image} alt={user.name || "User"} />
          ) : (
            <AvatarFallback>
              <UserCircle2Icon className="size-5 text-blue-600" />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-2 flex flex-col gap-1">
          <div className="font-semibold text-sm truncate">
            {user?.name || "User"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <HomeIcon className="size-4 mr-2" /> Home
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/studio">
            <VideoIcon className="size-4 mr-2" /> Studio
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                },
              },
            });
          }}
          variant="destructive"
        >
          <LogOutIcon className="size-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AuthButton;
