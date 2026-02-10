# CF Astro Blog Starter

An opinionated blog starter template powered by **Astro** + **Hono** + **Cloudflare Workers** with a built-in admin panel, CMS, analytics, and media management — all using Cloudflare-native services.

**[Live Demo](https://cf-astro-blog-starter.h1n054ur.dev)** 
--
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/h1n054ur/cf-astro-blog-starter)

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Astro](https://astro.build) (SSR on Workers) |
| Admin/API | [Hono](https://hono.dev) + [HTMX](https://htmx.org) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) via [Drizzle ORM](https://orm.drizzle.team) |
| Media | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| Sessions | [Cloudflare KV](https://developers.cloudflare.com/kv/) |
| Auth | JWT ([jose](https://github.com/panva/jose)) + [Turnstile](https://developers.cloudflare.com/turnstile/) |
| Runtime | [Bun](https://bun.sh) |
| Linting | [Biome](https://biomejs.dev) |
| Testing | [bun:test](https://bun.sh/docs/cli/test) |
| Deploy | [Cloudflare Workers](https://developers.cloudflare.com/workers/) |

## Features

- **Blog** — SSR pages served from D1, markdown content, categories, tags, pagination, SEO meta
- **Admin Panel** — Hono-powered dashboard at `/api/admin` with HTMX interactivity
- **Post Editor** — Create/edit posts with markdown, SEO fields, categories, tags, featured images
- **Media Manager** — Upload and manage files via R2 directly from the admin
- **Analytics** — Built-in session and event tracking stored in D1
- **Search** — Server-side search across post titles, content, and excerpts
- **RSS + Sitemap** — Dynamic feeds generated from D1
- **Dark Mode** — System preference auto-detect with manual toggle
- **Security** — CSP headers, rate-limited login, JWT auth, Turnstile CAPTCHA support
- **Themeable** — CSS custom properties for easy style customization

## Architecture

```
Astro (public site)          Hono (admin + API)
├── / (homepage)             ├── /api/auth/* (login/logout)
├── /blog (listing)          ├── /api/admin (dashboard)
├── /blog/:slug (post)       ├── /api/admin/posts (CRUD)
├── /search                  ├── /api/admin/media (R2)
├── /rss.xml                 ├── /api/admin/analytics
└── /sitemap.xml             └── /api/health

         ┌──────────┐
         │ Shared   │
         │ D1 + R2  │
         │ + KV     │
         └──────────┘
```

Astro handles the public-facing site with SSR pages that query D1 directly. Hono handles the admin panel and API routes, mounted via a catch-all Astro endpoint at `/api/[...route]`.

## Quick Start

### Deploy to Cloudflare (one-click)

Click the button above. Cloudflare will automatically provision D1, R2, and KV resources.

### Manual Setup

```bash
# Clone
git clone https://github.com/h1n054ur/cf-astro-blog-starter.git
cd cf-astro-blog-starter

# Install
bun install

# Set up local secrets
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your values

# Generate initial migration
bun run db:generate

# Run locally
bun run dev
```

### Create Resources (manual deploy)

```bash
# Create Cloudflare resources
wrangler d1 create blog-db
wrangler r2 bucket create blog-media
wrangler kv namespace create SESSION

# Update wrangler.jsonc with the IDs from above

# Set secrets
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD_HASH
wrangler secret put TURNSTILE_SECRET_KEY

# Deploy
bun run deploy
```

### Generate Admin Password Hash

```bash
echo -n 'your-password' | sha256sum
# Use the hash output as ADMIN_PASSWORD_HASH
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Astro dev server |
| `bun run build` | Build for production |
| `bun run preview` | Build and preview with Wrangler |
| `bun run deploy` | Run migrations, build, and deploy |
| `bun run check` | Astro check + Biome check |
| `bun run check:fix` | Auto-fix Biome issues |
| `bun run format` | Format with Biome |
| `bun run lint` | Lint with Biome |
| `bun test` | Run tests |
| `bun run db:generate` | Generate Drizzle migration |
| `bun run db:migrate:local` | Apply migrations locally |
| `bun run db:migrate:remote` | Apply migrations to production |
| `bun run db:seed:local` | Seed local DB with sample posts |
| `bun run db:seed:remote` | Seed production DB with sample posts |

## Project Structure

```
src/
├── pages/                  # Astro pages (public site)
│   ├── index.astro         # Homepage
│   ├── blog/               # Blog listing + post pages (SSR)
│   ├── search.astro        # Search page
│   ├── rss.xml.ts          # RSS feed
│   ├── sitemap.xml.ts      # Dynamic sitemap
│   └── api/[...route].ts   # Catch-all → Hono
├── admin/                  # Hono sub-app
│   ├── app.ts              # Hono entry
│   ├── routes/             # Auth, dashboard, posts, media, analytics
│   ├── middleware/          # JWT auth, rate limiting
│   └── views/              # HTML templates (admin UI)
├── components/             # Astro components
├── layouts/                # Base + Post layouts
├── styles/                 # CSS custom properties (themeable)
├── db/schema.ts            # Drizzle schema
├── lib/                    # Shared utilities
└── middleware.ts            # Security headers
scripts/
└── seed.sql                # Sample blog posts for demo/dev
tests/
├── unit/                   # Schema tests
└── integration/            # API endpoint tests
```

## Cloudflare Services Used

| Service | Binding | Purpose |
|---------|---------|---------|
| D1 | `DB` | Blog posts, categories, tags, analytics, auth |
| R2 | `MEDIA_BUCKET` | Image and file uploads |
| KV | `SESSION` | Session storage and caching |
| Workers | — | SSR runtime |
| Turnstile | `TURNSTILE_SITE_KEY` | Bot protection on login |

## Customization

### Theming

Edit `src/styles/global.css` — all colors, fonts, spacing, and layout values are CSS custom properties:

```css
:root {
  --color-accent: #3b82f6;     /* Change the accent color */
  --font-sans: 'Inter', ...;   /* Swap fonts */
  --max-width: 72rem;          /* Adjust content width */
}
```

Dark mode tokens are defined in `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)`.

### Site Config

Edit `src/lib/types.ts` to update site name, URL, description, and author.

## License

[MIT](LICENSE)
