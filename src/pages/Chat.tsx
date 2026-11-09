import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { ChatMessage, MatchWithProfile, ReportReason } from '@/types';

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

  const activeId = params.get('match') ?? matches[0]?.id;
  const active = matches.find((m) => m.id === activeId);

  useEffect(() => {
    api.getMatches().then(setMatches).finally(() => setLoading(false));
  }, []);

useEffect(() => {
  if (!activeId) {
    setMessages([]);
    return;
  }

  let cancelled = false;
  let inFlight = false;

  setMessages([]);

  const loadMessages = async () => {
    if (cancelled || inFlight) return;

    inFlight = true;

    try {
      const data = await api.getMessages(activeId);

      if (!cancelled) {
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
  };
}, [activeId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    const msg = await api.sendMessage(active.id, text);
    setMessages((m) => [...m, msg]);
    setText('');
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
      <nav className="chat__list" aria-label="Shody">
        {matches.map((m) => (
          <Link
            key={m.id}
            to={`/chat?match=${m.id}`}
            className="chat__item"
            aria-current={m.id === activeId ? 'true' : undefined}
          >
            <Avatar name={m.profile.nickname} photo={m.profile.photo} background={m.profile.photoBg} />
            <strong>{m.profile.nickname}</strong>
          </Link>
        ))}
      </nav>

      {active && user && (
        <section className="card chat__panel" aria-label={`Chat s ${active.profile.nickname}`}>
          <div className="chat__head">
            <strong>{active.profile.nickname}</strong>
            <div className="row">
              <Button small variant="ghost" onClick={() => setDialog('report')}>
                Nahlásit
              </Button>
              <Button small variant="ghost" onClick={() => setDialog('block')}>
                Zablokovat
              </Button>
            </div>
          </div>
          <div className="chat__messages" aria-live="polite">
            {messages.length === 0 && <p className="muted center">Prolom ledy a napiš první mňau!</p>}
            {messages.map((m) => (
              <span key={m.id} className={m.fromId === user.id ? 'bubble bubble--me' : 'bubble'}>
                {m.text}
              </span>
            ))}
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
              onChange={(e) => setText(e.target.value)}
              autoComplete="off"
            />
            <Button type="submit" disabled={!text.trim()}>
              Odeslat
            </Button>
          </form>
        </section>
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
