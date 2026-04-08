import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBracketMatches } from "@/lib/utils";
import { emitToTournament } from "@/lib/socket-server";
import { serializeTournament } from "@/lib/serialize";

const fullInclude = {
  teams: { include: { members: true, captain: true } },
  participants: true,
  matches: {
    orderBy: [{ round: "asc" as const }, { matchIndex: "asc" as const }],
    include: {
      team1: { include: { members: true, captain: true } },
      team2: { include: { members: true, captain: true } },
      winner: { include: { members: true, captain: true } },
    },
  },
  draftPicks: {
    orderBy: { pickNumber: "asc" as const },
    include: { team: true, participant: true },
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { hostToken } = await req.json();
    const raw = await prisma.tournament.findUnique({ where: { id }, include: fullInclude });
    if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tournament = serializeTournament(raw as any);
    if (tournament.hostToken !== hostToken) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    await prisma.match.deleteMany({ where: { tournamentId: id } });
    const matchData = generateBracketMatches(tournament.teams, id, tournament.roundBestOf);
    await prisma.match.createMany({ data: matchData });

    const updated = serializeTournament(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (await prisma.tournament.update({ where: { id }, data: { status: "IN_PROGRESS" }, include: fullInclude })) as any
    );

    emitToTournament(id, "bracket:update", { tournament: updated });
    return NextResponse.json({ tournament: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
