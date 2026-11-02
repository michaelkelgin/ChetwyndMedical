CREATE TABLE "cmsa_records" (
	"key" text PRIMARY KEY,
	"kind" text NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cmsa_records_kind_idx" ON "cmsa_records" ("kind");