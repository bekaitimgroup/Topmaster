-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "car_make_id" TEXT,
ADD COLUMN     "car_model_id" TEXT,
ADD COLUMN     "car_year" INTEGER;

-- CreateTable
CREATE TABLE "car_makes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_local" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "car_makes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "car_models" (
    "id" TEXT NOT NULL,
    "make_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year_from" INTEGER,
    "year_to" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "car_models_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "car_models" ADD CONSTRAINT "car_models_make_id_fkey" FOREIGN KEY ("make_id") REFERENCES "car_makes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_car_make_id_fkey" FOREIGN KEY ("car_make_id") REFERENCES "car_makes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_car_model_id_fkey" FOREIGN KEY ("car_model_id") REFERENCES "car_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
