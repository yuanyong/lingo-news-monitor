import * as dotenv from "dotenv";
import Exa, { EventType } from "exa-js";

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

// Define websets to create
const websets = [
  {
    name: "Startup Funding",
    query: "Startups that raised a funding round in the last week",
    criteria: [
      {
        description: "Article is about a startup raising a funding round of at leas $1M",
      },
      {
        description: "Article published in a top 20 tech publication (TechCrunch, The Verge, Wired, etc.)",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Futurism",
    query: "Articles about the future of technology, cutting edge research, and long term tech predictions from the last week",
    criteria: [
      {
        description: "Content discusses trends, predictions, or innovations expected to have significant impact in the future (5+ years)",
      },
      {
        description: "Content is about far out tech and novel research, not day to day tech news or product updates",
      },
      {
        description: "Article published in a leading technology, science, or futurism publication (e.g., Wired, MIT Technology Review, Futurism, Singularity Hub, New Scientist)"
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Memes",
    query: "Articles about viral internet trends on social medial platforms from the last week",
    criteria: [
      {
        description: "Content discusses viral trends, memes, or cultural phenomena that originated on social media platforms",
      },
      {
        description: "Content published by a high-traffic digital culture or social media analysis site (e.g., Know Your Meme, Mashable, BuzzFeed, The Verge, Reddit trend reports)"
      },
      {
        description: "The article is about a specific meme, trend, or cultural phenomenon and not a list or generic overview",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Hot Takes",
    query: "Opinionated articles, controversial opinions, hot takes, bold predictions, or contrarian viewpoints from the last week",
    criteria: [
      {
        description: "Content expresses a strong or controversial opinion, prediction, or viewpoint (hot take) on any topic (sports, tech, politics, etc.)"
      },
      {
        description: "Article published in an opinion or commentary section of a reputable media outlet or a well-known tech or news columnist (e.g., New York Times Opinion, The Atlantic, Stratechery, The Verge, TechCrunch, The Guardian)"
      },
      {
        description: "Article was published in the last week"
      }
    ]
  },
  {
    name: "Product Launches",
    query: "Major product launches or announcements from widely recognized companies in hardware or software fron the last week",
    criteria: [
      {
        description: "Content is about a new product release or major product update from a company that is widely recognized (hardware or software)"
      },
      {
        description: "Article published by a top mainstream tech news publication or official company blog of a widely recognized brand (e.g., Apple Newsroom, Google Blog, The Verge, Engadget, TechCrunch, CNET, Wired)"
      },
      {
        description: "Article was published in the last week"
      }
    ]
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
      EventType.webset_item_enriched,
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

  // Delete websets (and their monitors) that match names in websets
  const configNames = websets.map(ws => ws.name);
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
  for (const { name, query, criteria } of websets) {
    const webset = await exa.websets.create({
      search: {
        query,
        criteria,
        entity: { type: "article" },
        behavior: "append",
        count: 25
      },
      enrichments: [
        {
          description: "One sentence summary of the article using content not in the title",
          format: "text",
        }
      ],
      metadata: { name }
    });
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