/*
  Warnings:

  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.
  - Added the required column `processing` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_no` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sort` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Deck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "is_deck" BOOLEAN NOT NULL,
    "lrig" TEXT NOT NULL,
    "assists" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "ancestor" INTEGER,
    "owner" INTEGER NOT NULL,
    "format" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "product_no" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "last_fetched" DATETIME,
    "last_converted" DATETIME,
    "sort" INTEGER NOT NULL,
    "processing" BOOLEAN NOT NULL
);
INSERT INTO "new_Product" ("id", "name") SELECT "id", "name" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
