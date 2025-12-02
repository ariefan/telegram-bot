import { FastifyInstance } from 'fastify';
import { db } from '../../db/index.js';
import { debts } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function debtRoutes(fastify: FastifyInstance) {
    // Get all debts
    fastify.get('/debts', {
        schema: {
            description: 'Get all debts',
            tags: ['debts'],
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            userId: { type: 'number' },
                            bpjsNumber: { type: 'string' },
                            amount: { type: 'number' },
                            dueDate: { type: 'string' },
                            status: { type: 'string' },
                            description: { type: 'string', nullable: true },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const allDebts = await db.query.debts.findMany();
        return allDebts;
    });

    // Get debts by user ID
    fastify.get('/users/:userId/debts', {
        schema: {
            description: 'Get debts by user ID',
            tags: ['debts'],
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'number' },
                },
            },
        },
    }, async (request, reply) => {
        const { userId } = request.params as { userId: number };

        const userDebts = await db.query.debts.findMany({
            where: eq(debts.userId, userId),
        });

        return userDebts;
    });

    // Create debt (for demo purposes)
    fastify.post('/debts', {
        schema: {
            description: 'Create a new debt record',
            tags: ['debts'],
            body: {
                type: 'object',
                required: ['userId', 'bpjsNumber', 'amount', 'dueDate'],
                properties: {
                    userId: { type: 'number' },
                    bpjsNumber: { type: 'string' },
                    amount: { type: 'number' },
                    dueDate: { type: 'string' },
                    status: { type: 'string' },
                    description: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const body = request.body as {
            userId: number;
            bpjsNumber: string;
            amount: number;
            dueDate: string;
            status?: string;
            description?: string;
        };

        const [newDebt] = await db.insert(debts).values({
            userId: body.userId,
            bpjsNumber: body.bpjsNumber,
            amount: body.amount,
            dueDate: new Date(body.dueDate),
            status: body.status || 'unpaid',
            description: body.description,
        }).returning();

        return newDebt;
    });

    // Update debt status
    fastify.patch('/debts/:id', {
        schema: {
            description: 'Update debt status',
            tags: ['debts'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: number };
        const { status } = request.body as { status: string };

        const [updatedDebt] = await db.update(debts)
            .set({ status, updatedAt: new Date() })
            .where(eq(debts.id, id))
            .returning();

        if (!updatedDebt) {
            reply.status(404);
            return { error: 'Debt not found' };
        }

        return updatedDebt;
    });
}
