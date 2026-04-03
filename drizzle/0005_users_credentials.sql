CREATE TABLE "users" (
  "email" text PRIMARY KEY NOT NULL,
  "name" text,
  "password_hash" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);
