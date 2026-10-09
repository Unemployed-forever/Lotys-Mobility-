import { boolean, integer, pgTable, serial, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  industry: varchar("industry", { length: 100 }).default("").notNull(),
  city: varchar("city", { length: 100 }).default("").notNull(),
  contactName: varchar("contact_name", { length: 100 }).default("").notNull(),
  contactEmail: varchar("contact_email", { length: 254 }).default("").notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).default("").notNull(),
  status: varchar("status", { length: 30 }).default("Interessent").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  licensePlate: varchar("license_plate", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  driver: varchar("driver", { length: 100 }).notNull(),
  nextHu: varchar("next_hu", { length: 20 }).notNull(),
  mileage: integer("mileage").default(0).notNull(),
  status: varchar("status", { length: 50 }).default("Bereit").notNull(),
  tireStatus: varchar("tire_status", { length: 100 }).default("Allwetter - OK").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 254 }).default("").notNull(),
  phone: varchar("phone", { length: 50 }).default("").notNull(),
  licenseCheckDue: varchar("license_check_due", { length: 20 }).default("").notNull(),
  status: varchar("status", { length: 30 }).default("Aktiv").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicleDocuments = pgTable("vehicle_documents", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").notNull(),
  documentType: varchar("document_type", { length: 80 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  storageReference: text("storage_reference").default("").notNull(),
  expiresOn: varchar("expires_on", { length: 20 }).default("").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fleetTasks = pgTable("fleet_tasks", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  vehicleId: integer("vehicle_id"),
  title: varchar("title", { length: 200 }).notNull(),
  category: varchar("category", { length: 60 }).default("Allgemein").notNull(),
  dueDate: varchar("due_date", { length: 20 }).default("").notNull(),
  priority: varchar("priority", { length: 20 }).default("Normal").notNull(),
  status: varchar("status", { length: 30 }).default("Offen").notNull(),
  assignee: varchar("assignee", { length: 100 }).default("Arthur").notNull(),
  notes: text("notes").default("").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fleetCosts = pgTable("fleet_costs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  vehicleId: integer("vehicle_id"),
  category: varchar("category", { length: 60 }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  occurredOn: varchar("occurred_on", { length: 20 }).notNull(),
  vendor: varchar("vendor", { length: 150 }).default("").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workshopPartners = pgTable("workshop_partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  city: varchar("city", { length: 100 }).default("").notNull(),
  email: varchar("email", { length: 254 }).default("").notNull(),
  phone: varchar("phone", { length: 50 }).default("").notNull(),
  services: text("services").default("").notNull(),
  rating: integer("rating").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id"),
  licensePlate: varchar("license_plate", { length: 50 }).notNull(),
  vehicleModel: varchar("vehicle_model", { length: 100 }).notNull(),
  issue: text("issue").notNull(),
  priority: varchar("priority", { length: 20 }).default("Medium").notNull(),
  status: varchar("status", { length: 50 }).default("Neu").notNull(),
  assignedTo: varchar("assigned_to", { length: 100 }).default("Arthur").notNull(),
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
  contactEmail: varchar("contact_email", { length: 254 }).notNull(),
  privacyConsent: boolean("privacy_consent").default(false).notNull(),
  adminNotes: text("admin_notes").default("").notNull(),
  customerVisibleNotes: text("customer_visible_notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fleetChecks = pgTable("fleet_checks", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 150 }).notNull(),
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  vehicleCount: integer("vehicle_count").notNull(),
  currentProcess: text("current_process").notNull(),
  mainPain: varchar("main_pain", { length: 100 }).notNull(),
  privacyConsent: boolean("privacy_consent").default(false).notNull(),
  calculatedScore: integer("calculated_score").notNull(),
  recommendations: text("recommendations").notNull(),
  source: varchar("source", { length: 60 }).default("Website").notNull(),
  salesStatus: varchar("sales_status", { length: 40 }).default("Neu").notNull(),
  nextFollowUp: varchar("next_follow_up", { length: 20 }).default("").notNull(),
  salesNotes: text("sales_notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 150 }).default("").notNull(),
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  phone: varchar("phone", { length: 50 }).default("").notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  message: text("message").notNull(),
  privacyConsent: boolean("privacy_consent").default(false).notNull(),
  status: varchar("status", { length: 30 }).default("Neu").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationOutbox = pgTable("notification_outbox", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(),
  recipient: varchar("recipient", { length: 254 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  payload: text("payload").default("").notNull(),
  status: varchar("status", { length: 30 }).default("Ausstehend").notNull(),
  providerMessageId: varchar("provider_message_id", { length: 150 }).default("").notNull(),
  errorMessage: text("error_message").default("").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrationConfigs = pgTable("integration_configs", {
  id: serial("id").primaryKey(),
  provider: varchar("provider", { length: 80 }).notNull(),
  purpose: varchar("purpose", { length: 120 }).notNull(),
  status: varchar("status", { length: 30 }).default("Nicht konfiguriert").notNull(),
  notes: text("notes").default("").notNull(),
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerAccounts = pgTable("customer_accounts", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("customer_accounts_email_unique").on(table.email)]);

export const legalSettings = pgTable("legal_settings", {
  id: serial("id").primaryKey(),
  businessName: varchar("business_name", { length: 200 }).default("").notNull(),
  legalForm: varchar("legal_form", { length: 100 }).default("").notNull(),
  street: varchar("street", { length: 200 }).default("").notNull(),
  postalCode: varchar("postal_code", { length: 20 }).default("").notNull(),
  city: varchar("city", { length: 100 }).default("").notNull(),
  country: varchar("country", { length: 100 }).default("Deutschland").notNull(),
  email: varchar("email", { length: 254 }).default("").notNull(),
  phone: varchar("phone", { length: 60 }).default("").notNull(),
  representative: varchar("representative", { length: 200 }).default("").notNull(),
  registryCourt: varchar("registry_court", { length: 150 }).default("").notNull(),
  registryNumber: varchar("registry_number", { length: 100 }).default("").notNull(),
  vatId: varchar("vat_id", { length: 50 }).default("").notNull(),
  editorialResponsible: varchar("editorial_responsible", { length: 200 }).default("").notNull(),
  hostingProvider: varchar("hosting_provider", { length: 200 }).default("").notNull(),
  hostingLocation: varchar("hosting_location", { length: 200 }).default("").notNull(),
  processors: text("processors").default("").notNull(),
  serverLogDays: integer("server_log_days").default(14).notNull(),
  inquiryRetentionMonths: integer("inquiry_retention_months").default(12).notNull(),
  privacyContact: varchar("privacy_contact", { length: 254 }).default("").notNull(),
  bookingUrl: varchar("booking_url", { length: 500 }).default("").notNull(),
  reviewed: boolean("reviewed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actor: varchar("actor", { length: 100 }).default("System").notNull(),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: integer("entity_id"),
  details: text("details").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
