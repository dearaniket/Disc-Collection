import type { FormatId, Kind } from './types';

export interface Format {
  id: FormatId;
  label: string;
  kind: Kind;
  /** Physical case size in millimetres. */
  w: number;
  h: number;
  d: number;
  /** Case plastic colour. */
  plastic: string;
  /** Spine label ink. */
  ink: string;
}

export const FORMATS: Record<FormatId, Format> = {
  ps5: { id: 'ps5', label: 'PS5', kind: 'game', w: 135, h: 170, d: 14, plastic: '#2149b8', ink: '#ffffff' },
  ps4: { id: 'ps4', label: 'PS4', kind: 'game', w: 135, h: 170, d: 14, plastic: '#1a3a94', ink: '#ffffff' },
  xbox: { id: 'xbox', label: 'Xbox', kind: 'game', w: 135, h: 170, d: 14, plastic: '#1f7d3c', ink: '#ffffff' },
  switch: { id: 'switch', label: 'Switch', kind: 'game', w: 105, h: 170, d: 11, plastic: '#c8262c', ink: '#ffffff' },
  pc: { id: 'pc', label: 'PC', kind: 'game', w: 135, h: 190, d: 14, plastic: '#1a1a1c', ink: '#d9d9d9' },
  dvd: { id: 'dvd', label: 'DVD', kind: 'movie', w: 135, h: 190, d: 14, plastic: '#141416', ink: '#e8e8e8' },
  bluray: { id: 'bluray', label: 'Blu-ray', kind: 'movie', w: 128, h: 148, d: 12, plastic: '#2a5ad6', ink: '#ffffff' },
  uhd: { id: 'uhd', label: '4K UHD', kind: 'movie', w: 128, h: 148, d: 12, plastic: '#111113', ink: '#e8e8e8' },
};

export const FORMAT_LIST = Object.values(FORMATS);

export const formatsFor = (kind: Kind) => FORMAT_LIST.filter((f) => f.kind === kind);

/** Tallest case on the shelf; every case renders at true scale against it. */
export const MAX_H = 190;
