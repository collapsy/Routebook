CREATE TABLE "decisions" (
  "id" uuid PRIMARY KEY NOT NULL,
  "trip_id" uuid NOT NULL,
  "recommendation_id" uuid,
  "actor_participant_id" varchar(160) NOT NULL,
  "decided_at" timestamp with time zone NOT NULL,
  "type" varchar(32) NOT NULL,
  "chosen_option" jsonb NOT NULL,
  "context_snapshot" jsonb NOT NULL,
  "effect" jsonb NOT NULL,
  "idempotency_key" varchar(180) NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "decisions_type_check" CHECK ("type" IN ('save-place', 'add-to-itinerary'))
);
--> statement-breakpoint
ALTER TABLE "decisions"
  ADD CONSTRAINT "decisions_trip_id_trips_id_fk"
  FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "decisions"
  ADD CONSTRAINT "decisions_recommendation_id_recommendations_id_fk"
  FOREIGN KEY ("recommendation_id") REFERENCES "public"."recommendations"("id")
  ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "decisions_trip_idempotency_unique"
  ON "decisions" USING btree ("trip_id", "idempotency_key");
--> statement-breakpoint
CREATE UNIQUE INDEX "decisions_recommendation_type_unique"
  ON "decisions" USING btree ("recommendation_id", "type")
  WHERE "recommendation_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "decisions_trip_id_idx"
  ON "decisions" USING btree ("trip_id");
--> statement-breakpoint
CREATE INDEX "decisions_recommendation_id_idx"
  ON "decisions" USING btree ("recommendation_id");
--> statement-breakpoint
ALTER TABLE "recommendations"
  ADD CONSTRAINT "recommendations_linked_decision_id_decisions_id_fk"
  FOREIGN KEY ("linked_decision_id") REFERENCES "public"."decisions"("id")
  ON DELETE restrict ON UPDATE no action;
