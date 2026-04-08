import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitToTournament } from "@/lib/socket-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  const { id, teamId } = await params;
  try {
    const body = await req.json();
    const { name, hostToken } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: { include: { members: true } }, participants: true },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tournament.hostToken !== hostToken) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (tournament.status !== "WAITING") return NextResponse.json({ error: "Tournament is not in WAITING state" }, { status: 400 });

    const team = tournament.teams.find((t) => t.id === teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (!team.captainId) return NextResponse.json({ error: "Assign a captain before adding members" }, { status: 400 });

    const nonCaptainMembers = team.members.filter((m) => m.id !== team.captainId);
    if (nonCaptainMembers.length >= tournament.playersPerTeam - 1) {
      return NextResponse.json({ error: "Team is already full" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const duplicate = tournament.participants.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) return NextResponse.json({ error: "A participant with that name already exists" }, { status: 400 });

    const participant = await prisma.participant.create({
      data: { tournamentId: id, name: trimmedName, role: "PARTICIPANT", teamId },
    });

    emitToTournament(id, "participant:joined", { participant });
    return NextResponse.json({ participant });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
