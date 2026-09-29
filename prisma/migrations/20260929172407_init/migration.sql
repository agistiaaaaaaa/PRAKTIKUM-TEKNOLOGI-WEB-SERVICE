-- CreateTable
CREATE TABLE `Kategori` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaKategori` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `Kategori_namaKategori_key`(`namaKategori`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destinasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(150) NOT NULL,
    `kategoriId` INTEGER NOT NULL,
    `lokasi` VARCHAR(150) NULL,
    `deskripsi` TEXT NULL,
    `hargaTiket` DOUBLE NOT NULL,
    `ratingRata` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ulasan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `destinasiId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `komentar` TEXT NOT NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Ulasan_destinasiId_tanggal_idx`(`destinasiId`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fasilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `destinasiId` INTEGER NOT NULL,
    `namaFasilitas` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Destinasi` ADD CONSTRAINT `Destinasi_kategoriId_fkey` FOREIGN KEY (`kategoriId`) REFERENCES `Kategori`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ulasan` ADD CONSTRAINT `Ulasan_destinasiId_fkey` FOREIGN KEY (`destinasiId`) REFERENCES `Destinasi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Fasilitas` ADD CONSTRAINT `Fasilitas_destinasiId_fkey` FOREIGN KEY (`destinasiId`) REFERENCES `Destinasi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
