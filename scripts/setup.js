import * as dotenv from "dotenv";
import Exa, { EventType } from "exa-js";

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

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

  // Create a Webset with search and enrichments
  const webset = await exa.websets.create({
    search: {
      query: "Top AI research labs focusing on large language models",
      count: 10
    },
    enrichments: [
      {
        description: "Estimate the company's founding year",
        format: "number"
      }
    ],
  });

  console.log(`Webset created with ID: ${webset.id}`);
}

main();