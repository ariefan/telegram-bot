import dotenv from 'dotenv';

dotenv.config();

export type LLMProvider = 'openrouter' | 'together';

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
    llm: {
        provider: (process.env.LLM_PROVIDER || 'openrouter') as LLMProvider,
        openrouter: {
            apiKey: process.env.OPENROUTER_API_KEY || '',
            model: process.env.OPENROUTER_MODEL || 'openai/gpt-4-turbo-preview',
            baseURL: 'https://openrouter.ai/api/v1',
        },
        together: {
            apiKey: process.env.TOGETHER_API_KEY || '',
            model: process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
            baseURL: 'https://api.together.xyz/v1',
        },
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
];

// Validate LLM provider-specific API keys
const provider = config.llm.provider;
if (provider === 'openrouter' && !config.llm.openrouter.apiKey) {
    requiredEnvVars.push('OPENROUTER_API_KEY');
} else if (provider === 'together' && !config.llm.together.apiKey) {
    requiredEnvVars.push('TOGETHER_API_KEY');
}

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
