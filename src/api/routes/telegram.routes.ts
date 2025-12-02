import { FastifyRequest, FastifyReply } from 'fastify';

export async function telegramRoutes(fastify: any, options: any) {
  fastify.post('/webhook/telegram', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // For now, just acknowledge webhook
      // Telegraf will handle the actual webhook processing
      reply.code(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      reply.code(500).send('Error');
    }
  });
}
