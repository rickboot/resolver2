import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    if (!pool) {
      pool = new Pool({
        host: process.env.AWS_RDS_HOST,
        port: parseInt(process.env.AWS_RDS_PORT || '5432'),
        database: process.env.AWS_RDS_DATABASE,
        user: process.env.AWS_RDS_USER,
        password: process.env.AWS_RDS_PASSWORD,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    
    db = drizzle(pool, { schema });
  }
  
  return db;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}
