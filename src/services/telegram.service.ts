import { Telegraf, Context } from 'telegraf';
import { config } from '../config/index.js';
import { Database } from '../db/index.js';
import { users, conversations, messages } from '../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import { LLMService } from './llm.service.js';

export class TelegramService {
  private bot: Telegraf;
  private db: Database;
  private llmService: LLMService;

  constructor(db: Database, llmService: LLMService) {
    this.bot = new Telegraf(config.telegram.botToken);
    this.db = db;
    this.llmService = llmService;
    this.setupHandlers();
  }

  private setupHandlers() {
    // Start command
    this.bot.start(async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const name = ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : '');

      // Create or get user
      let user = await this.db.query.users.findFirst({
        where: eq(users.telegramId, telegramId),
      });

      if (!user) {
        const [newUser] = await this.db
          .insert(users)
          .values({
            telegramId,
            name,
          })
          .returning();
        user = newUser;
      }

      await ctx.reply(
        `Selamat datang di BPJS Kesehatan Debt Collector Bot! 👋\n\n` +
          `Saya di sini untuk membantu Anda mengelola pembayaran BPJS Kesehatan Anda.\n\n` +
          `Untuk memulai, silakan verifikasi nomor BPJS Anda dengan mengetik:\n` +
          `/verify [nomor BPJS Anda]`
      );
    });

    // Verify command
    this.bot.command('verify', async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const bpjsNumber = ctx.message.text.split(' ')[1];

      if (!bpjsNumber) {
        return ctx.reply('Silakan masukkan nomor BPJS Anda. Contoh: /verify 1234567890');
      }

      // Update user with BPJS number
      await this.db
        .update(users)
        .set({
          bpjsNumber,
          isVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.telegramId, telegramId));

      await ctx.reply(
        `✅ Nomor BPJS Anda (${bpjsNumber}) telah berhasil diverifikasi!\n\n` +
          `Sekarang Anda dapat bertanya tentang tagihan atau pembayaran BPJS Anda.`
      );
    });

    // Handle text messages
    this.bot.on('text', async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const userMessage = ctx.message.text;

      // Get user
      const user = await this.db.query.users.findFirst({
        where: eq(users.telegramId, telegramId),
      });

      if (!user) {
        return ctx.reply('Silakan mulai dengan mengetik /start terlebih dahulu.');
      }

      // Get or create conversation
      let conversation = await this.db.query.conversations.findFirst({
        where: and(eq(conversations.userId, user.id), eq(conversations.status, 'active')),
      });

      if (!conversation) {
        const [newConversation] = await this.db
          .insert(conversations)
          .values({
            userId: user.id,
            telegramChatId: ctx.chat.id.toString(),
          })
          .returning();
        conversation = newConversation;
      }

      // Save user message
      await this.db.insert(messages).values({
        conversationId: conversation.id,
        role: 'user',
        content: userMessage,
      });

      // Get conversation history
      const history = await this.db.query.messages.findMany({
        where: eq(messages.conversationId, conversation.id),
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        limit: 10,
      });

      const conversationHistory = history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Get user debts (mock data for demo)
      const userData = user.isVerified
        ? {
            name: user.name,
            bpjsNumber: user.bpjsNumber || undefined,
            debts: await this.db.query.debts
              .findMany({
                where: eq(users.id, user.id),
              })
              .then((debts) =>
                debts.map((d) => ({
                  amount: d.amount,
                  dueDate: d.dueDate,
                  description: d.description || undefined,
                }))
              ),
          }
        : undefined;

      // Generate response using LLM with RAG
      const response = await this.llmService.generateResponseWithRAG(
        userMessage,
        conversationHistory,
        userData
      );

      // Save assistant message
      await this.db.insert(messages).values({
        conversationId: conversation.id,
        role: 'assistant',
        content: response,
      });

      await ctx.reply(response);
    });
  }

  async launch(webhookUrl?: string) {
    if (webhookUrl) {
      // Set webhook
      await this.bot.telegram.setWebhook(webhookUrl);
      console.log(`Telegram bot webhook set to: ${webhookUrl}`);
    } else {
      // Use polling
      await this.bot.launch();
      console.log('Telegram bot started in polling mode');
    }
  }

  async handleUpdate(update: any) {
    await this.bot.handleUpdate(update);
  }

  async setWebhook(webhookUrl: string) {
    await this.bot.telegram.setWebhook(webhookUrl);
    console.log(`Telegram webhook set to: ${webhookUrl}`);
  }

  async getWebhookInfo() {
    return await this.bot.telegram.getWebhookInfo();
  }

  async stop() {
    this.bot.stop('SIGINT');
  }

  getBot() {
    return this.bot;
  }
}
