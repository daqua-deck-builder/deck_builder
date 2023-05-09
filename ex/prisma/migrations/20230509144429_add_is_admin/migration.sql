-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "last_login" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("created_at", "id", "last_login", "name", "password", "theme") SELECT "created_at", "id", "last_login", "name", "password", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
