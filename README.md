# BPJS Kesehatan Debt Collector Chatbot

A Telegram chatbot for BPJS Kesehatan debt collection using Fastify, Drizzle ORM, PostgreSQL, and OpenRouter LLM with RAG capabilities.

## Features

- 🤖 **Telegram Bot Integration** - Interactive chatbot for debt collection
- 🧠 **LLM with RAG** - OpenRouter-powered responses with user context
- 📊 **REST API** - Fastify-based API with Swagger documentation
- 💾 **PostgreSQL Database** - Drizzle ORM for type-safe database operations
- 🔍 **User Verification** - BPJS number validation
- 💰 **Debt Management** - Track and manage user debts

## Project Structure

```
telegram-bot/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── users.routes.ts
│   │   │   ├── conversations.routes.ts
│   │   │   ├── debts.routes.ts
│   │   │   └── health.routes.ts
│   │   └── server.ts
│   ├── config/
│   │   └── index.ts
│   ├── db/
│   │   ├── schema/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── llm.service.ts
│   │   └── telegram.service.ts
│   └── index.ts
├── .env.example
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenRouter API Key

## Setup

1. **Clone and install dependencies:**
   ```bash
   cd c:\dev\telegram-bot
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - `DATABASE_URL` - PostgreSQL connection string
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `OPENROUTER_API_KEY` - Your OpenRouter API key

3. **Set up the database:**
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

## Usage

### API Documentation

Once the server is running, access the Swagger UI at:
```
http://localhost:3000/docs
```

### Telegram Bot Commands

- `/start` - Initialize the bot and create user account
- `/verify [BPJS_NUMBER]` - Verify your BPJS number
- Send any message to chat with the bot about your debts

### API Endpoints

#### Health
- `GET /api/health` - Health check

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/telegram/:telegramId` - Get user by Telegram ID

#### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:id` - Get conversation with messages
- `GET /api/users/:userId/conversations` - Get user's conversations

#### Debts
- `GET /api/debts` - Get all debts
- `GET /api/users/:userId/debts` - Get user's debts
- `POST /api/debts` - Create new debt
- `PATCH /api/debts/:id` - Update debt status

## Development

### Database Management

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (development)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

### Build for Production

```bash
# Build TypeScript
pnpm build

# Start production server
pnpm start
```

## Architecture

### Database Schema

- **users** - Telegram users with BPJS verification
- **conversations** - Chat sessions
- **messages** - Conversation history for RAG
- **debts** - User debt records

### Services

- **LLMService** - OpenRouter integration with RAG context
- **TelegramService** - Bot message handling and conversation management

### API Layer

- Fastify server with Swagger documentation
- RESTful endpoints for all resources
- No authentication (demo purposes)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `HOST` | Server host | No (default: 0.0.0.0) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | Yes |
| `OPENROUTER_MODEL` | LLM model to use | No (default: gpt-4-turbo-preview) |

## License

MIT
