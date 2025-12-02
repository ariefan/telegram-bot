# Deployment Troubleshooting Guide

## Current Issue Identified

Your Telegram bot deployment is failing because environment variables are not properly configured in Dokploy.

### Root Cause

- Container `telegram` is continuously restarting
- Error: `Missing required environment variable: DATABASE_URL`
- Environment variables are not being passed to the container

### Database Connection Details Found

- **Database Name**: telegram
- **User**: telegram_user
- **Password**: change-this-secure-password-in-production
- **Host**: telegram-postgres (container name)
- **Port**: 5432

## Immediate Fix Required

You need to configure the environment variables in your Dokploy project. Here are the required variables:

### Database Configuration

```
DATABASE_URL=postgresql://telegram_user:change-this-secure-password-in-production@telegram-postgres:5432/telegram
```

### Server Configuration

```
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
```

### Telegram Configuration

```
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=https://telegram.technosmart.id/webhook/telegram
```

### OpenRouter Configuration

```
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4-turbo-preview
```

### BPJS Configuration

```
BPJS_API_URL=https://api.bpjs-kesehatan.go.id
BPJS_API_KEY=your_actual_bpjs_api_key_here
```

## How to Fix in Dokploy

1. **Access Dokploy Dashboard**
   - Navigate to your Dokploy instance
   - Go to Projects → telegram

2. **Configure Environment Variables**
   - Find your application (telegram-dockercompose-inpeon)
   - Go to Environment Variables section
   - Add all the variables listed above

3. **Redeploy the Application**
   - After adding environment variables, trigger a redeployment
   - Monitor the deployment logs

## Alternative: SSH Fix (Temporary)

If you need to quickly test, you can manually set environment variables:

```bash
# SSH into server
ssh -i C:/Users/arief/.ssh/dev.pem ubuntu@18.140.254.61

# Stop the current container
sudo docker stop telegram

# Run with environment variables (temporary)
sudo docker run -d \
  --name telegram-test \
  --network dokploy-network \
  -p 6969:3000 \
  -e DATABASE_URL="postgresql://telegram_user:change-this-secure-password-in-production@telegram-postgres:5432/telegram" \
  -e TELEGRAM_BOT_TOKEN="your_token_here" \
  -e OPENROUTER_API_KEY="your_key_here" \
  -e NODE_ENV="production" \
  -e PORT="3000" \
  -e HOST="0.0.0.0" \
  telegram-dockercompose-inpeon-telegram

# Check logs
sudo docker logs telegram-test -f
```

## Verification Steps After Fix

1. **Check Container Status**

```bash
sudo docker ps
# Look for telegram container with "Up" status
```

2. **Check Application Logs**

```bash
sudo docker logs telegram
# Should see successful startup messages
```

3. **Test HTTP Endpoints**

```bash
curl -k https://telegram.technosmart.id/api/health
```

4. **Test Telegram Bot**

- Find your bot in Telegram
- Send `/start` command
- Verify it responds

## Security Recommendations

1. **Change Default Passwords**
   - Update the PostgreSQL password from the default
   - Use strong, unique passwords for all services

2. **Use Secrets Management**
   - Consider using Docker secrets or environment file encryption
   - Don't commit sensitive data to version control

3. **Network Security**
   - Ensure only necessary ports are exposed
   - Use HTTPS for all external communications

## Monitoring Setup

After fixing the deployment, set up monitoring:

1. **Health Checks**
   - Configure Docker health checks
   - Set up external monitoring

2. **Log Management**
   - Configure log rotation
   - Set up centralized logging

3. **Alerting**
   - Set up alerts for container restarts
   - Monitor resource usage

## Next Steps

1. Fix environment variables in Dokploy
2. Redeploy the application
3. Test all functionality
4. Set up proper monitoring
5. Implement security best practices

## Emergency Contacts

If you need further assistance:

- Check Dokploy documentation
- Review Docker logs for detailed errors
- Consider setting up proper CI/CD pipeline for future deployments
