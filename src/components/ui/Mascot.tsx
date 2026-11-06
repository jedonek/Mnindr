import { useState } from 'react';

interface MascotProps {
  variant: 'girl' | 'boy';
  className?: string;
}

/**
 * Maskot z Figmy. Obrázky patří do /public/images/girl.png a boy.png.
 * Když chybí, zobrazí se náhradní silueta, ať se layout nerozbije.
 */
export function Mascot({ variant, className = '' }: MascotProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="mascot-fallback" role="img" aria-label="Zástupný obrázek maskota">
        Sem patří obrázek <br />
        /images/{variant}.png
      </div>
    );
  }
  return (
    <img
      className={`mascot ${className}`}
      src={`/images/${variant}.png`}
      alt=""
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

export function Sparkle({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2c.9 5.500 3.500 8.100 10 10-6.500 1.900-9.100 4.500-10 10-.9-5.500-3.500-8.100-10-10 6.500-1.900 9.100-4.500 10-10z"
        fill="#FFE08A"
        stroke="#3B1D2A"
        strokeWidth="1.600"
        strokeLinejoin="round"
      />
    </svg>
  );
}
