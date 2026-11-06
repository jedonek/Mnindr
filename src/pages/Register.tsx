import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import {
  MSG,
  fileToDataUrl,
  hasErrors,
  validateAge,
  validateEmail,
  validatePassword,
  validatePhoto,
  validateRequired,
} from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Checkbox, TextField } from '@/components/ui/Fields';
import type { Gender, RegisterBasics } from '@/types';

interface FlowContext {
  basics: RegisterBasics | null;
  setBasics: (b: RegisterBasics) => void;
}

/** Layout route pro /register a /register/pet-info – drží rozepsaná data v paměti (heslo se nikam neukládá). */
export function RegisterFlow() {
  const [basics, setBasics] = useState<RegisterBasics | null>(null);
  return <Outlet context={{ basics, setBasics } satisfies FlowContext} />;
}

/** GET /register – 1. krok: základní údaje. */
export function Register() {
  const { basics, setBasics } = useOutletContext<FlowContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const emailExists = (location.state as { emailExists?: boolean } | null)?.emailExists;

  const [form, setForm] = useState<RegisterBasics>(
    basics ?? { firstName: '', lastName: '', email: '', password: '', acceptTerms: false, newsletter: false },
  );
  const [errors, setErrors] = useState<Record<string, string | null>>(emailExists ? { email: MSG.emailExists } : {});

  const set = <K extends keyof RegisterBasics>(key: K, value: RegisterBasics[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      firstName: validateRequired(form.firstName),
      lastName: validateRequired(form.lastName),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      acceptTerms: form.acceptTerms ? null : MSG.terms,
    };
    setErrors(next);
    if (hasErrors(next)) return;
    setBasics(form);
    navigate('/register/pet-info');
  };

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <div>
        <h2 style={{ fontSize: 24 }}>Registrovat se</h2>
        <p className="card__subtitle" style={{ marginBottom: 0 }}>
          Zadej své údaje a vytvoř si účet.
        </p>
      </div>
      <TextField label="Jméno" hideLabel autoComplete="given-name" value={form.firstName} error={errors.firstName} onChange={(e) => set('firstName', e.target.value)} />
      <TextField label="Příjmení" hideLabel autoComplete="family-name" value={form.lastName} error={errors.lastName} onChange={(e) => set('lastName', e.target.value)} />
      <TextField label="Email" hideLabel type="email" autoComplete="email" value={form.email} error={errors.email} onChange={(e) => set('email', e.target.value)} />
      <TextField label="Heslo" hideLabel type="password" autoComplete="new-password" value={form.password} error={errors.password} onChange={(e) => set('password', e.target.value)} />
      <Checkbox
        checked={form.acceptTerms}
        error={errors.acceptTerms}
        onChange={(e) => set('acceptTerms', e.target.checked)}
        label={
          <>
            Souhlasím se <Link to="/terms" target="_blank">smluvními podmínkami</Link>
          </>
        }
      />
      <Checkbox checked={form.newsletter} onChange={(e) => set('newsletter', e.target.checked)} label="Souhlasím se zasíláním novinek" />
      <Button type="submit" block>
        Pokračovat
      </Button>
      <p className="form-footer">
        <span>Už máte účet?</span>
        <Link to="/login">Přihlásit se</Link>
      </p>
    </form>
  );
}

/** GET /register/pet-info – 2. krok: údaje o mazlíčkovi. */
export function RegisterPetInfo() {
  const { basics } = useOutletContext<FlowContext>();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('kocka');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Bez 1. kroku sem nemá smysl chodit.
  if (!basics) return <Navigate to="/register" replace />;

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setErrors((x) => ({ ...x, photo: problem }));
      setPhoto(undefined);
      e.target.value = '';
      return;
    }
    setErrors((x) => ({ ...x, photo: null }));
    setPhoto(await fileToDataUrl(file));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ageNum = Number(age);
    const next = { nickname: validateRequired(nickname), age: age ? validateAge(ageNum) : MSG.required, photo: errors.photo ?? null };
    setErrors(next);
    if (hasErrors(next)) return;

    setBusy(true);
    setFormError(null);
    try {
      await register(basics, { nickname, age: ageNum, gender, phone, photo });
      // AuthLayout po nastavení uživatele přesměruje na /discover.
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_EXISTS') {
        navigate('/register', { replace: true, state: { emailExists: true } });
        return;
      }
      setFormError(err instanceof Error ? err.message : MSG.generic);
      setBusy(false);
    }
  };

  return (
    <form className="card form" onSubmit={onSubmit} noValidate>
      <h2 style={{ fontSize: 22 }}>Řekni nám něco o sobě.</h2>
      {formError && <p className="form-error" role="alert">{formError}</p>}
      <TextField label="Přezdívka" hideLabel value={nickname} error={errors.nickname} onChange={(e) => setNickname(e.target.value)} />
      <TextField label="Věk" hideLabel type="number" inputMode="numeric" min={18} max={99} value={age} error={errors.age} onChange={(e) => setAge(e.target.value)} />
      <div className="segmented" role="group" aria-label="Pohlaví">
        <button type="button" aria-pressed={gender === 'kocka'} onClick={() => setGender('kocka')}>
          Kočka
        </button>
        <button type="button" aria-pressed={gender === 'kocour'} onClick={() => setGender('kocour')}>
          Kocour
        </button>
      </div>
      <TextField label="Telefonní číslo (nepovinné)" hideLabel type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <TextField label="Fotka (JPG/PNG, max 5 MB)" type="file" accept="image/jpeg,image/png" error={errors.photo} onChange={onPhoto} />
      <Button type="submit" block disabled={busy}>
        {busy ? 'Vytvářím…' : 'Vytvořit účet'}
      </Button>
      <p className="form-footer">
        <Link to="/register">← Zpět</Link>
      </p>
    </form>
  );
}
