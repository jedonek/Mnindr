import type { ReactNode, SVGProps } from 'react';

export type IconName =
  | 'user'
  | 'heart'
  | 'x'
  | 'sparkle'
  | 'verified'
  | 'lock'
  | 'shield'
  | 'chat'
  | 'search'
  | 'save'
  | 'palette'
  | 'chevron'
  | 'arrow-right'
  | 'flag'
  | 'ban'
  | 'send'
  | 'mail';

const PATHS: Record<IconName, ReactNode> = {
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  heart: <path d="M12 20s-8-4.800-8-10.500A4.500 4.500 0 0 1 12 7a4.500 4.500 0 0 1 8 2.500C20 15.200 12 20 12 20z" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  sparkle: <path d="M12 3c.8 5 3.200 7.500 9 9-5.800 1.500-8.200 4-9 9-.8-5-3.200-7.500-9-9 5.800-1.500 8.200-4 9-9z" />,
  verified: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z" />
      <path d="M12 8v5M12 16.500v.01" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.500 7.200L4 20l1-4.500A8 8 0 1 1 21 12z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  save: (
    <>
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M8 4v5h7V4M8 20v-6h8v6" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.500 0 2-1 1.500-2-.6-1.200.2-2.500 1.500-2.500H17a4 4 0 0 0 4-4c0-5-4-9.500-9-9.500z" />
      <path d="M8 11h.01M12 7.500h.01M16 11h.01" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  flag: <path d="M5 21V4M5 4h12l-2 4 2 4H5" />,
  ban: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6 6l12 12" />
    </>
  ),
  send: <path d="M4 12l16-8-6 16-3-7z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  filled?: boolean;
}

/** Obrysové ikony, čára 3 px, zaoblené zakončení (viz design systém). */
export function Icon({ name, size = 22, filled = false, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
