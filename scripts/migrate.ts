import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { readFileSync, readdirSync } from 'fs';

async function main() {
  const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!);
  
  // Drop all tables in correct order with CASCADE
  await sql.query('DROP TABLE IF EXISTS "personEntry" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "person" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "transaction" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "tag" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "statsLayout" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "dashboardLayout" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "authenticator" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "session" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "account" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "verificationToken" CASCADE');
  await sql.query('DROP TABLE IF EXISTS "user" CASCADE');
  
  console.log('All tables dropped. Applying migration...');

  const files = readdirSync('drizzle').filter(f => f.endsWith('.sql'));
  if (files.length === 0) throw new Error('No SQL migration files found');
  const migration = readFileSync(`drizzle/${files[0]}`, 'utf-8');
  const statements = migration.split(';').filter(s => s.trim().length > 0);
  for (const stmt of statements) {
    await sql.query(stmt + ';');
  }
  console.log('Migration applied successfully');
}

main().catch(console.error);
