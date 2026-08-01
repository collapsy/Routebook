ALTER TABLE "itinerary_activities"
ADD COLUMN "decision_id" uuid;
--> statement-breakpoint
ALTER TABLE "itinerary_activities"
ADD CONSTRAINT "itinerary_activities_decision_id_decisions_id_fk"
FOREIGN KEY ("decision_id") REFERENCES "public"."decisions"("id")
ON DELETE SET NULL ON UPDATE NO ACTION;
--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_activities_decision_id_unique"
ON "itinerary_activities" USING btree ("decision_id")
WHERE "decision_id" IS NOT NULL;
