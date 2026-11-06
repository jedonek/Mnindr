const CONTENT = {
  terms: {
    title: 'Obchodní podmínky',
    body: [
      'Tento text je zástupný. Před spuštěním ho nahraď skutečnými obchodními podmínkami.',
      'Služba MŇINDR je určena osobám starším 18 let. Uživatel odpovídá za pravdivost údajů ve svém profilu.',
    ],
  },
  privacy: {
    title: 'Ochrana soukromí',
    body: [
      'Tento text je zástupný. Před spuštěním ho nahraď skutečnými zásadami zpracování osobních údajů.',
      'Ostatním uživatelům zobrazujeme pouze přezdívku, věk, vzdálenost, fotku a popis. E-mail ani telefon nezveřejňujeme.',
    ],
  },
} as const;

/** GET /terms, /privacy – zástupné právní texty. */
export function Legal({ kind }: { kind: keyof typeof CONTENT }) {
  const { title, body } = CONTENT[kind];
  return (
    <article className="prose">
      <h1>{title}</h1>
      {body.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </article>
  );
}
