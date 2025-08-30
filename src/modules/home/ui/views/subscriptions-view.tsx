import React from "react";
import { SubscriptionsVideosSection } from "../sections/subscriptions-video-section";

function SubscriptionsView() {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-xs text-muted-foreground">
          Videos from your favorite creators
        </p>
      </div>
      <SubscriptionsVideosSection />
    </div>
  );
}

export default SubscriptionsView;
