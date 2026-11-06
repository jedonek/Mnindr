import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '@/lib/api';
import { MSG, validateEmail } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Fields';

/** GET /forgot-password – krok A: e-mail → 6místný OTP kód (platnost 15 min). */
export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const problem = validateEmail(email);
    setError(problem);
    if (problem) return;

    setBusy(true);
    try {
      const { devCode } = await requestPasswordReset(email);
      navigate('/verify-code', { state: { email, devCode } });
    } catch {
      setError(MSG.generic);
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <div>
        <h2 style={{ fontSize: 24 }}>Obnova hesla</h2>
        <p className="card__subtitle" style={{ marginBottom: 0 }}>
          Zadej email, na který bude poslán ověřovací kód.
        </p>
      </div>
      <TextField label="Email" hideLabel type="email" autoComplete="email" value={email} error={error} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit" block disabled={busy}>
        {busy ? 'Odesílám…' : 'Odeslat kód'}
      </Button>
      <p className="form-footer">
        <Link to="/login">← Zpět na přihlášení</Link>
      </p>
    </form>
  );
}
