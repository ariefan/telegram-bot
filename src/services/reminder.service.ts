import { Database } from '../db/index.js';
import { debts, users, reminders } from '../db/schema/index.js';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { TelegramService } from './telegram.service.js';
import { LLMService } from './llm.service.js';

export class ReminderService {
    private db: Database;
    private telegramService: TelegramService;
    private llmService: LLMService;

    constructor(db: Database, telegramService: TelegramService, llmService: LLMService) {
        this.db = db;
        this.telegramService = telegramService;
        this.llmService = llmService;
    }

    async processReminders() {
        console.log(`[${new Date().toISOString()}] Starting reminder processing...`);

        try {
            // Process 7-day reminders
            await this.processReminderType('7_days', 7);

            // Process 3-day reminders
            await this.processReminderType('3_days', 3);

            // Process 1-day reminders
            await this.processReminderType('1_day', 1);

            console.log(`[${new Date().toISOString()}] Reminder processing completed`);
        } catch (error) {
            console.error('[ReminderService] Error processing reminders:', error);
        }
    }

    private async processReminderType(reminderType: string, daysBeforeDue: number) {
        console.log(`Processing ${reminderType} reminders...`);

        // Calculate the target due date (e.g., NOW + 7 days)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysBeforeDue);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        // Find unpaid debts due on the target date
        const upcomingDebts = await this.db.query.debts.findMany({
            where: and(
                eq(debts.status, 'unpaid'),
                sql`DATE(${debts.dueDate}) = ${targetDateStr}`
            ),
            with: {
                user: true,
            },
        });

        console.log(`Found ${upcomingDebts.length} debts due in ${daysBeforeDue} days`);

        for (const debt of upcomingDebts) {
            try {
                // Check if reminder already sent
                const existingReminder = await this.db.query.reminders.findFirst({
                    where: and(
                        eq(reminders.debtId, debt.id),
                        eq(reminders.reminderType, reminderType)
                    ),
                });

                if (existingReminder) {
                    console.log(`Reminder ${reminderType} already sent for debt ${debt.id}`);
                    continue;
                }

                // Get user info
                const user = await this.db.query.users.findFirst({
                    where: eq(users.id, debt.userId),
                });

                if (!user) {
                    console.error(`User not found for debt ${debt.id}`);
                    continue;
                }

                // Generate AI-personalized reminder message
                const message = await this.generateReminderMessage(
                    user.name,
                    debt.amount,
                    debt.dueDate,
                    daysBeforeDue,
                    debt.description || ''
                );

                // Send reminder via Telegram
                await this.sendReminderToUser(user.telegramId, message);

                // Record the reminder
                await this.db.insert(reminders).values({
                    debtId: debt.id,
                    userId: user.id,
                    reminderType,
                    status: 'sent',
                });

                console.log(`Sent ${reminderType} reminder to user ${user.name} for debt ${debt.id}`);
            } catch (error) {
                console.error(`Error sending reminder for debt ${debt.id}:`, error);

                // Record failed reminder
                try {
                    await this.db.insert(reminders).values({
                        debtId: debt.id,
                        userId: debt.userId,
                        reminderType,
                        status: 'failed',
                    });
                } catch (dbError) {
                    console.error('Failed to record failed reminder:', dbError);
                }
            }
        }
    }

    private async generateReminderMessage(
        name: string,
        amount: number,
        dueDate: Date,
        daysBeforeDue: number,
        description: string
    ): Promise<string> {
        const context = `
User: ${name}
Debt Amount: Rp ${amount.toLocaleString('id-ID')}
Due Date: ${dueDate.toLocaleDateString('id-ID')}
Days Until Due: ${daysBeforeDue} hari
Description: ${description}
        `.trim();

        const prompt = `Anda adalah asisten BPJS Kesehatan yang ramah. Buatkan pesan pengingat pembayaran yang hangat dan profesional untuk pengguna.

Informasi:
${context}

Pesan harus:
- Ramah dan sopan
- Mengingatkan tentang pembayaran yang akan jatuh tempo
- Memberikan informasi jumlah dan tanggal jatuh tempo
- Menyertakan cara pembayaran (transfer bank, Indomaret, Alfamart, atau aplikasi)
- Empati dan mendorong untuk segera membayar
- Dalam Bahasa Indonesia yang baik

Buatkan pesan pengingat yang personal dan hangat.`;

        try {
            const message = await this.llmService.generateResponse([
                { role: 'user', content: prompt }
            ]);

            return message;
        } catch (error) {
            console.error('Error generating AI message, using template:', error);

            // Fallback template message
            return `Halo ${name},\n\nIni adalah pengingat bahwa pembayaran BPJS Kesehatan Anda akan jatuh tempo dalam ${daysBeforeDue} hari.\n\nDetail Pembayaran:\n- Jumlah: Rp ${amount.toLocaleString('id-ID')}\n- Jatuh Tempo: ${dueDate.toLocaleDateString('id-ID')}\n- Keterangan: ${description}\n\nMohon segera lakukan pembayaran melalui:\n- Transfer Bank\n- Indomaret/Alfamart\n- Aplikasi mobile banking\n\nTerima kasih atas perhatian Anda.`;
        }
    }

    private async sendReminderToUser(telegramId: string, message: string) {
        const bot = this.telegramService.getBot();
        await bot.telegram.sendMessage(telegramId, message);
    }
}
