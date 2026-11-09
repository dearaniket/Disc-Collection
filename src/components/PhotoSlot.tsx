import { useEffect, useId, useState } from 'react';
import { IconCamera, IconImage, IconRotate, IconClose } from './Icons';

export interface Photo {
  file: Blob;
  turns: number;
}

interface Props {
  label: string;
  hint?: string;
  aspect: number; // w / h
  photo?: Photo;
  existingUrl?: string;
  required?: boolean;
  onChange: (p?: Photo) => void;
}

export function PhotoSlot({ label, hint, aspect, photo, existingUrl, required, onChange }: Props) {
  const id = useId();
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!photo) {
      setPreview(undefined);
      return;
    }
    const u = URL.createObjectURL(photo.file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [photo?.file]);

  const src = preview ?? existingUrl;
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange({ file, turns: 0 });
    e.target.value = '';
  };

  return (
    <div className="slot">
      <div className="slot__frame" style={{ aspectRatio: String(aspect) }}>
        {src ? (
          <img src={src} alt={`${label} photo`} style={{ rotate: `${(photo?.turns ?? 0) * 90}deg`, objectFit: 'cover' }} />
        ) : (
          <span className="slot__empty">{required ? `${label} · needed` : label}</span>
        )}
      </div>
      <div className="slot__label">
        <b>{label}</b>
        {hint && <span>{hint}</span>}
      </div>
      <div className="slot__actions" data-vaul-no-drag>
        <label className="chip" htmlFor={`${id}-cam`}>
          <IconCamera size={18} /> Camera
        </label>
        <input id={`${id}-cam`} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
        <label className="chip" htmlFor={`${id}-lib`}>
          <IconImage size={18} /> Photos
        </label>
        <input id={`${id}-lib`} type="file" accept="image/*" hidden onChange={pick} />
        {photo && (
          <>
            <button type="button" className="chip chip--icon" onClick={() => onChange({ ...photo, turns: (photo.turns + 1) % 4 })} aria-label={`Rotate ${label} photo`}>
              <IconRotate size={18} />
            </button>
            <button type="button" className="chip chip--icon" onClick={() => onChange(undefined)} aria-label={`Remove ${label} photo`}>
              <IconClose size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
