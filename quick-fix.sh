#!/bin/bash

# Quick Fix Script for Telegram Bot Deployment
# This script will temporarily run the container with required environment variables
# Use this for testing while you fix the environment variables in Dokploy

echo "🔧 Quick Fix Script for Telegram Bot Deployment"
echo "=============================================="

# Configuration
CONTAINER_NAME="telegram-test"
IMAGE_NAME="telegram-dockercompose-inpeon-telegram"
NETWORK="dokploy-network"

# Database connection (from running container)
DB_HOST="telegram-postgres"
DB_PORT="5432"
DB_NAME="telegram"
DB_USER="telegram_user"
DB_PASSWORD="change-this-secure-password-in-production"

# Build DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📋 Configuration:"
echo "  Container: $CONTAINER_NAME"
echo "  Image: $IMAGE_NAME"
echo "  Network: $NETWORK"
echo "  Database URL: ${DATABASE_URL}"
echo ""

# Check if container exists and remove it
if sudo docker ps -a | grep -q $CONTAINER_NAME; then
    echo "🗑️  Removing existing container..."
    sudo docker stop $CONTAINER_NAME 2>/dev/null
    sudo docker rm $CONTAINER_NAME 2>/dev/null
fi

echo "🚀 Starting container with environment variables..."

# Run the container with environment variables
sudo docker run -d \
    --name $CONTAINER_NAME \
    --network $NETWORK \
    -p 6969:3000 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e TELEGRAM_BOT_TOKEN="8202596739:AAGfIP-AHmsJHBBcfiVUlWLhsmXo-sXConc" \
    -e OPENROUTER_API_KEY="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" \
    -e NODE_ENV="production" \
    -e PORT="3000" \
    -e HOST="0.0.0.0" \
    -e TELEGRAM_WEBHOOK_URL="https://telegram.technosmart.id/webhook/telegram" \
    -e OPENROUTER_MODEL="meta-llama/llama-3.1-8b-instruct:free" \
    -e BPJS_API_URL="https://api.bpjs-kesehatan.go.id" \
    -e BPJS_API_KEY="your_actual_bpjs_api_key_here" \
    $IMAGE_NAME

echo "✅ Container started!"
echo ""

# Check container status
echo "📊 Container Status:"
sudo docker ps | grep $CONTAINER_NAME

echo ""
echo "📋 Next Steps:"
echo "1. Replace the placeholder tokens in the script above with your actual tokens"
echo "2. Check logs: sudo docker logs $CONTAINER_NAME -f"
echo "3. Test the application: curl -k https://telegram.technosmart.id/api/health"
echo "4. Test Telegram bot functionality"
echo ""
echo "⚠️  This is a temporary fix. Please configure environment variables in Dokploy for permanent solution."