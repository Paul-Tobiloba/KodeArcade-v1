CREATE TABLE "school_invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"token_digest" text NOT NULL,
	"created_by" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "school_invitation_token_digest_unique" UNIQUE("token_digest"),
	CONSTRAINT "school_invitation_role" CHECK ("school_invitation"."role" in ('teacher', 'school_admin'))
);
--> statement-breakpoint
ALTER TABLE "school_invitation" ADD CONSTRAINT "school_invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_invitation" ADD CONSTRAINT "school_invitation_created_by_auth_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."auth_user"("id") ON DELETE no action ON UPDATE no action;