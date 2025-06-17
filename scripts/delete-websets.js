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

  // Get websets from our database
  const dbWebsets = await prisma.webset.findMany();

  if (dbWebsets.length === 0) {
    console.log("No websets found in database. Nothing to delete.");
    return;
  }

  console.log(`Found ${dbWebsets.length} websets in database to delete.`);

  // Delete monitors first (websets with monitors can't be deleted)
  console.log('\n--- Checking and deleting monitors ---');
  const monitors = await exa.websets.monitors.list();
  let deletedMonitorCount = 0;
  for (const monitor of monitors.data) {
    if (dbWebsets.some(w => w.websetId === monitor.websetId)) {
      await exa.websets.monitors.delete(monitor.id);
      console.log(`Deleted monitor with ID: ${monitor.id}`);
      deletedMonitorCount++;
    }
  }
  console.log(`Deleted ${deletedMonitorCount} monitors.`);

  // Delete websets from Exa API using the IDs from our database
  console.log('\n--- Deleting websets from Exa API ---');
  for (const dbWebset of dbWebsets) {
    try {
      await exa.websets.delete(dbWebset.websetId);
      console.log(`Deleted webset "${dbWebset.name}" with ID: ${dbWebset.websetId}`);
    } catch (error) {
      console.error(`Failed to delete webset ${dbWebset.websetId}:`, error.message);
    }
  }

  console.log("\n✅ Websets deleted from Exa API.");

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