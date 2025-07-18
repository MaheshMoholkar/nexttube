import { HydrateClient, trpc } from "@/trpc/server";
import { Page } from "./client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function HomePage() {
  void trpc.hello.prefetch({ text: "client" });
  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Error</div>}>
          <Page />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
