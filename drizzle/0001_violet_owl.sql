CREATE TABLE "audit_event" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_session" (
	"session_id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"classroom_id" text NOT NULL,
	"learner_id" text NOT NULL,
	"credential_version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "management_operation" (
	"actor_id" text NOT NULL,
	"key" text NOT NULL,
	"digest" text NOT NULL,
	"resource_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "management_operation_actor_id_key_pk" PRIMARY KEY("actor_id","key")
);
--> statement-breakpoint
ALTER TABLE "learner" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_id_auth_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_session" ADD CONSTRAINT "learner_session_session_id_auth_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."auth_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_session" ADD CONSTRAINT "learner_session_organization_id_classroom_id_classroom_organization_id_id_fk" FOREIGN KEY ("organization_id","classroom_id") REFERENCES "public"."classroom"("organization_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_session" ADD CONSTRAINT "learner_session_organization_id_learner_id_learner_organization_id_id_fk" FOREIGN KEY ("organization_id","learner_id") REFERENCES "public"."learner"("organization_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_session" ADD CONSTRAINT "learner_session_classroom_id_learner_id_enrollment_classroom_id_learner_id_fk" FOREIGN KEY ("classroom_id","learner_id") REFERENCES "public"."enrollment"("classroom_id","learner_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_operation" ADD CONSTRAINT "management_operation_actor_id_auth_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;