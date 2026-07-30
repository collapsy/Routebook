CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"trip_id" uuid NOT NULL,
	"place_id" uuid NOT NULL,
	"status" varchar(24) NOT NULL,
	"context_snapshot" jsonb NOT NULL,
	"context_fingerprint" varchar(64) NOT NULL,
	"reasons" jsonb NOT NULL,
	"limitations" jsonb NOT NULL,
	"score" double precision NOT NULL,
	"confidence_level" varchar(16) NOT NULL,
	"confidence_basis" jsonb NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"generator" varchar(24) NOT NULL,
	"policy_version" varchar(80) NOT NULL,
	"generated_at" timestamp with time zone NOT NULL,
	"presented_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"linked_decision_id" uuid,
	"status_reason" varchar(160),
	"superseded_by_recommendation_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "recommendations_status_check" CHECK ("status" IN ('generated', 'presented', 'accepted', 'rejected', 'expired', 'invalidated', 'superseded')),
	CONSTRAINT "recommendations_confidence_level_check" CHECK ("confidence_level" IN ('low', 'medium', 'high')),
	CONSTRAINT "recommendations_generator_check" CHECK ("generator" IN ('deterministic', 'manual')),
	CONSTRAINT "recommendations_score_check" CHECK ("score" >= 0),
	CONSTRAINT "recommendations_validity_check" CHECK ("expires_at" IS NULL OR "expires_at" > "valid_from")
);
--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_trip_id_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_superseded_by_recommendation_id_fk" FOREIGN KEY ("superseded_by_recommendation_id") REFERENCES "public"."recommendations"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "recommendations_trip_id_idx" ON "recommendations" USING btree ("trip_id");
--> statement-breakpoint
CREATE INDEX "recommendations_trip_status_idx" ON "recommendations" USING btree ("trip_id", "status");
--> statement-breakpoint
CREATE UNIQUE INDEX "recommendations_active_context_unique" ON "recommendations" USING btree ("trip_id", "place_id", "context_fingerprint") WHERE "status" IN ('generated', 'presented');
