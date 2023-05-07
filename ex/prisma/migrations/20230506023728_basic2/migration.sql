/*
  Warnings:

  - You are about to drop the column `burst` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `color_card` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `rarerity` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Card` table. All the data in the column will be lost.
  - Added the required column `card_type` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `has_lb` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `klass` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `limit` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rarity` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skills` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_piece` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Made the column `level` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lrig` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `story` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timing` on table `Card` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pronounce" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "card_type" TEXT NOT NULL,
    "lrig" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "klass" TEXT NOT NULL,
    "cost" TEXT NOT NULL,
    "limit" TEXT NOT NULL,
    "power" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "team_piece" BOOLEAN NOT NULL,
    "timing" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "has_lb" BOOLEAN NOT NULL,
    "lb_text" TEXT,
    "skills" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "format" TEXT NOT NULL
);
INSERT INTO "new_Card" ("cost", "format", "id", "level", "lrig", "name", "power", "pronounce", "slug", "story", "timing") SELECT "cost", "format", "id", "level", "lrig", "name", "power", "pronounce", "slug", "story", "timing" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
