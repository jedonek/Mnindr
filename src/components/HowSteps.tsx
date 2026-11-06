import { Icon } from '@/components/ui/Icon';

/** Tři kroky k seznámení – používá landing i /how-it-works. */
export function HowSteps() {
  return (
    <div className="grid-3">
      <article className="card">
        <div className="step__preview">
          <strong>Mia, 23</strong>
          <span className="caption muted">Praha · milovnice koček</span>
          <span className="tag" style={{ alignSelf: 'flex-start' }}>
            Káva a anime
          </span>
        </div>
        <h3>
          <span className="step__number">1</span>Vytvoř profil
        </h3>
        <p className="caption">Přidej fotku, pár slov o sobě a své zájmy. Ukaž, co tě dělá tebou.</p>
      </article>

      <article className="card">
        <div className="step__preview" style={{ alignItems: 'center' }}>
          <Icon name="heart" size={40} filled style={{ color: 'var(--raspberry)' }} />
          <span className="caption" style={{ color: 'var(--raspberry)', fontWeight: 700 }}>
            Je to match!
          </span>
        </div>
        <h3>
          <span className="step__number">2</span>Swipe a seznamuj se
        </h3>
        <p className="caption">
          Zaujal tě někdo? Dej mu srdíčko. Když sympatie přeskočí oběma, je to match!
        </p>
      </article>

      <article className="card">
        <div className="step__preview">
          <span className="bubble">Mňau! Taky miluješ kočky?</span>
          <span className="bubble bubble--me">Mňau! A co zajít na kávu?</span>
        </div>
        <h3>
          <span className="step__number">3</span>Napiš první mňau
        </h3>
        <p className="caption">
          Prolom ledy první zprávou. Z jednoho mňau může být chat, káva i něco víc.
        </p>
      </article>
    </div>
  );
}
