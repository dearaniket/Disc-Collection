import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { PhotoSlot, type Photo } from './PhotoSlot';
import { FORMATS, formatsFor } from '../lib/formats';
import { putImage, uid } from '../lib/db';
import { prepareCover } from '../lib/image';
import { useStore } from '../lib/store';
import type { CaseItem, FormatId, Kind } from '../lib/types';

export interface Prefill {
  title: string;
  kind: Kind;
  format: FormatId;
  wishId?: string;
}

interface Props {
  open: boolean;
  prefill?: Prefill;
  onOpenChange: (o: boolean) => void;
  onSaved: (c: CaseItem) => void;
}

export function CaptureSheet({ open, prefill, onOpenChange, onSaved }: Props) {
  const { addCase, removeWish } = useStore();
  const [kind, setKind] = useState<Kind>('game');
  const [format, setFormat] = useState<FormatId>('ps5');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [photos, setPhotos] = useState<{ front?: Photo; back?: Photo; inside?: Photo }>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setKind(prefill?.kind ?? 'game');
    setFormat(prefill?.format ?? 'ps5');
    setTitle(prefill?.title ?? '');
    setYear('');
    setPhotos({});
    setError('');
  }, [open, prefill]);

  const f = FORMATS[format];
  const aspect = f.w / f.h;

  const switchKind = (k: Kind) => {
    setKind(k);
    if (FORMATS[format].kind !== k) setFormat(formatsFor(k)[0].id);
  };

  const save = async () => {
    if (!photos.front) return setError('Add a front photo. It becomes the cover of the case.');
    if (!title.trim()) return setError('Add a title so the case can be filed on the shelf.');
    setError('');
    setSaving(true);
    try {
      const id = uid();
      const keys: Partial<Record<'front' | 'back' | 'inside', string>> = {};
      let tint = f.plastic;
      for (const side of ['front', 'back', 'inside'] as const) {
        const p = photos[side];
        if (!p) continue;
        const out = await prepareCover(p.file, aspect, p.turns);
        await putImage(`${id}-${side}`, out.blob);
        keys[side] = `${id}-${side}`;
        if (side === 'front') tint = out.tint;
      }
      const y = Number(year);
      const item = await addCase({
        id,
        kind,
        title: title.trim(),
        format,
        year: y >= 1970 && y <= 2100 ? y : undefined,
        status: 'none',
        front: keys.front!,
        back: keys.back,
        inside: keys.inside,
        tint,
        addedAt: Date.now(),
      });
      if (prefill?.wishId) removeWish(prefill.wishId);
      onSaved(item);
      onOpenChange(false);
    } catch {
      setError('That photo could not be read. Try a JPEG or PNG from your camera roll.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="sheet-overlay" />
        <Drawer.Content className="sheet" aria-describedby={undefined}>
          <div className="sheet__grip" />
          <div className="sheet__scroll">
            <Drawer.Title className="sheet__title">{prefill ? `Add ${prefill.title}` : 'Add a case'}</Drawer.Title>

            <div className="seg seg--wide" role="tablist" aria-label="Kind">
              {(['game', 'movie'] as const).map((k) => (
                <button key={k} role="tab" aria-selected={kind === k} className="seg__btn" onClick={() => switchKind(k)}>
                  {k === 'game' ? 'Game' : 'Movie'}
                </button>
              ))}
            </div>

            <fieldset className="field">
              <legend>Format</legend>
              <div className="chips">
                {formatsFor(kind).map((x) => (
                  <button key={x.id} type="button" className="chip" aria-pressed={format === x.id} onClick={() => setFormat(x.id)} style={{ ['--plastic' as string]: x.plastic }}>
                    <i className="chip__swatch" />
                    {x.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="slots">
              <PhotoSlot label="Front" aspect={aspect} photo={photos.front} required onChange={(p) => setPhotos((s) => ({ ...s, front: p }))} />
              <PhotoSlot label="Back" hint="Optional" aspect={aspect} photo={photos.back} onChange={(p) => setPhotos((s) => ({ ...s, back: p }))} />
              <PhotoSlot label="Inside" hint="Optional" aspect={aspect} photo={photos.inside} onChange={(p) => setPhotos((s) => ({ ...s, inside: p }))} />
            </div>
            <p className="field__note">Photos are cropped to the {f.label} case shape ({f.w} × {f.h} mm). Shoot straight on, case filling the frame.</p>

            <label className="field">
              <span>Title</span>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="As printed on the spine" autoComplete="off" />
            </label>
            <label className="field">
              <span>Year</span>
              <input className="input num" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Optional" inputMode="numeric" />
            </label>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="sheet__foot">
            <button className="btn btn--primary btn--block" onClick={save} disabled={saving}>
              {saving ? 'Shelving…' : 'Put it on the shelf'}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
