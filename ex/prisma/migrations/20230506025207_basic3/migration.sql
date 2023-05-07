/*
  Warnings:

  - You are about to alter the column `format` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

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
    "format" INTEGER NOT NULL
);
INSERT INTO "new_Card" ("card_type", "color", "cost", "format", "has_lb", "id", "img", "klass", "lb_text", "level", "limit", "lrig", "name", "power", "pronounce", "rarity", "skills", "slug", "story", "team", "team_piece", "timing") SELECT "card_type", "color", "cost", "format", "has_lb", "id", "img", "klass", "lb_text", "level", "limit", "lrig", "name", "power", "pronounce", "rarity", "skills", "slug", "story", "team", "team_piece", "timing" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
