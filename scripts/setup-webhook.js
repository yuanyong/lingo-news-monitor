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

  if (!webhook) {
    // Create a new webhook
    webhook = await exa.websets.webhooks.create({
      url: webhookUrl,
      events: [
        EventType.webset_created,
        EventType.webset_item_enriched,
      ],
    });

    console.log(`✅ Webhook created with ID: ${webhook.id}`);
    console.log(`Webhook URL: ${webhookUrl}`);
    console.log(`\nIMPORTANT: Save this webhook secret to your WEBHOOK_SECRET environment variable:`);
    console.log(`WEBHOOK_SECRET=${webhook.secret}`);
  } else {
    console.log(`✅ Webhook already exists with ID: ${webhook.id}`);
    console.log(`Webhook URL: ${webhookUrl}`);
  }
}

main();