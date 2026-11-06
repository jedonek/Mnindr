import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import type { Profile, SwipeAction } from '@/types';

const SWIPE_THRESHOLD = 110;

type Leaving = 'left' | 'right' | 'up' | null;

/** GET /discover – hlavní swajpovací obrazovka. */
export function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<Leaving>(null);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    api
      .getDiscoverQueue()
      .then((p) => active && setQueue(p))
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Nepodařilo se načíst profily.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const current = queue[0];

  const act = useCallback(
    async (action: SwipeAction) => {
      if (!current || busy.current) return;
      busy.current = true;
      setLeaving(action === 'dislike' ? 'left' : action === 'superlike' ? 'up' : 'right');
      try {
        const [{ isMatch }] = await Promise.all([
          api.swipe({ targetUserId: current.id, action }),
          new Promise((r) => setTimeout(r, 250)), // doběhne animace karty
        ]);
        setQueue((q) => q.slice(1));
        if (isMatch) setMatched(current);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Akci se nepodařilo uložit.');
      } finally {
        setLeaving(null);
        setDx(0);
        busy.current = false;
      }
    },
    [current],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (busy.current) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setDx(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dx > SWIPE_THRESHOLD) void act('like');
    else if (dx < -SWIPE_THRESHOLD) void act('dislike');
    else setDx(0);
  };

  const cardClass = ['card', 'profile-card', dragging && 'dragging', leaving && `leaving-${leaving}`]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="discover">
      <span className="eyebrow">
        <Icon name="heart" size={22} filled />
        Tvoje další spřízněná duše
      </span>
      <h1>Objevuj nové mňau</h1>
      <p className="muted">Někdo na stejné vlně je možná jen jedno srdíčko daleko.</p>

      {error && <p className="form-error" role="alert">{error}</p>}
      {loading && <p className="muted" role="status">Hledám kočky ve tvém okolí…</p>}

      {!loading && current && (
        <>
          <div className="swipe-stage">
            <div
              className={cardClass}
              style={!leaving ? { transform: `translateX(${dx}px) rotate(${dx / 30}deg)` } : undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="profile-card__photo" style={{ background: current.photoBg }}>
                {current.photo ? (
                  <img src={current.photo} alt={`Fotka profilu ${current.nickname}`} />
                ) : (
                  <Avatar name={current.nickname} />
                )}
              </div>
              <div className="profile-card__body">
                {current.verified && (
                  <span className="profile-card__verified">
                    <Icon name="verified" size={18} /> Ověřený profil
                  </span>
                )}
                <h2>
                  {current.nickname}, {current.age}
                </h2>
                <p className="muted">
                  {current.residence} · {current.distanceKm} km od vás
                </p>
                <p>{current.bio}</p>
                <div className="chips">
                  {current.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="swipe-actions">
            <Button variant="ghost" onClick={() => act('dislike')} disabled={!!leaving}>
              <Icon name="x" size={20} /> Ne
            </Button>
            <Button onClick={() => act('superlike')} disabled={!!leaving}>
              <Icon name="sparkle" size={20} /> Super mňau
            </Button>
            <Button variant="secondary" onClick={() => act('like')} disabled={!!leaving}>
              <Icon name="heart" size={20} filled style={{ color: 'var(--raspberry)' }} /> Ano
            </Button>
          </div>
        </>
      )}

      {!loading && !current && !error && (
        <div className="card empty-state">
          <h2>V tvém okolí už nejsou žádné další kočky.</h2>
          <p className="muted">Zkus rozšířit vzdálenost nebo věk partnera.</p>
          <Button to="/profile/preferences">Upravit preference</Button>
          {import.meta.env.DEV && (
            <button
              type="button"
              className="link-button caption"
              onClick={async () => {
                await api.resetSwipes();
                setLoading(true);
                setQueue(await api.getDiscoverQueue());
                setLoading(false);
              }}
            >
              (dev) Vynulovat swipy
            </button>
          )}
        </div>
      )}

      {matched && user && (
        <Modal
          title="Je to match!"
          onClose={() => setMatched(null)}
          actions={
            <>
              <Button onClick={() => navigate('/chat')}>Napsat zprávu</Button>
              <Button variant="ghost" onClick={() => setMatched(null)}>
                Pokračovat v hledání
              </Button>
            </>
          }
        >
          <div className="match-pair">
            <Avatar name={user.nickname} photo={user.photo} background={user.photoBg} />
            <Icon name="heart" size={32} filled style={{ color: 'var(--raspberry)' }} />
            <Avatar name={matched.nickname} photo={matched.photo} background={matched.photoBg} />
          </div>
          <p>{matched.nickname} ti taky dala srdíčko. Prolom ledy!</p>
        </Modal>
      )}
    </div>
  );
}
