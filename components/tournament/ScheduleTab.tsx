"use client";

import { useState } from "react";
import type { TournamentWithRelations, MatchWithRelations } from "@/lib/types";

interface Props {
  tournament: TournamentWithRelations;
  isHost: boolean;
  onUpdate: () => void;
}

export default function ScheduleTab({ tournament, isHost, onUpdate }: Props) {
  if (tournament.matches.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
        No matches scheduled yet. Generate the bracket first.
      </div>
    );
  }

  const rounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort((a, b) => a - b);
  const totalRounds = Math.max(...rounds);

  async function setRoundBestOf(round: number, bo: number) {
    const token = localStorage.getItem("hostToken");
    const matchesInRound = tournament.matches.filter((m) => m.round === round && !m.winnerId);
    await Promise.all(
      matchesInRound.map((m) =>
        fetch(`/api/tournaments/${tournament.id}/matches/${m.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set-best-of", hostToken: token, bestOf: bo }),
        })
      )
    );
    onUpdate();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {rounds.map((round) => {
        const matches = tournament.matches
          .filter((m) => m.round === round)
          .sort((a, b) => a.matchIndex - b.matchIndex);

        const label =
          round === totalRounds ? "Final"
          : round === totalRounds - 1 ? "Semi-finals"
          : round === totalRounds - 2 ? "Quarter-finals"
          : `Round ${round}`;

        // Current BO for this round (from first match)
        const currentBo = matches[0]?.bestOf ?? 1;
        const hasUnfinished = matches.some((m) => !m.winnerId);

        return (
          <section key={round}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <h2 style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                {label.toUpperCase()}
              </h2>
              {isHost && hasUnfinished && (
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  {[1, 3, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`btn btn-sm ${currentBo === n ? "btn-primary" : "btn-ghost"}`}
                      style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}
                      onClick={() => setRoundBestOf(round, n)}
                    >
                      BO{n}
                    </button>
                  ))}
                </div>
              )}
              {!isHost && currentBo > 1 && (
                <span className="badge badge-gray" style={{ fontSize: "0.68rem" }}>BO{currentBo}</span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  tournament={tournament}
                  isHost={isHost}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MatchCard({
  match,
  tournament,
  isHost,
  onUpdate,
}: {
  match: MatchWithRelations;
  tournament: TournamentWithRelations;
  isHost: boolean;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [winnerSelect, setWinnerSelect] = useState("");
  const [showResult, setShowResult] = useState(false);

  const hasTeams = match.team1Id && match.team2Id;
  const isComplete = !!match.winnerId;
  const isSetup = !!(match.chosenMap || match.chosenSide || match.chosenServer);
  const isSeries = (match.bestOf ?? 1) > 1;
  const winsNeeded = Math.ceil((match.bestOf ?? 1) / 2);

  async function setupMatch() {
    setLoading(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", hostToken: token }),
    });
    setLoading(false);
    onUpdate();
  }

  async function addGameWin(teamId: string) {
    setLoading(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "score", hostToken: token, winnerId: teamId }),
    });
    setLoading(false);
    onUpdate();
  }

  async function recordResult() {
    if (!winnerSelect) return;
    setLoading(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "result", hostToken: token, winnerId: winnerSelect }),
    });
    setLoading(false);
    setShowResult(false);
    onUpdate();
  }

  const team1Name = match.team1?.name || "TBD";
  const team2Name = match.team2?.name || "TBD";

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem",
        borderColor: isComplete ? "rgba(34,197,94,0.2)" : hasTeams && !isComplete ? "var(--border-2)" : undefined,
      }}
    >
      {/* Teams row */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontWeight: 600, color: match.winnerId === match.team1Id ? "var(--green)" : match.winnerId && match.winnerId !== match.team1Id ? "var(--text-muted)" : "var(--text)" }}>
            {team1Name}
          </span>

          {isSeries && hasTeams ? (
            <span style={{ fontWeight: 700, fontSize: "1rem", color: isComplete ? "var(--text-muted)" : "var(--text)", minWidth: 40, textAlign: "center" }}>
              {match.team1Score ?? 0}–{match.team2Score ?? 0}
            </span>
          ) : (
            <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>vs</span>
          )}

          <span style={{ fontWeight: 600, color: match.winnerId === match.team2Id ? "var(--green)" : match.winnerId && match.winnerId !== match.team2Id ? "var(--text-muted)" : "var(--text)" }}>
            {team2Name}
          </span>

          {isComplete && match.winner && (
            <span className="badge badge-green">✓ {match.winner.name} wins{isSeries ? ` (${match.team1Score}–${match.team2Score})` : ""}</span>
          )}
        </div>

        {/* Match setup details */}
        {isSetup && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {match.chosenMap && <span className="badge badge-blue">🗺 {match.chosenMap}</span>}
            {match.chosenSide && <span className="badge badge-red">⚔ {match.chosenSide}</span>}
            {match.chosenServer && <span className="badge badge-gray">🌐 {match.chosenServer}</span>}
          </div>
        )}

        {/* Host actions */}
        {isHost && hasTeams && !isComplete && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {!isSetup && (
              <button className="btn btn-secondary btn-sm" onClick={setupMatch} disabled={loading}>
                Set up match
              </button>
            )}

            {isSeries ? (
              /* Game-by-game buttons for series */
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => addGameWin(match.team1Id!)}
                  disabled={loading}
                  title={`${team1Name} wins a game`}
                >
                  +1 {team1Name}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => addGameWin(match.team2Id!)}
                  disabled={loading}
                  title={`${team2Name} wins a game`}
                >
                  +1 {team2Name}
                </button>
              </div>
            ) : (
              /* BO1: direct winner select */
              !showResult ? (
                <button className="btn btn-primary btn-sm" onClick={() => setShowResult(true)}>
                  Record result
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <select
                    className="input"
                    style={{ fontSize: "0.8rem", padding: "0.3rem 0.5rem", width: "auto" }}
                    value={winnerSelect}
                    onChange={(e) => setWinnerSelect(e.target.value)}
                  >
                    <option value="">Winner…</option>
                    {match.team1Id && <option value={match.team1Id}>{team1Name}</option>}
                    {match.team2Id && <option value={match.team2Id}>{team2Name}</option>}
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={recordResult} disabled={!winnerSelect || loading}>
                    Confirm
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowResult(false)}>
                    Cancel
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Series progress dots */}
      {isSeries && hasTeams && !isComplete && (
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem" }}>
          {[
            { name: team1Name, score: match.team1Score ?? 0 },
            { name: team2Name, score: match.team2Score ?? 0 },
          ].map(({ name, score }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{name}</span>
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {Array.from({ length: winsNeeded }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: i < score ? "var(--accent)" : "var(--surface-3)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
