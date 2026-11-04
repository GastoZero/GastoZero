# GastoZero

React + Vite + Tailwind CSS. PWA de controle de assinaturas e gastos recorrentes.

## Development Server

Start it with `npm run dev` (http://localhost:5173). Hot reload is enabled.

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css`, mounts `src/App.tsx` and registers the service worker in production
- `src/App.tsx` - Global state (subscriptions, profile, navigation) and persistence
- `src/pages/` - Login, Register, Dashboard, Subscriptions, Catalog, Simulator, Alerts, Settings
- `src/components/` - `Sidebar` (desktop), `BottomNav` (mobile) and shared UI such as `PriceInput` (money field: digits and one comma only)
- `server/app.ts` - Express app (routes, no `listen`); `server/index.ts` runs it locally and `api/index.ts` exposes it as the Vercel serverless function
- `server/lib/subscriptionFields.ts` - Subscription validation shared by the user and admin routes
- `vercel.json` - Vercel build output and `/api/*` rewrites
- `src/data/catalog.ts` - Global service/plan catalog with prices
- `src/lib/format.ts` - Currency, dates, billing cycles (weekly, monthly, yearly), price input helpers and derived subscription fields
- `src/lib/storage.ts` - `localStorage` persistence (`gastozero:` prefix)
- `src/types.ts` - Shared domain types
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `public/` - `manifest.webmanifest`, `sw.js` and PWA icon
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Dependencies and the dev, typecheck, build, preview and format scripts
- `vite.config.ts` - Vite configuration with React and Tailwind CSS v4 plus the `@` alias for `src`

## Dependencies

- Runtime: React 19 and React DOM 19
- Icons: lucide-react
- Charts: recharts
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.9, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
