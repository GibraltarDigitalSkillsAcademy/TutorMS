-- CreateTable
CREATE TABLE "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "instructorId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDatetime" DATETIME NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "rruleFreq" TEXT,
    "rruleInterval" INTEGER,
    "rruleByDay" TEXT,
    "rruleUntil" DATETIME,
    "rruleCount" INTEGER,
    CONSTRAINT "Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Class_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("description", "durationMinutes", "id", "instructorId", "name", "rruleByDay", "rruleCount", "rruleFreq", "rruleInterval", "rruleUntil", "startDatetime", "timezone") SELECT "description", "durationMinutes", "id", "instructorId", "name", "rruleByDay", "rruleCount", "rruleFreq", "rruleInterval", "rruleUntil", "startDatetime", "timezone" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
CREATE TABLE "new_Instructor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "under_18" BOOLEAN NOT NULL,
    "from_industry" BOOLEAN NOT NULL,
    "from_education" BOOLEAN NOT NULL,
    "first_aid_trained" BOOLEAN NOT NULL,
    "contact_number" TEXT NOT NULL DEFAULT 'NONE',
    "contact_email" TEXT NOT NULL DEFAULT 'NONE',
    "role" TEXT NOT NULL DEFAULT 'INSTRUCTOR',
    "archived" BOOLEAN NOT NULL
);
INSERT INTO "new_Instructor" ("archived", "first_aid_trained", "from_education", "from_industry", "id", "name", "under_18") SELECT "archived", "first_aid_trained", "from_education", "from_industry", "id", "name", "under_18" FROM "Instructor";
DROP TABLE "Instructor";
ALTER TABLE "new_Instructor" RENAME TO "Instructor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
