import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

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

export const donors = sqliteTable('donors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bloodType: text('blood_type').notNull(),
  phone: text('phone').notNull(),
  location: text('location').notNull(),
  lastDonation: text('last_donation'),
  lastContacted: text('last_contacted'),
  rating: real('rating').notNull().default(0),
  donationCount: integer('donation_count').notNull().default(0),
  status: text('status').notNull().default('active'),
  blacklistReason: text('blacklist_reason'),
  communicationType: text('communication_type').notNull().default('phone_call'),
  notes: text('notes'),
  source: text('source').notNull().default('direct'),
  category: text('category').notNull().default('active'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
});

export const donorContacts = sqliteTable('donor_contacts', {
  id: text('id').primaryKey(),
  donorId: text('donor_id').notNull().references(() => donors.id),
  requestId: text('request_id'),
  contactedBy: text('contacted_by').notNull(),
  communicationType: text('communication_type').notNull().default('phone_call'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
});
