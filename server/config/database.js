import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.info('Connected to MongoDB');
}
