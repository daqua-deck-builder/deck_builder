/*
  Warnings:

  - Added the required column `login_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "login_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "last_login" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "use_allstar" BOOLEAN NOT NULL DEFAULT true,
    "use_key_selection" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("created_at", "id", "is_admin", "last_login", "name", "password", "theme") SELECT "created_at", "id", "is_admin", "last_login", "name", "password", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_login_id_key" ON "User"("login_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
