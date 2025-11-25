# Deployment Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas or self-hosted cluster
- Playwright dependencies (Chromium) installed on MCP host
- n8n instance with Notion + Mailjet credentials
- Shared `.env` values distributed across services

## Services
1. **MCP Server**
   - `cd mcp-server && npm install`
   - `npm run start`
   - Behind firewall, accessible only to backend.
2. **Backend API**
   - `cd backend && npm install`
   - `npm start`
   - Ensure `MCP_SERVER_URL` and Mongo URI reachable.
3. **Frontend**
   - `cd frontend && npm install`
   - `npm run build && npm run start`
   - Configure `NEXT_PUBLIC_BACKEND_URL` for client calls.
4. **Scrapers**
   - Bundled with MCP server.

## Environment Variables
Copy `.env.example` into each service root. Core keys:
- `MONGO_URI`
- `MCP_SERVER_URL`
- `BACKEND_URL`
- `NEXT_PUBLIC_BACKEND_URL`
- `SCRAPER_AUTH_TOKEN`
- `NOTION_API_KEY`, `NOTION_DATABASE_ID`
- `N8N_WEBHOOK_URL`

## n8n
1. Import JSON files from `workflows/`.
2. Provide credentials for Webhook, Notion, Mailjet.
3. Configure webhook URL referenced by backend if required.

## Monitoring
- Use `/health` endpoint for uptime checks.
- Tail pino logs for backend/MCP.
- Enable Playwright tracing when debugging scrapers.
