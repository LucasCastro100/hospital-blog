-- AlterTable
ALTER TABLE "display_screens"
  ADD COLUMN "paused" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pinnedPostId" TEXT,
  ADD COLUMN "currentPostId" TEXT,
  ADD COLUMN "intervalMs" INTEGER,
  ADD COLUMN "stateVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastCommandAt" TIMESTAMP(3);
