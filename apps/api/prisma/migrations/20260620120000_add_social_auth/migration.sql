-- Make phone optional (social login users may not have a phone)
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;

-- Add unique constraint on email (was already nullable, now unique)
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");

-- Add telegram_id for Telegram Login Widget
ALTER TABLE "users" ADD COLUMN "telegram_id" TEXT;
ALTER TABLE "users" ADD CONSTRAINT "users_telegram_id_key" UNIQUE ("telegram_id");

-- Add google_id for Google OAuth
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;
ALTER TABLE "users" ADD CONSTRAINT "users_google_id_key" UNIQUE ("google_id");
