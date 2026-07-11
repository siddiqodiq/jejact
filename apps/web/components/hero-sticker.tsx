"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  BUILT_IN_TEMPLATES,
  SAMPLE_ACTIVITY,
} from "@repo/sticker-engine";
import { StickerCanvas } from "./sticker-canvas";

/**
 * Object stickers with their own palettes — legible on the checkerboard
 * in both color schemes. Some templates draw their content anchored to the
 * top/right of a larger transparent canvas, so each slide carries a small
 * optical-centering offset (display px, tuned for the 3 stats shown here).
 */
const SLIDES = [
  { id: "chat", dx: -20, dy: 0 },
  { id: "notification", dx: 0, dy: 4 },
  { id: "receipt", dx: 0, dy: 42 },
  { id: "terminal", dx: 0, dy: 42 },
  { id: "ping", dx: 0, dy: 0 },
];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // ease-out-quint: fast start, soft landing

type SlideState = "active" | "leaving" | "waiting";

/**
 * Inline styles on purpose: transitions survive any CSS pipeline, purge,
 * or OS reduced-motion setting — the animation always runs.
 * Perfectly centered, no rotation: a gentle rise + fade with a soft
 * focus pull (blur sharpening as the sticker settles).
 */
function slideStyle(state: SlideState): CSSProperties {
  const transforms: Record<SlideState, string> = {
    active: "translateY(0px) scale(1)",
    leaving: "translateY(-18px) scale(0.99)",
    waiting: "translateY(18px) scale(0.98)",
  };
  return {
    opacity: state === "active" ? 1 : 0,
    transform: transforms[state],
    filter: state === "active" ? "blur(0px)" : "blur(8px)",
    transition: `opacity 800ms ${EASE}, transform 800ms ${EASE}, filter 800ms ${EASE}`,
    willChange: "opacity, transform, filter",
  };
}

/**
 * Transparency checkerboard with a template carousel: all slides stay
 * mounted (canvases render once) and the active one rises softly into
 * place while the previous drifts up and dissolves.
 */
export function HeroSticker() {
  const [slide, setSlide] = useState({ current: 0, previous: -1 });

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((s) => ({
        current: (s.current + 1) % SLIDES.length,
        previous: s.current,
      }));
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="transparency-grid relative aspect-square w-full overflow-hidden rounded-3xl border border-hairline">
        {SLIDES.map(({ id, dx, dy }, i) => {
          const state: SlideState =
            i === slide.current
              ? "active"
              : i === slide.previous
                ? "leaving"
                : "waiting";
          const template = BUILT_IN_TEMPLATES.find((t) => t.id === id);
          if (!template) return null;
          return (
            <div
              key={id}
              className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 sm:p-10"
              style={{ transform: `translate(${dx}px, ${dy}px)` }}
            >
              <div style={slideStyle(state)}>
                <StickerCanvas
                  template={template}
                  data={SAMPLE_ACTIVITY}
                  fields={["distance", "pace", "duration"]}
                  textColor="#ffffff"
                  className="max-h-[300px] w-auto drop-shadow-lg sm:max-h-[340px]"
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[13px] text-ink-faint">
        Transparent PNG · rendered on your device · pasted on your Story
      </p>
    </div>
  );
}
