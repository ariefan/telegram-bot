import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { userRoutes } from './routes/users.routes.js';
import { conversationRoutes } from './routes/conversations.routes.js';
import { messageRoutes } from './routes/messages.routes.js';
import { reminderRoutes } from './routes/reminders.routes.js';
import { debtRoutes } from './routes/debts.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { telegramRoutes } from './routes/telegram.routes.js';
import { config } from '../config/index.js';
import { TelegramService } from '../services/telegram.service.js';
import { ReminderService } from '../services/reminder.service.js';

export async function createServer(telegramService?: TelegramService, reminderService?: ReminderService) {
  const fastify = Fastify({
    logger: {
      level: config.server.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Register CORS for dashboard
  await fastify.register(cors, {
    origin: process.env.DASHBOARD_URL || 'http://localhost:3001',
    credentials: true,
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
        { name: 'messages', description: 'Message endpoints' },
        { name: 'reminders', description: 'Reminder endpoints' },
        { name: 'debts', description: 'Debt management endpoints' },
        { name: 'admin', description: 'Admin endpoints' },
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
  await fastify.register(messageRoutes, { prefix: '/api' });
  await fastify.register(reminderRoutes, { prefix: '/api' });
  await fastify.register(debtRoutes, { prefix: '/api' });

  // Register admin routes if reminder service is provided
  if (reminderService) {
    await fastify.register(adminRoutes, { prefix: '/api', reminderService });
  }

  // Register telegram routes only if service is provided
  if (telegramService) {
    await fastify.register(telegramRoutes, { prefix: '', telegramService });
  }

  return fastify;
}
