import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { COLOR_OPTIONS, SPORT_OPTIONS } from '@/data/seed';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import {
  MSG,
  fileToDataUrl,
  hasErrors,
  validateAge,
  validatePhoto,
  validateRequired,
} from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { ChipGroup, SelectField, TextAreaField, TextField } from '@/components/ui/Fields';
import { Icon } from '@/components/ui/Icon';
import { UnsavedChangesDialog } from '@/components/ui/Modal';
import type { Gender, SessionUser } from '@/types';

interface FormState {
  firstName: string;
  lastName: string;
  nickname: string;
  age: string;
  gender: Gender;
  phone: string;
  residence: string;
  bio: string;
  sports: string[];
  colors: string[];
  dreamDate: string;
  photo: string | undefined;
  photoBg: string;
}

const toForm = (u: SessionUser): FormState => ({
  firstName: u.firstName,
  lastName: u.lastName,
  nickname: u.nickname,
  age: String(u.age),
  gender: u.gender,
  phone: u.phone,
  residence: u.residence,
  bio: u.bio,
  sports: u.sports,
  colors: u.colors,
  dreamDate: u.dreamDate,
  photo: u.photo,
  photoBg: u.photoBg,
});

/** GET /profile/edit – tři sloupce: osobní informace, zájmy, profilová fotka. */
export function ProfileEdit() {
  const { user, updateUser } = useAuth();
  const baseline = useMemo(() => (user ? toForm(user) : null), [user]);
  const [form, setForm] = useState<FormState>(() => baseline as FormState);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = baseline ? JSON.stringify(form) !== JSON.stringify(baseline) : false;
  const blocker = useUnsavedChanges(dirty);

  if (!user || !baseline) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
    setSaved(false);
  };

  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setErrors((x) => ({ ...x, photo: problem }));
      e.target.value = '';
      return;
    }
    set('photo', await fileToDataUrl(file));
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      firstName: validateRequired(form.firstName),
      lastName: validateRequired(form.lastName),
      nickname: validateRequired(form.nickname),
      age: validateAge(Number(form.age)),
      photo: errors.photo ?? null,
    };
    setErrors(next);
    if (hasErrors(next)) return;

    setSaving(true);
    try {
      await updateUser({ ...form, age: Number(form.age) });
      setSaved(true);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : MSG.generic });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="edit-page" onSubmit={onSave} noValidate>
      <div className="edit-page__top">
        <h1 style={{ fontSize: 36 }}>Můj profil</h1>
        <div className="row">
          {saved && <span role="status" className="badge">Uloženo</span>}
          <Button type="submit" small disabled={saving || !dirty}>
            <Icon name="save" size={18} /> {saving ? 'Ukládám…' : 'Uložit'}
          </Button>
        </div>
      </div>
      {errors.form && <p className="form-error" role="alert">{errors.form}</p>}

      <div className="edit-grid">
        <section className="card form" aria-labelledby="personal-title">
          <div>
            <h2 id="personal-title" style={{ fontSize: 28 }}>Osobní informace</h2>
            <p className="card__subtitle">Zkontroluj si profilové údaje, které se budou zobrazovat ostatním.</p>
          </div>
          <TextField label="Jméno" value={form.firstName} error={errors.firstName} onChange={(e) => set('firstName', e.target.value)} />
          <TextField label="Příjmení" value={form.lastName} error={errors.lastName} onChange={(e) => set('lastName', e.target.value)} />
          <TextField label="Přezdívka" value={form.nickname} error={errors.nickname} onChange={(e) => set('nickname', e.target.value)} />
          <TextField label="Věk" type="number" min={18} max={99} value={form.age} error={errors.age} onChange={(e) => set('age', e.target.value)} />
          <SelectField
            label="Pohlaví"
            value={form.gender}
            options={[
              { value: 'kocka', label: 'Kočka' },
              { value: 'kocour', label: 'Kocour' },
            ]}
            onChange={(e) => set('gender', e.target.value as Gender)}
          />
          <TextField label="Telefonní číslo" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <TextField label="Bydliště" value={form.residence} onChange={(e) => set('residence', e.target.value)} />
          <TextAreaField label="O mně" value={form.bio} maxLength={300} onChange={(e) => set('bio', e.target.value)} />
        </section>

        <section className="card form" aria-labelledby="interests-title">
          <div>
            <h2 id="interests-title" style={{ fontSize: 28 }}>Zájmy a aktivity</h2>
            <p className="card__subtitle">Vyber sporty, barvy a rande, které ti nejvíc vyhovují.</p>
          </div>
          <ChipGroup label="Oblíbené sporty" options={SPORT_OPTIONS} value={form.sports} onChange={(v) => set('sports', v)} />
          <ChipGroup label="Oblíbené barvy" options={COLOR_OPTIONS} value={form.colors} onChange={(v) => set('colors', v)} />
          <TextField label="Tvé vysněné kočičí rande" value={form.dreamDate} onChange={(e) => set('dreamDate', e.target.value)} />
        </section>

        <section className="card form" aria-labelledby="photo-title">
          <div>
            <h2 id="photo-title" style={{ fontSize: 28 }}>Profilová fotka</h2>
            <p className="card__subtitle">Nastav si fotku, která bude reprezentovat tvůj profil.</p>
          </div>
          <div className="photo-preview">
            <div className="photo-preview__circle" style={{ background: form.photoBg }}>
              {form.photo ? <img src={form.photo} alt="Náhled profilové fotky" /> : 'profilovka'}
            </div>
          </div>
          <TextField label="Nahrát fotku (JPG/PNG, max 5 MB)" type="file" accept="image/jpeg,image/png" error={errors.photo} onChange={onPhoto} />
          <div className="color-row">
            <label htmlFor="photo-bg" className="field__label" style={{ flex: 1 }}>
              Barva pozadí fotky
            </label>
            <input
              id="photo-bg"
              className="color-input"
              type="color"
              value={form.photoBg}
              onChange={(e) => set('photoBg', e.target.value)}
              aria-label="Barva pozadí fotky"
            />
          </div>
        </section>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />
      )}
    </form>
  );
}
