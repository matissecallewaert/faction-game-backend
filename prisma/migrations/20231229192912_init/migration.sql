-- CreateTable
CREATE TABLE `Game` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `height` INTEGER NOT NULL,
    `width` INTEGER NOT NULL,
    `amountOfMoves` INTEGER NOT NULL,

    PRIMARY KEY (`name`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gameId` VARCHAR(191) NOT NULL,
    `gameName` VARCHAR(191) NOT NULL,
    `resourceType` ENUM('BASE', 'RESOURCE', 'EMPTY') NOT NULL,
    `faction` INTEGER NOT NULL,
    `unit` VARCHAR(191) NULL,
    `bombed` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Tile` ADD CONSTRAINT `Tile_gameName_gameId_fkey` FOREIGN KEY (`gameName`, `gameId`) REFERENCES `Game`(`name`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
