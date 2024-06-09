import { pgEnum, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const userRolesEnum = pgEnum('user_roles_enum', ['admin', 'user']);

export const usersTable = pgTable(
  'users_table',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    email: text('email').notNull(),
    profilePictureURL: text('profile_picture_url'),
    role: userRolesEnum('role').notNull().default('user'),
  },
  (table) => {
    return {
      userEmailUniqueIndex: uniqueIndex('user_email_unique_index').on(
        table.email
      ),
    };
  }
);
