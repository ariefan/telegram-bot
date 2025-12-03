import { FastifyInstance } from 'fastify';
import { ReminderService } from '../../services/reminder.service.js';
import { db } from '../../db/index.js';
import { users, debts, conversations, messages, reminders } from '../../db/schema/index.js';
import { sql } from 'drizzle-orm';

export async function adminRoutes(fastify: FastifyInstance, options: { reminderService: ReminderService }) {
    // Manual trigger for reminders
    fastify.post('/admin/trigger-reminders', {
        schema: {
            description: 'Manually trigger reminder processing',
            tags: ['admin'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        try {
            await options.reminderService.processReminders();
            return {
                success: true,
                message: 'Reminder processing triggered successfully',
            };
        } catch (error) {
            reply.status(500);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to trigger reminders',
            };
        }
    });

    // Get dashboard stats
    fastify.get('/admin/stats', {
        schema: {
            description: 'Get dashboard statistics',
            tags: ['admin'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        totalUsers: { type: 'number' },
                        totalDebts: { type: 'number' },
                        totalConversations: { type: 'number' },
                        totalMessages: { type: 'number' },
                        totalReminders: { type: 'number' },
                        unpaidDebts: { type: 'number' },
                        totalDebtAmount: { type: 'number' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const [userStats] = await db.select({
            totalUsers: sql<number>`count(distinct ${users.id})`,
        }).from(users);

        const [debtStats] = await db.select({
            totalDebts: sql<number>`count(*)`,
            unpaidDebts: sql<number>`count(*) filter (where ${debts.status} = 'unpaid')`,
            totalDebtAmount: sql<number>`coalesce(sum(${debts.amount}) filter (where ${debts.status} = 'unpaid'), 0)`,
        }).from(debts);

        const [conversationStats] = await db.select({
            totalConversations: sql<number>`count(*)`,
        }).from(conversations);

        const [messageStats] = await db.select({
            totalMessages: sql<number>`count(*)`,
        }).from(messages);

        const [reminderStats] = await db.select({
            totalReminders: sql<number>`count(*)`,
        }).from(reminders);

        return {
            totalUsers: Number(userStats.totalUsers),
            totalDebts: Number(debtStats.totalDebts),
            totalConversations: Number(conversationStats.totalConversations),
            totalMessages: Number(messageStats.totalMessages),
            totalReminders: Number(reminderStats.totalReminders),
            unpaidDebts: Number(debtStats.unpaidDebts),
            totalDebtAmount: Number(debtStats.totalDebtAmount),
        };
    });
}
