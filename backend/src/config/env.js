const required = [
  'MONGO_URI',
  'MCP_SERVER_URL',
  'SCRAPER_AUTH_TOKEN'
];

function loadEnv() {
  required.forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Missing env ${name}`);
    }
  });

  return {
    port: Number(process.env.BACKEND_PORT) || 5050,
    mongoUri: process.env.MONGO_URI,
    mcpServerUrl: process.env.MCP_SERVER_URL,
    scraperAuthToken: process.env.SCRAPER_AUTH_TOKEN,
    cacheTtlMinutes: Number(process.env.CACHE_TTL_MINUTES || 15),
    notionApiKey: process.env.NOTION_API_KEY || '',
    notionDatabaseId: process.env.NOTION_DATABASE_ID || '',
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || ''
  };
}

module.exports = loadEnv();
