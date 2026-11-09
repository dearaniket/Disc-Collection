import { drawBack, drawFront, drawInside, type CoverSpec } from './covers';
import { putImage, uid } from './db';
import { averageColor, canvasToBlob } from './image';
import { FORMATS } from './formats';
import type { CaseItem, Status } from './types';

interface Demo extends CoverSpec {
  year: number;
  score?: number;
  hours?: number;
  status: Status;
  review?: string;
}

// Fictional titles only. Nothing here refers to a real release.
const DEMOS: Demo[] = [
  { title: 'Sundial', format: 'pc', a: '#e6c38a', b: '#5b3a1e', motif: 'sun', year: 2019, status: 'finished', score: 7, hours: 22, blurb: 'Bend the hours of a desert town to undo one bad afternoon.' },
  { title: 'Night Ferry', format: 'dvd', a: '#d94a6a', b: '#2b0f24', motif: 'grid', year: 2008, status: 'watched', score: 8, blurb: 'Two strangers, one crossing, and a passenger list that keeps changing.', review: 'The last twenty minutes on the car deck are worth the whole disc.' },
  { title: 'Pocket Tundra', format: 'switch', a: '#cfe7f5', b: '#24507a', motif: 'peaks', year: 2021, status: 'playing', hours: 9, blurb: 'Raise a herd of tiny reindeer across a frozen archipelago.' },
  { title: 'Moss Kingdom', format: 'ps4', a: '#c7d36b', b: '#2b4220', motif: 'peaks', year: 2017, status: 'finished', score: 9, hours: 64, blurb: 'A forest kingdom grows back one stone at a time. You hold the trowel.', review: 'Spoiler-free: the second map is three times bigger than the first.' },
  { title: 'Salt Hollow', format: 'uhd', a: '#9fb5b2', b: '#1e2b2e', motif: 'wave', year: 2022, status: 'none', blurb: 'A lighthouse keeper finds a ledger that predicts every shipwreck.' },
  { title: 'Glass Harbor', format: 'xbox', a: '#8fd6e3', b: '#10283a', motif: 'grid', year: 2020, status: 'playing', hours: 14, blurb: 'Pilot a cargo drone through a city built entirely over water.' },
  { title: 'The Quiet Pier', format: 'bluray', a: '#e9e3cf', b: '#5d4c35', motif: 'wave', year: 2016, status: 'watched', score: 6, blurb: 'A retired projectionist re-opens the cinema at the end of the pier.' },
  { title: 'Kite Rally', format: 'switch', a: '#ffd25a', b: '#c2312a', motif: 'rings', year: 2023, status: 'finished', score: 8, hours: 31, blurb: 'Four-player kite racing over cliffs, rooftops, and one very angry goose.' },
  { title: 'Halfway Motel', format: 'dvd', a: '#f4a3a8', b: '#5a2340', motif: 'sun', year: 2004, status: 'none', blurb: 'Every room at the motel is booked by the same guest.' },
  { title: 'Low Orbit', format: 'xbox', a: '#89c9b8', b: '#1b3446', motif: 'rings', year: 2022, status: 'finished', score: 7, hours: 41, blurb: 'Repair a failing space station with whatever drifts past the window.' },
  { title: 'Paper Comet', format: 'ps5', a: '#a3adff', b: '#1d2263', motif: 'orb', year: 2024, status: 'finished', score: 9, hours: 18, blurb: 'Fold, crease, and launch a paper comet across a sleeping city.' },
  { title: 'Ember Tide', format: 'ps5', a: '#f2a541', b: '#7a1f1b', motif: 'sun', year: 2025, status: 'playing', score: 8, hours: 12, blurb: 'Ride a burning tide across a volcanic coast before it cools to stone.' },
];

export async function buildDemoShelf(startNo: number): Promise<CaseItem[]> {
  await Promise.all([
    document.fonts.load('700 80px Antonio'),
    document.fonts.load('600 40px Antonio'),
    document.fonts.load('400 30px "Inter Variable"'),
  ]);
  const out: CaseItem[] = [];
  let no = startNo;
  const now = Date.now();
  for (const [i, d] of DEMOS.entries()) {
    const id = uid();
    const front = drawFront(d);
    const back = drawBack(d);
    const inside = drawInside(d);
    await Promise.all([
      putImage(`${id}-front`, await canvasToBlob(front)),
      putImage(`${id}-back`, await canvasToBlob(back)),
      putImage(`${id}-inside`, await canvasToBlob(inside)),
    ]);
    out.push({
      id,
      no: no++,
      kind: FORMATS[d.format].kind,
      title: d.title,
      format: d.format,
      year: d.year,
      score: d.score,
      hours: d.hours,
      review: d.review,
      status: d.status,
      front: `${id}-front`,
      back: `${id}-back`,
      inside: `${id}-inside`,
      tint: averageColor(front),
      addedAt: now - (DEMOS.length - i) * 86_400_000,
      demo: true,
    });
  }
  return out;
}
