import { createStore, get, set, del } from 'idb-keyval';
import type { CaseItem, WishItem } from './types';

const store = createStore('caseshelf', 'kv');

export interface Snapshot {
  cases: CaseItem[];
  wishes: WishItem[];
  nextNo: number;
  seeded: boolean;
}

export async function loadSnapshot(): Promise<Snapshot> {
  const [cases, wishes, nextNo, seeded] = await Promise.all([
    get<CaseItem[]>('cases', store),
    get<WishItem[]>('wishes', store),
    get<number>('nextNo', store),
    get<boolean>('seeded', store),
  ]);
  return { cases: cases ?? [], wishes: wishes ?? [], nextNo: nextNo ?? 1, seeded: seeded ?? false };
}

export const saveCases = (cases: CaseItem[]) => set('cases', cases, store);
export const saveWishes = (wishes: WishItem[]) => set('wishes', wishes, store);
export const saveNextNo = (n: number) => set('nextNo', n, store);
export const saveSeeded = (v: boolean) => set('seeded', v, store);

// Images are stored as Blobs under their own keys so the item list stays small.
const urlCache = new Map<string, string>();

export async function putImage(key: string, blob: Blob) {
  await set(`img:${key}`, blob, store);
  const old = urlCache.get(key);
  if (old) URL.revokeObjectURL(old);
  urlCache.set(key, URL.createObjectURL(blob));
}

export async function imageUrl(key: string): Promise<string | undefined> {
  const hit = urlCache.get(key);
  if (hit) return hit;
  const blob = await get<Blob>(`img:${key}`, store);
  if (!blob) return undefined;
  const url = URL.createObjectURL(blob);
  urlCache.set(key, url);
  return url;
}

export async function deleteImage(key: string) {
  await del(`img:${key}`, store);
  const old = urlCache.get(key);
  if (old) URL.revokeObjectURL(old);
  urlCache.delete(key);
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
