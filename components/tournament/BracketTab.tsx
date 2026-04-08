"use client";

import { useState } from "react";
import type { TournamentWithRelations, MatchWithRelations } from "@/lib/types";

interface Props {
  tournament: TournamentWithRelations;
  isHost: boolean;
  onUpdate: () => void;
}

export default function BracketTab({ tournament, isHost, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);

  const canGenerate =
    isHost &&
    (tournament.status === "BRACKET" ||
      (tournament.status !== "WAITING" && tournament.status !== "DRAFTING"));

  const shouldGenerate = tournament.status === "BRACKET";

  async function generateBracket() {
    setLoading(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/bracket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: token }),
    });
    setLoading(false);
    onUpdate();
  }

  if (tournament.matches.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <p style={{ color: "var(--text-muted)" }}>
          {shouldGenerate
            ? "Draft is complete. Generate the bracket to continue."
            : "The bracket hasn't been generated yet."}
        </p>
        {canGenerate && (
          <button className="btn btn-primary btn-lg" onClick={generateBracket} disabled={loading}>
            {loading ? "Generating…" : "Generate Bracket"}
          </button>
        )}
      </div>
    );
  }

  const rounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = Math.max(...rounds);

  const winner = tournament.matches.find((m) => m.round === totalRounds && m.winnerId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {tournament.status === "COMPLETED" && winner?.winner && (
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,197,94,0.1))",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏆</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            {winner.winner.name}
          </div>
          <div style={{ color: "var(--text-muted)" }}>Tournament Champion</div>
        </div>
      )}

      {/* Visual bracket */}
      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
            minWidth: "max-content",
          }}
        >
          {rounds.map((round) => {
            const roundMatches = tournament.matches
              .filter((m) => m.round === round)
              .sort((a, b) => a.matchIndex - b.matchIndex);
            const matchCount = roundMatches.length;
            const roundLabel =
              round === totalRounds
                ? "Final"
                : round === totalRounds - 1
                ? "Semi-finals"
                : round === totalRounds - 2
                ? "Quarter-finals"
                : `Round ${round}`;

            return (
              <div key={round} style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--text-dim)",
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                    textAlign: "center",
                  }}
                >
                  {roundLabel.toUpperCase()}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    gap: matchCount > 1 ? "1.5rem" : "0",
                    flex: 1,
                  }}
                >
                  {roundMatches.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BracketMatchCard({ match }: { match: MatchWithRelations }) {
  const isBye = !match.team1Id || !match.team2Id;
  const isComplete = !!match.winnerId;

  return (
    <div
      style={{
        width: 180,
        border: "1px solid var(--border-2)",
        borderRadius: 9,
        overflow: "hidden",
        background: "var(--surface)",
        opacity: isBye && !isComplete ? 0.6 : 1,
      }}
    >
      <TeamSlot
        team={match.team1}
        isWinner={match.winnerId === match.team1Id}
        isLoser={!!match.winnerId && match.winnerId !== match.team1Id}
        isTbd={!match.team1Id}
      />
      <div style={{ height: 1, background: "var(--border)" }} />
      <TeamSlot
        team={match.team2}
        isWinner={match.winnerId === match.team2Id}
        isLoser={!!match.winnerId && match.winnerId !== match.team2Id}
        isTbd={!match.team2Id}
      />
    </div>
  );
}

function TeamSlot({
  team,
  isWinner,
  isLoser,
  isTbd,
}: {
  team: { name: string } | null | undefined;
  isWinner: boolean;
  isLoser: boolean;
  isTbd: boolean;
}) {
  return (
    <div
      style={{
        padding: "0.5rem 0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: isWinner ? "rgba(34,197,94,0.1)" : "transparent",
        opacity: isLoser ? 0.4 : 1,
        minHeight: 38,
      }}
    >
      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: isWinner ? 600 : 400,
          color: isTbd ? "var(--text-dim)" : "var(--text)",
        }}
      >
        {isTbd ? "TBD" : team?.name || "TBD"}
      </span>
      {isWinner && <span style={{ fontSize: "0.7rem" }}>✓</span>}
    </div>
  );
}
