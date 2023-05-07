/*
  Warnings:

  - Added the required column `slug` to the `Color` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_Color" ("id") SELECT "id" FROM "Color";
DROP TABLE "Color";
ALTER TABLE "new_Color" RENAME TO "Color";
CREATE UNIQUE INDEX "Color_id_key" ON "Color"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
