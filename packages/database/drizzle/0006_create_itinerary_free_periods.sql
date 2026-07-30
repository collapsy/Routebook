CREATE TABLE "itinerary_free_periods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"itinerary_day_id" uuid NOT NULL,
	"mode" varchar(24) NOT NULL,
	"start_time" varchar(5),
	"duration_minutes" integer,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itinerary_free_periods" ADD CONSTRAINT "itinerary_free_periods_itinerary_day_id_itinerary_days_id_fk" FOREIGN KEY ("itinerary_day_id") REFERENCES "public"."itinerary_days"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "itinerary_free_periods_day_order_unique" ON "itinerary_free_periods" USING btree ("itinerary_day_id","order");
