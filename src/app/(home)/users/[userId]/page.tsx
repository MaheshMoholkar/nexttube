import { DEFAULT_LIMIT } from "@/constants";
import UserView from "@/modules/users/ui/views/user-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  // If trying to access "current" user but not authenticated, redirect to login
  if (userId === "current") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      redirect("/login");
    }
  }

  void trpc.users.getOne.prefetch({ id: userId });
  void trpc.videos.getMany.prefetchInfinite({ userId, limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <UserView userId={userId} />
    </HydrateClient>
  );
}

export default Page;
