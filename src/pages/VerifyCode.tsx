import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword, verifyCode } from '@/lib/api';
import { MSG, validatePassword } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Fields';

const LENGTH = 6;

/** GET /verify-code – krok B: 6 políček pro kód → nové heslo → /login. */
export function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string; devCode?: string } | null;
  const email = state?.email;

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [devCode, setDevCode] = useState(state?.devCode);
  const [verified, setVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const code = digits.join('');

  const setDigit = (i: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    setDigits((d) => d.map((x, idx) => (idx === i ? clean : x)));
    setFormError(null);
    if (clean && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => text[i] ?? ''));
    refs.current[Math.min(text.length, LENGTH - 1)]?.focus();
  };

  const onVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length < LENGTH) {
      setFormError(MSG.otpInvalid);
      return;
    }
    setBusy(true);
    setFormError(null);
    try {
      await verifyCode(email, code);
      setVerified(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : MSG.generic);
    } finally {
      setBusy(false);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      password: validatePassword(password),
      confirm: password !== confirm ? MSG.passwordMismatch : null,
    };
    setErrors(next);
    if (next.password || next.confirm) return;

    setBusy(true);
    try {
      await resetPassword(email, code, password);
      navigate('/login', { state: { notice: 'Heslo bylo změněno. Teď se můžeš přihlásit.' } });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : MSG.generic);
      setBusy(false);
    }
  };

  const resend = async () => {
    setFormError(null);
    setDigits(Array(LENGTH).fill(''));
    const res = await requestPasswordReset(email);
    setDevCode(res.devCode);
    refs.current[0]?.focus();
  };

  if (verified) {
    return (
      <form className="card form" onSubmit={onReset} noValidate>
        <h2 style={{ fontSize: 24 }}>Nové heslo</h2>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <TextField label="Nové heslo" hideLabel type="password" autoComplete="new-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
        <TextField label="Nové heslo znovu" hideLabel type="password" autoComplete="new-password" value={confirm} error={errors.confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" block disabled={busy}>
          {busy ? 'Ukládám…' : 'Uložit heslo'}
        </Button>
      </form>
    );
  }

  return (
    <form className="card form" onSubmit={onVerify} noValidate>
      <div>
        <h2 style={{ fontSize: 24 }}>Ověření e-mailu</h2>
        <p className="card__subtitle" style={{ marginBottom: 0 }}>
          Zadej ověřovací kód, který ti přišel do emailu.
        </p>
      </div>
      {devCode && (
        <p className="dev-hint" role="status">
          Vývojový režim: kód je <strong>{devCode}</strong> (v ostrém provozu přijde e-mailem).
        </p>
      )}
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <div className="otp" role="group" aria-label="Šestimístný ověřovací kód">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Číslice ${i + 1} z ${LENGTH}`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
          />
        ))}
      </div>
      <Button type="submit" block disabled={busy}>
        {busy ? 'Ověřuji…' : 'Ověřit kód'}
      </Button>
      <p className="form-footer">
        <span>Nepřišel ti kód?</span>
        <button type="button" className="link-button" onClick={resend}>
          Poslat kód znovu
        </button>
      </p>
      <p className="form-footer">
        <Link to="/login">← Zpět na přihlášení</Link>
      </p>
    </form>
  );
}
