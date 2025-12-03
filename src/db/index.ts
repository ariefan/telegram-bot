import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL!;
console.log('📊 Database connection string:', connectionString?.replace(/:[^:@]+@/, ':****@') || 'undefined');

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

export type Database = typeof db;
