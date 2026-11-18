-- AlterEnum
ALTER TYPE "BlockType" ADD VALUE 'VIDEO';

-- CreateTable
CREATE TABLE "display_screens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DisplayScreenToPost" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DisplayScreenToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "display_screens_slug_key" ON "display_screens"("slug");

-- CreateIndex
CREATE INDEX "_DisplayScreenToPost_B_index" ON "_DisplayScreenToPost"("B");

-- AddForeignKey
ALTER TABLE "_DisplayScreenToPost" ADD CONSTRAINT "_DisplayScreenToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "display_screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DisplayScreenToPost" ADD CONSTRAINT "_DisplayScreenToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
