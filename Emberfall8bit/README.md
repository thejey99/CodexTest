# Emberfall: Ash of the Oath

A dark-fantasy 8-bit adventure prototype originally built with SwiftUI, now mirrored with a **cross-platform web build** that can be deployed on **Vercel** for both iPhone and Android users.

## Why switch from Swift-only to Vercel-hosted web

A Vercel-hosted build lets you ship one codebase to both phone platforms quickly:

- **iPhone + Android support** through any modern mobile browser.
- **Instant updates** after each deployment (no App Store/Play Store review cycle for content tweaks).
- **Shareable URL** for testing, demos, and play sessions.

## Project structure

- `Sources/Emberfall8bit/` – original SwiftUI prototype source.
- `../emberfall-web/` – new Next.js web implementation that replicates gameplay progression and lore unlock flow.

## Run the web build locally

```bash
cd emberfall-web
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, choose **Add New Project** and import the repository.
3. Set **Root Directory** to `emberfall-web`.
4. Keep default Next.js build settings (`npm run build`).
5. Deploy.

After deployment, users can open the Vercel URL on iPhone or Android and play immediately.

## Gameplay pillars preserved in the web build

- **8-bit tone + modern controls**
- **Trauma-informed protagonist**
- **Multiple weapon styles**
- **Branching revelation arc**

## Level arc

1. **Ashen Causeway**
2. **Cathedral of Cinders**
3. **Gravewood Bastion**
4. **The Rift Crown**
