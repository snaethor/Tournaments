import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitToTournament } from "@/lib/socket-server";
import { nextSnakePickState, nextLinearPickState } from "@/lib/utils";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const s = (raw: any) => serializeTournament(raw);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { action, hostToken, participantId, captainAssignments } = body;

    const raw = await prisma.tournament.findUnique({ where: { id }, include: fullInclude });
    if (!raw) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    const tournament = s(raw);

    if (action !== "pick" && tournament.hostToken !== hostToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (action === "assign-captain") {
      if (!captainAssignments?.length) {
        return NextResponse.json({ error: "No captain assignments" }, { status: 400 });
      }
      const participantIds = captainAssignments.map((a: { participantId: string }) => a.participantId);
      const hasDuplicates = new Set(participantIds).size !== participantIds.length;
      if (hasDuplicates) {
        return NextResponse.json({ error: "Each captain must be a different participant" }, { status: 400 });
      }
      for (const a of captainAssignments as { teamId: string; participantId: string }[]) {
        await prisma.team.update({ where: { id: a.teamId }, data: { captainId: a.participantId } });
        await prisma.participant.update({ where: { id: a.participantId }, data: { role: "CAPTAIN", teamId: a.teamId } });
      }
      const updated = s(await prisma.tournament.findUnique({ where: { id }, include: fullInclude }));
      return NextResponse.json({ tournament: updated });
    }

    if (action === "start") {
      if (!tournament.draftEnabled) return NextResponse.json({ error: "Draft not enabled" }, { status: 400 });
      const updated = s(await prisma.tournament.update({
        where: { id },
        data: { status: "DRAFTING", currentDraftTeamIndex: 0, currentDraftRound: 1, draftDirection: "forward" },
        include: fullInclude,
      }));
      emitToTournament(id, "draft:start", { tournament: updated });
      return NextResponse.json({ tournament: updated });
    }

    if (action === "pause") {
      emitToTournament(id, "draft:pause", { tournamentId: id });
      return NextResponse.json({ ok: true });
    }

    if (action === "resume") {
      emitToTournament(id, "draft:resume", { tournamentId: id });
      return NextResponse.json({ ok: true });
    }

    if (action === "pick") {
      if (tournament.status !== "DRAFTING") {
        return NextResponse.json({ error: "Draft is not active" }, { status: 400 });
      }
      const currentTeam = tournament.teams[tournament.currentDraftTeamIndex];
      if (!currentTeam) return NextResponse.json({ error: "Invalid team index" }, { status: 400 });

      const pickedParticipant = tournament.participants.find((p) => p.id === participantId);
      if (!pickedParticipant) return NextResponse.json({ error: "Participant not found" }, { status: 404 });
      if (pickedParticipant.teamId) return NextResponse.json({ error: "Participant already on a team" }, { status: 400 });

      const totalPicks = tournament.draftPicks.length;
      const pickNumber = totalPicks + 1;
      const round = tournament.currentDraftRound;
      const totalPicksNeeded = tournament.teamCount * (tournament.playersPerTeam - 1);
      const isDraftComplete = pickNumber >= totalPicksNeeded;

      const nextState = tournament.draftMode === "linear"
        ? nextLinearPickState(tournament.currentDraftTeamIndex, tournament.currentDraftRound, tournament.teamCount)
        : nextSnakePickState(
            tournament.currentDraftTeamIndex,
            tournament.currentDraftRound,
            tournament.draftDirection as "forward" | "backward",
            tournament.teamCount
          );

      await prisma.$transaction([
        prisma.draftPick.create({ data: { tournamentId: id, round, pickNumber, teamId: currentTeam.id, participantId } }),
        prisma.participant.update({ where: { id: participantId }, data: { teamId: currentTeam.id } }),
      ]);

      const updated = s(await prisma.tournament.update({
        where: { id },
        data: {
          currentDraftTeamIndex: isDraftComplete ? 0 : nextState.teamIndex,
          currentDraftRound: isDraftComplete ? 1 : nextState.round,
          draftDirection: isDraftComplete ? "forward" : nextState.direction,
          status: isDraftComplete ? "BRACKET" : "DRAFTING",
        },
        include: fullInclude,
      }));

      emitToTournament(id, "draft:pick", {
        tournamentId: id, participantId, teamId: currentTeam.id,
        pickNumber, round, nextTeamIndex: nextState.teamIndex,
        nextRound: nextState.round, nextDirection: nextState.direction,
        tournament: updated,
      });
      return NextResponse.json({ tournament: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
