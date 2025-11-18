/**
 * Console-based notification adapter
 * For development - logs notifications instead of sending them
 */

import { INotificationAdapter } from '../index';
import { logger } from '../../logger';

export class ConsoleNotificationAdapter implements INotificationAdapter {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    logger.info('Email notification (console)', {
      to,
      subject,
      bodyLength: body.length,
    });
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    logger.info('SMS notification (console)', {
      to,
      messageLength: message.length,
    });
    console.log(`[SMS] To: ${to}, Message: ${message}`);
  }

  async sendPush(userId: string, title: string, body: string): Promise<void> {
    logger.info('Push notification (console)', {
      userId,
      title,
      bodyLength: body.length,
    });
    console.log(`[PUSH] User: ${userId}, Title: ${title}`);
  }
}
