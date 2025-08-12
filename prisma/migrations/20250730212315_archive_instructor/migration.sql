/*
  Warnings:

  - Added the required column `archived` to the `Instructor` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Instructor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "under_18" INTEGER NOT NULL,
    "from_industry" INTEGER NOT NULL,
    "from_education" INTEGER NOT NULL,
    "first_aid_trained" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL
);
INSERT INTO "new_Instructor" ("first_aid_trained", "from_education", "from_industry", "id", "name", "under_18") SELECT "first_aid_trained", "from_education", "from_industry", "id", "name", "under_18" FROM "Instructor";
DROP TABLE "Instructor";
ALTER TABLE "new_Instructor" RENAME TO "Instructor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
