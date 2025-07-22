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
        description: "Published by a major news outlet",
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
        description: "Article is a ",
      },
      {
        description: "Published by a top 25 financial news outlet",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "AI",
    query: "News from about the major AI companies or major AI breakthroughs from the last week",
    criteria: [
      {
        description: "Content covers AI breakthroughs, new AI tools/models, AI company news, or AI research",
      },
      {
        description: "Published by popular tech or business news outlet",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Science",
    query: "Recent scientific news, research updates, clinical trial announcements, or discoveries",
    criteria: [
      {
        description: "Article discusses new scientific research, trends, discoveries, or major updates in any scientific field",
      },
      {
        description: "Published by a reputable news outlet, science journal, university, or science website",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  {
    name: "Startup Funding",
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
    name: "Uplifting",
    query: "News articles from the last week that are uplifting and positive",
    criteria: [
      {
        description: "Article content would make sense in r/UpliftingNews",
      },
      {
        description: "Article is from a popular publication and not a listicle or SEO spam"
      },
      {
        description: "Article was published in the last week",
      }
    ]
  }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createWithRetry(createFn, itemName, maxRetries = 10, baseDelay = 30000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await createFn();
    } catch (error) {
      if (error.statusCode === 403 && error.message?.includes('maximum number of concurrent requests')) {
        const delay = baseDelay + (attempt - 1) * 30000; // 30s, 60s, 90s, etc up to 10 mins
        console.log(`⚠️  Rate limited creating ${itemName}, retrying in ${delay/1000}s (attempt ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          await sleep(delay);
          continue;
        }
      }
      throw error;
    }
  }
}

async function main() {
  const exa = new Exa(process.env.EXA_API_KEY);

  // Create websets
  console.log('\n--- Creating websets ---');
  const createdWebsets = [];
  for (const { name, query, criteria } of websets) {
    const webset = await createWithRetry(async () => {
      return await exa.websets.create({
        search: {
          query,
          criteria,
          entity: { type: "article" },
          behavior: "append",
          count: 50,
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
    }, `webset "${name}"`);
    
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