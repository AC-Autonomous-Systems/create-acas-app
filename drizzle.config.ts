import type { Config } from 'drizzle-kit';

import * as dotenv from 'dotenv';
dotenv.config({
  path: '.env.local',
});

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('DB_CONNECTION_STRING is not set');
} else if (!process.env.TEST_DB_CONNECTION_STRING) {
  throw new Error('TEST_DB_CONNECTION_STRING is not set');
}
export default {
  schema: './src/**/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.NODE_ENV === 'test'
        ? process.env.TEST_DB_CONNECTION_STRING
        : process.env.DB_CONNECTION_STRING,
  },
} satisfies Config;
