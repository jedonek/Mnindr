interface AvatarProps {
  name: string;
  photo?: string;
  background?: string;
}

/** Kulatý avatar – fotka, nebo iniciála na barevném pozadí. */
export function Avatar({ name, photo, background }: AvatarProps) {
  return (
    <span className="avatar" style={background ? { background } : undefined} aria-hidden="true">
      {photo ? <img src={photo} alt="" /> : (name.trim()[0] ?? '?').toUpperCase()}
    </span>
  );
}
