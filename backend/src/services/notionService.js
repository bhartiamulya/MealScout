const axios = require('axios');
const env = require('../config/env');

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE_URL = 'https://api.notion.com/v1/pages';

const notionEnabled = Boolean(env.notionApiKey && env.notionDatabaseId);

function textContent(input, fallback = '') {
  const value = (input ?? fallback).toString();
  return value.length ? value.slice(0, 2000) : fallback;
}

function toRichText(content) {
  return [
    {
      type: 'text',
      text: {
        content: textContent(content, '-')
      }
    }
  ];
}

async function syncHistory(payload) {
  if (!notionEnabled) {
    return;
  }

  const primaryItem = payload.items?.[0] || payload.item || 'Comparison';
  const locationLabel =
    payload.locationDetails?.displayName ||
    payload.locationDetails?.raw ||
    payload.location ||
    'Unknown location';
  const bestPlatformName = payload.bestPlatform?.platform || 'Unknown';
  const bestTotal = Number(payload.bestPlatform?.total || 0);

  const properties = {
    Name: { title: toRichText(primaryItem) },
    Location: { rich_text: toRichText(locationLabel) },
    'Best Platform': { rich_text: toRichText(bestPlatformName) },
    Total: { number: bestTotal }
  };

  try {
    await axios.post(
      NOTION_BASE_URL,
      {
        parent: { database_id: env.notionDatabaseId },
        properties
      },
      {
        headers: {
          Authorization: `Bearer ${env.notionApiKey}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    console.error(`[notion] failed to sync history: ${message}`);
  }
}

module.exports = {
  syncHistory
};
