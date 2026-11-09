import { useMemo, useRef, useState } from 'react';
import { FORMATS } from '../lib/formats';
import { IconShuffle } from './Icons';
import { catalogNo, statusLine } from './Feed';
import type { CaseItem, Kind } from '../lib/types';
import { useReducedMotion } from '../lib/useImage';

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

/** Shelf order ignores a leading article, as collectors file them. */
export const sortKey = (t: string) => t.replace(/^(the|a|an)\s+/i, '').toUpperCase();
const letterOf = (t: string) => {
  const c = sortKey(t)[0] ?? '#';
  return c >= 'A' && c <= 'Z' ? c : '#';
};

interface Props {
  cases: CaseItem[];
  onOpen: (c: CaseItem) => void;
}

export function Stacks({ cases, onOpen }: Props) {
  const [filter, setFilter] = useState<'all' | Kind>('all');
  const [picked, setPicked] = useState<string>();
  const shelf = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const list = useMemo(
    () => cases.filter((c) => filter === 'all' || c.kind === filter).sort((a, b) => sortKey(a.title).localeCompare(sortKey(b.title))),
    [cases, filter],
  );
  const firstByLetter = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of list) {
      const l = letterOf(c.title);
      if (!m.has(l)) m.set(l, c.id);
    }
    return m;
  }, [list]);

  const scrollToId = (id: string, smooth = true) => {
    const el = shelf.current?.querySelector<HTMLElement>(`[data-id="${id}"]`);
    if (!el || !shelf.current) return;
    const left = el.offsetLeft - shelf.current.clientWidth / 2 + el.offsetWidth / 2;
    shelf.current.scrollTo({ left, behavior: smooth && !reduced ? 'smooth' : 'auto' });
  };

  const scrubTo = (clientX: number, row: HTMLElement) => {
    const r = row.getBoundingClientRect();
    const i = Math.max(0, Math.min(LETTERS.length - 1, Math.floor(((clientX - r.left) / r.width) * LETTERS.length)));
    const id = firstByLetter.get(LETTERS[i]);
    if (id) scrollToId(id, false);
  };

  const shuffle = () => {
    if (!list.length) return;
    let next = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1) while (next.id === picked) next = list[Math.floor(Math.random() * list.length)];
    setPicked(next.id);
    scrollToId(next.id);
  };

  const current = list.find((c) => c.id === picked);

  return (
    <div className="stacks">
      <header className="stacks__head">
        <h1 className="stacks__title">Stacks</h1>
        <button className="icon-btn" onClick={shuffle} aria-label="Pull a random case">
          <IconShuffle />
        </button>
        <div className="seg stacks__filter" role="tablist" aria-label="Filter shelf">
          {(['all', 'game', 'movie'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={filter === k} className="seg__btn" onClick={() => setFilter(k)}>
              {k === 'all' ? 'All' : k === 'game' ? 'Games' : 'Movies'}
            </button>
          ))}
        </div>
      </header>

      <p className="stacks__count num">{list.length} cases, A to Z</p>

      {list.length === 0 ? (
        <p className="stacks__empty">Nothing on this shelf yet.</p>
      ) : (
        <div className="shelf" ref={shelf}>
          <div className="shelf__row">
            {list.map((c) => {
              const f = FORMATS[c.format];
              const on = c.id === picked;
              return (
                <button
                  key={c.id}
                  data-id={c.id}
                  className={`spine${on ? ' is-out' : ''}`}
                  style={{ ['--w' as string]: f.d, ['--h' as string]: f.h, ['--plastic' as string]: f.plastic, ['--tint' as string]: c.tint, color: f.ink }}
                  onClick={() => (on ? onOpen(c) : setPicked(c.id))}
                  aria-label={`${c.title}, ${f.label}${on ? ', pulled out. Activate again to open' : ''}`}
                  aria-pressed={on}
                >
                  <span className="spine__fmt">{f.label}</span>
                  <span className="spine__title">{c.title}</span>
                  <span className="spine__no num">{String(c.no).padStart(4, '0')}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        className="index"
        role="slider"
        aria-label="Jump to letter"
        aria-valuemin={0}
        aria-valuemax={LETTERS.length - 1}
        aria-valuenow={0}
        tabIndex={0}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          scrubTo(e.clientX, e.currentTarget);
        }}
        onPointerMove={(e) => {
          if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) scrubTo(e.clientX, e.currentTarget);
        }}
      >
        {LETTERS.map((l) => (
          <span key={l} className={`index__cell${firstByLetter.has(l) ? '' : ' is-empty'}`}>
            {l}
          </span>
        ))}
      </div>

      <div className="pulled" aria-live="polite">
        {current ? (
          <>
            <div className="pulled__title">{current.title}</div>
            <div className="pulled__meta num">
              {catalogNo(current.no)} · {FORMATS[current.format].label}
              {current.year ? ` · ${current.year}` : ''}
            </div>
            <div className="pulled__status">{statusLine(current)}</div>
            <button className="btn btn--primary" onClick={() => onOpen(current)}>
              Open case
            </button>
          </>
        ) : (
          <p className="pulled__hint">Tap a spine to pull it out. Drag along the letters to jump.</p>
        )}
      </div>
    </div>
  );
}
