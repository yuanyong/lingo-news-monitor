import * as dotenv from "dotenv";
import Exa from "exa-js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

async function deleteWebsets() {
  const exa = new Exa(process.env.EXA_API_KEY);

  // Delete all monitors
  console.log('--- Deleting monitors ---');
  const monitors = await exa.websets.monitors.list();
  for (const monitor of monitors.data) {
    await exa.websets.monitors.delete(monitor.id);
    console.log(`Deleted monitor with ID: ${monitor.id}`);
  }

  // Delete all websets
  console.log('\n--- Deleting websets ---');
  const websets = await exa.websets.list();
  for (const webset of websets.data) {
    await exa.websets.delete(webset.id);
    console.log(`Deleted webset "${webset.metadata?.name || 'unnamed'}" with ID: ${webset.id}`);
  }

  console.log("\n✅ All monitors and websets have been deleted from Exa API.");

  // Delete all webset items from database
  console.log("\n--- Deleting webset items from database ---");
  const deletedItems = await prisma.websetItem.deleteMany({});
  console.log(`Deleted ${deletedItems.count} webset items from database`);

  // Delete all websets from database
  console.log("\n--- Deleting websets from database ---");
  const deletedWebsets = await prisma.webset.deleteMany({});
  console.log(`Deleted ${deletedWebsets.count} websets from database`);

  await prisma.$disconnect();
  console.log("\n✅ All webset data deleted from both Exa API and database.");
}

deleteWebsets();