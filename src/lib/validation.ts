/** České validační hlášky a pravidla – jediné místo, kde se mění. */
export const MSG = {
  required: 'Toto pole je povinné.',
  email: 'Zadej platnou e-mailovou adresu.',
  emailExists: 'Účet s touto e-mailovou adresou již existuje.',
  badLogin: 'Nespárovaná kombinace e-mailové adresy a hesla.',
  weakPassword: 'Heslo musí mít alespoň 8 znaků, číslo a velké písmeno.',
  passwordMismatch: 'Hesla se neshodují.',
  otpExpired: 'Platnost zadaného kódu vypršela. Nechte si poslat nový kód.',
  otpInvalid: 'Zadaný kód není správný.',
  badPhoto: 'Nahrajte prosím fotografii ve formátu JPG nebo PNG do 5 MB.',
  terms: 'Pro pokračování musíš souhlasit se smluvními podmínkami.',
  age: 'Věk musí být v rozsahu 18–99 let.',
  unsaved: 'Máš neuložené změny. Opravdu chceš odejít?',
  generic: 'Něco se pokazilo. Zkus to prosím znovu.',
} as const;

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function validateRequired(value: string): string | null {
  return value.trim() ? null : MSG.required;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return MSG.required;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? null : MSG.email;
}

/** Min. 8 znaků, 1 velké písmeno, 1 číslo. */
export function validatePassword(value: string): string | null {
  if (!value) return MSG.required;
  const ok = value.length >= 8 && /[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(value) && /\d/.test(value);
  return ok ? null : MSG.weakPassword;
}

export function validateAge(value: number): string | null {
  if (!Number.isFinite(value)) return MSG.required;
  return value >= 18 && value <= 99 ? null : MSG.age;
}

export function validatePhoto(file: File): string | null {
  const okType = file.type === 'image/jpeg' || file.type === 'image/png';
  return okType && file.size <= MAX_PHOTO_BYTES ? null : MSG.badPhoto;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function hasErrors(errors: Record<string, string | null | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
