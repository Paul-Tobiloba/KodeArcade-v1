CREATE TABLE "learner_progress" (
	"classroom_id" text NOT NULL,
	"learner_id" text NOT NULL,
	"course_key" text NOT NULL,
	"curriculum_version" text NOT NULL,
	"revision" integer NOT NULL,
	"document" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_progress_classroom_id_learner_id_course_key_curriculum_version_pk" PRIMARY KEY("classroom_id","learner_id","course_key","curriculum_version"),
	CONSTRAINT "progress_revision" CHECK ("learner_progress"."revision" >= 1),
	CONSTRAINT "progress_document_size" CHECK (octet_length("learner_progress"."document"::text) <= 1048576)
);
--> statement-breakpoint
ALTER TABLE "learner_progress" ADD CONSTRAINT "progress_enrollment_fk" FOREIGN KEY ("classroom_id","learner_id") REFERENCES "public"."enrollment"("classroom_id","learner_id") ON DELETE cascade ON UPDATE no action;