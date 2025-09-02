import React from "react";
import UserSection from "../sections/user-section";
import { VideosSection } from "../sections/videos-section";

function UserView({ userId }: { userId: string }) {
  return (
    <div className="flex flex-col px-4 pt-2.5 mb-10 gap-y-6">
      <UserSection userId={userId} />
      <VideosSection userId={userId} />
    </div>
  );
}

export default UserView;
