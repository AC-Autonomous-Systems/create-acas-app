import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { tenantsTable } from '../tenant/schema';

export const apiKeysTable = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiration: timestamp('expiration'),
    tenantId: uuid('tenant_id')
      .references(() => tenantsTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => {
    return {
      apiKeyKeyUniqueIndex: unique('api_key_key_unique_index').on(table.key),
    };
  }
);
