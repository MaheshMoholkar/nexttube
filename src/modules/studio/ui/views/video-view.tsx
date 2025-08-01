import React from "react";
import { FormSection } from "../sections/form-section";

function VideoView({ videoId }: { videoId: string }) {
  return (
    <div className="px-4 pt-2">
      <FormSection videoId={videoId} />
    </div>
  );
}

export default VideoView;
