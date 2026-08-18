import mongoose from 'mongoose';
import { env } from './index';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.URL_MONGO, {
      autoIndex: env.NODE_ENV !== 'production',
    });
    console.log(`[DB] MongoDB connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error('[DB] MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });
}
