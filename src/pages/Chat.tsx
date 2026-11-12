import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ChatMessage, MatchProfileDetails, MatchWithProfile, ReportReason } from '@/types';
import { GOAL_LABELS, SEEKING_LABELS } from '@/data/seed';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'obtezovani', label: 'Obtěžování nebo urážky' },
  { value: 'falesny-profil', label: 'Falešný profil' },
  { value: 'spam', label: 'Spam nebo reklama' },
  { value: 'nevhodny-obsah', label: 'Nevhodný obsah' },
  { value: 'jine', label: 'Jiný důvod' },
];

/** GET /chat – seznam shod a konverzace, s nahlášením a blokací. */
export function Chat() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<'report' | 'block' | null>(null);
  const [reason, setReason] = useState<ReportReason>('obtezovani');
  const [toast, setToast] = useState<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [peerProfile, setPeerProfile] = useState<MatchProfileDetails | null>(null);
  const messagesElement = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const initialLoadRef = useRef(true);
  const scrollPendingRef = useRef(false);
  const typingHeartbeatRef = useRef<number | null>(null);
  const typingIdleRef = useRef<number | null>(null);

  const activeId = params.get('match') ?? matches[0]?.id;
  const active = matches.find((m) => m.id === activeId);

  useEffect(() => {
    api.getMatches().then(setMatches).finally(() => setLoading(false));
  }, []);

