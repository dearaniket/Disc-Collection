import { useCallback, useEffect, useRef, useState } from 'react';
import { CaseScene, type Pose } from './CaseScene';
import { IconCart, IconDisc, IconFlip, IconOpen } from './Icons';
import { FORMATS, MAX_H } from '../lib/formats';
import { useImage, useReducedMotion } from '../lib/useImage';
import type { CaseItem } from '../lib/types';

interface Props {
  items: CaseItem[];
  focusId?: string;
  onEdit: (item: CaseItem) => void;
  onActive: (item?: CaseItem) => void;
  empty: React.ReactNode;
}

export const catalogNo = (n: number) => `No. ${String(n).padStart(4, '0')}`;

export function statusLine(c: CaseItem) {
  const parts: string[] = [];
  if (c.score != null) parts.push(`${c.score}/10`);
  if (c.kind === 'game' && c.hours) parts.push(`${c.hours} h played`);
  if (c.status === 'playing') parts.push('Playing');
  if (c.status === 'finished') parts.push('Finished');
  if (c.status === 'watched') parts.push('Watched');
  return parts.join(' · ') || 'Not scored yet';
}

export function Feed({ items, focusId, onEdit, onActive, empty }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll('[data-index]').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items]);

  // Jump to a requested case (from Stacks, Capture, or Wishlist).
  useEffect(() => {
    if (!focusId || !root.current) return;
    const i = items.findIndex((c) => c.id === focusId);
    if (i < 0) return;
    root.current.scrollTo({ top: i * root.current.clientHeight, behavior: 'instant' as ScrollBehavior });
    setActive(i);
  }, [focusId, items]);

  useEffect(() => {
    onActive(items[active]);
  }, [active, items, onActive]);

  if (!items.length) return <div className="feed feed--empty">{empty}</div>;

  return (
    <>
      <div className="feed" ref={root}>
        {items.map((c, i) => (
          <Slide key={c.id} item={c} index={i} active={i === active} onEdit={onEdit} />
        ))}
      </div>
      <div className="pager num" aria-live="polite">
        {active + 1}
        <span> / {items.length}</span>
      </div>
    </>
  );
}

function Slide({ item, index, active, onEdit }: { item: CaseItem; index: number; active: boolean; onEdit: (c: CaseItem) => void }) {
  const front = useImage(item.front);
  const back = useImage(item.back);
  const inside = useImage(item.inside);
  const reduced = useReducedMotion();
  const [pose, setPose] = useState<Pose>({ face: 0, open: false, disc: false });
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const f = FORMATS[item.format];
  const isCart = item.format === 'switch';

  useEffect(() => {
    if (!active) {
      setReady(false);
      setPose({ face: 0, open: false, disc: false });
      setExpanded(false);
    }
  }, [active]);

  const onFace = useCallback((face: 0 | 1) => setPose((p) => (p.face === face ? p : { ...p, face })), []);
  const onReady = useCallback(() => setReady(true), []);

  const flip = () => setPose((p) => ({ face: p.face ? 0 : 1, open: false, disc: false }));
  const open = () => setPose((p) => ({ face: 0, open: !p.open, disc: p.open ? false : p.disc }));
  const disc = () => setPose((p) => ({ face: 0, open: true, disc: !p.disc }));

  const urls = { front, back, inside };

  return (
    <section className="slide" data-index={index} aria-label={`${item.title}, ${catalogNo(item.no)}`}>
      <div className="stage">
        {front && (
          <img
            className="stage__still"
            src={front}
            alt=""
            style={{ height: `calc(var(--stage-h) * 0.58 * ${f.h / MAX_H})`, aspectRatio: `${f.w} / ${f.h}`, opacity: ready ? 0 : 1, translate: `0 calc(var(--stage-h) * 0.29 * ${(MAX_H - f.h) / MAX_H})` }}
          />
        )}
        {active && front && (
          <div className="stage__live" style={{ opacity: ready ? 1 : 0 }}>
            <CaseScene item={item} urls={urls} pose={pose} onFace={onFace} onReady={onReady} reduced={reduced} />
          </div>
        )}
      </div>

      <div className="rail" role="toolbar" aria-label="Handle case">
        <button className="rail__btn" onClick={flip} aria-pressed={pose.face === 1}>
          <IconFlip size={26} />
          <span>{pose.face ? 'Front' : 'Back'}</span>
        </button>
        <button className="rail__btn" onClick={open} aria-pressed={pose.open}>
          <IconOpen size={26} />
          <span>{pose.open ? 'Close' : 'Open'}</span>
        </button>
        <button className="rail__btn" onClick={disc} aria-pressed={pose.disc}>
          {isCart ? <IconCart size={26} /> : <IconDisc size={26} />}
          <span>{pose.disc ? 'Put back' : isCart ? 'Cart' : 'Disc'}</span>
        </button>
        <button className="rail__btn rail__score" onClick={() => onEdit(item)} aria-label={item.score != null ? `Score ${item.score} of 10, edit` : 'Add score'}>
          <b>{item.score ?? '–'}</b>
          <span>Score</span>
        </button>
      </div>

      <div className="caption">
        <h2 className="caption__title">{item.title}</h2>
        <div className="caption__meta">
          <span className="num">{catalogNo(item.no)}</span>
          <span>{f.label}</span>
          {item.year && <span className="num">{item.year}</span>}
          {item.demo && <span className="tag">Sample</span>}
        </div>
        <p className="caption__status">{statusLine(item)}</p>
        {item.review && (
          <button className={`caption__review${expanded ? ' is-open' : ''}`} onClick={() => setExpanded((e) => !e)} aria-expanded={expanded}>
            {item.review}
          </button>
        )}
        <button className="caption__edit" onClick={() => onEdit(item)}>
          Edit details
        </button>
      </div>
    </section>
  );
}
