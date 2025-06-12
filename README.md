# Websets News Monitor

A Next.js application that monitors Exa websets using webhooks.

## Setup

### Prerequisites

- Node.js 18+ installed
- An Exa API key from [Exa](https://exa.ai)
- (Optional) A Smee.io channel for local webhook development

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` with your values:
```env
EXA_API_KEY=your-exa-api-key-here
WEBHOOK_URL=https://smee.io/your-channel-id
WEBHOOK_SECRET=will-be-generated-by-setup
```

### Running Locally with Smee.io

1. **Set up Smee.io webhook forwarding** (Terminal 1):
```bash
npx smee -u https://smee.io/your-channel-id -t http://localhost:3000/api/webhook
```

2. **Run the setup script** (Terminal 2):
```bash
npm run setup
```
This will:
- Create a webhook that listens for all webset events
- Display a webhook secret that you need to save
- Create a sample webset

3. **Update your `.env.local` with the webhook secret**:
```env
WEBHOOK_SECRET=<secret-displayed-by-setup>
```

4. **Start the Next.js development server** (Terminal 3):
```bash
npm run dev
```

Now your app will receive webhook events from Exa as websets are processed.

### Running in Production

For production, set `WEBHOOK_URL` to your actual webhook endpoint:
```env
WEBHOOK_URL=https://your-domain.com/api/webhook
```

## Webhook Events

The application logs all webhook events, including:
- `webset.created` - When a webset is created
- `webset.idle` - When a webset finishes processing
- `webset.search.completed` - When search completes
- `webset.item.created` - When an item is found
- `webset.item.enriched` - When an item is enriched
- And more...

## Scripts

- `npm run dev` - Start development server
- `npm run setup` - Create webhook and sample webset
- `npm run build` - Build for production
- `npm run start` - Start production server