useEffect(() => {
  if (!activeId) {
    setMessages([]);
    messagesRef.current = [];
    setPeerTyping(false);
    return;
  }

  let cancelled = false;
  let inFlight = false;

  setMessages([]);
  messagesRef.current = [];
  initialLoadRef.current = true;
  setPeerTyping(false);

  const loadMessages = async () => {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const data = await api.getMessages(activeId);

      if (!cancelled) {
        const viewport = messagesElement.current;
        const nearBottom = !viewport || viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 80;
        const hasNewMessages = data.some((message) => !messagesRef.current.some((current) => current.id === message.id));
        if (initialLoadRef.current || (hasNewMessages && nearBottom)) scrollPendingRef.current = true;
        initialLoadRef.current = false;
        messagesRef.current = data;
        setMessages(data);
      }
    } catch (error) {
      if (!cancelled) {
        console.error('Chyba načítání zpráv:', error);
      }
    } finally {
      inFlight = false;
    }
  };

  void loadMessages();

  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      void loadMessages();
    }
  }, 2000);

  return () => {
    cancelled = true;
    clearInterval(interval);
    if (typingHeartbeatRef.current !== null) window.clearInterval(typingHeartbeatRef.current);
    if (typingIdleRef.current !== null) window.clearTimeout(typingIdleRef.current);
    typingHeartbeatRef.current = null;
    typingIdleRef.current = null;
    void api.setTyping(activeId, false).catch(() => undefined);
  };
}, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    const loadTyping = async () => {
      try {
        const status = await api.getPeerTyping(activeId);
        if (!cancelled) setPeerTyping(status.typing);
      } catch {
        if (!cancelled) setPeerTyping(false);
      }
    };
    void loadTyping();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadTyping();
    }, 1800);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeId]);

  useEffect(() => {
    if (!messages.length || !scrollPendingRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const viewport = messagesElement.current;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
      scrollPendingRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    const msg = await api.sendMessage(active.id, text);
    messagesRef.current = [...messagesRef.current, msg];
    scrollPendingRef.current = true;
    setMessages(messagesRef.current);
    if (typingHeartbeatRef.current !== null) window.clearInterval(typingHeartbeatRef.current);
    if (typingIdleRef.current !== null) window.clearTimeout(typingIdleRef.current);
    typingHeartbeatRef.current = null;
    typingIdleRef.current = null;
    void api.setTyping(active.id, false).catch(() => undefined);
    setText('');
  };

  const onTextChange = (value: string) => {
    setText(value);
    if (!activeId) return;
    if (!value.trim()) {
      if (typingHeartbeatRef.current !== null) window.clearInterval(typingHeartbeatRef.current);
      if (typingIdleRef.current !== null) window.clearTimeout(typingIdleRef.current);
      typingHeartbeatRef.current = null;
      typingIdleRef.current = null;
      void api.setTyping(activeId, false).catch(() => undefined);
      return;
    }
    if (typingHeartbeatRef.current === null) {
      void api.setTyping(activeId, true).catch(() => undefined);
      typingHeartbeatRef.current = window.setInterval(() => {
        void api.setTyping(activeId, true).catch(() => undefined);
      }, 2000);
    }
    if (typingIdleRef.current !== null) window.clearTimeout(typingIdleRef.current);
    typingIdleRef.current = window.setTimeout(() => {
      if (typingHeartbeatRef.current !== null) window.clearInterval(typingHeartbeatRef.current);
      typingHeartbeatRef.current = null;
      typingIdleRef.current = null;
      void api.setTyping(activeId, false).catch(() => undefined);
    }, 3500);
  };

  const openPeerProfile = async () => {
    if (!active) return;
    setProfileOpen(true);
    setProfileLoading(true);
    setProfileError(null);
    setPeerProfile(null);
    try {
      setPeerProfile(await api.getMatchProfile(active.id));
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Profil se nepodařilo načíst.');
    } finally {
      setProfileLoading(false);
    }
  };

  const confirmBlock = async () => {
    if (!active) return;
    await api.blockUser(active.profile.id);
    setMatches((m) => m.filter((x) => x.id !== active.id));
    setParams({});
    setDialog(null);
    setToast('Uživatel byl zablokován.');
  };

  const confirmReport = async () => {
    if (!active) return;
    await api.reportUser(active.profile.id, reason);
    setDialog(null);
    setToast('Děkujeme, nahlášení jsme přijali.');
  };

  if (loading) return <p className="center muted" role="status">Načítám chaty…</p>;

  if (matches.length === 0) {
    return (
      <div className="prose center" style={{ alignItems: 'center' }}>
        <h1>Zatím žádné shody</h1>
        <p className="muted">Až se ti povede match, objeví se tady a budete si moct napsat.</p>
        <Button to="/discover">Objevovat</Button>
      </div>
    );
  }

  return (
    <div className="chat">
      <aside className="chat__sidebar">
        <div className="chat__list-heading">
          <div>
            <p className="chat__eyebrow">Mňindr</p>
            <h2> zprávy</h2>
          </div>
          <span className="chat__count" aria-label={`${matches.length} shod`}>{matches.length}</span>
        </div>
        <nav className="chat__list" aria-label="Shody">
          {matches.map((m) => (
            <Link
              key={m.id}
              to={`/chat?match=${m.id}`}
              className="chat__item"
              aria-current={m.id === activeId ? 'true' : undefined}
            >
              <Avatar name={m.profile.nickname} photo={m.profile.photo} background={m.profile.photoBg} />
              <span className="chat__item-copy">
                <strong>{m.profile.nickname}</strong>
                <span className="chat__item-preview">Otevřít konverzaci</span>
              </span>
              <span className="chat__item-arrow" aria-hidden="true">›</span>
            </Link>
          ))}
        </nav>
      </aside>

      {active && user && (
        <section className="card chat__panel" aria-label={`Chat s ${active.profile.nickname}`}>
          <div className="chat__head">
            <div className="chat__person">
              <Avatar name={active.profile.nickname} photo={active.profile.photo} background={active.profile.photoBg} />
              <button type="button" className="chat__profile-trigger" onClick={() => void openPeerProfile()} aria-label={`Zobrazit profil uživatele ${active.profile.nickname}`}>
                <strong>{active.profile.nickname}</strong>
                <span className="chat__head-subtitle">{peerTyping ? `${active.profile.nickname} píše…` : 'Zobrazit profil a preference'}</span>
              </button>
            </div>
            <div className="chat__actions">
              <Button small variant="ghost" onClick={() => setDialog('report')}>
                Nahlásit
              </Button>
              <Button small variant="ghost" onClick={() => setDialog('block')}>
                Zablokovat
              </Button>
            </div>
          </div>
          <div className="chat__messages" aria-live="polite" ref={messagesElement}>
            {messages.length === 0 && (
              <div className="chat__empty">
                <span className="chat__empty-icon" aria-hidden="true">✦</span>
                <strong>Začněte konverzaci</strong>
                <p>Prolom ledy a napiš první mňau!</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`chat__message ${m.fromId === user.id ? 'chat__message--me' : 'chat__message--them'}`}>
                <div className="bubble">{m.text}</div>
                <time className="chat__time" dateTime={m.at}>
                  {new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' }).format(new Date(m.at))}
                </time>
              </div>
            ))}
            {peerTyping && (
              <div className="chat__typing" role="status" aria-label={`${active.profile.nickname} píše`}>
                <span aria-hidden="true">{active.profile.gender === 'kocka' ? '🐈' : '🐈‍⬛'}</span>
                <span className="chat__typing-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="sr-only">{active.profile.nickname} píše</span>
              </div>
            )}
          </div>
          <form className="chat__form" onSubmit={onSend}>
            <label htmlFor="chat-input" className="sr-only">
              Napsat zprávu
            </label>
            <input
              id="chat-input"
              className="input"
              placeholder="Napiš zprávu…"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              autoComplete="off"
            />
            <Button type="submit" disabled={!text.trim()}>
              Odeslat
            </Button>
          </form>
        </section>
      )}

      {profileOpen && active && (
        <Modal title={`Profil uživatele ${active.profile.nickname}`} onClose={() => setProfileOpen(false)} actions={<Button variant="ghost" onClick={() => setProfileOpen(false)}>Zavřít</Button>}>
          {profileLoading && <p className="muted" role="status">Načítám profil…</p>}
          {profileError && <p className="form-error" role="alert">{profileError}</p>}
          {peerProfile && (
            <div className="chat__profile-details">
              <div className="chat__profile-summary">
                <Avatar name={peerProfile.nickname} photo={peerProfile.photo} background={peerProfile.photoBg} />
                <div><strong>{peerProfile.nickname}, {peerProfile.age}</strong><span>{peerProfile.gender === 'kocka' ? 'Kočka' : 'Kocour'} · {peerProfile.residence || 'Bydliště neuvedeno'}</span></div>
              </div>
              <section><h3>O mně</h3><p>{peerProfile.bio || 'Zatím bez popisku.'}</p><p>{peerProfile.verified ? 'Ověřený profil' : 'Neověřený profil'}</p></section>
              <section><h3>Zájmy a rande</h3><p><strong>Sporty:</strong> {peerProfile.sports?.join(', ') || 'Neuvedeno'}</p><p><strong>Oblíbené barvy:</strong> {peerProfile.colors?.join(', ') || 'Neuvedeno'}</p><p><strong>Vysněné rande:</strong> {peerProfile.dreamDate || 'Neuvedeno'}</p></section>
              <section><h3>Preference</h3><p><strong>Hledá:</strong> {SEEKING_LABELS[peerProfile.prefs.seeking]}</p><p><strong>Věk:</strong> {peerProfile.prefs.ageMin}–{peerProfile.prefs.ageMax} let · <strong>Vzdálenost:</strong> do {peerProfile.prefs.maxDistance} km</p><p><strong>Oblast:</strong> {peerProfile.prefs.area || 'Neuvedeno'}</p><p><strong>Vztah:</strong> {GOAL_LABELS[peerProfile.prefs.goal]}</p><p><strong>První rande:</strong> {peerProfile.prefs.firstDate}</p><p><strong>Kdy se potkat:</strong> {peerProfile.prefs.whenMeet}</p><p><strong>Aktivity:</strong> {peerProfile.prefs.activities}</p><p><strong>Hudba:</strong> {peerProfile.prefs.music}</p><p><strong>Kouření:</strong> {peerProfile.prefs.smoking}</p><p>{peerProfile.prefs.onlyVerified ? 'Chce poznávat pouze ověřené profily' : 'Nevyžaduje ověřený profil'}</p></section>
              <p className="chat__profile-privacy">Kontaktní údaje, jako telefon a e-mail, zůstávají soukromé.</p>
            </div>
          )}
        </Modal>
      )}

      {dialog === 'block' && active && (
        <Modal
          title={`Zablokovat uživatele ${active.profile.nickname}?`}
          onClose={() => setDialog(null)}
          actions={
            <>
              <Button variant="danger" onClick={confirmBlock}>
                Zablokovat
              </Button>
              <Button variant="ghost" onClick={() => setDialog(null)}>
                Zrušit
              </Button>
            </>
          }
        >
          <p>Už se ti nebude zobrazovat a nebude ti moct psát.</p>
        </Modal>
      )}

      {dialog === 'report' && active && (
        <Modal
          title="Nahlásit uživatele"
          onClose={() => setDialog(null)}
          actions={
            <>
              <Button onClick={confirmReport}>Odeslat nahlášení</Button>
              <Button variant="ghost" onClick={() => setDialog(null)}>
                Zrušit
              </Button>
            </>
          }
        >
          <label htmlFor="report-reason" className="sr-only">
            Důvod nahlášení
          </label>
          <select
            id="report-reason"
            className="input"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
