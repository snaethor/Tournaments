import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
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

    const tournament = await prisma.tournament.findUnique({ where: { id } });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tournament.hostToken !== hostToken) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ team });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
