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

  // Firebase (web SDK config)
  FIREBASE_API_KEY: z.string().default(''),
  FIREBASE_AUTH_DOMAIN: z.string().default(''),
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_STORAGE_BUCKET: z.string().default(''),
  FIREBASE_MESSAGING_SENDER_ID: z.string().default(''),
  FIREBASE_APP_ID: z.string().default(''),
  FIREBASE_DATABASE_URL: z.string().default(''),

  // Firebase Admin (service account) — optional, degraded when absent
  FIREBASE_ADMIN_PROJECT_ID: z.string().default(''),
  FIREBASE_ADMIN_CLIENT_EMAIL: z.string().default(''),
  FIREBASE_ADMIN_PRIVATE_KEY: z.string().default(''),
  FIREBASE_ADMIN_DATABASE_URL: z.string().default(''),
  FIREBASE_ADMIN_ENABLED: z.string().default('false'),

  // Google Maps (geocode/directions/matrix/autocomplete) — optional, degraded when absent
  GOOGLE_MAPS: z.string().default(''),

  // Twilio (chamadas de alerta + Verify OTP) — optional, degraded when absent
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_SERVICE_SID: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
