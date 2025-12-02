import OpenAI from 'openai';
import { config } from '../config/index.js';
import { buildSystemPrompt } from '../prompts/index.js';

export class LLMService {
    private client: OpenAI;
    private model: string;
    private provider: string;

    constructor() {
        const provider = config.llm.provider;
        this.provider = provider;

        if (provider === 'together') {
            this.client = new OpenAI({
                baseURL: config.llm.together.baseURL,
                apiKey: config.llm.together.apiKey,
            });
            this.model = config.llm.together.model;
            console.log(`✅ LLM Service initialized with Together.ai (${this.model})`);
        } else {
            // Default to OpenRouter
            this.client = new OpenAI({
                baseURL: config.llm.openrouter.baseURL,
                apiKey: config.llm.openrouter.apiKey,
            });
            this.model = config.llm.openrouter.model;
            console.log(`✅ LLM Service initialized with OpenRouter (${this.model})`);
        }
    }

    async generateResponse(
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        context?: string,
        isFirstMessage?: boolean
    ): Promise<string> {
        const systemPrompt = buildSystemPrompt(context, isFirstMessage);

        const chatMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...messages,
        ];

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 1500,
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

        // Detect if this is the first message (no conversation history)
        const isFirstMessage = conversationHistory.length === 0;

        return this.generateResponse(messages, context, isFirstMessage);
    }
}
