import React from "react";
import SubscriptionsSection from "../sections/subscription-section";

function SubscriptionsView() {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2 5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-xs text-muted-foreground">
          Manage your subscriptions and stay updated with your favorite
          creators.
        </p>
      </div>
      <SubscriptionsSection />
    </div>
  );
}

export default SubscriptionsView;
