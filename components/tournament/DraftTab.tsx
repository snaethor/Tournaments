"use client";

import { useState, useEffect, useCallback } from "react";
import type { TournamentWithRelations, TeamWithRelations } from "@/lib/types";
import type { Participant } from "@prisma/client";
import { useTournamentStore } from "@/store/tournament";

interface Props {
  tournament: TournamentWithRelations;
  isHost: boolean;
  onUpdate: () => void;
}

export default function DraftTab({ tournament, isHost, onUpdate }: Props) {
  const { draftPaused } = useTournamentStore();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const isDrafting = tournament.status === "DRAFTING";
  const isDraftComplete = tournament.status !== "WAITING" && tournament.status !== "DRAFTING";
  const currentTeam = isDrafting ? tournament.teams[tournament.currentDraftTeamIndex] : null;

  const myParticipantId =
    typeof window !== "undefined"
      ? localStorage.getItem(`participant:${tournament.id}`)
      : null;

  const myTeam = myParticipantId
    ? tournament.teams.find((t) =>
        t.members.some((m) => m.id === myParticipantId) || t.captainId === myParticipantId
      )
    : null;

  const isMyCaptainTurn = currentTeam?.captainId === myParticipantId;
  const isHostTurn = isHost; // host can also pick on behalf

  // Timer
  const resetTimer = useCallback(() => {
    if (tournament.draftTimer) setTimeLeft(tournament.draftTimer);
  }, [tournament.draftTimer]);

  useEffect(() => {
    if (!isDrafting || draftPaused || !tournament.draftTimer) return;
    resetTimer();
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isDrafting, draftPaused, tournament.currentDraftTeamIndex, tournament.currentDraftRound, tournament.draftTimer, resetTimer]);

  async function startDraft() {
    setLoading(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", hostToken: token }),
    });
    setLoading(false);
    onUpdate();
  }

  async function pauseDraft() {
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pause", hostToken: token }),
    });
  }

  async function resumeDraft() {
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resume", hostToken: token }),
    });
  }

  async function makePick(participantId: string) {
    setLoading(true);
    await fetch(`/api/tournaments/${tournament.id}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pick", participantId }),
    });
    setLoading(false);
    onUpdate();
  }

  const unpicked = tournament.participants.filter(
    (p) => !p.teamId && p.role !== "HOST" && p.role !== "CAPTAIN"
  );

  const totalPicksNeeded = tournament.teamCount * (tournament.playersPerTeam - 1);
  const picksRemaining = totalPicksNeeded - tournament.draftPicks.length;

  if (!tournament.draftEnabled) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        Draft mode is disabled for this tournament.
      </div>
    );
  }

  if (tournament.status === "WAITING") {
    const allCaptainsAssigned = tournament.teams.every((t) => t.captainId);
    return (
      <div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <p style={{ color: "var(--text-muted)" }}>
          {allCaptainsAssigned
            ? "All captains assigned. Ready to start the draft."
            : "Assign captains in the Participants tab first."}
        </p>
        {isHost && allCaptainsAssigned && (
          <button className="btn btn-primary btn-lg" onClick={startDraft} disabled={loading}>
            {loading ? "Starting…" : "Start Draft"}
          </button>
        )}
      </div>
    );
  }

  if (isDraftComplete) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--green)" }}>
          Draft complete! {tournament.teamCount} teams assembled.
        </div>
        <DraftHistory tournament={tournament} />
        <TeamsDisplay tournament={tournament} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Draft status bar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1 }}>
          {draftPaused ? (
            <span style={{ color: "var(--yellow)", fontWeight: 600 }}>⏸ Draft paused</span>
          ) : currentTeam ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  animation: "pulse-glow 1.5s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontWeight: 600 }}>
                {currentTeam.name} is on the clock
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                · Round {tournament.currentDraftRound} · {picksRemaining} picks left
              </span>
              <span className="badge badge-gray" style={{ fontSize: "0.68rem" }}>
                {tournament.draftMode === "linear" ? "➡️ Linear" : "🐍 Snake"}
              </span>
              {isMyCaptainTurn && (
                <span className="badge badge-green">Your pick!</span>
              )}
            </div>
          ) : null}
        </div>

        {timeLeft !== null && isDrafting && !draftPaused && (
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: timeLeft <= 10 ? "var(--red)" : "var(--text)",
              minWidth: 40,
              textAlign: "center",
            }}
          >
            {timeLeft}s
          </div>
        )}

        {isHost && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {draftPaused ? (
              <button className="btn btn-primary btn-sm" onClick={resumeDraft}>Resume</button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={pauseDraft}>Pause</button>
            )}
          </div>
        )}
      </div>

      {/* Main 3-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "1rem" }}>
        {/* Left teams */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {tournament.teams
            .filter((_, i) => i % 2 === 0)
            .map((team) => (
              <MiniTeamRoster
                key={team.id}
                team={team}
                isOnClock={currentTeam?.id === team.id}
              />
            ))}
        </div>

        {/* Player pool */}
        <div className="card" style={{ padding: "1rem" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            PLAYER POOL ({unpicked.length})
          </h3>
          {unpicked.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>All players picked!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {unpicked.map((p) => {
                const canPick =
                  !loading &&
                  !draftPaused &&
                  isDrafting &&
                  (isHostTurn || isMyCaptainTurn);

                return (
                  <PlayerPoolRow
                    key={p.id}
                    participant={p}
                    canPick={canPick}
                    onPick={() => makePick(p.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right teams */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {tournament.teams
            .filter((_, i) => i % 2 !== 0)
            .map((team) => (
              <MiniTeamRoster
                key={team.id}
                team={team}
                isOnClock={currentTeam?.id === team.id}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function MiniTeamRoster({ team, isOnClock }: { team: TeamWithRelations; isOnClock: boolean }) {
  return (
    <div
      className="card"
      style={{
        padding: "0.75rem",
        borderColor: isOnClock ? "var(--accent)" : undefined,
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: "0.875rem",
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        {isOnClock && (
          <div
            style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }}
          />
        )}
        {team.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {team.captain && (
          <div style={{ fontSize: "0.78rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
            <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>C</span>
            {team.captain.name}
          </div>
        )}
        {team.members
          .filter((m) => m.id !== team.captainId)
          .map((m) => (
            <div key={m.id} style={{ fontSize: "0.78rem", color: "var(--text-muted)", paddingLeft: "1.2rem" }}>
              {m.name}
            </div>
          ))}
      </div>
    </div>
  );
}

function PlayerPoolRow({
  participant,
  canPick,
  onPick,
}: {
  participant: Participant;
  canPick: boolean;
  onPick: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 0.75rem",
        background: "var(--surface-2)",
        borderRadius: 8,
        border: "1px solid var(--border)",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (canPick) (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      <span style={{ fontSize: "0.875rem" }}>{participant.name}</span>
      {canPick && (
        <button className="btn btn-primary btn-sm" onClick={onPick}>
          Pick
        </button>
      )}
    </div>
  );
}

function TeamsDisplay({ tournament }: { tournament: TournamentWithRelations }) {
  return (
    <div>
      <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--text-muted)" }}>
        FINAL ROSTERS
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
        {tournament.teams.map((team) => (
          <div className="card" key={team.id} style={{ padding: "1rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.6rem" }}>{team.name}</div>
            {team.captain && (
              <div style={{ fontSize: "0.82rem", marginBottom: "0.3rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
                <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>C</span>
                {team.captain.name}
              </div>
            )}
            {team.members
              .filter((m) => m.id !== team.captainId)
              .map((m) => (
                <div key={m.id} style={{ fontSize: "0.82rem", color: "var(--text-muted)", paddingLeft: "1.2rem" }}>
                  {m.name}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DraftHistory({ tournament }: { tournament: TournamentWithRelations }) {
  return (
    <div>
      <h3 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.95rem", color: "var(--text-muted)" }}>
        DRAFT HISTORY
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {tournament.draftPicks.map((pick) => (
          <div
            key={pick.id}
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              padding: "0.4rem 0.75rem",
              background: "var(--surface-2)",
              borderRadius: 7,
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "var(--text-dim)", minWidth: 28 }}>#{pick.pickNumber}</span>
            <span style={{ color: "var(--text-muted)", minWidth: 80 }}>R{pick.round}</span>
            <span style={{ color: "var(--accent)", flex: 1 }}>{pick.team.name}</span>
            <span>{pick.participant.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
