import { useMemo, useState } from 'react';
import { FAQ, FAQ_CATEGORIES, type FaqCategory } from '@/data/faq';
import { Button } from '@/components/ui/Button';
import { FaqList } from '@/components/ui/FaqList';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Mascot, Sparkle } from '@/components/ui/Mascot';

export const SUPPORT_EMAIL = 'podpora@mnindr.cz';

const CATEGORY_CARDS: { id: FaqCategory; icon: IconName; text: string; cta: string }[] = [
  { id: 'ucet', icon: 'user', text: 'Heslo, ověření i úpravy profilu. Najdi cestu zpátky ke svému účtu.', cta: 'Nápověda k účtu' },
  { id: 'seznamovani', icon: 'chat', text: 'Jak fungují srdíčka, vzájemné shody a první společné mňau?', cta: 'Jak to funguje' },
  { id: 'bezpecnost', icon: 'shield', text: 'Měj svá data pod kontrolou. Zjisti, jak nahlásit nebo zablokovat profil.', cta: 'Bezpečí a pravidla' },
];

/** GET /support – nápověda, vyhledávání, kontakt. */
export function Support() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FaqCategory | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter(
      (f) =>
        (!category || f.category === category) &&
        (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Dotaz na podporu MŇINDR')}`;

  return (
    <>
      <section className="hero">
        <div className="hero__side">
          <Mascot variant="girl" />
        </div>
        <div className="hero__center">
          <span className="eyebrow">
            <Icon name="heart" size={22} filled />
            Jsme tu pro tebe
          </span>
          <h1>Podpora</h1>
          <p className="muted">
            Něco se zatoulalo? Pomůžeme ti najít cestu.
            <br />
            Prohledej nápovědu nebo se nám ozvi.
          </p>
          <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
            <Icon name="search" size={18} />
            <label htmlFor="support-search" className="sr-only">
              Co potřebuješ vyřešit?
            </label>
            <input
              id="support-search"
              type="search"
              placeholder="Co potřebuješ vyřešit?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" small>
              Hledat
            </Button>
          </form>
          <span className="caption muted">Zkus třeba: přihlášení, ověření profilu nebo zprávy</span>
        </div>
        <div className="hero__side">
          <Mascot variant="boy" />
        </div>
      </section>

      <div className="container">
        <section className="section">
          <h2 className="section__title" style={{ marginBottom: 24 }}>
            S čím ti můžeme pomoct?
          </h2>
          <div className="grid-3">
            {CATEGORY_CARDS.map((c) => (
              <article key={c.id} className="card feature-card">
                <span className="feature-card__icon">
                  <Icon name={c.icon} size={22} />
                </span>
                <h3>{FAQ_CATEGORIES[c.id]}</h3>
                <p>{c.text}</p>
                <button
                  type="button"
                  className="link-button more"
                  onClick={() => setCategory(category === c.id ? null : c.id)}
                  aria-pressed={category === c.id}
                >
                  {category === c.id ? 'Zobrazit vše' : c.cta}
                  <Icon name="arrow-right" size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section" aria-live="polite">
          <FaqList items={results} />
        </section>

        <section className="section">
          <div className="cta-banner">
            <Sparkle size={56} />
            <div className="cta-banner__text">
              <h3>Nenašel jsi odpověď?</h3>
              <p className="muted">Napiš nám, co tě trápí. Společně se na to podíváme.</p>
            </div>
            <Button href={mailto}>Napsat podpoře</Button>
          </div>
        </section>
      </div>
    </>
  );
}
