"use client";

import { trpc } from "@/trpc/client";

export const Page = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "client" });
  return <div>{data.greeting}</div>;
};
