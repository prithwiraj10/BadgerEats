import twilio from 'twilio';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

export type SendSmsOptions = {
  to: string;
  body: string;
  mediaUrl?: string;
};

async function sendSms({ to, body, mediaUrl }: SendSmsOptions) {
  logger.debug({ to, body }, 'Sending SMS via Twilio');

  const message = await client.messages.create({
    to,
    from: config.TWILIO_FROM,
    body,
    mediaUrl,
  });

  logger.info({ sid: message.sid, to }, 'SMS sent');
  return message;
}

export type TwilioWebhookPayload = {
  From: string;
  Body: string;
  SmsStatus: string;
};

function parseKeyword(body: string) {
  return body.trim().toUpperCase();
}

const STOP_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const RESUME_KEYWORDS = ['START', 'YES', 'UNSTOP'];

function classifyKeyword(keyword: string) {
  if (STOP_KEYWORDS.includes(keyword)) return 'STOP';
  if (RESUME_KEYWORDS.includes(keyword)) return 'START';
  return 'OTHER';
}

export const twilioService = {
  sendSms,
  parseKeyword,
  classifyKeyword,
};
