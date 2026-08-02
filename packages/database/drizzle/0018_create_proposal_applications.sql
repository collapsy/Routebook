CREATE TABLE IF NOT EXISTS "proposal_applications" (
  "id" uuid PRIMARY KEY,
  "trip_id" uuid NOT NULL REFERENCES "trips"("id") ON DELETE CASCADE,
  "itinerary_id" uuid NOT NULL REFERENCES "itineraries"("id") ON DELETE CASCADE,
  "itinerary_proposal_id" uuid NOT NULL REFERENCES "itinerary_proposals"("id") ON DELETE CASCADE,
  "idempotency_key" text NOT NULL,
  "request_fingerprint" char(64) NOT NULL,
  "request_payload" jsonb NOT NULL,
  "application_type" text NOT NULL,
  "status" text NOT NULL,
  "expected_itinerary_version" integer NOT NULL,
  "resulting_itinerary_version" integer,
  "actor_type" text NOT NULL,
  "actor_id" text,
  "started_at" timestamp with time zone NOT NULL,
  "completed_at" timestamp with time zone,
  "failure_code" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "proposal_applications_idempotency_key_not_blank"
    CHECK (btrim("idempotency_key") <> ''),
  CONSTRAINT "proposal_applications_request_fingerprint_format"
    CHECK ("request_fingerprint" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "proposal_applications_request_payload_object"
    CHECK (jsonb_typeof("request_payload") = 'object'),
  CONSTRAINT "proposal_applications_application_type"
    CHECK ("application_type" IN ('full', 'partial')),
  CONSTRAINT "proposal_applications_status"
    CHECK ("status" IN ('started', 'succeeded', 'failed')),
  CONSTRAINT "proposal_applications_expected_version_positive"
    CHECK ("expected_itinerary_version" > 0),
  CONSTRAINT "proposal_applications_resulting_version_positive"
    CHECK (
      "resulting_itinerary_version" IS NULL
      OR "resulting_itinerary_version" > 0
    ),
  CONSTRAINT "proposal_applications_actor_type_not_blank"
    CHECK (btrim("actor_type") <> ''),
  CONSTRAINT "proposal_applications_actor_id_not_blank"
    CHECK ("actor_id" IS NULL OR btrim("actor_id") <> ''),
  CONSTRAINT "proposal_applications_failure_code_not_blank"
    CHECK ("failure_code" IS NULL OR btrim("failure_code") <> ''),
  CONSTRAINT "proposal_applications_timeline"
    CHECK ("completed_at" IS NULL OR "completed_at" >= "started_at"),
  CONSTRAINT "proposal_applications_lifecycle"
    CHECK (
      (
        "status" = 'started'
        AND "completed_at" IS NULL
        AND "resulting_itinerary_version" IS NULL
        AND "failure_code" IS NULL
      )
      OR (
        "status" = 'succeeded'
        AND "completed_at" IS NOT NULL
        AND "resulting_itinerary_version" IS NOT NULL
        AND "failure_code" IS NULL
      )
      OR (
        "status" = 'failed'
        AND "completed_at" IS NOT NULL
        AND "resulting_itinerary_version" IS NULL
        AND "failure_code" IS NOT NULL
      )
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS "proposal_applications_proposal_idempotency_unique"
  ON "proposal_applications" ("itinerary_proposal_id", "idempotency_key");

CREATE INDEX IF NOT EXISTS "proposal_applications_trip_started_at_idx"
  ON "proposal_applications" ("trip_id", "started_at" DESC);

CREATE INDEX IF NOT EXISTS "proposal_applications_itinerary_started_at_idx"
  ON "proposal_applications" ("itinerary_id", "started_at" DESC);

CREATE INDEX IF NOT EXISTS "proposal_applications_status_started_at_idx"
  ON "proposal_applications" ("status", "started_at" DESC);
