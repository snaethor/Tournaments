import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FAKE_NAMES = [
  "xXFragzXx", "SilentSniper", "NightCrawler", "IceQueen", "BlazeMaster",
  "ShadowWolf", "ToxicAim", "CryptoKid", "VoidWalker", "NeonRacer",
  "GridironG", "PixelPusher", "ChaosAgent", "ThunderClap", "FrostByte",
  "LaserFocus", "DarkMatter", "RiftRunner", "StormBreaker", "ZeroGravity",
  "AcidRain", "BinaryBeast", "CosmicRay", "DeathRoll", "EchoStrike",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { hostToken } = await req.json();
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tournament.hostToken !== hostToken) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const isSolo = tournament.playersPerTeam === 1;
    const shuffled = [...FAKE_NAMES].sort(() => Math.random() - 0.5);

    if (isSolo) {
      // Fill empty team slots with one fake player each
      const emptySlots = tournament.teams.filter((t) => !t.captainId);
      const names = shuffled.slice(0, emptySlots.length);

      for (let i = 0; i < emptySlots.length && i < names.length; i++) {
        const slot = emptySlots[i];
        const name = names[i];
        const participant = await prisma.participant.create({
          data: { tournamentId: id, name, role: "CAPTAIN", teamId: slot.id },
        });
        await prisma.team.update({
          where: { id: slot.id },
          data: {
            captainId: participant.id,
            name: slot.name.match(/^(Slot|Team|Player) \d+$/) ? name : slot.name,
          },
        });
      }

      return NextResponse.json({ added: Math.min(emptySlots.length, names.length) });
    }

    // Team mode
    const existing = await prisma.participant.count({ where: { tournamentId: id } });
    const needed = tournament.teamCount * tournament.playersPerTeam;
    const toAdd = Math.max(0, needed - existing);
    const names = shuffled.slice(0, toAdd);

    await prisma.participant.createMany({
      data: names.map((name) => ({ tournamentId: id, name, role: "PARTICIPANT" })),
    });

    return NextResponse.json({ added: names.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
