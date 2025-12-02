import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function userRoutes(fastify: FastifyInstance) {
    // Get all users
    fastify.get('/users', {
        schema: {
            description: 'Get all users',
            tags: ['users'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            telegramId: { type: 'string' },
                            name: { type: 'string' },
                            bpjsNumber: { type: 'string', nullable: true },
                            isVerified: { type: 'boolean' },
                            createdAt: { type: 'string' },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const allUsers = await db.query.users.findMany();
        return allUsers;
    });

    // Get user by ID
    fastify.get('/users/:id', {
        schema: {
            description: 'Get user by ID',
            tags: ['users'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                },
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        telegramId: { type: 'string' },
                        name: { type: 'string' },
                        bpjsNumber: { type: 'string', nullable: true },
                        phoneNumber: { type: 'string', nullable: true },
                        isVerified: { type: 'boolean' },
                        createdAt: { type: 'string' },
                    },
                },
                404: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: number };
        const user = await db.query.users.findFirst({
            where: eq(users.id, id),
        });

        if (!user) {
            reply.status(404);
            return { error: 'User not found' };
        }

        return user;
    });

    // Get user by Telegram ID
    fastify.get('/users/telegram/:telegramId', {
        schema: {
            description: 'Get user by Telegram ID',
            tags: ['users'],
            params: {
                type: 'object',
                properties: {
                    telegramId: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { telegramId } = request.params as { telegramId: string };
        const user = await db.query.users.findFirst({
            where: eq(users.telegramId, telegramId),
        });

        if (!user) {
            reply.status(404);
            return { error: 'User not found' };
        }

        return user;
    });
}
