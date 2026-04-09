# Skybound Sprocket Web (Vercel)

A browser platformer inspired by classic run-and-jump adventures, rebuilt with new characters and story using Next.js.

## Commands

- `npm run dev` - local development
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint checks

## Mobile compatibility

The UI is responsive and optimized for touch targets (44px minimum button height), making it usable on both iPhone and Android browsers.

## Vercel setup

## Root-level fallback (prevents 404 if Root Directory is wrong)

This repository includes a root `vercel.json` that points Vercel to `emberfall-web/package.json`
and adds a catch-all route to `emberfall-web/$1`.
That means deployments from the repository root still build the Next.js app and route requests
into the subdirectory build output instead of returning a 404.


When importing this repository in Vercel:

- Framework preset: **Next.js**
- Root directory: `emberfall-web`
- Build command: `npm run build`
- Output: default (managed by Next.js)

### CLI deploy (avoid plugin 404s)

If you tried:

- `npx plugins add vercel/vercel-plugin`

that command is not part of the Vercel CLI workflow and can return a 404.
Use the Vercel CLI directly instead:

```bash
cd emberfall-web
npx vercel login
npx vercel
```

For production:

```bash
npx vercel --prod
```

If you still get a 404, verify you are logged into the correct Vercel account/team and that the project path is set to `emberfall-web` during linking.
