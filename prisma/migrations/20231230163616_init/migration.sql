-- AlterTable
ALTER TABLE `Faction` MODIFY `gold` INTEGER NOT NULL DEFAULT 1000,
    MODIFY `score` INTEGER NOT NULL DEFAULT 0,
    MODIFY `land` INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE `Tile` MODIFY `factionId` INTEGER NOT NULL DEFAULT -1;