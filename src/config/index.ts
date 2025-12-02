import dotenv from 'dotenv';

dotenv.config();

export const config = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    database: {
        url: process.env.DATABASE_URL!,
    },
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN!,
        webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    },
    openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY!,
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo-preview',
    },
    bpjs: {
        apiUrl: process.env.BPJS_API_URL || 'https://api.bpjs-kesehatan.go.id',
        apiKey: process.env.BPJS_API_KEY,
    },
} as const;

// Validate required environment variables
const requiredEnvVars = [
    'DATABASE_URL',
    'TELEGRAM_BOT_TOKEN',
    'OPENROUTER_API_KEY',
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
