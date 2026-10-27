# Pokéva — Deployment & Production Operations Guide

This document outlines the production architecture, hosting prerequisites, routing configuration, caching strategy, and deployment runbook for **Pokéva**.

---

## 1. Overview & Build Artifacts

Pokéva is a client-rendered Single Page Application (SPA) powered by React 19, TypeScript, Vite 6, and TanStack Query v5. Production builds generate completely static assets in the `dist/` directory that can be served by any static hosting provider or HTTP reverse proxy.

### Standard Build Pipeline

```bash
# 1. Install dependencies from lockfile
bun install --frozen-lockfile

# 2. Execute Quality Gates (Lint, Typecheck, Test Suite)
bun run lint
bun run typecheck
bun test

# 3. Production Build
bun run build

# 4. Local Production Verification
bun run preview
```

### Production Artifact Structure

```text
dist/
├── _headers                 # Cloudflare Pages / Netlify security & cache control rules
├── _redirects               # Cloudflare Pages / Netlify SPA rewrite fallback
├── favicon.svg              # Standalone scalable SVG brand icon
├── index.html               # Semantic HTML5 shell with preconnect & meta tags
├── robots.txt               # Web crawler directive
└── assets/
    ├── index-*.css          # Tailwind CSS purged stylesheet (~9.1 kB gzip)
    ├── index-*.js           # App shell entrypoint (~19.9 kB gzip)
    ├── vendor-react-*.js    # React, ReactDOM, Scheduler (~73.8 kB gzip)
    ├── vendor-router-*.js   # React Router v7 (~31.4 kB gzip)
    ├── vendor-query-*.js    # TanStack Query (~12.6 kB gzip)
    ├── HomePage-*.js        # Lazy-loaded Catalogue Listing (~5.8 kB gzip)
    ├── PokemonDetailPage-*.js # Lazy-loaded Detail & Evolution explorer (~8.5 kB gzip)
    ├── FavoritesPage-*.js   # Lazy-loaded Personal Collection (~2.8 kB gzip)
    └── AboutPage-*.js       # Lazy-loaded Architecture & Roadmap (~1.7 kB gzip)
```

---

## 2. SPA Routing & Fallback Requirement

Because Pokéva utilizes HTML5 History API routing via React Router v7 (`/`, `/pokemon/:idOrName`, `/favorites`, `/about`), **all deep links and browser refresh events must rewrite non-file HTTP requests to `/index.html`** with an HTTP 200 status code.

### Provided Configuration Files

- **Cloudflare Pages & Netlify:** `public/_redirects` is copied to `dist/_redirects`:
  ```text
  /*    /index.html   200
  ```
- **Vercel:** `vercel.json` located in the root repository defines route rewrites:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

### Nginx Configuration

When hosting on a self-managed server (e.g., Ubuntu, Debian, Docker Nginx):

```nginx
server {
    listen 80;
    server_name pokeva.example.com;
    root /var/www/pokeva/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    # Long-term caching for hashed static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Strict non-caching for HTML entrypoint
    location = /index.html {
        expires -1;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    # SPA history fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Caddy Server Configuration

```caddy
pokeva.example.com {
    root * /var/www/pokeva/dist
    encode gzip zstd
    try_files {path} /index.html
    file_server

    @assets path /assets/*
    header @assets Cache-Control "public, max-age=31536000, immutable"

    @html path /index.html
    header @html Cache-Control "public, max-age=0, must-revalidate"
}
```

---

## 3. Caching & HTTP Header Strategy

1. **Fingerprinted Assets (`/assets/*.js`, `/assets/*.css`):**
   - Built with deterministic content hashes in their filename.
   - Header: `Cache-Control: public, max-age=31536000, immutable`
   - Safe to cache indefinitely in CDNs and browser caches.
2. **Application Shell (`/index.html`):**
   - Header: `Cache-Control: public, max-age=0, must-revalidate`
   - Forces the browser to check for newly published asset hashes on each navigation or fresh session.
3. **Security Headers (Configured via `_headers` and hosting platform):**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 4. Environment Variables

Pokéva operates entirely client-side. No secrets or private credentials exist.

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_POKEAPI_BASE_URL` | No | `https://pokeapi.co/api/v2` | Overrides the public PokéAPI v2 endpoint (e.g. for self-hosted PokéAPI or staging mirrors). |

---

## 5. Post-Deployment Verification Checklist

After deploying a new release, perform the following smoke tests:

1. **Direct Route Deep Link:**
   - Open `/pokemon/pikachu` directly in a fresh incognito browser tab.
   - Verify the hero showcase, base stats, evolution chain, and abilities render without a 404 error.
2. **Browser Refresh:**
   - On `/favorites`, refresh the browser (F5 / Cmd+R).
   - Ensure the page reloads cleanly without an HTTP 404 from the web server.
3. **Dark / Light Theme Retention:**
   - Toggle theme to Dark, close the tab, and reopen.
   - Verify theme preference remains dark without flicker.
4. **Favorites Storage:**
   - Favorite a Pokémon from the grid or detail page.
   - Navigate to `/favorites` and verify the item is present.
   - Open a second tab to verify cross-tab sync.
5. **Asset Compression:**
   - In browser DevTools Network tab, check `Content-Encoding: gzip` or `br` for `.js` and `.css` files.
