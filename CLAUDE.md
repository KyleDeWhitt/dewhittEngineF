# DeWhitt Designs

Website for dewhittdesigns.com (React + Vite). It also hosts the web version of the DeWhitt Fit app under `/fit`.

## Commands
- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- There are no automated tests. To check a change, run lint and build, then look at the page in the dev server.

## Deploying
- Pushing to `main` deploys the live site: GitHub Actions builds and uploads `dist/` to Hostinger over FTP. Never push to `main` without asking first.
- The FTP `server-dir` in `.github/workflows/deploy.yml` is `./` on purpose (the FTP user's root is already the site docroot). It took many attempts to get right; don't change it.
- The backend (`dewhittEngineB/`) is believed to redeploy on Render automatically when its `main` is pushed (not confirmed). Treat a push there as a live deploy too, and ask first.

## Three separate git repos live in this folder
- This folder: the website frontend (`dewhitt-fit-frontend` on GitHub).
- `dewhittEngineB/`: the backend API (Express + Sequelize + MySQL, Stripe, hosted on Render as `dewhitt-engine-b`). Its own repo.
- `dewhittFitEngine/`: the DeWhitt Fit Android app (`app/`, Capacitor) and a not-yet-deployed standalone Fit API (`server/`). Its own repo.
- Never `git add` the two engine folders into this repo. Commit backend or app changes from inside their own folder.

## Gotchas
- One backend serves both products today. `VITE_API_URL` and `VITE_FIT_API_URL` both point at `dewhitt-engine-b`; `dewhittFitEngine/server/` is not live.
- The Fit screens exist twice: `src/fit/` (web) and `dewhittFitEngine/app/src/` (Android). They must stay in sync: when changing a Fit screen, make the same change in the other copy. They are not byte-identical (the Android copy has app-only pieces such as `DeepLinkHandler.jsx`), so port the change by hand rather than copying whole files over.
- The main site and Fit keep separate logins: `authToken` vs `fitAuthToken` in localStorage, separate AuthContexts, separate axios instances. Don't mix them.
- `.env` and `.env.production` are committed and hold only public `VITE_` URLs. Never put a secret in them; anything `VITE_` ships to the browser.
- Files in `public/` (the `.glb` models) keep their names across deploys, so `public/.htaccess` must not long-cache them. Built JS/CSS get unique names and are cached forever.
- `public/.well-known/assetlinks.json` makes email links open the Android app. Don't remove or rename it.
- `diag-*.cjs` in this folder contain live database credentials. Never commit them or copy their contents anywhere.
