import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTournament } from "@/lib/serialize";

export const fullInclude = {
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const raw = await prisma.tournament.findUnique({ where: { id }, include: fullInclude });
    if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json({ tournament: serializeTournament(raw as any) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
