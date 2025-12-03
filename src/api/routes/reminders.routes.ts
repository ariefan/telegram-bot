import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { reminders } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function reminderRoutes(fastify: FastifyInstance) {
    // Get all reminders
    fastify.get('/reminders', {
        schema: {
            description: 'Get all reminders',
            tags: ['reminders'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            debtId: { type: 'number' },
                            userId: { type: 'number' },
                            reminderType: { type: 'string' },
                            sentAt: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const allReminders = await db.query.reminders.findMany({
            orderBy: (reminders, { desc }) => [desc(reminders.sentAt)],
        });
        return allReminders;
    });

    // Get reminders by user ID
    fastify.get('/users/:userId/reminders', {
        schema: {
            description: 'Get reminders by user ID',
            tags: ['reminders'],
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'number' },
                },
                required: ['userId'],
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            debtId: { type: 'number' },
                            userId: { type: 'number' },
                            reminderType: { type: 'string' },
                            sentAt: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { userId } = request.params as { userId: number };
        const userReminders = await db.query.reminders.findMany({
            where: eq(reminders.userId, userId),
            orderBy: (reminders, { desc }) => [desc(reminders.sentAt)],
        });
        return userReminders;
    });
}
