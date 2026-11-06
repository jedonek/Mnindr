import { FAQ } from '@/data/faq';
import { HowSteps } from '@/components/HowSteps';
import { Button } from '@/components/ui/Button';
import { FaqList } from '@/components/ui/FaqList';
import { Icon } from '@/components/ui/Icon';
import { Mascot, Sparkle } from '@/components/ui/Mascot';

/** GET /how-it-works – tři kroky + časté dotazy. */
export function HowItWorks() {
  return (
    <>
      <section className="hero">
        <div className="hero__side">
          <Mascot variant="girl" />
        </div>
        <div className="hero__center">
          <span className="eyebrow">
            <Icon name="heart" size={22} filled />
            Tři kroky k seznámení
          </span>
          <h1>Jak to funguje?</h1>
          <p className="muted">
            Najdi někoho, kdo je na stejné vlně.
            <br />
            Od prvního swipu až po společné předení.
          </p>
        </div>
        <div className="hero__side">
          <Mascot variant="boy" />
        </div>
      </section>

      <div className="container">
        <section className="section">
          <h2 className="section__title">Láska začíná jedním mňau!</h2>
          <p className="section__lead">Žádné složitosti. Buď sám sebou, objev spřízněné duše a nech přeskočit jiskru.</p>
          <HowSteps />
        </section>

        <section className="section">
          <div className="cta-banner">
            <Sparkle size={56} />
            <div className="cta-banner__text">
              <h3>Tvoje další mňau může být osudové.</h3>
              <p className="muted">Tak na co čekáš? Tvůj ušatý protějšek už je možná tady.</p>
            </div>
            <Button to="/register">Chci to zkusit</Button>
          </div>
        </section>

        <section className="section">
          <h2 className="section__title" style={{ marginBottom: 24 }}>
            Často se ptáte
          </h2>
          <FaqList items={FAQ.filter((f) => ['zdarma', 'overeni', 'nahlaseni'].includes(f.id))} />
          <p style={{ marginTop: 24 }}>
            <Button to="/support" variant="ghost">
              Napsat podpoře
            </Button>
          </p>
        </section>
      </div>
    </>
  );
}
