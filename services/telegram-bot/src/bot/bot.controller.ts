import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { BotService } from './bot.service';

@Controller()
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('[bot] body is string but not JSON', e);
        return res.status(400).send('bad body');
      }
    }
    try {
      await this.botService.handleUpdate(body);
      res.status(200).send('ok');
    } catch (err) {
      console.error('[bot] handler error', err);
      res.status(500).send('error');
    }
  }
}
