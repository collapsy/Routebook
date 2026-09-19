ALTER TABLE "itinerary_proposals"
ADD COLUMN "generation_scope" varchar(16) DEFAULT 'INITIAL' NOT NULL;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals"
ADD COLUMN "generation_context" jsonb;
--> statement-breakpoint
ALTER TABLE "itinerary_proposals"
ADD CONSTRAINT "itinerary_proposals_generation_scope_check"
CHECK ("generation_scope" in ('INITIAL', 'REPLAN'));
