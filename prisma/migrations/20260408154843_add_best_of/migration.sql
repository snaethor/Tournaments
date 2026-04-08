-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "matchIndex" INTEGER NOT NULL,
    "team1Id" TEXT,
    "team2Id" TEXT,
    "winnerId" TEXT,
    "bestOf" INTEGER NOT NULL DEFAULT 1,
    "team1Score" INTEGER NOT NULL DEFAULT 0,
    "team2Score" INTEGER NOT NULL DEFAULT 0,
    "chosenMap" TEXT,
    "chosenSide" TEXT,
    "chosenServer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("chosenMap", "chosenServer", "chosenSide", "createdAt", "id", "matchIndex", "round", "team1Id", "team2Id", "tournamentId", "winnerId") SELECT "chosenMap", "chosenServer", "chosenSide", "createdAt", "id", "matchIndex", "round", "team1Id", "team2Id", "tournamentId", "winnerId" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
CREATE TABLE "new_Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "teamCount" INTEGER NOT NULL,
    "playersPerTeam" INTEGER NOT NULL,
    "mapPool" TEXT NOT NULL DEFAULT '',
    "servers" TEXT NOT NULL DEFAULT '',
    "draftEnabled" BOOLEAN NOT NULL DEFAULT true,
    "draftTimer" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "hostToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "currentDraftTeamIndex" INTEGER NOT NULL DEFAULT 0,
    "currentDraftRound" INTEGER NOT NULL DEFAULT 1,
    "draftDirection" TEXT NOT NULL DEFAULT 'forward',
    "draftMode" TEXT NOT NULL DEFAULT 'snake',
    "roundBestOf" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Tournament" ("createdAt", "currentDraftRound", "currentDraftTeamIndex", "draftDirection", "draftEnabled", "draftMode", "draftTimer", "game", "hostToken", "id", "mapPool", "name", "playersPerTeam", "servers", "status", "teamCount", "updatedAt") SELECT "createdAt", "currentDraftRound", "currentDraftTeamIndex", "draftDirection", "draftEnabled", "draftMode", "draftTimer", "game", "hostToken", "id", "mapPool", "name", "playersPerTeam", "servers", "status", "teamCount", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
CREATE UNIQUE INDEX "Tournament_hostToken_key" ON "Tournament"("hostToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
