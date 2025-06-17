import * as dotenv from "dotenv";
import Exa from "exa-js";

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.EXA_API_KEY) {
  throw new Error("EXA_API_KEY is not set in the environment variables.");
}

// Define websets to create
const websets = [
  // Popular mainstream categories first
  {
    name: "World News",
    query: "Major international news, global events, and world affairs from the last week",
    criteria: [
      {
        description: "Article covers significant international events, diplomatic relations, or global developments",
      },
      {
        description: "Published by major news outlets (BBC, Reuters, AP, CNN International, The Guardian)",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Politics",
    query: "Political news, government decisions, and policy changes from the last week",
    criteria: [
      {
        description: "Content covers political developments, elections, legislation, or government policy",
      },
      {
        description: "Published by reputable political news sources or major media outlets",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Finance",
    query: "Financial markets, economic news, and investment updates from the last week",
    criteria: [
      {
        description: "Article covers stock markets, economic indicators, central bank decisions, or major financial events",
      },
      {
        description: "Published by financial news outlets (Bloomberg, Financial Times, WSJ, Reuters Finance)",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Sports",
    query: "Sports news about athletes and teams in major leagues from the last week",
    criteria: [
      {
        description: "Content covers major league sports, athlete news, team updates, or significant sporting events",
      },
      {
        description: "Published by major sports outlets (ESPN, The Athletic, Sports Illustrated) or sports sections of major news sites",
      },
      {
        description: "The news is about an actual storyline and not just a game recap or stats",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "AI",
    query: "Artificial intelligence developments, AI research, and machine learning news from the last week",
    criteria: [
      {
        description: "Content covers AI breakthroughs, new AI tools/models, AI company news, or AI policy developments",
      },
      {
        description: "Published by tech outlets or AI-focused publications",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Science",
    query: "Scientific research publications, clinical trials, and research breakthroughs from the last week",
    criteria: [
      {
        description: "Article reports on peer-reviewed research, clinical trial results, or scientific discoveries",
      },
      {
        description: "Published by scientific journals, university press releases, or science news outlets (Nature, Science, New Scientist)",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Startups",
    query: "Startup news, new ventures, and entrepreneurship stories from the last week",
    criteria: [
      {
        description: "Content covers startup launches, founder stories, startup trends, or entrepreneurship developments",
      },
      {
        description: "Published by startup-focused outlets (TechCrunch, VentureBeat, The Information) or business publications",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "VC Rounds",
    query: "Article about startups raising funding rounds in the last week",
    criteria: [
      {
        description: "Article announces a funding round of at least $1M",
      },
      {
        description: "Published in a popular tech/business publication or an official company announcement",
      },
      {
        description: "Published in the last week",
      }
    ]
  },
  {
    name: "Product Launches",
    query: "Major product launches or announcements from widely recognized companies in hardware or software from the last week",
    criteria: [
      {
        description: "Content is about a new product release or major product update from a company that is widely recognized (hardware or software)",
      },
      {
        description: "Article published by a top mainstream tech news publication or official company blog of a widely recognized brand (e.g., Apple Newsroom, Google Blog, The Verge, Engadget, TechCrunch, CNET, Wired)",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Uplifting",
    query: "Uplifting news stories from the last week",
    criteria: [
      {
        description: "Article focuses on real-world positive impact, achievements, community successes, or heartwarming events",
      },
      {
        description: "Article comes from a popular site and is not a listicle, clickbait, or SEO spam."
      },
      {
        description: "Article was published in the last week",
      }
    ]
  }
];

async function main() {
  const exa = new Exa(process.env.EXA_API_KEY);

  // Fetch existing websets and monitors
  console.log('--- Checking existing websets and monitors ---');
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
        count: 100
      },
      enrichments: [
        {
          description: "One sentence summary of the article using content not in the title",
          format: "text",
        }
      ],
      metadata: { 
        name,
        app: "websets-news-monitor"
      }
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

  console.log('\n✅ Websets setup complete!');
}

main();