"use client";

import { useEffect, useState } from "react";
import {
  BUILT_IN_TEMPLATES,
  SAMPLE_ACTIVITY,
} from "@repo/sticker-engine";
import { StickerCanvas } from "./sticker-canvas";

const ROTATION = ["receipt", "trace", "glass-card"];

/** Story-shaped mock with a live-rendered sticker cycling through templates. */
export function HeroSticker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % ROTATION.length),
      3500,
    );
    return () => clearInterval(timer);
  }, []);

  const template =
    BUILT_IN_TEMPLATES.find((t) => t.id === ROTATION[index]) ??
    BUILT_IN_TEMPLATES[0];
  if (!template) return null;

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="story-backdrop elevated relative aspect-[9/16] w-full overflow-hidden rounded-[32px] border border-hairline p-5">
        <div className="absolute left-5 top-4 flex gap-1">
          <span className="h-0.5 w-10 rounded-full bg-white/80" />
          <span className="h-0.5 w-10 rounded-full bg-white/30" />
          <span className="h-0.5 w-10 rounded-full bg-white/30" />
        </div>
        <div className="flex h-full items-center justify-center">
          <StickerCanvas
            key={template.id}
            template={template}
            data={SAMPLE_ACTIVITY}
            fields={["distance", "pace", "duration", "elevation"]}
            textColor="#ffffff"
            className="drop-shadow-lg transition-opacity duration-500"
          />
        </div>
      </div>
    </div>
  );
}
