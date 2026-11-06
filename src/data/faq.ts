export type FaqCategory = 'ucet' | 'seznamovani' | 'bezpecnost';

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES: Record<FaqCategory, string> = {
  ucet: 'Účet a přihlášení',
  seznamovani: 'Seznamování a zprávy',
  bezpecnost: 'Bezpečí a pravidla',
};

export const FAQ: FaqItem[] = [
  {
    id: 'zdarma',
    category: 'seznamovani',
    question: 'Je MŇINDR zdarma?',
    answer:
      'Ano, registrace, swajpování i psaní zpráv po vzájemné shodě je zdarma. Případné prémiové funkce budou vždy volitelné.',
  },
  {
    id: 'overeni',
    category: 'bezpecnost',
    question: 'Jak funguje ověření profilu?',
    answer:
      'Ověřený profil poznáš podle odznaku u jména. Znamená, že za profilem stojí skutečný člověk, ne falešné mňau.',
  },
  {
    id: 'nahlaseni',
    category: 'bezpecnost',
    question: 'Jak nahlásím nevhodné chování?',
    answer:
      'Uživatele můžeš kdykoli nahlásit nebo zablokovat přímo z jeho profilu nebo z chatu. Každé nahlášení kontrolujeme.',
  },
  {
    id: 'heslo',
    category: 'ucet',
    question: 'Zapomněl(a) jsem heslo. Co teď?',
    answer:
      'Na přihlašovací stránce zvol „zapomenuté heslo“. Pošleme ti na e-mail 6místný kód s platností 15 minut a po jeho zadání si nastavíš nové heslo.',
  },
  {
    id: 'upravit-profil',
    category: 'ucet',
    question: 'Jak upravím svůj profil?',
    answer: 'V horní liště otevři svůj profil. Změny se projeví až po stisknutí tlačítka Uložit.',
  },
  {
    id: 'shoda',
    category: 'seznamovani',
    question: 'Kdy vznikne shoda (match)?',
    answer:
      'Když dáte srdíčko oba navzájem. Pak se objeví okno „Je to match!“ a můžete si začít psát.',
  },
  {
    id: 'supermnau',
    category: 'seznamovani',
    question: 'Co je Super mňau?',
    answer: 'Zvýrazněné srdíčko pro profily, které tě opravdu zaujaly. Dej vědět, že tě někdo extra baví.',
  },
  {
    id: 'soukromi',
    category: 'bezpecnost',
    question: 'Kdo vidí moje údaje?',
    answer:
      'Ostatním ukazujeme jen přezdívku, věk, vzdálenost, fotku a popis. Telefon ani e-mail nikdy nezveřejňujeme.',
  },
];
