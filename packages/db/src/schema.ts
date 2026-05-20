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

export const hospitals = sqliteTable('hospitals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  valley: text('valley').notNull().default('inside_valley'),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const diagnoses = sqliteTable('diagnoses', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
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
  requestReceivedFrom: text('request_received_from'),
  requestManagedFrom: text('request_managed_from'),
  requestorEmail: text('requestor_email'),
  patientFeedbackStatus: text('patient_feedback_status'),
  requisitionFormUpload: text('requisition_form_upload'),
  createdAt: text('created_at').notNull(),
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
