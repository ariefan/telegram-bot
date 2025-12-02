import OpenAI from 'openai';
import { config } from '../config/index.js';
import { buildSystemPrompt } from '../prompts/index.js';

export class LLMService {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: config.openrouter.apiKey,
        });
    }

    async generateResponse(
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        context?: string
    ): Promise<string> {
        const systemPrompt = buildSystemPrompt(context);

        const chatMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages,
        ];

        const response = await this.client.chat.completions.create({
            model: config.openrouter.model,
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda saat ini.';
    }

    async generateResponseWithRAG(
        userMessage: string,
        conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
        userData?: {
            name?: string;
            bpjsNumber?: string;
            debts?: Array<{ amount: number; dueDate: Date; description?: string }>;
        }
    ): Promise<string> {
        let context = '';

        if (userData) {
            context = `User Information:
- Name: ${userData.name || 'Unknown'}
- BPJS Number: ${userData.bpjsNumber || 'Not verified'}
`;

            if (userData.debts && userData.debts.length > 0) {
                context += `\nOutstanding Debts:\n`;
                userData.debts.forEach((debt, index) => {
                    context += `${index + 1}. Amount: Rp ${debt.amount.toLocaleString('id-ID')}
   Due Date: ${debt.dueDate.toLocaleDateString('id-ID')}
   ${debt.description ? `Description: ${debt.description}` : ''}
`;
                });
            } else {
                context += '\nNo outstanding debts found.';
            }
        }

        const messages = [
            ...conversationHistory,
            { role: 'user' as const, content: userMessage },
        ];

        return this.generateResponse(messages, context);
    }
}
