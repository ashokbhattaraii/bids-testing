import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Minimal shared schema entry so Drizzle can generate migrations from one place.
// Start moving real tables here incrementally.
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  isActive: integer('is_active').notNull().default(1),
  avatar: text('avatar'),
  joinedAt: text('joined_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});