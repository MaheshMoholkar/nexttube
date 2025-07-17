import { Button } from "@/components/ui/button";
import { UserCircle2Icon } from "lucide-react";
import React from "react";

function AuthButton() {
  return (
    <Button
      variant="outline"
      className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
    >
      <UserCircle2Icon className="size-5" />
      Sign In
    </Button>
  );
}

export default AuthButton;
