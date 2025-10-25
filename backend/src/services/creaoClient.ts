import axios, { AxiosInstance } from 'axios';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export type CreaoPromptPayload = {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  metadata?: Record<string, unknown>;
};

export type CreaoResponse = {
  id?: string;
  content?: string;
  text?: string;
  choices?: Array<{ message?: { content?: string }; text?: string }>;
  tokens_used?: number;
  finish_reason?: string;
  [key: string]: unknown;
};

class CreaoClient {
  private http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: config.CREAO_API_URL,
      headers: {
        Authorization: `Bearer ${config.CREAO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15_000,
    });
  }

  async generate(payload: CreaoPromptPayload): Promise<string> {
    try {
      const response = await this.http.post<CreaoResponse>('', payload);
      const data = response.data;

      const text =
        data.content ??
        data.text ??
        data.choices?.[0]?.message?.content ??
        data.choices?.[0]?.text;

      if (!text) {
        logger.warn({ data }, 'Creao AI response missing text content');
        throw new Error('Creao AI did not return content');
      }

      return text.trim();
    } catch (err) {
      logger.error({ err }, 'Creao AI request failed');
      throw err;
    }
  }
}

export const creaoClient = new CreaoClient();
