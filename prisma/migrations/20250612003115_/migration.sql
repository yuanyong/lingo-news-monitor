-- CreateTable
CREATE TABLE "Webset" (
    "id" TEXT NOT NULL,
    "websetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsetItem" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "websetId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "enrichments" JSONB,
    "evaluations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsetItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webset_websetId_key" ON "Webset"("websetId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsetItem_itemId_key" ON "WebsetItem"("itemId");

-- AddForeignKey
ALTER TABLE "WebsetItem" ADD CONSTRAINT "WebsetItem_websetId_fkey" FOREIGN KEY ("websetId") REFERENCES "Webset"("websetId") ON DELETE RESTRICT ON UPDATE CASCADE;
