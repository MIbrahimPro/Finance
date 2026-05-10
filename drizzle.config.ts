import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
});
