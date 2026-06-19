-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_task_id_fkey";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "subscription_id" TEXT,
ALTER COLUMN "task_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
