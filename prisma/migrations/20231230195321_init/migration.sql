-- DropForeignKey
ALTER TABLE `Faction` DROP FOREIGN KEY `Faction_gameName_gameId_fkey`;

-- DropForeignKey
ALTER TABLE `Tile` DROP FOREIGN KEY `Tile_gameName_gameId_fkey`;

-- DropForeignKey
ALTER TABLE `Unit` DROP FOREIGN KEY `Unit_factionId_gameId_fkey`;

-- AddForeignKey
ALTER TABLE `Tile` ADD CONSTRAINT `Tile_gameName_gameId_fkey` FOREIGN KEY (`gameName`, `gameId`) REFERENCES `Game`(`name`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_factionId_gameId_fkey` FOREIGN KEY (`factionId`, `gameId`) REFERENCES `Faction`(`id`, `gameId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faction` ADD CONSTRAINT `Faction_gameName_gameId_fkey` FOREIGN KEY (`gameName`, `gameId`) REFERENCES `Game`(`name`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;
