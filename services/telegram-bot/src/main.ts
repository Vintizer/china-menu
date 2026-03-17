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
    await botService.setWebhook(webhookUrl);
    console.log('[bot] Webhook set to', webhookUrl);
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
