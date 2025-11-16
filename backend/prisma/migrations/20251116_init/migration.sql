-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "runtime" INTEGER,
    "plot" TEXT,
    "posterUrl" TEXT,
    "director" TEXT,
    "genre" TEXT,
    "actors" TEXT,
    "imdbId" TEXT,
    "tmdbId" INTEGER,
    "sourceType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Copy" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_imdbId_key" ON "Movie"("imdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
