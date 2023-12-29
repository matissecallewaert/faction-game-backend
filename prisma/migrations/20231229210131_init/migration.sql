/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Game` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `currentGame` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `gameId` VARCHAR(191) NOT NULL,
    `gameName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Game_id_key` ON `Game`(`id`);

-- AddForeignKey
ALTER TABLE `currentGame` ADD CONSTRAINT `currentGame_gameName_gameId_fkey` FOREIGN KEY (`gameName`, `gameId`) REFERENCES `Game`(`name`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
