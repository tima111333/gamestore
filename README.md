# VOLTA

A game-store front end built as a showcase: heavy motion, real catalogue data, and performance treated as a feature rather than a cleanup task.

Dark near-black interface, one acid accent and one hot accent, notched panels, film grain and scanlines. Six routes, not a one-pager — every URL works on direct entry and on refresh.

> Demo project. Nothing is for sale; artwork and catalogue data belong to their respective publishers.

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. **No API key is required** — see [Data sources](#data-sources).

Production build:

```bash
npm run build && npm run start
```

Requires Node.js 20.9+ (Next.js 16 minimum).

---

## Data sources

The catalogue is resolved through a provider chain in [`src/lib/games.ts`](src/lib/games.ts). Each provider maps onto the same `Game` type, so pages never branch on where data came from.

| Order | Provider | Key needed | What it gives |
| --- | --- | --- | --- |
| 1 | **RAWG** (`api.rawg.io`) | yes | Broad catalogue, genres, tags, trailers, requirements |
| 2 | **Steam store** (`store.steampowered.com/api`) | **no** | Live shelves with **real prices and real discounts**, screenshots, trailers, requirements |
| 3 | **Offline catalogue** (`src/lib/mock-data.ts`) | no | 18 hand-picked titles, always available |

Every upstream call is time-boxed, cached, and guarded by a circuit breaker: after a failure the provider is skipped for 60 seconds instead of costing every page render a timeout. A dead API degrades to the next provider silently — the site never shows an error because of it.

Pin a provider for testing:

```bash
VOLTA_DATA_SOURCE=steam    # or: rawg | offline | auto (default)
```

### Getting a RAWG key (optional, ~1 minute)

1. Open <https://rawg.io/apidocs> and click **Get API key**.
2. Register (free tier: 20 000 requests/month, no card).
3. Copy `.env.local.example` to `.env.local` and paste the key:

```bash
RAWG_API_KEY=your_key_here
```

Restart the dev server. Without the key the site runs on Steam data, and without network access it runs on the offline catalogue.

### Refreshing the offline catalogue

```bash
node scripts/generate-mock.mjs
```

Rebuilds `src/lib/mock-data.ts` from the public Steam store API. The app never calls Steam for this file at runtime — it is committed output.

### Background footage

Hero and genre backgrounds are free-licence clips from [Pexels](https://www.pexels.com/), referenced from their CDN and declared in [`src/lib/media.ts`](src/lib/media.ts). Nothing is bundled.

---

## Routes

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | Static, revalidated hourly | Full-screen hero with background video, spotlight, featured rail, deals block, genre index |
| `/catalog` | Dynamic | Filters (genre, platform, price, rating, sale), sort, debounced search, infinite scroll |
| `/game/[slug]` | SSG + ISR | Gallery, trailer, description, system requirements, scores, similar games |
| `/genres` | Static | Parallax sections, each linking into a filtered catalogue |
| `/deals` | Static, revalidated hourly | Countdown to 00:00 UTC, headline deal, discount grid |
| `/cart` | Static shell | Local state only (zustand + `localStorage`), no backend |

Catalogue state lives entirely in the URL (`?q=`, `?genre=`, `?platform=`, `?price=`, `?rating=`, `?sort=`, `?sale=`), so filtered views are shareable and survive a refresh.

---

## Architecture

```
src/
├── app/                  routes, loading.tsx / error.tsx per segment, api/games route handler
├── components/
│   ├── ui/               Button, MagneticButton, Skeleton, Tag, Rating, PriceTag, Section
│   ├── layout/           Header, Footer, ScrollProgress, ThemeToggle, CartBadge, Wordmark
│   ├── motion/           SmoothScroll, PageTransition, Reveal, Enter, SplitText, ParallaxLayer,
│   │                     ParallaxController, AnimatedNumber, CartFlight, MotionProvider
│   ├── game/             GameCard, TiltCard, HoverTrailer, Gallery, SystemRequirements, …
│   ├── catalog/          FiltersPanel, SearchInput, SortSelect, InfiniteGrid, EmptyState
│   ├── home/             Hero, HeroVideo, FeaturedRail, DealsStrip, GenreTeaser
│   └── three/            AccentScene (+ its gate)
├── hooks/                useInView, useMediaQuery, useDebouncedValue
├── lib/                  games, rawg, steam, mock-data, filters, genres, image-hosts, media, utils
├── store/                cart (persisted), ui (theme, cart flights)
└── types/                game.ts — the single shape every provider maps to
```

### Image host allowlist

[`src/lib/image-hosts.ts`](src/lib/image-hosts.ts) is the single source of truth for remote image hosts: `next.config.ts` builds `images.remotePatterns` from it, and the data mappers validate every incoming URL against it. Upstream APIs move artwork between CDN hosts, and an unknown host makes `next/image` throw mid-render — this turns that class of outage into a silent fallback.

---

## Motion

| Piece | Implementation | Gated by |
| --- | --- | --- |
| Smooth scroll | Lenis, dynamically imported | reduced motion |
| Page transitions | `template.tsx` + curtain | client navigation only |
| Headline | per-character CSS keyframes | — |
| Above-the-fold entrances | CSS (`Enter`) | — |
| Below-the-fold reveals | IntersectionObserver (`Reveal`) | — |
| Card tilt + cursor glow | Framer springs on `rotateX/rotateY` | fine pointer, reduced motion |
| Hover trailer | 400 ms intent delay, buffer released on leave | fine pointer, reduced motion |
| Magnetic buttons | Framer springs, pointer-driven | fine pointer, reduced motion |
| Fly-to-cart, animated counters | Framer | reduced motion |
| Parallax | Framer scroll (`/`), GSAP ScrollTrigger (`/genres`) | ≥768 px, reduced motion |
| 3D accent | react-three-fiber point sphere | ≥1024 px, fine pointer, WebGL, reduced motion |

Only `transform` and `opacity` are animated. Scroll handlers are passive and coalesced into a single `requestAnimationFrame`; every effect cleans up after itself. `prefers-reduced-motion` is honoured globally through `MotionConfig reducedMotion="user"` plus a CSS reset that also neutralises animation delays.

The pointer stays the system cursor — no custom replacement. Mobile gets simplified motion: no tilt, no hover trailers, no background video — the poster frame stands in.

---

## Performance

Measured with Lighthouse against `next start` on the production build:

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | **98** | **100** | 77 | **100** |
| Mobile | **86** | **100** | 77 | **100** |

Desktop: LCP 1.0 s, TBT 90 ms, **CLS 0**. Mobile: FCP 0.9 s, TBT 60 ms, Speed Index 1.0 s, **CLS 0**.

Mobile LCP reads 4.3 s, but the observed value in the same trace is **437 ms** — the difference is Lighthouse's simulated slow-4G/4×-CPU model applied to hydration cost, not a resource the page is waiting on. Nothing in the run finishes later than 1.2 s.

### Bundle

```
first load (any route)   ~228 KB gzip
├── react-dom             69.7 KB
├── next runtime          42.6 KB
├── react                 38.6 KB
└── app + motion stack    ~68 KB   (framer-motion ~25, zustand, app code)

loaded on demand only
├── three.js             228 KB    home route, desktop + idle + WebGL
├── gsap + ScrollTrigger  50 KB    /genres only
└── lenis                 13 KB    after mount, unless reduced motion
```

The framework accounts for roughly 160 KB of the first load; that is the floor. The animation stack is kept off it: Framer runs through `LazyMotion` with the `domAnimation` feature set (`strict` mode makes regressions a build-time error), GSAP is imported inside the effect that needs it, and the 3D scene is behind `next/dynamic` with `ssr: false`.

### Rules the code follows

- `next/image` everywhere; `priority` only on the hero poster, everything else lazy with explicit `sizes`
- Video: `preload="none"`, poster frame, paused via IntersectionObserver when off-screen, source attached only after idle
- Skeletons that reserve the final box (hence CLS 0), never spinners
- Content above the fold never waits on JavaScript to become visible

---

## Accessibility

Semantic landmarks, skip link, visible focus ring on every interactive element, full keyboard navigation, `alt` text on meaningful images and `aria-hidden` on decorative ones. Colour tokens are AA against their surfaces (smallest text: 4.98:1). Lighthouse accessibility: 100 on both the home and catalogue routes.

Overlays behave like real dialogs: the filters drawer moves focus inside on open, keeps Tab within it, closes on Escape, and returns focus to the trigger ([`useFocusTrap`](src/hooks/useFocusTrap.ts)). Interactive targets clear 24×24 px.

Verified by driving headless Chrome: a Tab walk across routes (focus ring present at every stop, no off-screen traps), an accessibility-tree name check, and a layout sweep at 360 / 768 / 1280 / 1920 px with zero horizontal overflow.

---

## Deploying

This app needs a Node runtime. Server components fetch the catalogue, `/api/games`
is a route handler, pages revalidate hourly, and `next/image` optimises artwork on
request — a static file host cannot serve any of that. **GitHub Pages will not
work**: with no static site in the repository it falls back to Jekyll and renders
this README instead.

Three hosts are wired up. All of them build from `main` on push.

**Vercel** — zero config. <https://vercel.com/new> → import the repository →
deploy. Nothing to change; the framework preset is detected.

**Netlify** — [`netlify.toml`](netlify.toml) pins Node 22 and the official
Next.js runtime, which maps server components, route handlers, revalidation and
`next/image` onto Netlify Functions and its image CDN.
<https://app.netlify.com/start> → import the repository → deploy.

**Render** — [`render.yaml`](render.yaml) runs plain `next start` in a Node
service with no platform adapter in between, so behaviour matches local
exactly. <https://dashboard.render.com/blueprints> → **New Blueprint Instance**
→ pick the repository. Free instances sleep when idle, so the first request
after a quiet spell pays a cold start.

On any of them, `RAWG_API_KEY` is optional: set it to switch the catalogue to
RAWG, leave it unset and the Steam provider takes over exactly as it does
locally.

Notes for a hosted deployment:

- The build calls Steam roughly 40 times to prerender game pages. If those calls
  are throttled or blocked from the build region, the breaker trips and the
  offline catalogue is used — the build still succeeds.
- Pin a provider with `VOLTA_DATA_SOURCE` if you want deterministic content.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `node scripts/generate-mock.mjs` | Regenerate the offline catalogue |

---

## Known limitations

- The Steam store API is undocumented and rate-limited (~200 requests / 5 min per IP); the app spends ~40 per revalidation and caches for an hour.
- Steam exposes no console availability, so platform facets are PC/macOS/Linux when Steam is the active provider.
- RAWG has no commerce data: with RAWG active, prices are derived deterministically from the game id, rating and age.
- Lighthouse "best practices" sits at 77 because of third-party cookies set by the Steam CDN and missing production source maps.
- Behind a corporate proxy or VPN, Node's `fetch` ignores `HTTP(S)_PROXY`; `next.config.ts` sets `NODE_USE_ENV_PROXY` when a proxy is configured, otherwise the image optimizer times out.

## Licence

Code is MIT. Game artwork, descriptions and trailers belong to their publishers and are fetched from public endpoints for demonstration purposes.
