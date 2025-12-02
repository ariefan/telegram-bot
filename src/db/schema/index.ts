import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    telegramId: text('telegram_id').notNull().unique(),
    name: text('name').notNull(),
    bpjsNumber: text('bpjs_number'),
    phoneNumber: text('phone_number'),
    isVerified: boolean('is_verified').default(false).notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const conversations = pgTable('conversations', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    telegramChatId: text('telegram_chat_id').notNull(),
    status: text('status').default('active').notNull(), // active, completed, archived
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
    role: text('role').notNull(), // user, assistant, system
    content: text('content').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const debts = pgTable('debts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    bpjsNumber: text('bpjs_number').notNull(),
    amount: integer('amount').notNull(),
    dueDate: timestamp('due_date').notNull(),
    status: text('status').default('unpaid').notNull(), // unpaid, paid, overdue
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reminders = pgTable('reminders', {
    id: serial('id').primaryKey(),
    debtId: integer('debt_id').references(() => debts.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    reminderType: text('reminder_type').notNull(), // '7_days', '3_days', '1_day'
    sentAt: timestamp('sent_at').defaultNow().notNull(),
    status: text('status').default('sent').notNull(), // 'sent', 'failed'
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
