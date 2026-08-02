CREATE TABLE "auth_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "auth_users_email_unique"
  ON "auth_users" ("email");

CREATE TABLE "auth_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "expires_at" timestamp with time zone NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  "ip_address" text,
  "user_agent" text,
  "user_id" uuid NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "auth_sessions_token_unique"
  ON "auth_sessions" ("token");
CREATE INDEX "auth_sessions_user_id_idx"
  ON "auth_sessions" ("user_id");
CREATE INDEX "auth_sessions_expires_at_idx"
  ON "auth_sessions" ("expires_at");

CREATE TABLE "auth_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp with time zone,
  "refresh_token_expires_at" timestamp with time zone,
  "scope" text,
  "password" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "auth_accounts_provider_account_unique"
  ON "auth_accounts" ("provider_id", "account_id");
CREATE INDEX "auth_accounts_user_id_idx"
  ON "auth_accounts" ("user_id");

CREATE TABLE "auth_verifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "auth_verifications_identifier_idx"
  ON "auth_verifications" ("identifier");
CREATE INDEX "auth_verifications_expires_at_idx"
  ON "auth_verifications" ("expires_at");
