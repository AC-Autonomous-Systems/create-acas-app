import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/* -------------------------------------------------------------------------- */
/*                               Loads the .env                               */
/* -------------------------------------------------------------------------- */
import * as dotenv from 'dotenv';
dotenv.config({
  path: '.env.local',
});

if (!process.env.DB_CONNECTION_STRING) {
  throw new Error('DB_CONNECTION_STRING is not set');
} else if (!process.env.TEST_DB_CONNECTION_STRING) {
  throw new Error('TEST_DB_CONNECTION_STRING is not set');
}

export const client = postgres(
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DB_CONNECTION_STRING
    : process.env.DB_CONNECTION_STRING,
  { max: 25 }
);
export const db = drizzle(client);
