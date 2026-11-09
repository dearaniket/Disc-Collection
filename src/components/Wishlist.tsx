import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FORMATS, formatsFor } from '../lib/formats';
import { uid } from '../lib/db';
import { useStore } from '../lib/store';
import { IconCheck, IconClose, IconHeart } from './Icons';
import type { FormatId, Kind, WishItem } from '../lib/types';

interface Props {
  onOwn: (w: WishItem) => void;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function Wishlist({ onOwn }: Props) {
  const { wishes, addWish, removeWish } = useStore();
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Kind>('game');
  const [format, setFormat] = useState<FormatId>('ps5');
  const reduce = useReducedMotion();

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addWish({ id: uid(), title: title.trim(), kind, format, addedAt: Date.now() });
    setTitle('');
  };

  return (
    <div className="wish">
      <header className="wish__head">
        <h1 className="stacks__title">Wishlist</h1>
        <p className="stacks__count num">{wishes.length ? `${wishes.length} wanted` : 'Nothing wanted yet'}</p>
      </header>

      <form className="wish__form" onSubmit={add}>
        <div className="wish__line">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title you're hunting for" aria-label="Wanted title" />
          <button className="btn btn--primary" type="submit" disabled={!title.trim()}>
            <IconHeart size={18} /> Want
          </button>
        </div>
        <div className="wish__opts">
          <div className="seg" role="tablist" aria-label="Kind">
            {(['game', 'movie'] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={kind === k}
                className="seg__btn"
                onClick={() => {
                  setKind(k);
                  setFormat(formatsFor(k)[0].id);
                }}
              >
                {k === 'game' ? 'Game' : 'Movie'}
              </button>
            ))}
          </div>
          <select className="input select" value={format} onChange={(e) => setFormat(e.target.value as FormatId)} aria-label="Format">
            {formatsFor(kind).map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {wishes.length === 0 ? (
        <p className="wish__empty">Add a title you're hunting for. When you find a copy, check it off and it goes straight to Capture with the title and format filled in.</p>
      ) : (
        <ul className="wish__list">
          <AnimatePresence initial={false}>
            {wishes.map((w) => {
              const f = FORMATS[w.format];
              return (
                <motion.li
                  key={w.id}
                  className="wish__row"
                  layout={!reduce}
                  initial={{ opacity: 0, y: reduce ? 0 : -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                  <i className="wish__swatch" style={{ background: f.plastic }} />
                  <div className="wish__text">
                    <b>{w.title}</b>
                    <span>
                      {f.label} · {w.kind === 'game' ? 'Game' : 'Movie'}
                    </span>
                  </div>
                  <button className="icon-btn icon-btn--own" onClick={() => onOwn(w)} aria-label={`I own ${w.title} now`}>
                    <IconCheck />
                  </button>
                  <button className="icon-btn" onClick={() => removeWish(w.id)} aria-label={`Stop wanting ${w.title}`}>
                    <IconClose />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
