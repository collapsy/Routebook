CREATE TABLE "place_external_references" (
  "id" uuid PRIMARY KEY NOT NULL,
  "place_id" uuid NOT NULL,
  "provider" varchar(80) NOT NULL,
  "external_id" varchar(200) NOT NULL,
  "source_license" text NOT NULL,
  "source_url" text,
  "collected_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "place_external_references_place_id_places_id_fk"
    FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "place_external_references_provider_external_id_unique"
  ON "place_external_references" USING btree ("provider", "external_id");
--> statement-breakpoint
CREATE INDEX "place_external_references_place_id_idx"
  ON "place_external_references" USING btree ("place_id");
