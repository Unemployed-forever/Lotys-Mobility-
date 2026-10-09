CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" varchar(100) DEFAULT 'System' NOT NULL,
	"action" varchar(120) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" integer,
	"details" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(150) DEFAULT '' NOT NULL,
	"contact_name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50) DEFAULT '' NOT NULL,
	"subject" varchar(160) NOT NULL,
	"message" text NOT NULL,
	"privacy_consent" boolean DEFAULT false NOT NULL,
	"status" varchar(30) DEFAULT 'Neu' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"email" varchar(254) NOT NULL,
	"name" varchar(120) NOT NULL,
	"password_hash" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"full_name" varchar(120) NOT NULL,
	"email" varchar(254) DEFAULT '' NOT NULL,
	"phone" varchar(50) DEFAULT '' NOT NULL,
	"license_check_due" varchar(20) DEFAULT '' NOT NULL,
	"status" varchar(30) DEFAULT 'Aktiv' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fleet_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(150) NOT NULL,
	"contact_name" varchar(100) NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"vehicle_count" integer NOT NULL,
	"current_process" text NOT NULL,
	"main_pain" varchar(100) NOT NULL,
	"privacy_consent" boolean DEFAULT false NOT NULL,
	"calculated_score" integer NOT NULL,
	"recommendations" text NOT NULL,
	"source" varchar(60) DEFAULT 'Website' NOT NULL,
	"sales_status" varchar(40) DEFAULT 'Neu' NOT NULL,
	"next_follow_up" varchar(20) DEFAULT '' NOT NULL,
	"sales_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fleet_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"vehicle_id" integer,
	"category" varchar(60) NOT NULL,
	"amount_cents" integer NOT NULL,
	"occurred_on" varchar(20) NOT NULL,
	"vendor" varchar(150) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fleet_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"vehicle_id" integer,
	"title" varchar(200) NOT NULL,
	"category" varchar(60) DEFAULT 'Allgemein' NOT NULL,
	"due_date" varchar(20) DEFAULT '' NOT NULL,
	"priority" varchar(20) DEFAULT 'Normal' NOT NULL,
	"status" varchar(30) DEFAULT 'Offen' NOT NULL,
	"assignee" varchar(100) DEFAULT 'Arthur' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(80) NOT NULL,
	"purpose" varchar(120) NOT NULL,
	"status" varchar(30) DEFAULT 'Nicht konfiguriert' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "legal_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" varchar(200) DEFAULT '' NOT NULL,
	"legal_form" varchar(100) DEFAULT '' NOT NULL,
	"street" varchar(200) DEFAULT '' NOT NULL,
	"postal_code" varchar(20) DEFAULT '' NOT NULL,
	"city" varchar(100) DEFAULT '' NOT NULL,
	"country" varchar(100) DEFAULT 'Deutschland' NOT NULL,
	"email" varchar(254) DEFAULT '' NOT NULL,
	"phone" varchar(60) DEFAULT '' NOT NULL,
	"representative" varchar(200) DEFAULT '' NOT NULL,
	"registry_court" varchar(150) DEFAULT '' NOT NULL,
	"registry_number" varchar(100) DEFAULT '' NOT NULL,
	"vat_id" varchar(50) DEFAULT '' NOT NULL,
	"editorial_responsible" varchar(200) DEFAULT '' NOT NULL,
	"hosting_provider" varchar(200) DEFAULT '' NOT NULL,
	"hosting_location" varchar(200) DEFAULT '' NOT NULL,
	"processors" text DEFAULT '' NOT NULL,
	"server_log_days" integer DEFAULT 14 NOT NULL,
	"inquiry_retention_months" integer DEFAULT 12 NOT NULL,
	"privacy_contact" varchar(254) DEFAULT '' NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"recipient" varchar(254) NOT NULL,
	"subject" varchar(200) NOT NULL,
	"payload" text DEFAULT '' NOT NULL,
	"status" varchar(30) DEFAULT 'Ausstehend' NOT NULL,
	"provider_message_id" varchar(150) DEFAULT '' NOT NULL,
	"error_message" text DEFAULT '' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"industry" varchar(100) DEFAULT '' NOT NULL,
	"city" varchar(100) DEFAULT '' NOT NULL,
	"contact_name" varchar(100) DEFAULT '' NOT NULL,
	"contact_email" varchar(254) DEFAULT '' NOT NULL,
	"contact_phone" varchar(50) DEFAULT '' NOT NULL,
	"status" varchar(30) DEFAULT 'Interessent' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"license_plate" varchar(50) NOT NULL,
	"vehicle_model" varchar(100) NOT NULL,
	"issue" text NOT NULL,
	"priority" varchar(20) DEFAULT 'Medium' NOT NULL,
	"status" varchar(50) DEFAULT 'Neu' NOT NULL,
	"assigned_to" varchar(100) DEFAULT 'Arthur' NOT NULL,
	"contact_name" varchar(100) NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"contact_email" varchar(254) NOT NULL,
	"privacy_consent" boolean DEFAULT false NOT NULL,
	"admin_notes" text DEFAULT '' NOT NULL,
	"customer_visible_notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"document_type" varchar(80) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"storage_reference" text DEFAULT '' NOT NULL,
	"expires_on" varchar(20) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer,
	"license_plate" varchar(50) NOT NULL,
	"model" varchar(100) NOT NULL,
	"driver" varchar(100) NOT NULL,
	"next_hu" varchar(20) NOT NULL,
	"mileage" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'Bereit' NOT NULL,
	"tire_status" varchar(100) DEFAULT 'Allwetter - OK' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workshop_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"city" varchar(100) DEFAULT '' NOT NULL,
	"email" varchar(254) DEFAULT '' NOT NULL,
	"phone" varchar(50) DEFAULT '' NOT NULL,
	"services" text DEFAULT '' NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "customer_accounts_email_unique" ON "customer_accounts" USING btree ("email");