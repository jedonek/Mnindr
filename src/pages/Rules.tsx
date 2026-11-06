import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Mascot, Sparkle } from '@/components/ui/Mascot';
import { SUPPORT_EMAIL } from './Support';

const PILLARS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'verified',
    title: 'Ověřené profily',
    text: 'Ověření ti pomůže poznat, že za profilem stojí skutečný člověk, ne falešné mňau.',
  },
  {
    icon: 'lock',
    title: 'Tvá data pod kontrolou',
    text: 'Sám rozhoduješ, co o sobě budeš sdílet, a nastavení soukromí můžeš kdykoli změnit.',
  },
  {
    icon: 'flag',
    title: 'Nahlášení a blokace',
    text: 'Nevhodné chování snadno nahlásíš a kohokoli můžeš zablokovat přímo z profilu nebo chatu.',
  },
];

const RULES = [
  'Buď sám sebou – falešné profily a cizí fotky nejsou povolené.',
  'Respektuj ostatní. Urážky, výhrůžky a obtěžování tu nemají místo.',
  'Nesdílej cizí osobní údaje ani nevyžádaný obsah.',
  'Žádný spam, reklama ani podvodné nabídky.',
  'Hlas „ne“ je vždy v pořádku. Rozhodnutí druhých přijmi.',
];

/** GET /rules – zásady komunity a bezpečnost. */
export function Rules() {
  return (
    <>
      <section className="hero">
        <div className="hero__side">
          <Mascot variant="girl" />
        </div>
        <div className="hero__center">
          <span className="eyebrow">
            <Icon name="heart" size={22} filled />
            Bezpečí na prvním místě
          </span>
          <h1>Seznamuj se s klidem</h1>
          <p className="muted">
            Tvoje pohodlí a soukromí jsou pro nás důležité.
            <br />
            Ty určuješ tempo. My ti kryjeme záda.
          </p>
        </div>
        <div className="hero__side">
          <Mascot variant="boy" />
        </div>
      </section>

      <div className="container">
        <section className="section">
          <h2 className="section__title">Dobré mňau začíná důvěrou.</h2>
          <p className="section__lead">Buď sám sebou, respektuj ostatní a sdílej jen to, co je ti příjemné.</p>
          <div className="grid-3">
            {PILLARS.map((p) => (
              <article key={p.title} className="card feature-card">
                <span className="feature-card__icon">
                  <Icon name={p.icon} size={22} />
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="zasady">
          <h2 className="section__title" style={{ marginBottom: 24 }}>
            Zásady komunity
          </h2>
          <div className="card">
            <ul style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {RULES.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section">
          <div className="cta-banner">
            <Sparkle size={56} />
            <div className="cta-banner__text">
              <h3>Potřebuješ pomoc?</h3>
              <p className="muted">Nenecháme tě v tom. Ozvi se nám, jsme tu pro tebe.</p>
            </div>
            <Button href={`mailto:${SUPPORT_EMAIL}`}>Kontaktovat podporu</Button>
          </div>
        </section>
      </div>
    </>
  );
}
