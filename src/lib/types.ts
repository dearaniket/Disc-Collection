export type Kind = 'game' | 'movie';

export type FormatId = 'ps5' | 'ps4' | 'xbox' | 'switch' | 'pc' | 'dvd' | 'bluray' | 'uhd';

export type Status = 'none' | 'playing' | 'finished' | 'watched';

export interface CaseItem {
  id: string;
  /** Catalog number, assigned in order of adding and never reused. */
  no: number;
  kind: Kind;
  title: string;
  format: FormatId;
  year?: number;
  score?: number;
  review?: string;
  hours?: number;
  status: Status;
  /** Image keys in the image store. */
  front: string;
  back?: string;
  inside?: string;
  /** Dominant cover colour, used for the ambient lamp. */
  tint: string;
  addedAt: number;
  demo?: boolean;
}

export interface WishItem {
  id: string;
  kind: Kind;
  title: string;
  format: FormatId;
  addedAt: number;
}
