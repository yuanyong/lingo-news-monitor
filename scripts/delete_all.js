import * as dotenv from "dotenv";
import Exa from "exa-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

async function deleteAll() {
  const exa = new Exa(process.env.EXA_API_KEY);

  // Delete all webhooks
  const webhooks = await exa.websets.webhooks.list();
  for (const webhook of webhooks.data) {
    await exa.websets.webhooks.delete(webhook.id);
    console.log(`Deleted webhook with ID: ${webhook.id}`);
  }

  // Delete all monitors
  const monitors = await exa.websets.monitors.list();
  for (const monitor of monitors.data) {
    await exa.websets.monitors.delete(monitor.id);
    console.log(`Deleted monitor with ID: ${monitor.id}`);
  }

  // Delete all websets
  const websets = await exa.websets.list();
  for (const webset of websets.data) {
    await exa.websets.delete(webset.id);
    console.log(`Deleted webset with ID: ${webset.id}`);
  }

  console.log("All webhooks, monitors, and websets have been deleted from Exa API.");

  // Delete all webset items from database
  console.log("\n--- Deleting webset items from database ---");
  const deletedItems = await prisma.websetItem.deleteMany({});
  console.log(`Deleted ${deletedItems.count} webset items from database`);

  // Delete all websets from database
  console.log("\n--- Deleting websets from database ---");
  const deletedWebsets = await prisma.webset.deleteMany({});
  console.log(`Deleted ${deletedWebsets.count} websets from database`);

  await prisma.$disconnect();
  console.log("\nAll data deleted from both Exa API and database.");
}

deleteAll();
