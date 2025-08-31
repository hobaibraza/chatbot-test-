# Skyon Chatbot — Vite + GitHub Pages

This repo is a minimal wrapper that mounts your chatbot components and auto-deploys to GitHub Pages via Actions.

## Quick setup
1. Create a **new GitHub repo** and upload these files.
2. Go to **Settings → Secrets and variables → Actions → New repository secret** and add:
   - `VITE_WEBHOOK_URL` = your backend/n8n chat webhook URL.
3. Go to **Settings → Pages** and set **Source = GitHub Actions**.
4. Push to `main`. The workflow builds with Vite and deploys to Pages.
5. Your site will be available at `https://<user>.github.io/<repo>/`.

> The workflow sets the correct Vite `base` automatically using the repo name.

## Local dev
```bash
npm i
npm run dev
```

## Files of interest
- `src/App.tsx` — where `ChatInterface` is mounted and toggled.
- `src/lib/constants.ts` — labels and `WEBHOOK_URL` (defaults to `import.meta.env.VITE_WEBHOOK_URL`).

— Generated 2025-08-31T10:56:16.847940Z
