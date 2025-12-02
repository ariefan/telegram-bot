import { createServer } from './api/server.js';
import { config } from './config/index.js';
import { db } from './db/index.js';
import { TelegramService } from './services/telegram.service.js';
import { LLMService } from './services/llm.service.js';
import { ReminderService } from './services/reminder.service.js';
import { SchedulerService } from './services/scheduler.service.js';

async function main() {
    try {
        // Initialize services FIRST
        const llmService = new LLMService();
        const telegramService = new TelegramService(db, llmService);

        // Create Fastify server with telegram service
        const server = await createServer(telegramService);

        await server.listen({
            port: config.server.port,
            host: config.server.host,
        });

        console.log(`🚀 Server is running on http://${config.server.host}:${config.server.port}`);
        console.log(`📚 Swagger documentation available at http://${config.server.host}:${config.server.port}/docs`);

        // Start Telegram bot in webhook mode (don't use polling)
        const webhookUrl = config.telegram.webhookUrl;
        if (webhookUrl) {
            await telegramService.setWebhook(webhookUrl);
            console.log(`✅ Telegram webhook configured: ${webhookUrl}`);
        } else {
            console.warn('⚠️  No webhook URL configured, bot will use polling mode');
            await telegramService.launch();
        }

        // Initialize and start scheduler for proactive reminders
        const reminderService = new ReminderService(db, telegramService, llmService);
        const schedulerService = new SchedulerService(reminderService);
        schedulerService.start();

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n${signal} received, shutting down gracefully...`);

            schedulerService.stop();
            await telegramService.stop();
            await server.close();

            console.log('Server closed');
            process.exit(0);
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

main();
