-- Seed data for CF Astro Blog Starter demo
-- Run with: wrangler d1 execute blog-db --remote --file=scripts/seed.sql

-- Categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Tutorials', 'tutorials', 'Step-by-step guides and walkthroughs'),
  ('Architecture', 'architecture', 'System design and architecture decisions'),
  ('Cloudflare', 'cloudflare', 'Tips and tricks for building on Cloudflare');

-- Tags
INSERT INTO blog_tags (name, slug) VALUES
  ('Astro', 'astro'),
  ('Hono', 'hono'),
  ('Cloudflare Workers', 'cloudflare-workers'),
  ('D1', 'd1'),
  ('Drizzle ORM', 'drizzle-orm'),
  ('TypeScript', 'typescript'),
  ('SSR', 'ssr'),
  ('HTMX', 'htmx');

-- Post 1: Getting Started
INSERT INTO blog_posts (title, slug, content, excerpt, status, published_at, meta_title, meta_description, category_id, author_name) VALUES (
  'Getting Started with CF Astro Blog Starter',
  'getting-started',
  '## What is CF Astro Blog Starter?

CF Astro Blog Starter is an opinionated blog template that combines **Astro** for the public-facing site with **Hono** for the admin panel and API — all running on **Cloudflare Workers**.

### Why this stack?

- **Astro** gives you fast, SEO-friendly SSR pages with minimal JavaScript
- **Hono** provides a lightweight, type-safe API framework designed for edge runtimes
- **Cloudflare Workers** means global edge deployment with zero cold starts
- **D1** (SQLite) keeps your data close to your users
- **R2** handles media without egress fees

### Quick Setup

```bash
# Clone the repo
git clone https://github.com/h1n054ur/cf-astro-blog-starter.git
cd cf-astro-blog-starter

# Install dependencies
bun install

# Start the dev server
bun run dev
```

Or click the **Deploy to Cloudflare** button in the repo to get running in under a minute.

### What you get out of the box

1. **Blog with SSR** — pages rendered at the edge, querying D1 directly
2. **Admin panel** — create and manage posts at `/api/admin`
3. **Markdown editor** — write posts in markdown with live preview
4. **Media manager** — upload images to R2 from the admin
5. **Analytics** — built-in session and pageview tracking
6. **Dark mode** — automatic system preference detection with manual toggle
7. **RSS + Sitemap** — dynamic feeds generated from your content
8. **Search** — server-side full-text search across posts

### Next steps

Log into the admin panel at `/api/auth/login` and create your first post. The default credentials are in your environment secrets.',
  'A complete guide to setting up and deploying your blog with Astro, Hono, and Cloudflare Workers.',
  'published',
  '2026-02-09T10:00:00.000Z',
  'Getting Started with CF Astro Blog Starter',
  'Learn how to set up and deploy a full-featured blog using Astro, Hono, and Cloudflare Workers with D1, R2, and KV.',
  1,
  'Admin'
);

-- Post 2: Architecture Deep Dive
INSERT INTO blog_posts (title, slug, content, excerpt, status, published_at, meta_title, meta_description, category_id, author_name) VALUES (
  'Architecture: How Astro and Hono Work Together',
  'architecture-astro-hono',
  '## The Dual-Framework Approach

This starter uses a pattern where two frameworks share the same deployment:

- **Astro** handles all public-facing pages (homepage, blog listing, individual posts, search, RSS, sitemap)
- **Hono** handles the admin panel, authentication, and API endpoints

They connect through a single catch-all route at `src/pages/api/[...route].ts`.

### How the routing works

```
Request comes in
├── /                  → Astro SSR (index.astro)
├── /blog              → Astro SSR (blog/index.astro)
├── /blog/:slug        → Astro SSR (blog/[slug].astro)
├── /search            → Astro SSR (search.astro)
├── /rss.xml           → Astro endpoint
├── /sitemap.xml       → Astro endpoint
└── /api/*             → Hono sub-app
    ├── /api/auth/*    → Login, logout, verify
    ├── /api/admin/*   → Dashboard, posts, media, analytics
    └── /api/health    → Health check
```

### Shared resources

Both frameworks access the same Cloudflare bindings:

| Binding | Type | Used by |
|---------|------|---------|
| `DB` | D1 | Astro (read posts) + Hono (CRUD) |
| `MEDIA_BUCKET` | R2 | Hono (upload/serve media) |
| `SESSION` | KV | Astro sessions + Hono auth |

### Why not just use one framework?

Astro excels at rendering content pages with minimal JS overhead. Hono excels at building APIs and server-rendered admin UIs with HTMX. Using both lets each framework do what it does best.

The admin panel uses **HTMX** for interactivity — form submissions, partial page updates, inline editing — without shipping a frontend framework to the browser.

### Database layer

**Drizzle ORM** provides type-safe queries against D1 (SQLite). The schema lives in `src/db/schema.ts` with 7 tables:

- `blog_posts` — the main content table
- `blog_categories` — hierarchical categories
- `blog_tags` + `blog_post_tags` — many-to-many tagging
- `analytics_sessions` + `analytics_events` — privacy-friendly analytics
- `login_attempts` — rate limiting for auth

Migrations are managed with `drizzle-kit` and applied via `wrangler d1 migrations apply`.',
  'A deep dive into how Astro and Hono coexist in a single Cloudflare Workers deployment, sharing D1, R2, and KV bindings.',
  'published',
  '2026-02-09T14:00:00.000Z',
  'Architecture: How Astro and Hono Work Together on Workers',
  'Understand the dual-framework architecture of CF Astro Blog Starter — Astro for public pages, Hono for admin and API.',
  2,
  'Admin'
);

