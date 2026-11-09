/** Decode a picked photo, rotate it by quarter turns, centre-crop to the case aspect, and re-encode. */
export async function prepareCover(
  file: Blob,
  aspect: number, // width / height
  quarterTurns = 0,
  maxH = 1100,
): Promise<{ blob: Blob; tint: string }> {
  const bmp = await createImageBitmap(file);
  const turned = quarterTurns % 2 === 1;
  const srcW = turned ? bmp.height : bmp.width;
  const srcH = turned ? bmp.width : bmp.height;

  // Rotate into an intermediate canvas.
  const rot = document.createElement('canvas');
  rot.width = srcW;
  rot.height = srcH;
  const rctx = rot.getContext('2d')!;
  rctx.translate(srcW / 2, srcH / 2);
  rctx.rotate((quarterTurns * Math.PI) / 2);
  rctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
  bmp.close();

  // Centre crop to the case aspect.
  let cw = srcW;
  let ch = srcW / aspect;
  if (ch > srcH) {
    ch = srcH;
    cw = srcH * aspect;
  }
  const outH = Math.min(maxH, Math.round(ch));
  const outW = Math.round(outH * aspect);
  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(rot, (srcW - cw) / 2, (srcH - ch) / 2, cw, ch, 0, 0, outW, outH);

  const tint = averageColor(out);
  const blob = await new Promise<Blob>((res) => out.toBlob((b) => res(b!), 'image/jpeg', 0.86));
  return { blob, tint };
}

export function averageColor(canvas: HTMLCanvasElement): string {
  const s = document.createElement('canvas');
  s.width = 12;
  s.height = 12;
  const c = s.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(canvas, 0, 0, 12, 12);
  const d = c.getImageData(0, 0, 12, 12).data;
  // Weight saturated pixels higher so the lamp picks up the cover's colour, not its greys.
  let r = 0, g = 0, b = 0, wsum = 0;
  for (let i = 0; i < d.length; i += 4) {
    const max = Math.max(d[i], d[i + 1], d[i + 2]);
    const min = Math.min(d[i], d[i + 1], d[i + 2]);
    const w = 0.15 + (max - min) / 255;
    r += d[i] * w;
    g += d[i + 1] * w;
    b += d[i + 2] * w;
    wsum += w;
  }
  const hex = (v: number) => Math.round(v / wsum).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export const canvasToBlob = (c: HTMLCanvasElement, type = 'image/jpeg', q = 0.88) =>
  new Promise<Blob>((res) => c.toBlob((b) => res(b!), type, q));
