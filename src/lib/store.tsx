import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { deleteImage, loadSnapshot, saveCases, saveNextNo, saveSeeded, saveWishes } from './db';
import { buildDemoShelf } from './seed';
import type { CaseItem, WishItem } from './types';

interface Store {
  ready: boolean;
  cases: CaseItem[];
  wishes: WishItem[];
  hasDemo: boolean;
  addCase: (c: Omit<CaseItem, 'no'>) => Promise<CaseItem>;
  updateCase: (id: string, patch: Partial<CaseItem>) => void;
  deleteCase: (id: string) => Promise<void>;
  addWish: (w: WishItem) => void;
  removeWish: (id: string) => void;
  clearDemo: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const nextNo = useRef(1);

  useEffect(() => {
    let alive = true;
    (async () => {
      const snap = await loadSnapshot();
      nextNo.current = snap.nextNo;
      let list = snap.cases;
      if (!snap.seeded) {
        list = await buildDemoShelf(nextNo.current);
        nextNo.current += list.length;
        await Promise.all([saveCases(list), saveNextNo(nextNo.current), saveSeeded(true)]);
      }
      if (!alive) return;
      setCases(list);
      setWishes(snap.wishes);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const commitCases = useCallback((fn: (prev: CaseItem[]) => CaseItem[]) => {
    setCases((prev) => {
      const next = fn(prev);
      void saveCases(next);
      return next;
    });
  }, []);

  const commitWishes = useCallback((fn: (prev: WishItem[]) => WishItem[]) => {
    setWishes((prev) => {
      const next = fn(prev);
      void saveWishes(next);
      return next;
    });
  }, []);

  const addCase = useCallback(
    async (c: Omit<CaseItem, 'no'>) => {
      const item = { ...c, no: nextNo.current++ } as CaseItem;
      await saveNextNo(nextNo.current);
      commitCases((prev) => [...prev, item]);
      return item;
    },
    [commitCases],
  );

  const updateCase = useCallback(
    (id: string, patch: Partial<CaseItem>) => commitCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [commitCases],
  );

  const deleteCase = useCallback(
    async (id: string) => {
      const target = cases.find((c) => c.id === id);
      commitCases((prev) => prev.filter((c) => c.id !== id));
      if (target) await Promise.all([target.front, target.back, target.inside].filter(Boolean).map((k) => deleteImage(k!)));
    },
    [cases, commitCases],
  );

  const clearDemo = useCallback(async () => {
    const demos = cases.filter((c) => c.demo);
    commitCases((prev) => prev.filter((c) => !c.demo));
    await Promise.all(demos.flatMap((c) => [c.front, c.back, c.inside].filter(Boolean).map((k) => deleteImage(k!))));
  }, [cases, commitCases]);

  const value = useMemo<Store>(
    () => ({
      ready,
      cases,
      wishes,
      hasDemo: cases.some((c) => c.demo),
      addCase,
      updateCase,
      deleteCase,
      addWish: (w) => commitWishes((prev) => [w, ...prev]),
      removeWish: (id) => commitWishes((prev) => prev.filter((w) => w.id !== id)),
      clearDemo,
    }),
    [ready, cases, wishes, addCase, updateCase, deleteCase, commitWishes, clearDemo],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
