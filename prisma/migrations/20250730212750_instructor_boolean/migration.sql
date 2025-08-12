/*
  Warnings:

  - You are about to alter the column `first_aid_trained` on the `Instructor` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `from_education` on the `Instructor` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `from_industry` on the `Instructor` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `under_18` on the `Instructor` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Instructor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "under_18" BOOLEAN NOT NULL,
    "from_industry" BOOLEAN NOT NULL,
    "from_education" BOOLEAN NOT NULL,
    "first_aid_trained" BOOLEAN NOT NULL,
    "archived" BOOLEAN NOT NULL
);
INSERT INTO "new_Instructor" ("archived", "first_aid_trained", "from_education", "from_industry", "id", "name", "under_18") SELECT "archived", "first_aid_trained", "from_education", "from_industry", "id", "name", "under_18" FROM "Instructor";
DROP TABLE "Instructor";
ALTER TABLE "new_Instructor" RENAME TO "Instructor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
