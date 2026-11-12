import { useEffect, useRef, useState, type FormEvent } from 'react';
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
// Zabrání duplicitám, když zpráva dorazí současně přes REST i WebSocket.
function mergeMessages(existing: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(existing.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) =>
    new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}
type ChatEvent =
  | { type: 'connected' }
  | { type: 'message:new'; message: ChatMessage }
  | { type: 'typing'; matchId: string; fromId: string; isTyping: boolean };
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
  const [otherTyping, setOtherTyping] = useState(false);

  const activeId = params.get('match') ?? matches[0]?.id;
  const active = matches.find((m) => m.id === activeId);

  const messagesRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const stayAtBottomRef = useRef(true);
  const localTypingRef = useRef(false);
  const typingStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingExpiryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTyping = (matchId: string, isTyping: boolean) => {
    const socket = wsRef.current;
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify({ type: 'typing', matchId, isTyping }));
    return true;
  };

  const onTextChange = (value: string) => {
    setText(value);
    if (!activeId) return;
    if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);

    if (!value.trim()) {
      if (localTypingRef.current) sendTyping(activeId, false);
      localTypingRef.current = false;
      return;
    }

    if (!localTypingRef.current) {
      localTypingRef.current = sendTyping(activeId, true);
    }

    typingStopTimerRef.current = setTimeout(() => {
      if (localTypingRef.current) sendTyping(activeId, false);
      localTypingRef.current = false;
    }, 1800);
  };

  // Když uživatel čte starší zprávy, neskáčeme mu samovolně dolů.
  const onMessagesScroll = () => {
    const el = messagesRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stayAtBottomRef.current = distanceFromBottom < 100;
  };
  useEffect(() => {
    api.getMatches().then(setMatches).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!activeId || !user) {
      setMessages([]);
      setOtherTyping(false);
      return;
    }

    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryCount = 0;

    setMessages([]);
    setOtherTyping(false);
    stayAtBottomRef.current = true;
    if (typingExpiryRef.current) clearTimeout(typingExpiryRef.current);

    const refresh = async () => {
      try {
        const history = await api.getMessages(activeId);
        if (!stopped) {
          setMessages(prev => mergeMessages(prev, history));
        }
      } catch (error) {
        if (!stopped) console.error('Historie chatu:', error);
      }
    };

    function scheduleReconnect() {
      if (stopped || retryTimer !== undefined) return;
      const delay = Math.min(1000 * 2 ** retryCount++, 15000);
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        connect();
      }, delay);
    }

    function connect() {
      if (stopped) return;
      let current: WebSocket;
      try {
        current = new WebSocket(api.websocketUrl());
        wsRef.current = current;
      } catch (error) {
        console.error('WebSocket nelze otevřít:', error);
        scheduleReconnect();
        return;
      }

      current.onopen = () => {
        retryCount = 0;
        void refresh();
      };

      current.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as ChatEvent;

          if (data.type === 'typing' && data.matchId === activeId && data.fromId !== user.id) {
            setOtherTyping(data.isTyping);
            if (typingExpiryRef.current) clearTimeout(typingExpiryRef.current);
            if (data.isTyping) {
              typingExpiryRef.current = setTimeout(() => setOtherTyping(false), 4000);
            }
          }

          if (data.type === 'message:new' && data.message.matchId === activeId) {
            setMessages(prev => mergeMessages(prev, [data.message]));
            if (data.message.fromId !== user.id) setOtherTyping(false);
          }
        } catch (error) {
          console.error('Neplatná WS událost:', error);
        }
      };

      current.onclose = () => {
        if (wsRef.current === current) wsRef.current = null;
        if (stopped) return;
        setOtherTyping(false);
        localTypingRef.current = false;
        scheduleReconnect();
      };

      current.onerror = () => current.close();
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };

    document.addEventListener('visibilitychange', onVisible);
    void refresh();
    connect();

    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisible);
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      if (typingExpiryRef.current) clearTimeout(typingExpiryRef.current);
      const current = wsRef.current;
      if (localTypingRef.current && current?.readyState === WebSocket.OPEN) {
        current.send(JSON.stringify({ type: 'typing', matchId: activeId, isTyping: false }));
      }
      localTypingRef.current = false;
      wsRef.current = null;
      current?.close();
    };
  }, [activeId, user?.id]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el && stayAtBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, otherTyping, activeId]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    try {
      const msg = await api.sendMessage(active.id, text.trim());
      stayAtBottomRef.current = true;
      setMessages((prev) => mergeMessages(prev, [msg]));
      setText('');
      if (typingStopTimerRef.current) clearTimeout(typingStopTimerRef.current);
      if (localTypingRef.current) sendTyping(active.id, false);
      localTypingRef.current = false;
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Zprávu nelze odeslat.');
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
              <div>
                <strong>{active.profile.nickname}</strong>
                <span className="chat__head-subtitle">Vaše konverzace</span>
              </div>
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
          <div className="chat__messages" ref={messagesRef} onScroll={onMessagesScroll} aria-live="polite">
            {messages.length === 0 && !otherTyping && (
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
            {otherTyping && (
              <div className="chat__message chat__message--them">
                <div className="bubble chat__typing-bubble" role="status" aria-label={`${active.profile.nickname} právě píše`}>
                  <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                </div>
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
