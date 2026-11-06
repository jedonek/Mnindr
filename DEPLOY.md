# Mňindr – spuštění a nasazení

## Lokálně
1. Založ PostgreSQL databázi (např. Neon) a zkopíruj její connection string.
2. V `backend/` zkopíruj `.env.example` do `.env`, nastav `DATABASE_URL` a náhodný `RESET_SECRET`.
3. V `backend/` spusť `npm install`, `npm run db:migrate`, `npm run dev`.
4. V kořeni projektu zkopíruj `.env.example` do `.env.local`.
5. V kořeni spusť `npm install` a `npm run dev`.
6. Otevři `http://localhost:5173`. Zaregistruj dva účty ve dvou prohlížečích a vyzkoušej vzájemný like.

## Produkce
- **Neon:** založ PostgreSQL projekt a použij připojovací `DATABASE_URL` s TLS (`sslmode=require`). Spusť migraci `npm run db:migrate` z `backend/` se stejným URL.
- **Render Web Service:** root directory `backend`, build command `npm install`, start command `npm start`. Nastav `DATABASE_URL`, `NODE_ENV=production`, `FRONTEND_URL=https://TVUJ-FRONTEND.vercel.app`, `COOKIE_SAMESITE=none`, `RESET_SECRET` a SMTP proměnné.
- **Vercel:** root directory kořen projektu, build `npm run build`, output `dist`. Nastav `VITE_API_URL=https://TVUJ-BACKEND.onrender.com`. Proveď nový deployment po změně env.
- HTTPS je v produkci nutné. Cross-site cookie vyžaduje `SameSite=None; Secure`; některé prohlížeče blokují cookies třetích stran. Nejrobustnější řešení je vlastní doména a reverse proxy `/api` pod stejným webovým originem, potom `COOKIE_SAMESITE=lax` a `VITE_API_URL` prázdné.
- Pro reset hesla nastav `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Bez SMTP je reset dostupný pouze ve vývojovém režimu a kód se vypisuje do terminálu.

## Co je hotové a co ještě řešit před veřejným spuštěním
- Účty v PostgreSQL, bcrypt hesla, session cookie, swipy, vzájemné shody, zprávy, blokace a hlášení.
- Původní ukázkové profily nejsou skuteční uživatelé, proto se do seznamu nevracejí. Otestuj se dvěma registrovanými účty.
- Chat načítá zprávy při otevření konverzace; pro živé doručování přidej polling nebo WebSocket.
- Profilové fotky se pro jednoduchost ukládají jako base64 do databáze. Pro ostrý provoz přejdi na objektové úložiště (např. S3/R2) a ukládej URL.
- Vzdálenost je nyní placeholder `0 km`; bez geolokačních souřadnic nelze filtrovat skutečnou vzdálenost. Preference oblasti jsou uložené, ale geografické filtrování není implementované.
- Ověření profilu (`verified`) nemá administrační workflow. Pro veřejný provoz doplň moderaci, kontrolu nahlášení, mazání účtu, GDPR pravidla, ochranu proti CSRF a robustní validaci všech vstupů.
- Veřejné nasazení vyžaduje otestovat přihlášení v Safari/Firefox a cookies mezi doménami.
