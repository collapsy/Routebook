CREATE TABLE "personal_account_ownerships" (
  "user_id" uuid PRIMARY KEY REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "personal_account_ownerships_account_id_unique"
  ON "personal_account_ownerships" ("account_id");
