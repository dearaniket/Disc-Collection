import { useEffect, useState } from 'react';
import { imageUrl } from './db';

export function useImage(key?: string) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let alive = true;
    if (!key) {
      setUrl(undefined);
      return;
    }
    imageUrl(key).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [key]);
  return url;
}

export function useReducedMotion() {
  const q = '(prefers-reduced-motion: reduce)';
  const [r, setR] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const m = matchMedia(q);
    const on = () => setR(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return r;
}
