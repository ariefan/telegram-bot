# 🪝 Telegram Webhook Setup Guide

## 📋 Current Bot Configuration

Your bot is currently using **polling** mode (`bot.launch()`), which continuously asks Telegram for updates. For production, **webhook** mode is recommended.

## 🔧 Webhook vs Polling

| Feature          | Polling (Current)          | Webhook (Recommended) |
| ---------------- | -------------------------- | --------------------- |
| Resource Usage   | High (continuous requests) | Low (event-driven)    |
| Scalability      | Limited                    | Better                |
| Response Time    | Slower (polling interval)  | Instant               |
| Production Ready | ❌                         | ✅                    |

## 🚀 Setting Up Webhook

### Step 1: Update Telegram Service

Modify [`src/services/telegram.service.ts`](src/services/telegram.service.ts) to use webhook:

```typescript
// Replace the launch() method with this:
async launch() {
    const webhookUrl = config.telegram.webhookUrl;

    if (config.server.nodeEnv === 'production') {
        // Set webhook for production
        await this.bot.launch({
            webhook: {
                domain: webhookUrl,
                hookPath: '/webhook/telegram',
            }
        });
        console.log(`🪝 Telegram bot started with webhook: ${webhookUrl}`);
    } else {
        // Use polling for development
        await this.bot.launch();
        console.log('🔄 Telegram bot started with polling (development mode)');
    }
}
```

### Step 2: Add Webhook Route

Create webhook route in [`src/api/routes/telegram.routes.ts`](src/api/routes/telegram.routes.ts):

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { TelegramService } from '../services/telegram.service.js';

export async function telegramRoutes(fastify: any, options: any) {
  fastify.post('/webhook/telegram', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // This will be handled by Telegraf webhook middleware
      reply.code(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      reply.code(500).send('Error');
    }
  });
}
```

### Step 3: Update Server Configuration

In [`src/api/server.ts`](src/api/server.ts), add the telegram route:

```typescript
import { telegramRoutes } from './routes/telegram.routes.js';

// Add this after other route registrations:
await fastify.register(telegramRoutes, { prefix: '/webhook' });
```

### Step 4: Update Configuration

In [`src/config/index.ts`](src/config/index.ts), ensure webhook URL is configured:

```typescript
telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL!,
}
```

## 🛠️ Quick Webhook Setup (Alternative)

For immediate testing, you can set webhook manually:

### Method 1: Using curl

```bash
# Set webhook
curl -X POST \
  https://api.telegram.org/bot8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://telegram.technosmart.id/webhook/telegram",
    "drop_pending_updates": true
  }'

# Check webhook status
curl https://api.telegram.org/bot8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc/getWebhookInfo
```

### Method 2: Using Telegram Bot API

```bash
# Get current webhook info
curl https://api.telegram.org/bot8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc/getWebhookInfo

# Delete webhook (to revert to polling)
curl https://api.telegram.org/bot8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc/deleteWebhook
```

## 🔍 Testing Webhook

### 1. Verify Webhook Endpoint

```bash
# Test if webhook endpoint responds
curl -X POST https://telegram.technosmart.id/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{"update_id":12345,"message":{"message_id":1,"from":{"id":123456,"first_name":"Test"},"chat":{"id":123456,"first_name":"Test"},"date":1234567890,"text":"test"}}'
```

### 2. Check Webhook Info

```bash
curl https://api.telegram.org/bot8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc/getWebhookInfo
```

## 📋 Environment Variables

Ensure these are in your `.env` file:

```env
TELEGRAM_BOT_TOKEN=8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc
TELEGRAM_WEBHOOK_URL=https://telegram.technosmart.id
```

## 🚨 Important Notes

### SSL Certificate

- Telegram requires HTTPS for webhooks
- Your domain `telegram.technosmart.id` needs valid SSL certificate
- Currently getting SSL errors - may need to configure proper certificate

### Webhook Path

- Full webhook URL: `https://telegram.technosmart.id/webhook/telegram`
- Make sure this path is accessible and returns 200 OK

### Security

- Consider adding secret token for webhook verification
- Validate incoming requests are from Telegram

## 🔄 Switching Back to Polling

If webhook causes issues, you can revert:

```bash
# Delete webhook to revert to polling
curl https://api.telegram.org/bot8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc/deleteWebhook
```

## 📊 Recommended Approach

1. **For now**: Keep using polling (current setup works)
2. **Later**: Implement webhook when SSL is properly configured
3. **Testing**: Use manual webhook setup for testing

## 🎯 Next Steps

1. **Fix SSL certificate** for `telegram.technosmart.id`
2. **Test webhook endpoint** accessibility
3. **Implement webhook code** changes
4. **Deploy and test** webhook functionality
5. **Monitor performance** improvements

Your bot will work fine with polling for now, but webhook is recommended for production!
