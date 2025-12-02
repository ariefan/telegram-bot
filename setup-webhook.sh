#!/bin/bash

# Telegram Webhook Setup Script
# Use this to set up webhook for your Telegram bot

BOT_TOKEN="8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc"
WEBHOOK_URL="https://telegram.technosmart.id/webhook/telegram"

echo "🪝 Setting up Telegram webhook..."
echo "Bot Token: ${BOT_TOKEN:0:10}..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Set webhook
echo "📡 Setting webhook..."
curl -X POST \
  "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$WEBHOOK_URL\",
    \"drop_pending_updates\": true
  }"

echo ""
echo ""

# Check webhook status
echo "🔍 Checking webhook status..."
curl "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo"

echo ""
echo ""

# Test webhook endpoint
echo "🧪 Testing webhook endpoint..."
curl -X POST \
  "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": true}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Webhook setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test your bot by sending a message to it"
echo "2. Check logs: ssh -i C:/Users/arief/.ssh/dev.pem ubuntu@18.140.254.61 'sudo docker logs telegram'"
echo "3. If issues occur, delete webhook: curl https://api.telegram.org/bot$BOT_TOKEN/deleteWebhook"