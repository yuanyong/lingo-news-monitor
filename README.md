# 📰 Websets News Monitor
### Powered by [Exa.ai](https://exa.ai) - The Search Engine for AI Applications

![Screenshot](https://websets-news-monitor.vercel.app/opengraph-image.jpg)

## 🎯 What is Websets News Monitor

Websets News Monitor is an open-source demo application that monitors the web for articles about specific topics using [Exa's Websets API](https://docs.exa.ai/websets/api/overview). It creates curated news feeds for each webset with webhooks for daily updates and intelligent deduplication.

For more details on how the key functionality works, see the [documentation](https://docs.exa.ai/examples/demo-websets-news-monitor).

## 💻 Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with pgvector extension
- **APIs**: Exa Websets API, OpenAI API
- **Hosting**: Vercel (frontend), Neon (database)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database URL with pgvector (e.g., from Neon)
- Exa API key (required)
- OpenAI API key (required)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/websets-news-monitor.git
cd websets-news-monitor
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` and fill in the environment variables:
```bash
cp .env.example .env.local
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Create websets and webhooks:
```bash
npm run setup:websets
npm run setup:webhook
```

6. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your news monitor!

## 🔧 Webset Configuration

Customize the news monitors by editing `scripts/setup-websets.js`:

```javascript
const websets = [
  {
    name: "Startup Funding",
    query: "Startups that raised a funding round in the last week",
    criteria: [
      {
        description: "Article is about a startup raising a funding round of at least $1M",
      },
      {
        description: "Article published in a top 20 tech publication (TechCrunch, The Verge, Wired, etc.)",
      },
      {
        description: "Article was published in the last week",
      }
    ]
  },
  // Additional websets like "Futurism", "Memes", "Hot Takes", "Product Launches", "Positive"...
];
```

After modifying, run the setup scripts again to apply your changes.

To reset your websets in the Exa API and database:
```bash
npm run delete:websets
```

## 🔍 Deduplication System

The application uses an intelligent deduplication system to prevent showing duplicate or highly similar news stories. The deduplication logic is implemented in `src/lib/dedupe.ts` and works as follows:

1. **Embedding Generation**: When a new article arrives via webhook (`src/app/api/webhook/route.ts`), the article title is converted to an embedding vector using OpenAI's embedding model.

2. **Vector Similarity Search**: Using PostgreSQL's pgvector extension, the system performs a similarity search to find articles from the past 7 days with similar embeddings within the same webset.

3. **Semantic Analysis**: The top 10 similar articles are then analyzed by an LLM (GPT-4.1-mini) to determine if the new article is truly a duplicate, considering:
   - Same event or topic coverage
   - Different wording but same story
   - User experience in a news aggregator

4. **Duplicate Prevention**: If determined to be a duplicate, the article is skipped and not inserted into the database, keeping your news feeds clean and focused.

This two-stage approach (vector similarity + LLM verification) ensures accurate deduplication while maintaining high performance.

## ⭐ About [Exa.ai](https://exa.ai)

This project is powered by [Exa.ai](https://exa.ai), a powerful search engine and web search API designed specifically for AI applications. Exa provides:

* Advanced semantic search capabilities
* Clean web content extraction
* Real-time data retrieval
* Comprehensive web search functionality
* Superior search accuracy for AI applications

[Try Exa search](https://exa.ai/search)

---

<p align="center">
  Built with ❤️ by team Exa
</p>