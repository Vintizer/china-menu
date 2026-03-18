import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './bot/bot.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('');

  const botService = app.get(BotService);
  const webhookDomain = process.env.WEBHOOK_DOMAIN;
  if (webhookDomain) {
    const webhookUrl = `${webhookDomain.replace(/\/$/, '')}/webhook`;
    const maxRetries = 5;
    const delayMs = 8000;
    for (let i = 0; i < maxRetries; i++) {
      try {
        if (i > 0) {
          console.log(`[bot] setWebhook retry ${i + 1}/${maxRetries}...`);
          await new Promise((r) => setTimeout(r, delayMs));
        }
        await botService.setWebhook(webhookUrl);
        console.log('[bot] Webhook set to', webhookUrl);
        break;
      } catch (e) {
        if (i === maxRetries - 1) {
          console.error('[bot] setWebhook failed after', maxRetries, 'attempts. Bot will run but won\'t receive updates.', (e as Error)?.message ?? e);
        }
      }
    }
  } else {
    console.warn('[bot] WEBHOOK_DOMAIN not set — webhook not registered. Set it for production.');
  }

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
  console.log(`[bot] Listening on port ${port}`);
}

bootstrap().catch((e) => {
  console.error('Bootstrap failed', e);
  process.exit(1);
});
