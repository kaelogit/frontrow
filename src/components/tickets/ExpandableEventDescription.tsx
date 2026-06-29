"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableEventDescriptionProps {
  description: string;
  className?: string;
}

export function ExpandableEventDescription({
  description,
  className,
}: ExpandableEventDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > 180;

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5", className)}>
      <p
        className={cn(
          "text-sm leading-relaxed text-slate-600",
          !expanded && isLong && "line-clamp-3"
        )}
      >
        {description}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-3 text-sm font-semibold text-sky-600 hover:text-sky-700"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
