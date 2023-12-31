-- DropIndex
DROP INDEX `currentGame_gameName_gameId_fkey` ON `currentGame`;

-- CreateTable
CREATE TABLE `gameStats` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `winner` INTEGER NOT NULL,
    `second` INTEGER NOT NULL,
    `third` INTEGER NOT NULL,
    `winnerScore` INTEGER NOT NULL,
    `secondScore` INTEGER NOT NULL,
    `thirdScore` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
