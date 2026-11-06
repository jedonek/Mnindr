import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ACTIVITY_OPTIONS,
  FIRST_DATE_OPTIONS,
  GOAL_LABELS,
  MUSIC_OPTIONS,
  SEEKING_LABELS,
  SMOKING_OPTIONS,
  WHEN_MEET_OPTIONS,
} from '@/data/seed';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { MSG } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Checkbox, SelectField, TextField } from '@/components/ui/Fields';
import { Icon } from '@/components/ui/Icon';
import { UnsavedChangesDialog } from '@/components/ui/Modal';
import type { Preferences as Prefs, RelationshipGoal, Seeking } from '@/types';

const toOptions = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));

/** GET /profile/preferences – filtry vyhledávání. */
export function Preferences() {
  const { user, updateUser } = useAuth();
  const baseline = useMemo(() => user?.prefs ?? null, [user]);
  const [form, setForm] = useState<Prefs>(() => baseline as Prefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = baseline ? JSON.stringify(form) !== JSON.stringify(baseline) : false;
  const blocker = useUnsavedChanges(dirty);

  if (!user || !baseline) return null;

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  // Slidery drží min ≤ max.
  const setAgeMin = (v: number) => set('ageMin', Math.min(v, form.ageMax));
  const setAgeMax = (v: number) => set('ageMax', Math.max(v, form.ageMin));

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateUser({ prefs: form });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : MSG.generic);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="edit-page" onSubmit={onSave}>
      <div className="edit-page__top">
        <div>
          <h1 style={{ fontSize: 36 }}>Preference profilu</h1>
        </div>
        <div className="row">
          {saved && <span role="status" className="badge">Uloženo</span>}
          <Button type="submit" small disabled={saving || !dirty}>
            <Icon name="save" size={18} /> {saving ? 'Ukládám…' : 'Uložit změny'}
          </Button>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="edit-grid">
        <section className="card form" aria-labelledby="pref-title">
          <span className="badge" style={{ alignSelf: 'flex-start' }}>
            <Icon name="heart" size={14} /> preference
          </span>
          <div>
            <h2 id="pref-title" style={{ fontSize: 28 }}>Nastav si, kdo se ti bude líbit</h2>
            <p className="card__subtitle">Vyber, co je pro tebe důležité. Preference můžeš kdykoli upravit.</p>
          </div>

          <div className="pref-value range">
            <label htmlFor="age-min" className="field__label" style={{ padding: 0 }}>
              Věk partnera: {form.ageMin}–{form.ageMax} let
            </label>
            <input id="age-min" type="range" min={18} max={99} value={form.ageMin} onChange={(e) => setAgeMin(Number(e.target.value))} aria-label="Minimální věk partnera" />
            <input type="range" min={18} max={99} value={form.ageMax} onChange={(e) => setAgeMax(Number(e.target.value))} aria-label="Maximální věk partnera" />
          </div>

          <div className="pref-value range">
            <label htmlFor="distance" className="field__label" style={{ padding: 0 }}>
              Maximální vzdálenost: {form.maxDistance} km
            </label>
            <input id="distance" type="range" min={1} max={100} value={form.maxDistance} onChange={(e) => set('maxDistance', Number(e.target.value))} />
          </div>

          <TextField label="Oblast hledání" value={form.area} onChange={(e) => set('area', e.target.value)} />
          <Checkbox checked={form.onlyVerified} onChange={(e) => set('onlyVerified', e.target.checked)} label="Pouze ověřené profily" />
        </section>

        <section className="card form" aria-labelledby="style-title">
          <span className="badge" style={{ alignSelf: 'flex-start' }}>
            <Icon name="sparkle" size={14} /> styl rande
          </span>
          <div>
            <h2 id="style-title" style={{ fontSize: 28 }}>Jak chceš trávit čas</h2>
            <p className="card__subtitle">Vyber styl setkání a aktivity, které ti vyhovují.</p>
          </div>
          <SelectField label="První rande" value={form.firstDate} options={toOptions(FIRST_DATE_OPTIONS)} onChange={(e) => set('firstDate', e.target.value)} />
          <SelectField label="Kdy se potkat" value={form.whenMeet} options={toOptions(WHEN_MEET_OPTIONS)} onChange={(e) => set('whenMeet', e.target.value)} />
          <SelectField label="Společné aktivity" value={form.activities} options={toOptions(ACTIVITY_OPTIONS)} onChange={(e) => set('activities', e.target.value)} />
          <SelectField label="Oblíbená hudba" value={form.music} options={toOptions(MUSIC_OPTIONS)} onChange={(e) => set('music', e.target.value)} />
        </section>

        <section className="card form" aria-labelledby="partner-title">
          <span className="badge" style={{ alignSelf: 'flex-start' }}>
            <Icon name="heart" size={14} /> o partnerovi
          </span>
          <div>
            <h2 id="partner-title" style={{ fontSize: 28 }}>Co hledáš u partnera</h2>
            <p className="card__subtitle">Základní hledání a to, co by vám mělo sedět.</p>
          </div>
          <SelectField
            label="Koho chci poznat"
            value={form.seeking}
            options={(Object.keys(SEEKING_LABELS) as Seeking[]).map((k) => ({ value: k, label: SEEKING_LABELS[k] }))}
            onChange={(e) => set('seeking', e.target.value as Seeking)}
          />
          <SelectField label="Kouření" value={form.smoking} options={toOptions(SMOKING_OPTIONS)} onChange={(e) => set('smoking', e.target.value)} />
          <SelectField
            label="Hledám"
            value={form.goal}
            options={(Object.keys(GOAL_LABELS) as RelationshipGoal[]).map((k) => ({ value: k, label: GOAL_LABELS[k] }))}
            onChange={(e) => set('goal', e.target.value as RelationshipGoal)}
          />
        </section>
      </div>

      {blocker.state === 'blocked' && (
        <UnsavedChangesDialog onStay={() => blocker.reset()} onLeave={() => blocker.proceed()} />
      )}
    </form>
  );
}
