import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { usersTable } from '../users/schema';

export const tenantUserRolesEnum = pgEnum('tenant_user_roles', [
  'admin',
  'user',
]);

export const tenantsTable = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  owner: uuid('owner')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),

  // Application specific fields:
});

export const tenantUsersTable = pgTable('tenant_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id')
    .references(() => tenantsTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  role: tenantUserRolesEnum('role').notNull(),
});
