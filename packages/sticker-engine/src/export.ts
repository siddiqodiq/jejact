/** Browser-only export helpers for rendered stickers. */

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export canvas as PNG"));
    }, "image/png");
  });
}

export function canCopyImages(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof ClipboardItem !== "undefined" &&
    !!navigator.clipboard?.write
  );
}

/**
 * Copies a PNG to the clipboard. Uses a promise-valued ClipboardItem so the
 * write starts synchronously within the user gesture (required by Safari).
 */
export async function copyPngToClipboard(
  render: () => Promise<Blob>,
): Promise<void> {
  if (!canCopyImages()) throw new Error("Clipboard images not supported");
  const item = new ClipboardItem({ "image/png": render() });
  await navigator.clipboard.write([item]);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function canShareFiles(file: File): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.canShare &&
    navigator.canShare({ files: [file] })
  );
}

export async function shareSticker(blob: Blob, title: string): Promise<void> {
  const file = new File([blob], "jejact-sticker.png", { type: "image/png" });
  if (!canShareFiles(file)) throw new Error("Sharing files not supported");
  await navigator.share({ files: [file], title });
}
