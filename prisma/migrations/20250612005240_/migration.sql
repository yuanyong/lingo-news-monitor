/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `WebsetItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WebsetItem" ADD COLUMN     "imageUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "WebsetItem_url_key" ON "WebsetItem"("url");
