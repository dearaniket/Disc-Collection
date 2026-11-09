import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconShelf = (p: P) => (
  <Svg {...p}>
    <rect x="6" y="3" width="12" height="18" rx="1.5" />
    <path d="M9 3v18" />
  </Svg>
);
export const IconStacks = (p: P) => (
  <Svg {...p}>
    <path d="M4 4v16M8 4v16M12 6v14M16.5 5.5l3.5 14" />
    <path d="M2.5 20.5h19" />
  </Svg>
);
export const IconCapture = (p: P) => (
  <Svg {...p}>
    <path d="M12 6v12M6 12h12" />
  </Svg>
);
export const IconHeart = (p: P & { filled?: boolean }) => (
  <Svg {...p} fill={p.filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </Svg>
);
export const IconFlip = (p: P) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
    <path d="M18 3v4h-4M6 21v-4h4" />
  </Svg>
);
export const IconOpen = (p: P) => (
  <Svg {...p}>
    <path d="M12 6v14" />
    <path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5Z" />
  </Svg>
);
export const IconDisc = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 5.5a6.5 6.5 0 0 1 6.5 6.5" opacity=".6" />
  </Svg>
);
export const IconCart = (p: P) => (
  <Svg {...p}>
    <path d="M7 3h10v18H7z" />
    <path d="M10 17h4M7 7h10" />
  </Svg>
);
export const IconPen = (p: P) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
    <path d="M13.5 6.5l4 4" />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const IconShuffle = (p: P) => (
  <Svg {...p}>
    <path d="M3 7h3.5c4 0 6.5 10 11 10H21M3 17h3.5c1.6 0 2.9-1.6 4-3.5M13.5 10c1.1-1.7 2.3-3 4-3H21" />
    <path d="m18 4 3 3-3 3M18 14l3 3-3 3" />
  </Svg>
);
export const IconCamera = (p: P) => (
  <Svg {...p}>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Svg>
);
export const IconImage = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="m4 17 5-5 4 4 2.5-2.5L20 18" />
    <circle cx="15.5" cy="9" r="1.5" />
  </Svg>
);
export const IconRotate = (p: P) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.3-5.7" />
    <path d="M20 4v4h-4" />
  </Svg>
);
export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Svg>
);
