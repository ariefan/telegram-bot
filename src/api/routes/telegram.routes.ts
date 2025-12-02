import { FastifyRequest, FastifyReply } from 'fastify';
import { TelegramService } from '../../services/telegram.service.js';
import { config } from '../../config/index.js';

export async function telegramRoutes(fastify: any, options: { telegramService: TelegramService }) {
  // Webhook endpoint for receiving Telegram updates
  fastify.post('/webhook/telegram', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Handle Telegram update
      await options.telegramService.handleUpdate(request.body);
      reply.code(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      reply.code(500).send('Error');
    }
  });

  // Endpoint to set/update webhook configuration
  fastify.post('/api/telegram/set-webhook', {
    schema: {
      description: 'Set Telegram webhook URL',
      tags: ['telegram'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            webhookUrl: { type: 'string' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const webhookUrl = config.telegram.webhookUrl;

      if (!webhookUrl) {
        return reply.code(400).send({
          success: false,
          error: 'TELEGRAM_WEBHOOK_URL is not configured in environment variables',
        });
      }

      await options.telegramService.setWebhook(webhookUrl);

      reply.code(200).send({
        success: true,
        webhookUrl,
        message: 'Webhook set successfully',
      });
    } catch (error) {
      console.error('Set webhook error:', error);
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set webhook',
      });
    }
  });

  // Endpoint to get current webhook info
  fastify.get('/api/telegram/webhook-info', {
    schema: {
      description: 'Get current Telegram webhook information',
      tags: ['telegram'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            webhookInfo: { type: 'object' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const webhookInfo = await options.telegramService.getWebhookInfo();

      reply.code(200).send({
        success: true,
        webhookInfo,
      });
    } catch (error) {
      console.error('Get webhook info error:', error);
      reply.code(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get webhook info',
      });
    }
  });
}
