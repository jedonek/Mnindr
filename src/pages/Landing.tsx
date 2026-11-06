import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { HowSteps } from '@/components/HowSteps';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Mascot, Sparkle } from '@/components/ui/Mascot';

/** GET / – úvodní stránka. */
export function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/discover" replace />;

  return (
    <>
      <section className="hero hero--landing">
        <div className="hero__side">
          <Mascot variant="girl" />
        </div>
        <div className="hero__center">
          <h1>Swajpuj a hledej svého ušatého partnera</h1>
          <Button to="/register">Zaregistrovat se</Button>
          <Sparkle size={48} />
          <p style={{ fontWeight: 700 }}>Láska začíná jedním mňau!</p>
        </div>
        <div className="hero__side">
          <Mascot variant="boy" />
        </div>
      </section>

      <div className="container">
        <section className="section" aria-labelledby="steps-title">
          <p className="center">
            <span className="eyebrow">
              <Icon name="heart" size={22} filled />
              Tři kroky k seznámení
            </span>
          </p>
          <h2 id="steps-title" className="section__title" style={{ marginTop: 8 }}>
            Jak to funguje?
          </h2>
          <p className="section__lead">Najdi někoho, kdo je na stejné vlně. Od prvního swipu až po společné předení.</p>
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
      </div>
    </>
  );
}
