"use client";

import { useEffect, useState } from "react";
import {
  BUILT_IN_TEMPLATES,
  SAMPLE_ACTIVITY,
} from "@repo/sticker-engine";
import { StickerCanvas } from "./sticker-canvas";

/**
 * Object stickers with their own palettes — legible on the checkerboard
 * in both color schemes, and the most "Jejact" templates we have.
 */
const ROTATION = ["chat", "receipt", "terminal", "ping"];

/** Transparency checkerboard with a live sticker peeled onto it. */
export function HeroSticker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % ROTATION.length),
      3200,
    );
    return () => clearInterval(timer);
  }, []);

  const template =
    BUILT_IN_TEMPLATES.find((t) => t.id === ROTATION[index]) ??
    BUILT_IN_TEMPLATES[0];
  if (!template) return null;

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="transparency-grid relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-hairline p-6 sm:p-10">
        <StickerCanvas
          key={template.id}
          template={template}
          data={SAMPLE_ACTIVITY}
          fields={["distance", "pace", "duration"]}
          textColor="#ffffff"
          className={`max-h-[300px] w-auto drop-shadow-xl sm:max-h-[340px] ${
            index % 2 === 0 ? "-rotate-2" : "rotate-2"
          }`}
        />
      </div>
      <p className="mt-3 text-center text-[13px] text-ink-faint">
        Transparent PNG · rendered on your device · pasted on your Story
      </p>
    </div>
  );
}
