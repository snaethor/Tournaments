import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitToTournament } from "@/lib/socket-server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { id, participantId } = await params;
  try {
    const body = await req.json();
    const { hostToken } = body;

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tournament.hostToken !== hostToken) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (tournament.status !== "WAITING") return NextResponse.json({ error: "Tournament is not in WAITING state" }, { status: 400 });

    const participant = await prisma.participant.findUnique({ where: { id: participantId } });
    if (!participant || participant.tournamentId !== id) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }
    if (participant.role === "CAPTAIN") {
      return NextResponse.json({ error: "Cannot remove a captain this way" }, { status: 400 });
    }
    if (participant.role === "HOST") {
      return NextResponse.json({ error: "Cannot remove the host" }, { status: 400 });
    }

    await prisma.participant.delete({ where: { id: participantId } });

    emitToTournament(id, "participant:left" as never, { participant });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
