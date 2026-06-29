-- Rename the login identifier while preserving existing user records.
ALTER TABLE "public"."users" RENAME COLUMN "email" TO "username";

ALTER TABLE "public"."users"
RENAME CONSTRAINT "users_email_key" TO "users_username_key";
