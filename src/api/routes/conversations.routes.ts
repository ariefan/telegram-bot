import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { conversations, messages } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function conversationRoutes(fastify: FastifyInstance) {
    // Get all conversations
    fastify.get('/conversations', {
        schema: {
            description: 'Get all conversations',
            tags: ['conversations'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            userId: { type: 'number' },
                            telegramChatId: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const allConversations = await db.query.conversations.findMany();
        return allConversations;
    });

    // Get conversation by ID with messages
    fastify.get('/conversations/:id', {
        schema: {
            description: 'Get conversation by ID with messages',
            tags: ['conversations'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                },
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: number };

        const conversation = await db.query.conversations.findFirst({
            where: eq(conversations.id, id),
        });

        if (!conversation) {
            reply.status(404);
            return { error: 'Conversation not found' };
        }

        const conversationMessages = await db.query.messages.findMany({
            where: eq(messages.conversationId, id),
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });

        return {
            ...conversation,
            messages: conversationMessages,
        };
    });

    // Get conversations by user ID
    fastify.get('/users/:userId/conversations', {
        schema: {
            description: 'Get conversations by user ID',
            tags: ['conversations'],
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'number' },
                },
            },
        },
    }, async (request, reply) => {
        const { userId } = request.params as { userId: number };

        const userConversations = await db.query.conversations.findMany({
            where: eq(conversations.userId, userId),
        });

        return userConversations;
    });
}
