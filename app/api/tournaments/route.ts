import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHostToken } from "@/lib/utils";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, game, teamCount, playersPerTeam, mapPool, servers, draftEnabled, draftTimer, draftMode, roundBestOf, teamNames } = body;

    if (!name || !game || !teamCount || !playersPerTeam) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hostToken = generateHostToken();
    const tc = parseInt(teamCount);

    const raw = await prisma.tournament.create({
      data: {
        name,
        game,
        teamCount: tc,
        playersPerTeam: parseInt(playersPerTeam),
        mapPool: Array.isArray(mapPool) ? mapPool.join(",") : (mapPool || ""),
        servers: Array.isArray(servers) ? servers.join(",") : (servers || ""),
        draftEnabled: draftEnabled ?? true,
        draftTimer: draftTimer ? parseInt(draftTimer) : null,
        draftMode: draftMode ?? "snake",
        roundBestOf: Array.isArray(roundBestOf) ? roundBestOf.join(",") : "",
        hostToken,
        teams: {
          create: Array.from({ length: tc }, (_, i) => ({
            name: teamNames?.[i] || `Team ${i + 1}`,
          })),
        },
      },
      include: fullInclude,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tournament = serializeTournament(raw as any);
    return NextResponse.json({ tournament, hostToken });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
