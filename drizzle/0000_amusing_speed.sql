CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"imageUrl" varchar,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_imageUrl_unique" UNIQUE("imageUrl")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar DEFAULT 'Untitled Video' NOT NULL,
	"description" text,
	"script" jsonb NOT NULL,
	"audioUrl" varchar NOT NULL,
	"captions" jsonb NOT NULL,
	"imageUrls" varchar[],
	"voice" varchar DEFAULT 'en-US-JennyNeural' NOT NULL,
	"captionStyle" varchar DEFAULT 'classic' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'generating' NOT NULL,
	"downloadUrl" varchar,
	"createdBy" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "videos" ADD CONSTRAINT "videos_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
