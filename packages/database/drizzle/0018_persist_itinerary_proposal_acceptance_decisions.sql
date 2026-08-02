ALTER TABLE "decisions" DROP CONSTRAINT "decisions_type_check";
--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_type_check"
CHECK ("type" IN ('save-place', 'add-to-itinerary', 'ignore-planning-risk', 'accept-itinerary-proposal'));
