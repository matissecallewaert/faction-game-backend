-- AlterTable
ALTER TABLE `Tile` MODIFY `resourceType` ENUM('BASE', 'RESOURCE', 'EMPTY') NOT NULL DEFAULT 'EMPTY';
