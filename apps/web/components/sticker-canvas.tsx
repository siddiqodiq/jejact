"use client";

import { useEffect, useRef, useState } from "react";
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
  /** Same-origin avatar URL for templates that draw it (e.g. /api/avatar). */
  avatarUrl?: string | null;
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
  avatarUrl,
  className = "",
  canvasRef,
}: StickerCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [avatar, setAvatar] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!avatarUrl) {
      setAvatar(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setAvatar(img);
    };
    img.src = avatarUrl;
    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const render = () => {
      // Use the page's real (next/font) family so the canvas matches the UI.
      const fontFamily = getComputedStyle(document.body).fontFamily;
      renderSticker(canvas, template, data, {
        fields,
        textColor,
        fontFamily,
        avatar,
      });
    };
    render();
    // Re-render once webfonts finish loading, otherwise first paint may
    // fall back to a system font. Canvas-only faces (Instagram Sans) are
    // never requested by the DOM, so load them explicitly.
    let cancelled = false;
    void Promise.allSettled([
      document.fonts.ready,
      document.fonts.load("400 32px 'Instagram Sans'"),
    ]).then(() => {
      if (!cancelled) render();
    });
    return () => {
      cancelled = true;
    };
  }, [template, data, fields, textColor, avatar]);

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
