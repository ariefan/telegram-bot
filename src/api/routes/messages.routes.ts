import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { messages } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function messageRoutes(fastify: FastifyInstance) {
    // Get all messages
    fastify.get('/messages', {
        schema: {
            description: 'Get all messages',
            tags: ['messages'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            conversationId: { type: 'number' },
                            role: { type: 'string' },
                            content: { type: 'string' },
                            metadata: { type: 'object', additionalProperties: true, nullable: true },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const allMessages = await db.query.messages.findMany({
            orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        });
        return allMessages;
    });

    // Get messages by conversation ID
    fastify.get('/conversations/:conversationId/messages', {
        schema: {
            description: 'Get messages by conversation ID',
            tags: ['messages'],
            params: {
                type: 'object',
                properties: {
                    conversationId: { type: 'number' },
                },
                required: ['conversationId'],
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            conversationId: { type: 'number' },
                            role: { type: 'string' },
                            content: { type: 'string' },
                            metadata: { type: 'object', additionalProperties: true, nullable: true },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { conversationId } = request.params as { conversationId: number };
        const conversationMessages = await db.query.messages.findMany({
            where: eq(messages.conversationId, conversationId),
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });
        return conversationMessages;
    });
}
