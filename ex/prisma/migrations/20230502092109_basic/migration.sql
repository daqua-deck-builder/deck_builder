-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Color" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pronounce" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "story" TEXT,
    "format" INTEGER NOT NULL,
    "cost" TEXT NOT NULL,
    "burst" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "text" TEXT,
    "level" INTEGER,
    "lrig" TEXT,
    "timing" TEXT,
    "rarerity" TEXT NOT NULL,
    "color_card" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ColorCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "card" INTEGER NOT NULL,
    "color" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Color_id_key" ON "Color"("id");
