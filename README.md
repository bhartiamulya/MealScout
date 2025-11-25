# Food Price Comparison Platform

Production-focused toolkit that scrapes Zomato, Swiggy, Blinkit, and Zepto in real time, compares the totals (items + delivery + taxes), recommends the best platform, and keeps a searchable rolling 24-hour history (older entries auto-purge).

## Codebase layout

```
food-price-comparison/
├─ frontend/       # Next.js 14 App Router client
├─ backend/        # Express API + Mongo persistence
├─ mcp-server/     # Secure Playwright tool server
├─ scrapers/       # Platform-specific scraping helpers
├─ .env.example    # Shared configuration template
├─ docs/           # API reference, architecture, deployment
└─ .gitignore
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB reachable at the value you set for `MONGO_URI` (defaults to `mongodb://127.0.0.1:27017/food-price`).
- Playwright browsers installed with `cd mcp-server && npx playwright install chromium`.
- Optional: Notion integration + database if you want automatic comparison logging into Notion.

## Environment configuration

1. Copy `.env.example` to `.env` at the repo root.
2. Fill required keys:
   - `MONGO_URI`
   - `MCP_SERVER_URL`, `BACKEND_URL`, `NEXT_PUBLIC_BACKEND_URL`
   - `SCRAPER_AUTH_TOKEN` (must match backend ↔ MCP)
   - Optional: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `N8N_WEBHOOK_URL`
3. The same `.env` file is read by backend, frontend, and MCP via `dotenv`.

## Local development

```bash
# 1. Install deps (first run only)
cd mcp-server && npm install && npx playwright install chromium
cd ../backend && npm install
cd ../frontend && npm install

# 2. Start services (use separate terminals)
cd mcp-server && npm run dev      # http://127.0.0.1:6060
cd backend && npm run dev         # http://127.0.0.1:5050
cd frontend && npm run dev        # http://127.0.0.1:3000

# (No additional steps required)
```

Frontend expects the backend at `NEXT_PUBLIC_BACKEND_URL`. For local development everything runs on localhost, but each service can be pointed at different hosts as long as the URLs match your `.env`.

### UI theme & assets

- The landing experience uses a Swiggy × Zomato inspired warm palette plus a full-screen looping video.
- Store the raw video at the project root as `background video.mp4` (ignored by git) and copy/encode a serving version to `frontend/public/background-video.mp4`.
- To refresh the asset, replace the files above and restart `npm run dev` for the frontend so Next.js picks up the change.
- Headline, loading, and recommendation components use translucent overlays and shadows for readability over motion backgrounds; adjust via `frontend/components/HomePage.tsx`, `CompareResults.tsx`, and `RecommendationPanel.tsx` if you swap videos.

### Notion sync (optional)

- Set `NOTION_API_KEY` (internal integration secret) and `NOTION_DATABASE_ID` in `.env`.
- Share the target Notion database with the integration so it has write access.
- Every successful comparison triggers a background call to Notion, adding a row with the primary item, resolved location, best platform, and total. Failures are logged to the backend console but do not block the user flow.

Each stored comparison automatically expires after 24 hours, keeping the dataset lightweight while protecting recent insights.

## Testing & monitoring

- Health check: `GET /health` on the backend.
- Compare smoke test:

  ```bash
  $body = @{ item = 'Chicken Biryani'; location = 'Bengaluru' } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5050/compare -Body $body -ContentType 'application/json'
  ```

- Mongo stores queries/results (see `backend/src/models`).
- MCP logs Playwright runs with pino; check console for failures.

### New insights & UI polish

- **Analytics preview** at `/analytics` renders charts and tables when you supply aggregated city/serviceability data. Ship a data aggregation job before relying on it in production.
- **Immersive landing UI** with Swiggy–Zomato themed gradient, video background, and translucent result/recommendation cards.

## Deployment notes

- MCP and backend require the shared auth header (`x-scraper-auth`). Keep MCP on a private network.
- Containerize each service separately; mount the `.env` or inject secrets via your orchestrator.
- Provision MongoDB Atlas with IP allow-listing or run a managed cluster (replica set recommended in production).
- Playwright browsers must be bundled into the MCP container (`npx playwright install --with-deps chromium`).

### Data accuracy & behaviour

- Prices come directly from live scraper runs; platform-side changes (account-specific deals, surge fees, paywall-only offers) may still differ when the user reaches checkout.
- When MCP is unreachable the backend returns a 500 error; frontend shows a retry CTA and no stale data is cached.
- Serviceability logic annotates each platform result with availability by location so unavailable platforms stay visible but disabled.

### Scraper reliability upgrades

- Rotating user-agents + randomized viewports added to every Playwright scraper.
- Shared retry helper reduces transient DOM/GOTO failures.

## Documentation

- `docs/api.md` – endpoints and auth headers
- `docs/architecture.md` – mermaid diagram + data flow
- `docs/deployment.md` – service-by-service instructions

