import twilio from 'twilio';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
const client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
async function sendSms({ to, body, mediaUrl }) {
    logger.debug({ to, body }, 'Sending SMS via Twilio');
    const message = await client.messages.create({
        to,
        from: config.TWILIO_FROM,
        body,
        mediaUrl: mediaUrl ? [mediaUrl] : undefined,
    });
    logger.info({ sid: message.sid, to }, 'SMS sent');
    return message;
}
function parseKeyword(body) {
    return body.trim().toUpperCase();
}
const STOP_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const RESUME_KEYWORDS = ['START', 'YES', 'UNSTOP'];
function classifyKeyword(keyword) {
    if (STOP_KEYWORDS.includes(keyword))
        return 'STOP';
    if (RESUME_KEYWORDS.includes(keyword))
        return 'START';
    return 'OTHER';
}
export const twilioService = {
    sendSms,
    parseKeyword,
    classifyKeyword,
};
