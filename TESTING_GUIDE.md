# Testing Guide for Deployed Telegram Bot

## ⚠️ IMPORTANT: Current Status

**ISSUE IDENTIFIED**: The deployment is failing due to missing environment variables.

- Container is continuously restarting
- Error: `Missing required environment variable: DATABASE_URL`
- See [`DEPLOYMENT_TROUBLESHOOTING.md`](DEPLOYMENT_TROUBLESHOOTING.md) for fix

## Deployment Information

- **Server IP**: 18.140.254.61
- **External Port**: 6969
- **Domain**: telegram.technosmart.id
- **Internal Port**: 3000
- **Status**: ❌ FAILED (Environment variables missing)

## 1. HTTP API Testing

### Health Check

Test if the server is responding:

```bash
# Via IP
curl http://18.140.254.61:6969/api/health

# Via Domain
curl https://telegram.technosmart.id/api/health
```

### API Documentation

Access Swagger UI:

- **URL**: http://18.140.254.61:6969/docs
- **URL**: https://telegram.technosmart.id/docs

### Available Endpoints

Based on your routes, you can test:

- `/api/health` - Health check
- `/api/users` - User management
- `/api/conversations` - Conversation management
- `/api/debts` - Debt management

## 2. Telegram Bot Testing

### Prerequisites

1. You need the Telegram Bot Token configured in your environment
2. The bot should be running and connected to Telegram's servers

### Testing Steps

1. **Find Your Bot**
   - Search for your bot in Telegram using its username
   - The bot should respond to `/start` command

2. **Basic Commands Test**

   ```
   /start                    # Initialize bot and create user
   /verify 1234567890       # Verify BPJS number (replace with actual number)
   ```

3. **Conversation Test**
   - After verification, send messages like:
     - "Berapa tagihan BPJS saya?"
     - "Kapan jatuh tempo pembayaran?"
     - "Bagaimana cara membayar BPJS?"

## 3. Database Connectivity Testing

### Check if Database is Connected

The health endpoint should indicate database status. If you have logs access, look for:

- Database connection messages
- Any migration or schema errors

## 4. Log Checking

### Access Server Logs

SSH into your server to check application logs:

```bash
# SSH to server
ssh -i C:/Users/arief/.ssh/dev.pem ubuntu@18.140.254.61

# Check Docker logs
docker logs telegram

# Check real-time logs
docker logs -f telegram
```

### Look For:

- Server startup messages
- Telegram bot connection status
- Database connection status
- Any error messages

## 5. Troubleshooting Common Issues

### If Bot Doesn't Respond:

1. Check if TELEGRAM_BOT_TOKEN is correctly set
2. Verify bot has proper permissions
3. Check Docker logs for any Telegram API errors

### If API Endpoints Don't Work:

1. Check if port 6969 is accessible
2. Verify Traefik configuration
3. Check Docker container is running

### If Database Issues:

1. Verify DATABASE_URL is correct
2. Check if database is accessible from the container
3. Look for connection errors in logs

## 6. Advanced Testing

### Test LLM Integration

Send complex queries to test the OpenRouter integration:

- "Saya punya tagihan BPJS sebesar Rp 500.000, kapan harus dibayar?"
- "Apa saja metode pembayaran BPJS yang tersedia?"

### Test User Data Persistence

1. Start a conversation with `/start`
2. Verify BPJS number with `/verify`
3. Send a message
4. Check if conversation history is maintained

## 7. Performance Testing

### Load Testing API

```bash
# Simple load test
for i in {1..10}; do
  curl -w "\n" http://18.140.254.61:6969/api/health
done
```

### Monitor Resources

```bash
# Check container resource usage
docker stats telegram

# Check system resources
free -h
df -h
```

## 8. Security Testing

### Check HTTPS

```bash
# Verify SSL certificate
curl -I https://telegram.technosmart.id/api/health
```

### Test Rate Limiting

Send multiple rapid requests to test if rate limiting works

## Quick Test Checklist

- [ ] Server responds to health check
- [ ] Swagger UI is accessible
- [ ] Telegram bot responds to `/start`
- [ ] Bot responds to `/verify` command
- [ ] Bot handles text messages
- [ ] No errors in Docker logs
- [ ] Database connections are successful
- [ ] LLM integration works
- [ ] HTTPS is properly configured

## Emergency Commands

If something goes wrong:

```bash
# Restart the container
docker restart telegram

# Check container status
docker ps -a

# View full logs
docker logs --tail 100 telegram

# Access container shell
docker exec -it telegram /bin/bash
```

## Next Steps After Testing

1. If all tests pass, your deployment is successful
2. Monitor the logs for the first few hours
3. Set up proper monitoring and alerting
4. Consider setting up automated health checks