-- Post 3: Building on Cloudflare
INSERT INTO blog_posts (title, slug, content, excerpt, status, published_at, meta_title, meta_description, category_id, author_name) VALUES (
  'Why Cloudflare Workers for Your Blog',
  'why-cloudflare-workers',
  '## The Case for Edge-First Blogging

Traditional blog platforms run on a central server. Every request travels to that server, gets processed, and travels back. With Cloudflare Workers, your blog runs in **300+ data centers worldwide** — the code executes in the data center closest to your reader.

### What Cloudflare gives you

**Workers** — Your application code runs at the edge. No cold starts, no container spin-up, no regional failover to worry about. Sub-millisecond startup times.

**D1** — SQLite at the edge. Your blog posts, categories, and analytics data live in a globally distributed database. Reads are fast because the data is close to your users.

**R2** — Object storage with zero egress fees. Upload images and files from the admin panel, serve them directly. No surprise bandwidth bills.

**KV** — Key-value storage for sessions and caching. Fast reads from the nearest edge location.

### Performance in practice

A typical page load on this blog:

1. Request hits the nearest Cloudflare data center (~1-10ms latency)
2. Worker executes, queries D1 for the post content (~5-15ms)
3. Astro renders the HTML (~2-5ms)
4. Response is sent back (~1-10ms)

**Total: 10-40ms** for a fully server-rendered page. No static site generation needed, no build step for content changes, no cache invalidation complexity.

### Cost

For most blogs, the free tier covers everything:

| Service | Free Tier |
|---------|-----------|
| Workers | 100,000 requests/day |
| D1 | 5M rows read, 100K writes/day |
| R2 | 10 GB storage, 10M reads/month |
| KV | 100K reads/day |

You could run a blog with thousands of daily readers without paying a cent.

### Getting started

The Deploy to Cloudflare button in the [repository](https://github.com/h1n054ur/cf-astro-blog-starter) provisions all the resources automatically. One click and you have a fully functional blog with admin panel, analytics, and media management.',
  'Why edge computing with Cloudflare Workers, D1, R2, and KV is an ideal foundation for a modern blog.',
  'published',
  '2026-02-10T08:00:00.000Z',
  'Why Cloudflare Workers for Your Blog',
  'Explore the benefits of running your blog on Cloudflare Workers with D1, R2, and KV — global edge deployment, zero cold starts, and a generous free tier.',
  3,
  'Admin'
);

-- Post-Tag associations
-- Post 1 (getting-started, id=1): Astro, Hono, Cloudflare Workers, D1, TypeScript
INSERT INTO blog_post_tags (post_id, tag_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 6);

-- Post 2 (architecture, id=2): Astro, Hono, SSR, HTMX, Drizzle ORM
INSERT INTO blog_post_tags (post_id, tag_id) VALUES (2, 1), (2, 2), (2, 7), (2, 8), (2, 5);

-- Post 3 (why-cloudflare, id=3): Cloudflare Workers, D1, SSR
INSERT INTO blog_post_tags (post_id, tag_id) VALUES (3, 3), (3, 4), (3, 7);
