import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitToTournament } from "@/lib/socket-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: { include: { captain: true } } },
    });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (tournament.status !== "WAITING") {
      return NextResponse.json({ error: "Tournament has already started" }, { status: 400 });
    }

    const existing = await prisma.participant.findFirst({
      where: { tournamentId: id, name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Name already taken" }, { status: 400 });
    }

    const isSolo = tournament.playersPerTeam === 1;

    if (isSolo) {
      // Find the first team slot with no captain yet
      const emptySlot = tournament.teams.find((t) => !t.captainId);
      if (!emptySlot) {
        return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
      }

      // Create participant, assign to team, set as captain in one go
      const participant = await prisma.participant.create({
        data: { tournamentId: id, name: name.trim(), role: "CAPTAIN", teamId: emptySlot.id },
      });

      await prisma.team.update({
        where: { id: emptySlot.id },
        data: {
          captainId: participant.id,
          // Rename the slot to the player's name if it was a generic "Slot N" default
          name: emptySlot.name.match(/^(Slot|Team|Player) \d+$/) ? name.trim() : emptySlot.name,
        },
      });

      emitToTournament(id, "participant:joined", { participant });
      return NextResponse.json({ participant });
    }

    // Normal team mode
    const participant = await prisma.participant.create({
      data: { tournamentId: id, name: name.trim(), role: "PARTICIPANT" },
    });

    emitToTournament(id, "participant:joined", { participant });
    return NextResponse.json({ participant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
