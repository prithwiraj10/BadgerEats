import { Router } from 'express';
import twilio from 'twilio';
import { twilioService } from '../services/twilioService.js';
import { userService } from '../services/userService.js';
import { logger } from '../lib/logger.js';
const twilioRouter = Router();
const messagingResponse = twilio.twiml.MessagingResponse;
twilioRouter.post('/', async (req, res, next) => {
    try {
        const { Body, From } = req.body;
        const keyword = twilioService.parseKeyword(Body ?? '');
        const classification = twilioService.classifyKeyword(keyword);
        const twiml = new messagingResponse();
        if (!From) {
            logger.warn('Twilio webhook missing From number');
            twiml.message('Missing phone number.');
            res.type('text/xml').send(twiml.toString());
            return;
        }
        const user = await userService.getUserByPhone(From);
        if (!user) {
            logger.info({ From }, 'Webhook from unknown number, ignoring');
            res.type('text/xml').send(twiml.message('You are not subscribed yet. Visit the web app to join.').toString());
            return;
        }
        if (classification === 'STOP') {
            await userService.unsubscribe(user.id);
            twiml.message('You will no longer receive alerts. Reply START to rejoin.');
            res.type('text/xml').send(twiml.toString());
            return;
        }
        if (classification === 'START') {
            await userService.resubscribe(user.id);
            twiml.message('Welcome back! You will receive alerts again.');
            res.type('text/xml').send(twiml.toString());
            return;
        }
        // TODO: call Creao AI for adhoc responses based on keyword/body
        twiml.message('Thanks! Visit the app for the latest menus.');
        res.type('text/xml').send(twiml.toString());
    }
    catch (err) {
        next(err);
    }
});
export { twilioRouter };
