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
- MongoDB 
- Playwright browsers installed with `cd mcp-server && npx playwright install chromium`.
- Optional: Notion integration + database if you want automatic comparison logging into Notion.

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

