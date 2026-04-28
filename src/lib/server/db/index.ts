import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) {
    console.error('CRITICAL: DATABASE_URL is not set in .env');
}

const client = mysql.createPool(env.DATABASE_URL || 'mysql://root@localhost:3306/jurnalgangguan');

export const db = drizzle(client, { schema, mode: 'default' });
