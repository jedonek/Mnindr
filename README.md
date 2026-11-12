🐾 Mňindr

Kočičí seznamovací aplikace (mobile-first). React 18 + TypeScript + Vite + React Router 6.

Spuštění
bash
npm install
npm run dev     # http://localhost:5173
npm run build   # typecheck + produkční build
Obrázky maskotů

Z Figmy exportuj průhledné PNG a ulož je do public/images/:

girl.png – kočičí dívka
boy.png – kocour

Bez nich se zobrazí náhradní silueta.

Struktura
text
src/
├── main.tsx, router.tsx      vstup a všechny routes
├── index.css                 design systém (barvy, typografie, komponenty)
├── types/                    sdílené typy
├── data/                     seed profilů, FAQ, možnosti výběrů
├── lib/
│   ├── api.ts                MOCK backend přes localStorage
│   └── validation.ts         validace + české hlášky
├── context/AuthContext.tsx   přihlášený uživatel
├── hooks/useUnsavedChanges.ts  varování při odchodu s neuloženými změnami
├── components/
│   ├── ui/                   Button, Fields, Modal, Icon, Logo, Mascot…
│   └── layout/               Header, Footer, Public/Auth/Protected layouty
└── pages/                    jedna stránka = jeden soubor
Routes
Route	Stránka	Přístup
/	Landing	všichni (přihlášené přesměruje na /discover)
/how-it-works, /support, /rules, /terms, /privacy	informační	všichni
/register, /register/pet-info	registrace ve 2 krocích	nepřihlášení
/login, /forgot-password, /verify-code	přihlášení a obnova hesla	nepřihlášení
/discover	swajpování, match modal	přihlášení
/chat	shody, zprávy, nahlášení a blokace	přihlášení
/profile/edit, /profile/preferences	profil a filtry	přihlášení
Mock backend → reálný backend

Všechna volání jsou v src/lib/api.ts a každé má v komentáři cílový endpoint. Stačí přepsat těla funkcí na fetch, zbytek aplikace se nemění.

Mock data jsou v localStorage (klíče mnindr:*).

[!WARNING] Heslo se v mocku ukládá v čitelné podobě – v produkci nikdy.

Vývojové pomůcky
OTP kód pro obnovu hesla se v dev režimu zobrazí na /verify-code a v konzoli.
Mia a Luna v seedu „dají like“ – swajpnutím doprava vznikne match.
Když dojdou profily, na prázdné obrazovce je dev tlačítko pro vynulování swipů.s