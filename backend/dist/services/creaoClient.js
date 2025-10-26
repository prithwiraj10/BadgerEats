import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';
class CreaoClient {
    constructor() {
        this.http = axios.create({
            baseURL: config.CREAO_API_URL,
            headers: {
                Authorization: `Bearer ${config.CREAO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 15000,
        });
    }
    async generate(payload) {
        try {
            const response = await this.http.post('', payload);
            const data = response.data;
            const text = data.content ??
                data.text ??
                data.choices?.[0]?.message?.content ??
                data.choices?.[0]?.text;
            if (!text) {
                logger.warn({ data }, 'Creao AI response missing text content');
                throw new Error('Creao AI did not return content');
            }
            return text.trim();
        }
        catch (err) {
            logger.error({ err }, 'Creao AI request failed');
            throw err;
        }
    }
}
export const creaoClient = new CreaoClient();
