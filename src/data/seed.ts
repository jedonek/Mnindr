import type { Preferences, Profile } from '@/types';

export const DEFAULT_PREFS: Preferences = {
  ageMin: 25,
  ageMax: 38,
  maxDistance: 30,
  area: 'Brno a okolí',
  onlyVerified: false,
  goal: 'dlouhodoby',
  seeking: 'vsichni',
  firstDate: 'Káva nebo procházka',
  whenMeet: 'Odpoledne a víkendy',
  activities: 'Výlety, kino a kavárny',
  music: 'Indie a pop',
  smoking: 'Preferuji nekuřáka',
};

export const SPORT_OPTIONS = ['Běh', 'Jóga', 'Plavání', 'Cyklistika', 'Turistika', 'Lezení', 'Tanec', 'Fitness'];
export const COLOR_OPTIONS = ['Růžová', 'Žlutá', 'Černá', 'Bílá', 'Fialová', 'Modrá', 'Zelená', 'Červená'];

export const GOAL_LABELS = {
  dlouhodoby: 'Dlouhodobý vztah',
  pratelstvi: 'Přátelství',
  nezavazne: 'Nezávazné seznámení',
  'zatim-nevim': 'Zatím nevím',
} as const;

export const SEEKING_LABELS = {
  kocka: 'Kočku',
  kocour: 'Kocoura',
  vsichni: 'Všechny',
} as const;

export const FIRST_DATE_OPTIONS = ['Káva nebo procházka', 'Večeře', 'Kino', 'Výlet', 'Zatím nevím'];
export const WHEN_MEET_OPTIONS = ['Během týdne', 'Odpoledne a víkendy', 'Večer', 'Kdykoli'];
export const ACTIVITY_OPTIONS = ['Výlety, kino a kavárny', 'Sport a pohyb', 'Domácí večery', 'Kultura a koncerty'];
export const MUSIC_OPTIONS = ['Indie a pop', 'Rock', 'Elektronika', 'Klasika', 'Hip-hop', 'Všechno možné'];
export const SMOKING_OPTIONS = ['Preferuji nekuřáka', 'Nevadí mi to', 'Kouřím také'];

/** Mock databáze profilů, které se objeví v /discover. */
export const SEED_PROFILES: Profile[] = [
  {
    id: 'seed-mia',
    nickname: 'Mia',
    age: 23,
    gender: 'kocka',
    residence: 'Praha',
    photo: '/images/girl.png',
    photoBg: '#FFF6F3',
    bio: 'Miluju kávu, anime a líná rána s kočkou. Hledám někoho na společné toulky městem i večery pod dekou. Dáme první mňau?',
    tags: ['Káva', 'Anime', 'Kočky', 'Procházky'],
    verified: true,
    distanceKm: 3,
    likesYou: true,
  },
  {
    id: 'seed-felix',
    nickname: 'Felix',
    age: 28,
    gender: 'kocour',
    residence: 'Brno',
    photo: '/images/boy.png',
    photoBg: '#FFF6F3',
    bio: 'Přes týden kód, o víkendu hory. Rád vařím a umím poznat dobrý flat white na sto honů.',
    tags: ['Hory', 'Vaření', 'Kávu', 'Deskovky'],
    verified: true,
    distanceKm: 8,
    likesYou: false,
  },
  {
    id: 'seed-luna',
    nickname: 'Luna',
    age: 26,
    gender: 'kocka',
    residence: 'Brno',
    photo: '/images/girl.png',
    photoBg: '#FFF6F3',
    bio: 'Jóga ráno, vinyly večer. Hledám někoho, kdo se nebojí zpívat v koupelně.',
    tags: ['Jóga', 'Vinyly', 'Indie'],
    verified: false,
    distanceKm: 12,
    likesYou: true,
  },
  {
    id: 'seed-simba',
    nickname: 'Simba',
    age: 31,
    gender: 'kocour',
    residence: 'Praha',
    photo: '/images/boy.png',
    photoBg: '#FFF6F3',
    bio: 'Fotím, cestuju a sbírám kočičí memy. Jsem nejlepší parťák na výlety.',
    tags: ['Foto', 'Cestování', 'Memy'],
    verified: true,
    distanceKm: 25,
    likesYou: false,
  },
  {
    id: 'seed-nala',
    nickname: 'Nala',
    age: 35,
    gender: 'kocka',
    residence: 'Olomouc',
    photo: '/images/girl.png',
    photoBg: '#FFF6F3',
    bio: 'Knihy, čaj a dlouhé procházky. Nehledám nic složitého, jen dobrou společnost.',
    tags: ['Knihy', 'Čaj', 'Procházky'],
    verified: false,
    distanceKm: 70,
    likesYou: false,
  },
];
