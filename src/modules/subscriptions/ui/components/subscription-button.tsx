import React from "react";
import { Button } from "@/components/ui/button";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function SubscriptionButton({
  onClick,
  disabled,
  isSubscribed,
  className,
  size,
}: {
  onClick: ComponentProps<typeof Button>["onClick"];
  disabled: boolean;
  isSubscribed: boolean;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
}) {
  return (
    <Button
      variant={isSubscribed ? "secondary" : "default"}
      className={cn("rounded-full", className)}
      size={size}
      onClick={onClick}
      disabled={disabled}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
}

export default SubscriptionButton;
