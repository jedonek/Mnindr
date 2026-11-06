import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  hideLabel?: boolean;
  error?: string | null;
  id: string;
  children: ReactNode;
}

function FieldShell({ label, hideLabel, error, id, children }: FieldShellProps) {
  return (
    <div className="field">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'field__label'}>
        {label}
      </label>
      {children}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Skryje popisek (zůstane pro čtečky) – text se zobrazí jako placeholder, jako ve Figmě. */
  hideLabel?: boolean;
  error?: string | null;
}

export function TextField({ label, hideLabel, error, ...rest }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hideLabel={hideLabel} error={error}>
      <input
        id={id}
        className="input"
        placeholder={hideLabel ? label : rest.placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
  error?: string | null;
}

export function TextAreaField({ label, hideLabel, error, ...rest }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hideLabel={hideLabel} error={error}>
      <textarea
        id={id}
        className="input"
        placeholder={hideLabel ? label : rest.placeholder}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  error?: string | null;
}

export function SelectField({ label, options, error, ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} error={error}>
      <select id={id} className="input" {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  error?: string | null;
}

export function Checkbox({ label, error, ...rest }: CheckboxProps) {
  const id = useId();
  return (
    <div className="field">
      <label className="checkbox" htmlFor={id}>
        <input id={id} type="checkbox" {...rest} />
        <span>{label}</span>
      </label>
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface ChipGroupProps {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}

/** Výběr více hodnot pomocí „čipů“ (sporty, barvy…). */
export function ChipGroup({ label, options, value, onChange }: ChipGroupProps) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className="field" role="group" aria-label={label}>
      <span className="field__label">{label}</span>
      <div className="chips">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className="chip"
            aria-pressed={value.includes(opt)}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
