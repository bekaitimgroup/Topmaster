/*
  Warnings:

  - A unique constraint covering the columns `[task_id,executor_id]` on the table `bids` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "performed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "expires_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "task_photos" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_photos" (
    "id" TEXT NOT NULL,
    "executor_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_photos_task_id_idx" ON "task_photos"("task_id");

-- CreateIndex
CREATE INDEX "portfolio_photos_executor_id_idx" ON "portfolio_photos"("executor_id");

-- CreateIndex
CREATE INDEX "bids_task_id_idx" ON "bids"("task_id");

-- CreateIndex
CREATE INDEX "bids_executor_id_idx" ON "bids"("executor_id");

-- CreateIndex
CREATE UNIQUE INDEX "bids_task_id_executor_id_key" ON "bids"("task_id", "executor_id");

-- CreateIndex
CREATE INDEX "messages_task_id_created_at_idx" ON "messages"("task_id", "created_at");

-- CreateIndex
CREATE INDEX "payments_external_transaction_id_idx" ON "payments"("external_transaction_id");

-- CreateIndex
CREATE INDEX "tasks_status_category_id_created_at_idx" ON "tasks"("status", "category_id", "created_at");

-- CreateIndex
CREATE INDEX "tasks_customer_id_idx" ON "tasks"("customer_id");

-- CreateIndex
CREATE INDEX "tasks_selected_executor_id_idx" ON "tasks"("selected_executor_id");

-- AddForeignKey
ALTER TABLE "task_photos" ADD CONSTRAINT "task_photos_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_photos" ADD CONSTRAINT "portfolio_photos_executor_id_fkey" FOREIGN KEY ("executor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
