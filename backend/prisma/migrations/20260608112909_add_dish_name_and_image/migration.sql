-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "dishImage" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "dishName" TEXT;

-- Встановлюємо значення за замовчуванням для існуючих рядків
UPDATE "OrderItem" SET "dishName" = 'Страва', "dishImage" = '' WHERE "dishName" IS NULL;

-- Тепер робимо колонки обов'язковими
ALTER TABLE "OrderItem" ALTER COLUMN "dishImage" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "dishImage" SET DEFAULT '';
ALTER TABLE "OrderItem" ALTER COLUMN "dishName" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "dishName" SET DEFAULT '';