import { createServer } from './api/server.js';
import { config } from './config/index.js';
import { db } from './db/index.js';
import { TelegramService } from './services/telegram.service.js';
import { LLMService } from './services/llm.service.js';

async function main() {
    try {
        // Create and start Fastify server
        const server = await createServer();

        await server.listen({
            port: config.server.port,
            host: config.server.host,
        });

        console.log(`🚀 Server is running on http://${config.server.host}:${config.server.port}`);
        console.log(`📚 Swagger documentation available at http://${config.server.host}:${config.server.port}/docs`);

        // Initialize services
        const llmService = new LLMService();
        const telegramService = new TelegramService(db, llmService);

        // Start Telegram bot
        await telegramService.launch();

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            console.log(`\n${signal} received, shutting down gracefully...`);

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
