import { Link } from 'react-router-dom';

export function CatMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M6 4l17 11h18L58 4v28c0 15-11 27-26 27S6 47 6 32z" fill="#FFD2D1" />
      <path d="M32 47s-10-6-10-13.200A5.500 5.500 0 0 1 32 31a5.500 5.500 0 0 1 10 2.800C42 41 32 47 32 47z" fill="#FFF6F3" />
    </svg>
  );
}

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo" aria-label="MŇINDR – domů">
      <CatMark />
      <span>MŇINDR</span>
    </Link>
  );
}
