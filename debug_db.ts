import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './src/lib/server/db/schema';

async function test() {
    const dbUrl = "mysql://root@localhost:3306/jurnalgangguan";
    const connection = await mysql.createConnection(dbUrl);
    const db = drizzle(connection, { schema, mode: 'default' });
    try {
        console.log('Testing query...');
        const result = await db.select().from(schema.jurnalGangguan).limit(1);
        console.log('Success:', result);
    } catch (e) {
        console.error('Error:', e);
    }
    await connection.end();
}

test();
