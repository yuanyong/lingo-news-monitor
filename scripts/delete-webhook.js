import * as dotenv from "dotenv";
import Exa from "exa-js";

dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

async function deleteWebhook() {
  const exa = new Exa(process.env.EXA_API_KEY);

  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("WEBHOOK_URL is not set. No webhook to delete.");
    return;
  }

  // Find and delete webhook matching the URL
  console.log('--- Looking for webhook to delete ---');
  const webhooks = await exa.websets.webhooks.list();
  const webhook = webhooks.data.find(w => w.url === webhookUrl);
  
  if (webhook) {
    await exa.websets.webhooks.delete(webhook.id);
    console.log(`✅ Deleted webhook with ID: ${webhook.id}`);
    console.log(`Webhook URL was: ${webhookUrl}`);
  } else {
    console.log(`No webhook found with URL: ${webhookUrl}`);
  }
}

deleteWebhook();