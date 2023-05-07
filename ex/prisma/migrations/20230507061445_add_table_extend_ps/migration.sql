-- CreateTable
CREATE TABLE "ExtendParameterSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "method" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtendParameterSetting_slug_key" ON "ExtendParameterSetting"("slug");
