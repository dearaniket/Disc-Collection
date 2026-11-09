import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { PhotoSlot, type Photo } from './PhotoSlot';
import { FORMATS, formatsFor } from '../lib/formats';
import { putImage } from '../lib/db';
import { prepareCover } from '../lib/image';
import { useStore } from '../lib/store';
import { useImage } from '../lib/useImage';
import type { CaseItem, FormatId, Status } from '../lib/types';
import { catalogNo } from './Feed';

interface Props {
  item?: CaseItem;
  onClose: () => void;
}

export function EditSheet({ item, onClose }: Props) {
  const open = !!item;
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay" />
        <Drawer.Content className="sheet" aria-describedby={undefined}>
          <div className="sheet__grip" />
          {item && <EditBody key={item.id} item={item} onClose={onClose} />}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function EditBody({ item, onClose }: { item: CaseItem; onClose: () => void }) {
  const { updateCase, deleteCase } = useStore();
  const [score, setScore] = useState<number | undefined>(item.score);
  const [status, setStatus] = useState<Status>(item.status);
  const [hours, setHours] = useState(item.hours ? String(item.hours) : '');
  const [review, setReview] = useState(item.review ?? '');
  const [title, setTitle] = useState(item.title);
  const [year, setYear] = useState(item.year ? String(item.year) : '');
  const [format, setFormat] = useState<FormatId>(item.format);
  const [photos, setPhotos] = useState<{ front?: Photo; back?: Photo; inside?: Photo }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const urls = { front: useImage(item.front), back: useImage(item.back), inside: useImage(item.inside) };
  const f = FORMATS[format];
  const aspect = f.w / f.h;

  useEffect(() => setConfirmDelete(false), [item.id]);

  const statuses: { id: Status; label: string }[] =
    item.kind === 'game'
      ? [
          { id: 'none', label: 'Unplayed' },
          { id: 'playing', label: 'Playing' },
          { id: 'finished', label: 'Finished' },
        ]
      : [
          { id: 'none', label: 'Unwatched' },
          { id: 'watched', label: 'Watched' },
        ];

  const save = async () => {
    setSaving(true);
    const patch: Partial<CaseItem> = {
      score,
      status,
      hours: Number(hours) > 0 ? Number(hours) : undefined,
      review: review.trim() || undefined,
      title: title.trim() || item.title,
      year: Number(year) >= 1970 ? Number(year) : undefined,
      format,
    };
    for (const side of ['front', 'back', 'inside'] as const) {
      const p = photos[side];
      if (!p) continue;
      const out = await prepareCover(p.file, aspect, p.turns);
      const key = `${item.id}-${side}-${Date.now().toString(36)}`;
      await putImage(key, out.blob);
      patch[side] = key;
      if (side === 'front') patch.tint = out.tint;
    }
    updateCase(item.id, patch);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="sheet__scroll">
        <Drawer.Title className="sheet__title">{item.title}</Drawer.Title>
        <p className="sheet__meta num">
          {catalogNo(item.no)} · {FORMATS[item.format].label}
        </p>

        <fieldset className="field">
          <legend>Score out of 10</legend>
          <div className="score" role="radiogroup" aria-label="Score out of 10">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} role="radio" aria-checked={score === n} className="score__cell num" onClick={() => setScore(score === n ? undefined : n)}>
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Status</legend>
          <div className="seg seg--wide" role="radiogroup">
            {statuses.map((s) => (
              <button key={s.id} role="radio" aria-checked={status === s.id} className="seg__btn" aria-selected={status === s.id} onClick={() => setStatus(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {item.kind === 'game' && (
          <label className="field">
            <span>Hours played</span>
            <input className="input num" value={hours} inputMode="numeric" onChange={(e) => setHours(e.target.value.replace(/\D/g, '').slice(0, 5))} placeholder="0" />
          </label>
        )}

        <label className="field">
          <span>Review</span>
          <textarea className="input input--area" value={review} onChange={(e) => setReview(e.target.value)} placeholder="What stayed with you" rows={4} />
        </label>

        <h3 className="sheet__section">Case details</h3>
        <label className="field">
          <span>Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>Year</span>
          <input className="input num" value={year} inputMode="numeric" onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        </label>
        <fieldset className="field">
          <legend>Format</legend>
          <div className="chips">
            {formatsFor(item.kind).map((x) => (
              <button key={x.id} type="button" className="chip" aria-pressed={format === x.id} onClick={() => setFormat(x.id)} style={{ ['--plastic' as string]: x.plastic }}>
                <i className="chip__swatch" />
                {x.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="slots">
          <PhotoSlot label="Front" aspect={aspect} photo={photos.front} existingUrl={urls.front} onChange={(p) => setPhotos((s) => ({ ...s, front: p }))} />
          <PhotoSlot label="Back" aspect={aspect} photo={photos.back} existingUrl={urls.back} onChange={(p) => setPhotos((s) => ({ ...s, back: p }))} />
          <PhotoSlot label="Inside" aspect={aspect} photo={photos.inside} existingUrl={urls.inside} onChange={(p) => setPhotos((s) => ({ ...s, inside: p }))} />
        </div>

        <div className="danger">
          {confirmDelete ? (
            <>
              <p>Remove {item.title} from the shelf? Its photos are deleted too. {catalogNo(item.no)} is not reused.</p>
              <div className="danger__row">
                <button className="btn" onClick={() => setConfirmDelete(false)}>
                  Keep it
                </button>
                <button
                  className="btn btn--danger"
                  onClick={async () => {
                    await deleteCase(item.id);
                    onClose();
                  }}
                >
                  Remove case
                </button>
              </div>
            </>
          ) : (
            <button className="btn btn--quiet" onClick={() => setConfirmDelete(true)}>
              Remove from shelf
            </button>
          )}
        </div>
      </div>
      <div className="sheet__foot">
        <button className="btn btn--primary btn--block" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </>
  );
}
