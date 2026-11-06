import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MSG, validateEmail, validateRequired } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Fields';

/** GET /login – přihlášení. Po úspěchu AuthLayout přesměruje na /discover. */
export function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = { email: validateEmail(email), password: validateRequired(password) };
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    setFormError(null);
    try {
      await login(email, password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : MSG.generic);
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <div>
        <h2 style={{ fontSize: 24 }}>Přihlášení</h2>
        <p className="card__subtitle" style={{ marginBottom: 0 }}>
          Zadej své údaje a pokračuj do aplikace.
        </p>
      </div>
      {notice && <p className="dev-hint" role="status">{notice}</p>}
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <TextField label="Email" hideLabel type="email" autoComplete="email" value={email} error={errors.email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Heslo" hideLabel type="password" autoComplete="current-password" value={password} error={errors.password} onChange={(e) => setPassword(e.target.value)} />
      <p className="form-footer" style={{ textAlign: 'right' }}>
        <Link to="/forgot-password">Zapomněl(a) jste heslo?</Link>
      </p>
      <Button type="submit" block disabled={busy}>
        {busy ? 'Přihlašuji…' : 'Přihlásit se'}
      </Button>
      <p className="form-footer">
        <span>Ještě nemáte účet?</span>
        <Link to="/register">Zaregistrovat se</Link>
      </p>
    </form>
  );
}
