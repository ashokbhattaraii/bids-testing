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

export const hospitals = sqliteTable('hospitals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  address: text('address'),
  valley: text('valley').notNull().default('inside_valley'),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const requests = sqliteTable('requests', {
  id: text('id').primaryKey(),
  patientName: text('patient_name').notNull(),
  requesterName: text('requester_name'),
  requesterPhone: text('requester_phone'),
  diagnosis: text('diagnosis'),
  hospital: text('hospital'),
  hospitalId: text('hospital_id').notNull().references(() => hospitals.id),
  bloodType: text('blood_type').notNull(),
  quantity: integer('quantity').notNull().default(1),
  urgency: text('urgency').notNull().default('high'),
  status: text('status').notNull().default('pending'),
  transportationRequired: text('transportation_required'),
  // ISO strings for created/requested/needed times
  requestedAt: text('requested_at').notNull(),
  neededBy: text('needed_by'),
  notes: text('notes'),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  location: text('location'),
  // JSON stored as text: selected components, quantities and images
  selectedComponents: text('selected_components'),
  componentQuantities: text('component_quantities'),
  images: text('images'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});