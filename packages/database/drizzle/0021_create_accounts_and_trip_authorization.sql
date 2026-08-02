CREATE TABLE "accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "status" varchar(24) NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "accounts_status_check"
    CHECK ("status" IN ('active', 'suspended'))
);

CREATE TABLE "account_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "role" varchar(24) NOT NULL,
  "status" varchar(24) NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "account_memberships_role_check"
    CHECK ("role" IN ('owner', 'editor', 'viewer')),
  CONSTRAINT "account_memberships_status_check"
    CHECK ("status" IN ('active', 'suspended', 'revoked'))
);

CREATE UNIQUE INDEX "account_memberships_account_user_unique"
  ON "account_memberships" ("account_id", "user_id");
CREATE INDEX "account_memberships_user_id_idx"
  ON "account_memberships" ("user_id");
CREATE INDEX "account_memberships_account_status_idx"
  ON "account_memberships" ("account_id", "status");

ALTER TABLE "trips"
  ADD COLUMN "account_id" uuid;

ALTER TABLE "trips"
  ADD CONSTRAINT "trips_account_id_accounts_id_fk"
  FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT;

CREATE INDEX "trips_account_id_idx"
  ON "trips" ("account_id");
