export type Gender = 'kocour' | 'kocka';
export type SwipeAction = 'like' | 'dislike' | 'superlike';
export type RelationshipGoal = 'dlouhodoby' | 'pratelstvi' | 'nezavazne' | 'zatim-nevim';
export type Seeking = 'kocka' | 'kocour' | 'vsichni';

/** Preference vyhledávání (/profile/preferences) */
export interface Preferences {
  ageMin: number;
  ageMax: number;
  maxDistance: number; // km, 1–100
  area: string;
  onlyVerified: boolean;
  goal: RelationshipGoal;
  seeking: Seeking;
  firstDate: string;
  whenMeet: string;
  activities: string;
  music: string;
  smoking: string;
}

/** Veřejná část profilu – to, co vidí ostatní na kartě. */
export interface Profile {
  id: string;
  nickname: string;
  age: number;
  gender: Gender;
  residence: string;
  photo?: string;
  photoBg: string;
  bio: string;
  tags: string[];
  verified: boolean;
  distanceKm: number;
  /** Jen pro mock: tento profil už dal like přihlášenému uživateli. */
  likesYou?: boolean;
}

/** Účet uživatele (mock – v reálném backendu by heslo nikdy nebylo v klientu). */
export interface Account {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  newsletter: boolean;
  nickname: string;
  age: number;
  gender: Gender;
  phone: string;
  residence: string;
  photo?: string;
  photoBg: string;
  bio: string;
  sports: string[];
  colors: string[];
  dreamDate: string;
  verified: boolean;
  prefs: Preferences;
  createdAt: string;
}

export type SessionUser = Omit<Account, 'password'>;

export interface RegisterBasics {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  newsletter: boolean;
}

export interface RegisterPetInfo {
  nickname: string;
  age: number;
  gender: Gender;
  phone: string;
  photo?: string;
}

export interface SwipeRequest {
  targetUserId: string;
  action: SwipeAction;
}

export interface SwipeResponse {
  isMatch: boolean;
}

export interface Match {
  id: string;
  userId: string;
  targetId: string;
  createdAt: string;
}

export interface MatchWithProfile extends Match {
  profile: Profile;
}

/** Additional profile details visible only to an existing match. */
export interface MatchProfileDetails extends Profile {
  sports: string[];
  colors: string[];
  dreamDate: string;
  prefs: Preferences;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  fromId: string;
  text: string;
  at: string;
}

export type ReportReason = 'spam' | 'obtezovani' | 'falesny-profil' | 'nevhodny-obsah' | 'jine';
