import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitToTournament } from "@/lib/socket-server";
import { pickRandom } from "@/lib/utils";
import { serializeTournament } from "@/lib/serialize";

const matchInclude = {
  team1: { include: { members: true, captain: true } },
  team2: { include: { members: true, captain: true } },
  winner: { include: { members: true, captain: true } },
};

const fullInclude = {
  teams: { include: { members: true, captain: true } },
  participants: true,
  matches: {
    orderBy: [{ round: "asc" as const }, { matchIndex: "asc" as const }],
    include: matchInclude,
  },
  draftPicks: {
    orderBy: { pickNumber: "asc" as const },
    include: { team: true, participant: true },
  },
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await params;
  try {
    const body = await req.json();
    const { action, hostToken, winnerId } = body;

    const rawT = await prisma.tournament.findUnique({ where: { id }, include: fullInclude });
    if (!rawT) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tournament = serializeTournament(rawT as any);
    if (tournament.hostToken !== hostToken) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const match = await prisma.match.findUnique({ where: { id: matchId }, include: matchInclude });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    if (action === "set-best-of") {
      const { bestOf } = body;
      if (![1, 3, 5].includes(bestOf)) return NextResponse.json({ error: "bestOf must be 1, 3, or 5" }, { status: 400 });
      const updated = await prisma.match.update({ where: { id: matchId }, data: { bestOf }, include: matchInclude });
      return NextResponse.json({ match: updated });
    }

    if (action === "setup") {
      const teams = [match.team1, match.team2].filter(Boolean);
      // Always split map and side between the two teams
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
      const mapChoosingTeam = shuffledTeams[0] ?? null;
      const sideChoosingTeam = shuffledTeams[1] ?? shuffledTeams[0] ?? null;
      const chosenMap = tournament.mapPool.length > 0 ? pickRandom(tournament.mapPool) : null;
      const chosenSide = sideChoosingTeam ? `${sideChoosingTeam.name} chooses side` : null;
      const chosenServer = tournament.servers.length > 0 ? pickRandom(tournament.servers) : null;
      const mapInfo = mapChoosingTeam && !chosenMap ? `${mapChoosingTeam.name} chooses map` : chosenMap;

      const updated = await prisma.match.update({
        where: { id: matchId },
        data: { chosenMap: mapInfo, chosenSide, chosenServer },
        include: matchInclude,
      });
      emitToTournament(id, "match:setup", { match: updated });
      return NextResponse.json({ match: updated });
    }

    if (action === "score") {
      // Increment score for one team in a series; auto-complete when threshold reached
      if (!winnerId) return NextResponse.json({ error: "Scoring team required" }, { status: 400 });
      if (match.winnerId) return NextResponse.json({ error: "Match already complete" }, { status: 400 });

      const isTeam1 = winnerId === match.team1Id;
      const isTeam2 = winnerId === match.team2Id;
      if (!isTeam1 && !isTeam2) return NextResponse.json({ error: "Invalid team" }, { status: 400 });

      const newTeam1Score = match.team1Score + (isTeam1 ? 1 : 0);
      const newTeam2Score = match.team2Score + (isTeam2 ? 1 : 0);
      const winsNeeded = Math.ceil((match.bestOf) / 2);
      const seriesWinnerId = newTeam1Score >= winsNeeded ? match.team1Id
        : newTeam2Score >= winsNeeded ? match.team2Id
        : null;

      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: {
          team1Score: newTeam1Score,
          team2Score: newTeam2Score,
          winnerId: seriesWinnerId ?? undefined,
          // Clear setup after each game so host presses "Set up match" again for the next game
          ...(!seriesWinnerId ? { chosenMap: null, chosenSide: null, chosenServer: null } : {}),
        },
        include: matchInclude,
      });

      if (seriesWinnerId) {
        // Advance winner in bracket
        const nextRound = match.round + 1;
        const nextMatchIndex = Math.floor(match.matchIndex / 2);
        const isTeam1Slot = match.matchIndex % 2 === 0;
        const nextMatch = await prisma.match.findFirst({
          where: { tournamentId: id, round: nextRound, matchIndex: nextMatchIndex },
        });
        if (nextMatch) {
          await prisma.match.update({
            where: { id: nextMatch.id },
            data: isTeam1Slot ? { team1Id: seriesWinnerId } : { team2Id: seriesWinnerId },
          });
        }
        const pendingMatches = await prisma.match.count({
          where: { tournamentId: id, winnerId: null, team1Id: { not: null }, team2Id: { not: null } },
        });
        if (pendingMatches === 0) {
          await prisma.tournament.update({ where: { id }, data: { status: "COMPLETED" } });
        }
      }

      const updatedT = serializeTournament(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (await prisma.tournament.findUnique({ where: { id }, include: fullInclude })) as any
      );
      emitToTournament(id, "match:result", { match: updatedMatch, tournament: updatedT });
      return NextResponse.json({ match: updatedMatch, tournament: updatedT });
    }

    if (action === "result") {
      if (!winnerId) return NextResponse.json({ error: "Winner required" }, { status: 400 });

      const updatedMatch = await prisma.match.update({
        where: { id: matchId },
        data: { winnerId },
        include: matchInclude,
      });

      // Advance winner in bracket
      const nextRound = match.round + 1;
      const nextMatchIndex = Math.floor(match.matchIndex / 2);
      const isTeam1Slot = match.matchIndex % 2 === 0;
      const nextMatch = await prisma.match.findFirst({
        where: { tournamentId: id, round: nextRound, matchIndex: nextMatchIndex },
      });
      if (nextMatch) {
        await prisma.match.update({
          where: { id: nextMatch.id },
          data: isTeam1Slot ? { team1Id: winnerId } : { team2Id: winnerId },
        });
      }

      const pendingMatches = await prisma.match.count({
        where: { tournamentId: id, winnerId: null, team1Id: { not: null }, team2Id: { not: null } },
      });
      if (pendingMatches === 0) {
        await prisma.tournament.update({ where: { id }, data: { status: "COMPLETED" } });
      }

      const updatedT = serializeTournament(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (await prisma.tournament.findUnique({ where: { id }, include: fullInclude })) as any
      );
      emitToTournament(id, "match:result", { match: updatedMatch, tournament: updatedT });
      return NextResponse.json({ match: updatedMatch, tournament: updatedT });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
