-- CreateTable
CREATE TABLE "Copy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "movieId" TEXT NOT NULL,
    "format" TEXT,
    "edition" TEXT,
    "region" TEXT,
    "distributor" TEXT,
    "upc" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "condition" TEXT,
    "notes" TEXT,
    "location" TEXT,
    "hasSlipcover" BOOLEAN NOT NULL DEFAULT false,
    "isSealed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Copy_movieId_idx" ON "Copy"("movieId");

-- CreateIndex
CREATE INDEX "Copy_format_idx" ON "Copy"("format");

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing physical media data to Copy table
-- For each movie that has physicalFormat data, create a Copy record
INSERT INTO "Copy" ("id", "createdAt", "updatedAt", "movieId", "format", "distributor", "upc", "notes")
SELECT
    gen_random_uuid(),
    "createdAt",
    "updatedAt",
    "id",
    "physicalFormat",
    "distributor",
    "upc",
    "notes"
FROM "Movie"
WHERE "physicalFormat" IS NOT NULL OR "distributor" IS NOT NULL OR "upc" IS NOT NULL;

-- Drop old physical media columns from Movie table
ALTER TABLE "Movie" DROP COLUMN "physicalFormat";
ALTER TABLE "Movie" DROP COLUMN "distributor";
ALTER TABLE "Movie" DROP COLUMN "upc";
ALTER TABLE "Movie" DROP COLUMN "notes";
