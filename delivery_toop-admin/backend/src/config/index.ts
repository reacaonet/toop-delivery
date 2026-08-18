import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8100),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PRODUCTION: z.string().default('false'),

  // MongoDB
  MONGO_CONNECT_TYPE: z.string().default('mongodb'),
  MONGO_ADMIN_USER: z.string().min(1),
  MONGO_ADMIN_PASSWORD: z.string().min(1),
  URL_MONGO: z.string().min(1),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),

  // JWT
  JWT_SECRET: z.string().min(10),
  JWT_SECRET_REFRESH: z.string().min(10),

  // Service URLs
  PAYMENT_URL: z.string().url().default('http://localhost:8400'),
  NOTIFICATION_URL: z.string().url().default('http://localhost:8200'),
  DELIVERYMAN_URL: z.string().url().default('http://localhost:8300'),
  NOTIFICATION_API_KEY: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
