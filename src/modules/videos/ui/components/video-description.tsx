import { cn } from "@/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import React, { useState } from "react";

function VideoDescription({
  compactViews,
  expandedViews,
  compactDate,
  expandedDate,
  description,
}: {
  compactViews: string;
  expandedViews: string;
  compactDate: string;
  expandedDate: string;
  description?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded((prev) => !prev)}
      className="bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition"
    >
      <div className="flex gap-2 text-sm mb-2">
        <span className="font-medium">
          {expanded ? expandedViews : compactViews} views
        </span>
        <span className="font-medium">
          {expanded ? expandedDate : compactDate}
        </span>
      </div>
      <div className="relative">
        <p
          className={cn(
            "text-sm whitespace-pre-wrap",
            !expanded && "line-clamp-2"
          )}
        >
          {description || "No description"}
        </p>
        <div className="flex items-center gap-1 mt-4 text-sm font-medium">
          {expanded ? (
            <>
              Show less <ChevronUpIcon className="size-4" />
            </>
          ) : (
            <>
              Show more <ChevronDownIcon className="size-4" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoDescription;
