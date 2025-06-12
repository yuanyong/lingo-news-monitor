import * as dotenv from "dotenv";
import Exa, { EventType } from "exa-js";

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

// Define websets to create
const websetConfigs = [
  {
    search: {
      query: "AI startups that raised a seed round in the last day",
      criteria: [
        {
          description: "Article is about an AI startup raising a seed round",
        },
        {
          description: "The article was published in the last 24 hours",
        }
      ],
      entity: { type: "article" },
      behavior: "append",
      count: 10
    },
    enrichments: [
      {
        description: "One sentance summary of the article",
        format: "text",
      }
    ],
    metadata: {
      name: "AI Seed Rounds"
    }
  }
];

async function main() {
  const exa = new Exa(process.env.EXA_API_KEY);

  // Check if webhook already exists
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("WEBHOOK_URL is not set in the environment variables.");
  }
  const existingWebhooks = await exa.websets.webhooks.list();
  let webhook = existingWebhooks.data.find(w => w.url === webhookUrl);

  if (webhook) {
    // Delete existing webhook
    await exa.websets.webhooks.delete(webhook.id);
    console.log(`Deleted existing webhook with ID: ${webhook.id}`);
  }

  // Create a new webhook
  webhook = await exa.websets.webhooks.create({
    url: webhookUrl,
    events: [
      EventType.webset_created,
      EventType.webset_deleted,
      EventType.webset_paused,
      EventType.webset_idle,
      EventType.webset_search_created,
      EventType.webset_search_canceled,
      EventType.webset_search_completed,
      EventType.webset_search_updated,
      EventType.webset_item_created,
      EventType.webset_item_enriched,
      EventType.webset_export_created,
      EventType.webset_export_completed
    ],
  });

  console.log(`Webhook created with ID: ${webhook.id}`);
  console.log(`Webhook URL: ${webhookUrl}`);
  console.log(`\nIMPORTANT: Save this webhook secret to your WEBHOOK_SECRET environment variable:`);
  console.log(`WEBHOOK_SECRET=${webhook.secret}`);

  // Fetch existing websets and monitors
  console.log('\n--- Checking existing websets and monitors ---');
  const existingWebsets = await exa.websets.list();
  const monitors = await exa.websets.monitors.list();

  // Delete websets (and their monitors) that match names in websetConfigs
  const configNames = websetConfigs.map(cfg => cfg.metadata?.name);
  for (const webset of existingWebsets.data) {
    if (configNames.includes(webset.metadata?.name)) {
      // Delete monitors for this webset
      for (const monitor of monitors.data.filter(m => m.websetId === webset.id)) {
        await exa.websets.monitors.delete(monitor.id);
        console.log(`Deleted monitor with ID: ${monitor.id} for webset "${webset.metadata?.name}"`);
      }
      // Delete the webset
      await exa.websets.delete(webset.id);
      console.log(`Deleted webset "${webset.metadata?.name}" with ID: ${webset.id}`);
    }
  }

  // Create websets
  console.log('\n--- Creating websets ---');
  const createdWebsets = [];
  for (const config of websetConfigs) {
    const name = config.metadata?.name;
    const webset = await exa.websets.create(config);
    createdWebsets.push(webset);
    console.log(`✓ Created webset "${name}" with ID: ${webset.id}`);
  }

  // Create monitors for each newly created webset
  console.log('\n--- Creating monitors for websets ---');
  for (const webset of createdWebsets) {
    const monitor = await exa.websets.monitors.create({
      websetId: webset.id,
      behavior: { type: "search", config: { count: 10 } },
      cadence: {
        cron: "0 0 * * *", // Every day
        timezone: "UTC"
      }
    })
    console.log(`✓ Created monitor for webset "${webset.metadata?.name}" with ID: ${monitor.id}`);
  }
}

main();