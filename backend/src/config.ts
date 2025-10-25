import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().nonempty('DATABASE_URL is required'),
  CREAO_API_URL: z.string().url('CREAO_API_URL must be a valid URL'),
  CREAO_API_KEY: z.string().nonempty('CREAO_API_KEY is required'),
  TWILIO_ACCOUNT_SID: z.string().nonempty('TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().nonempty('TWILIO_AUTH_TOKEN is required'),
  TWILIO_FROM: z.string().nonempty('TWILIO_FROM is required'),
  DEFAULT_CITY: z.string().default('Madison'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Configuration validation failed.');
}

export const config = {
  ...parsed.data,
  port: Number(parsed.data.PORT) || 4000,
  isProduction: parsed.data.NODE_ENV === 'production',
};
