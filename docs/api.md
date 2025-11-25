# API Documentation

## Authentication

All internal services exchange a shared header:

```
X-Scraper-Auth: <SCRAPER_AUTH_TOKEN>
```

## Backend Routes

### POST /compare
Body:
```
{
  "item": "Chicken Biryani",
  "location": "Bengaluru"
}
```
Response mirrors `ComparisonResponse` interface (item, location, results[], bestPlatform, breakdown).

### POST /fetch/:platform
Proxy call to MCP server for the given platform (zomato, swiggy, blinkit, zepto).

### GET /history/list
Returns last 25 persisted comparisons.

### POST /history/save
Internal hook used by workflows to push custom entries.

### GET /health
Returns status heartbeat.

## MCP Server Tools

### POST /compare
Launches Playwright scrapers in parallel per platform.

### POST /recommend
Given `{ results: PlatformResult[] }`, returns `{ bestPlatform }`.

### POST /fetch/:platform
Runs platform-specific scraper.

### POST /history/save and /history/list
Maintains lightweight in-memory history for auxiliary workflows (primary storage handled by backend Mongo models).
