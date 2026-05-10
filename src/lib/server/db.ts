import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const sql = neon(url);
  return drizzle({ client: sql, schema });
}

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}
