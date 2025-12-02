import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { userRoutes } from './routes/users.routes.js';
import { conversationRoutes } from './routes/conversations.routes.js';
import { debtRoutes } from './routes/debts.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { telegramRoutes } from './routes/telegram.routes.js';
import { config } from '../config/index.js';
import { TelegramService } from '../services/telegram.service.js';

export async function createServer(telegramService?: TelegramService) {
  const fastify = Fastify({
    logger: {
      level: config.server.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Register Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'BPJS Debt Collector Chatbot API',
        description: 'API for managing BPJS Kesehatan debt collection chatbot',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${config.server.host}:${config.server.port}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health check endpoints' },
        { name: 'users', description: 'User management endpoints' },
        { name: 'conversations', description: 'Conversation management endpoints' },
        { name: 'debts', description: 'Debt management endpoints' },
        { name: 'telegram', description: 'Telegram webhook management endpoints' },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(userRoutes, { prefix: '/api' });
  await fastify.register(conversationRoutes, { prefix: '/api' });
  await fastify.register(debtRoutes, { prefix: '/api' });

  // Register telegram routes only if service is provided
  if (telegramService) {
    await fastify.register(telegramRoutes, { prefix: '', telegramService });
  }

  return fastify;
}
