"use client";

import { useEffect, useRef } from "react";
import type { StatField } from "@repo/types";
import {
  renderSticker,
  type StickerData,
  type StickerTemplate,
} from "@repo/sticker-engine";

interface StickerCanvasProps {
  template: StickerTemplate;
  data: StickerData;
  fields: StatField[];
  textColor: string;
  className?: string;
  /** Called with the canvas so parents can export from it. */
  canvasRef?: (canvas: HTMLCanvasElement | null) => void;
}

/** Live sticker preview. Renders at export resolution, scaled down by CSS. */
export function StickerCanvas({
  template,
  data,
  fields,
  textColor,
  className = "",
  canvasRef,
}: StickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const render = () => {
      // Use the page's real (next/font) family so the canvas matches the UI.
      const fontFamily = getComputedStyle(document.body).fontFamily;
      renderSticker(canvas, template, data, { fields, textColor, fontFamily });
    };
    render();
    // Re-render once webfonts finish loading, otherwise first paint may
    // fall back to a system font.
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) render();
    });
    return () => {
      cancelled = true;
    };
  }, [template, data, fields, textColor]);

  useEffect(() => {
    canvasRef?.(ref.current);
    return () => canvasRef?.(null);
  }, [canvasRef]);

  return (
    <canvas
      ref={ref}
      className={`h-auto max-w-full ${className}`}
      style={{ aspectRatio: `${template.width} / ${template.height}` }}
      role="img"
      aria-label={`${template.name} sticker preview for ${data.name}`}
    />
  );
}
