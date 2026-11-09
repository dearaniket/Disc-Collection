import { FORMATS } from './formats';
import type { FormatId } from './types';

export type Motif = 'sun' | 'peaks' | 'rings' | 'grid' | 'wave' | 'orb';

export interface CoverSpec {
  title: string;
  format: FormatId;
  a: string; // light
  b: string; // dark
  motif: Motif;
  blurb: string;
}

const PX_PER_MM = 6;

function mm(format: FormatId) {
  const f = FORMATS[format];
  return { W: f.w * PX_PER_MM, H: f.h * PX_PER_MM, f };
}

function canvas(W: number, H: number) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return [c, c.getContext('2d')!] as const;
}

function drawMotif(ctx: CanvasRenderingContext2D, s: CoverSpec, x: number, y: number, w: number, h: number) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, s.a);
  g.addColorStop(1, s.b);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const cx = x + w / 2;
  ctx.globalAlpha = 1;
  switch (s.motif) {
    case 'sun': {
      ctx.fillStyle = 'rgba(255,240,215,0.9)';
      ctx.beginPath();
      ctx.arc(cx, y + h * 0.42, w * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = s.b;
      for (let i = 0; i < 7; i++) {
        const bh = 4 + i * 5;
        ctx.fillRect(x, y + h * 0.36 + i * (h * 0.035), w, bh);
      }
      break;
    }
    case 'peaks': {
      const layers = 4;
      for (let i = 0; i < layers; i++) {
        ctx.fillStyle = `rgba(0,0,0,${0.12 + i * 0.12})`;
        ctx.beginPath();
        const base = y + h * (0.5 + i * 0.09);
        ctx.moveTo(x, base + h * 0.2);
        for (let k = 0; k <= 6; k++) {
          const px = x + (w / 6) * k;
          const py = base - (k % 2 === 0 ? 0 : h * (0.12 + ((i * 7 + k * 3) % 5) * 0.03));
          ctx.lineTo(px, py);
        }
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.fill();
      }
      break;
    }
    case 'rings': {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      for (let i = 1; i < 9; i++) {
        ctx.lineWidth = 3 + i;
        ctx.beginPath();
        ctx.ellipse(cx, y + h * 0.45, w * 0.06 * i, w * 0.02 * i, -0.35, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(cx, y + h * 0.45, w * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'grid': {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 3;
      const hz = y + h * 0.42;
      for (let i = -10; i <= 10; i++) {
        ctx.beginPath();
        ctx.moveTo(cx, hz);
        ctx.lineTo(cx + i * w * 0.18, y + h);
        ctx.stroke();
      }
      for (let i = 1; i < 10; i++) {
        const t = Math.pow(i / 10, 2);
        ctx.beginPath();
        ctx.moveTo(x, hz + (y + h - hz) * t);
        ctx.lineTo(x + w, hz + (y + h - hz) * t);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(x, hz - 2, w, 4);
      break;
    }
    case 'wave': {
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.15 + i * 0.07})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        for (let px = 0; px <= w; px += 8) {
          const py = y + h * (0.3 + i * 0.05) + Math.sin(px / (w * 0.16) + i * 0.7) * h * 0.03;
          px === 0 ? ctx.moveTo(x + px, py) : ctx.lineTo(x + px, py);
        }
        ctx.stroke();
      }
      break;
    }
    case 'orb': {
      const rg = ctx.createRadialGradient(cx - w * 0.08, y + h * 0.36, w * 0.02, cx, y + h * 0.42, w * 0.32);
      rg.addColorStop(0, 'rgba(255,255,255,0.95)');
      rg.addColorStop(0.5, s.a);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(cx, y + h * 0.42, w * 0.32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function banner(ctx: CanvasRenderingContext2D, format: FormatId, W: number, H: number) {
  const f = FORMATS[format];
  const bh = Math.round(H * 0.085);
  ctx.fillStyle = f.plastic;
  ctx.fillRect(0, 0, W, bh);
  ctx.fillStyle = f.ink;
  ctx.font = `700 ${Math.round(bh * 0.52)}px Antonio, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(f.label.toUpperCase(), W * 0.05, bh / 2 + 2);
  return bh;
}

function fitTitle(ctx: CanvasRenderingContext2D, text: string, maxW: number, start: number) {
  let size = start;
  ctx.font = `700 ${size}px Antonio, sans-serif`;
  while (ctx.measureText(text).width > maxW && size > 20) {
    size -= 4;
    ctx.font = `700 ${size}px Antonio, sans-serif`;
  }
  return size;
}

export function drawFront(s: CoverSpec) {
  const { W, H } = mm(s.format);
  const [c, ctx] = canvas(W, H);
  const bh = banner(ctx, s.format, W, H);
  drawMotif(ctx, s, 0, bh, W, H - bh);
  const scrim = ctx.createLinearGradient(0, H * 0.6, 0, H);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);
  const t = s.title.toUpperCase();
  const size = fitTitle(ctx, t, W * 0.88, Math.round(W * 0.2));
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillText(t, W / 2, H * 0.9);
  ctx.font = `600 ${Math.round(W * 0.03)}px Antonio, sans-serif`;
  ctx.globalAlpha = 0.75;
  ctx.fillText('SAMPLE COVER', W / 2, H * 0.955);
  ctx.globalAlpha = 1;
  return c;
}

export function drawBack(s: CoverSpec) {
  const { W, H } = mm(s.format);
  const [c, ctx] = canvas(W, H);
  ctx.fillStyle = s.b;
  ctx.fillRect(0, 0, W, H);
  const bh = banner(ctx, s.format, W, H);
  const pad = W * 0.07;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  const size = fitTitle(ctx, s.title.toUpperCase(), W - pad * 2, Math.round(W * 0.09));
  ctx.textBaseline = 'top';
  ctx.fillText(s.title.toUpperCase(), pad, bh + pad * 0.8);
  // Screens strip
  const sy = bh + pad * 0.8 + size + pad * 0.6;
  const sw = (W - pad * 2 - pad * 0.5) / 3;
  const sh = sw * 0.62;
  for (let i = 0; i < 3; i++) {
    drawMotif(ctx, { ...s, motif: (['sun', 'grid', 'wave', 'peaks', 'rings', 'orb'] as const)[(i + s.title.length) % 6] }, pad + i * (sw + pad * 0.25), sy, sw, sh);
  }
  // Blurb
  ctx.font = `400 ${Math.round(W * 0.034)}px "Inter Variable", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  const words = s.blurb.split(' ');
  let line = '';
  let ly = sy + sh + pad * 0.7;
  const lh = W * 0.05;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > W - pad * 2) {
      ctx.fillText(line, pad, ly);
      line = w;
      ly += lh;
    } else line = test;
  }
  ctx.fillText(line, pad, ly);
  // Footer: barcode-style block and sample note
  const fy = H - pad - W * 0.12;
  ctx.fillStyle = '#fff';
  ctx.fillRect(W - pad - W * 0.28, fy, W * 0.28, W * 0.12);
  ctx.fillStyle = '#111';
  for (let i = 0; i < 28; i++) {
    const bw = ((i * 7) % 3) + 1;
    ctx.fillRect(W - pad - W * 0.27 + i * (W * 0.0093), fy + W * 0.012, bw * 1.6, W * 0.08);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = `600 ${Math.round(W * 0.028)}px Antonio, sans-serif`;
  ctx.fillText('SAMPLE COVER · NOT A REAL RELEASE', pad, fy + W * 0.04);
  return c;
}

export function drawInside(s: CoverSpec) {
  const { W, H } = mm(s.format);
  const [c, ctx] = canvas(W, H);
  drawMotif(ctx, { ...s, motif: s.motif === 'orb' ? 'rings' : 'orb', a: s.b, b: s.a }, 0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const pad = W * 0.1;
  ctx.fillRect(pad, H * 0.62, W - pad * 2, H * 0.28);
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `700 ${Math.round(W * 0.06)}px Antonio, sans-serif`;
  ctx.textBaseline = 'top';
  ctx.fillText('INSTRUCTIONS', pad * 1.4, H * 0.645);
  ctx.fillStyle = '#555';
  for (let i = 0; i < 5; i++) ctx.fillRect(pad * 1.4, H * 0.72 + i * H * 0.03, (W - pad * 2.8) * (i === 4 ? 0.6 : 1), H * 0.012);
  return c;
}
