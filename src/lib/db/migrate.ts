import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './db.js';

// This will run migrations on the database, skipping the ones already applied
migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    console.info('Migrations complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migrations failed!', err);
    process.exit(1);
  });
