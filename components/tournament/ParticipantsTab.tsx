"use client";

import { useState } from "react";
import type { TournamentWithRelations, TeamWithRelations } from "@/lib/types";
import type { Participant } from "@prisma/client";

interface Props {
  tournament: TournamentWithRelations;
  isHost: boolean;
  onUpdate: () => void;
}

export default function ParticipantsTab({ tournament, isHost, onUpdate }: Props) {
  const isSolo = tournament.playersPerTeam === 1;

  return isSolo
    ? <SoloSection tournament={tournament} isHost={isHost} onUpdate={onUpdate} />
    : <TeamSection tournament={tournament} isHost={isHost} onUpdate={onUpdate} />;
}

// ─── Solo mode ────────────────────────────────────────────────────────────────

function SoloSection({ tournament, isHost, onUpdate }: Props) {
  const [seeding, setSeeding] = useState(false);

  async function seedPlayers() {
    setSeeding(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: token }),
    });
    setSeeding(false);
    onUpdate();
  }

  const filledSlots = tournament.teams.filter((t) => t.captainId);
  const emptySlots = tournament.teams.filter((t) => !t.captainId);
  const total = tournament.teams.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>Solo Players</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
            {filledSlots.length} / {total} slots filled
            {emptySlots.length > 0 && ` · ${emptySlots.length} open`}
          </p>
        </div>
        {isHost && tournament.status === "WAITING" && emptySlots.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={seedPlayers} disabled={seeding}>
            {seeding ? "Adding…" : "🎲 Add fake players"}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(filledSlots.length / total) * 100}%`,
            background: filledSlots.length === total ? "var(--green)" : "var(--accent)",
            borderRadius: 99,
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Slot grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.6rem" }}>
        {tournament.teams.map((team, i) => {
          const player = team.captain;
          return (
            <div
              key={team.id}
              className="card"
              style={{
                padding: "0.875rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                borderColor: player ? "rgba(99,102,241,0.25)" : undefined,
                opacity: player ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: player ? "var(--accent)" : "var(--surface-3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
                  color: player ? "white" : "var(--text-dim)",
                }}
              >
                {i + 1}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: player ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {player ? player.name : "Open"}
                </div>
                {!player && (
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>waiting…</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filledSlots.length === total && tournament.status === "WAITING" && isHost && (
        <GenerateBracketPrompt tournamentId={tournament.id} onUpdate={onUpdate} />
      )}

      {tournament.status !== "WAITING" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {tournament.status === "COMPLETED" ? "Tournament complete." : "Tournament is underway."}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onUpdate()}>Refresh</button>
            <ViewTabButton label="View Bracket" tab="bracket" />
            <ViewTabButton label="Schedule" tab="schedule" />
          </div>
        </div>
      )}
    </div>
  );
}

function ViewTabButton({ label, tab }: { label: string; tab: string }) {
  return (
    <button
      className="btn btn-primary btn-sm"
      onClick={() => {
        // Find the tab button by text and click it
        const btns = [...document.querySelectorAll<HTMLButtonElement>(".tab")];
        const target = btns.find((b) => b.textContent?.toLowerCase().includes(tab));
        target?.click();
      }}
    >
      {label}
    </button>
  );
}

function GenerateBracketPrompt({ tournamentId, onUpdate }: { tournamentId: string; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournamentId}/bracket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: token }),
    });
    setLoading(false);
    onUpdate();
  }

  return (
    <div
      style={{
        padding: "1.25rem",
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>All slots filled!</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Ready to generate the bracket.</div>
      </div>
      <button className="btn btn-primary" onClick={go} disabled={loading}>
        {loading ? "Generating…" : "Generate Bracket →"}
      </button>
    </div>
  );
}

// ─── Team mode ────────────────────────────────────────────────────────────────

function TeamSection({ tournament, isHost, onUpdate }: Props) {
  const [captainMap, setCaptainMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState("");
  const [memberInputMap, setMemberInputMap] = useState<Record<string, string>>({});
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [poolInput, setPoolInput] = useState("");
  const [addingToPool, setAddingToPool] = useState(false);

  async function seedPlayers() {
    setSeeding(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournament.id}/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: token }),
    });
    setSeeding(false);
    onUpdate();
  }

  function assignCaptain(teamId: string, participantId: string) {
    setCaptainMap((m) => ({ ...m, [teamId]: participantId }));
  }

  async function addMember(teamId: string, name: string) {
    if (!name.trim()) return;
    setAddingMap((m) => ({ ...m, [teamId]: true }));
    const token = localStorage.getItem("hostToken");
    const res = await fetch(`/api/tournaments/${tournament.id}/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), hostToken: token }),
    });
    setAddingMap((m) => ({ ...m, [teamId]: false }));
    if (!res.ok) {
      const d = await res.json();
      setMsg(d.error || "Failed to add member");
    } else {
      setMemberInputMap((m) => ({ ...m, [teamId]: "" }));
      onUpdate();
    }
  }

  async function removeMember(teamId: string, participantId: string) {
    const token = localStorage.getItem("hostToken");
    const res = await fetch(`/api/tournaments/${tournament.id}/teams/${teamId}/members/${participantId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: token }),
    });
    if (res.ok) onUpdate();
  }

  async function addToPool(name: string) {
    if (!name.trim()) return;
    setAddingToPool(true);
    const token = localStorage.getItem("hostToken");
    const res = await fetch(`/api/tournaments/${tournament.id}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), hostToken: token }),
    });
    setAddingToPool(false);
    if (!res.ok) {
      const d = await res.json();
      setMsg(d.error || "Failed to add participant");
    } else {
      setPoolInput("");
      onUpdate();
    }
  }

  async function removeFromPool(participantId: string) {
    const token = localStorage.getItem("hostToken");
    const res = await fetch(`/api/tournaments/${tournament.id}/participants/${participantId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostToken: token }),
    });
    if (res.ok) onUpdate();
  }

  async function saveCaptains() {
    setSaving(true);
    setMsg("");
    try {
      const assignments = Object.entries(captainMap)
        .filter(([, pid]) => pid)
        .map(([teamId, participantId]) => ({ teamId, participantId }));
      if (assignments.length === 0) { setMsg("No captains selected."); return; }
      const token = localStorage.getItem("hostToken");
      const res = await fetch(`/api/tournaments/${tournament.id}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign-captain", hostToken: token, captainAssignments: assignments }),
      });
      if (!res.ok) { const d = await res.json(); setMsg(d.error || "Failed"); }
      else { setMsg("Captains assigned!"); onUpdate(); }
    } finally {
      setSaving(false);
    }
  }

  const unassigned = tournament.participants.filter((p) => !p.teamId && p.role !== "HOST");
  const allCaptainsAssigned = tournament.teams.every((t) => t.captainId);
  const allTeamsFull = tournament.teams.every(
    (t) =>
      t.captainId !== null &&
      t.members.filter((m) => m.id !== t.captainId).length === tournament.playersPerTeam - 1
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Unassigned pool */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-muted)" }}>
            PARTICIPANT POOL ({unassigned.length})
          </h2>
          {isHost && tournament.status === "WAITING" && (
            <button className="btn btn-ghost btn-sm" onClick={seedPlayers} disabled={seeding}>
              {seeding ? "Adding…" : "🎲 Add fake players"}
            </button>
          )}
        </div>

        {isHost && tournament.status === "WAITING" && (
          <form
            onSubmit={(e) => { e.preventDefault(); addToPool(poolInput); }}
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}
          >
            <input
              className="input"
              placeholder="Add participant to pool…"
              value={poolInput}
              onChange={(e) => setPoolInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn btn-secondary btn-sm"
              disabled={!poolInput.trim() || addingToPool}
              style={{ flexShrink: 0 }}
            >
              {addingToPool ? "…" : "Add"}
            </button>
          </form>
        )}

        {unassigned.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No participants in pool yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {unassigned.map((p) => (
              <ParticipantChip
                key={p.id}
                participant={p}
                onRemove={isHost && tournament.status === "WAITING" ? () => removeFromPool(p.id) : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* Teams */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h2 style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-muted)" }}>
            TEAMS ({tournament.teams.length})
          </h2>
          {isHost && !allCaptainsAssigned && tournament.status === "WAITING" && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {msg && <span style={{ fontSize: "0.8rem", color: msg.includes("!") ? "var(--green)" : "var(--red)" }}>{msg}</span>}
              <button className="btn btn-primary btn-sm" onClick={saveCaptains} disabled={saving || Object.keys(captainMap).length === 0}>
                {saving ? "Saving…" : "Assign Captains"}
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem" }}>
          {tournament.teams.map((team) => {
            // Exclude participants already selected as captain for another team
            const selectedElsewhere = Object.entries(captainMap)
              .filter(([tid, pid]) => tid !== team.id && pid)
              .map(([, pid]) => pid);
            const availableForTeam = unassigned.filter((p) => !selectedElsewhere.includes(p.id));
            return (
            <TeamCard
              key={team.id}
              team={team}
              isHost={isHost}
              unassigned={availableForTeam}
              selectedCaptainId={captainMap[team.id]}
              onSelectCaptain={(pid) => assignCaptain(team.id, pid)}
              status={tournament.status}
              playersPerTeam={tournament.playersPerTeam}
              memberInput={memberInputMap[team.id] ?? ""}
              onMemberInputChange={(val) => setMemberInputMap((m) => ({ ...m, [team.id]: val }))}
              onAddMember={(name) => addMember(team.id, name)}
              onRemoveMember={(pid) => removeMember(team.id, pid)}
              adding={addingMap[team.id] ?? false}
              tournamentId={tournament.id}
              onUpdate={onUpdate}
            />
            );
          })}
        </div>
      </section>

      {isHost && tournament.status === "WAITING" && allTeamsFull && (
        <GenerateBracketPrompt tournamentId={tournament.id} onUpdate={onUpdate} />
      )}

      {msg && allCaptainsAssigned && (
        <p style={{ color: msg.includes("!") ? "var(--green)" : "var(--red)", fontSize: "0.85rem" }}>{msg}</p>
      )}
    </div>
  );
}

function ParticipantChip({ participant, onRemove }: { participant: Participant; onRemove?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.5rem 0.3rem 0.75rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 99, fontSize: "0.85rem" }}>
      <span>{participant.name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "0.9rem", padding: "0", lineHeight: 1, display: "flex", alignItems: "center" }}
          title="Remove"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface TeamCardProps {
  team: TeamWithRelations;
  isHost: boolean;
  unassigned: Participant[];
  selectedCaptainId?: string;
  onSelectCaptain: (pid: string) => void;
  status: string;
  playersPerTeam: number;
  memberInput: string;
  onMemberInputChange: (val: string) => void;
  onAddMember: (name: string) => void;
  onRemoveMember: (participantId: string) => void;
  adding: boolean;
  tournamentId: string;
  onUpdate: () => void;
}

function TeamCard({ team, isHost, unassigned, selectedCaptainId, onSelectCaptain, status, playersPerTeam, memberInput, onMemberInputChange, onAddMember, onRemoveMember, adding, tournamentId, onUpdate }: TeamCardProps) {
  const captain = team.captain;
  const nonCaptainMembers = team.members.filter((m) => m.id !== captain?.id);
  const emptySlots = captain ? (playersPerTeam - 1) - nonCaptainMembers.length : 0;
  const showMemberManagement = isHost && status === "WAITING" && !!captain && playersPerTeam > 1;
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(team.name);
  const [savingName, setSavingName] = useState(false);

  async function saveName() {
    if (!nameInput.trim() || nameInput.trim() === team.name) { setEditingName(false); return; }
    setSavingName(true);
    const token = localStorage.getItem("hostToken");
    await fetch(`/api/tournaments/${tournamentId}/teams/${team.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim(), hostToken: token }),
    });
    setSavingName(false);
    setEditingName(false);
    onUpdate();
  }

  return (
    <div className="card" style={{ padding: "1rem" }}>
      <div style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {editingName ? (
          <form onSubmit={(e) => { e.preventDefault(); saveName(); }} style={{ display: "flex", gap: "0.3rem", flex: 1 }}>
            <input
              className="input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
              style={{ flex: 1, fontSize: "0.875rem", padding: "0.2rem 0.4rem", fontWeight: 600 }}
              onBlur={saveName}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={savingName} style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem" }}>
              {savingName ? "…" : "✓"}
            </button>
          </form>
        ) : (
          <>
            <span
              onClick={() => isHost && setEditingName(true)}
              style={{ cursor: isHost ? "pointer" : "default" }}
              title={isHost ? "Click to rename" : undefined}
            >
              {team.name}
            </span>
            {team.seed && <span className="badge badge-gray">#{team.seed}</span>}
            {isHost && (
              <button
                onClick={() => setEditingName(true)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "0.75rem", padding: "0", lineHeight: 1, opacity: 0.5 }}
                title="Rename team"
              >
                ✏
              </button>
            )}
          </>
        )}
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.3rem" }}>CAPTAIN</div>
        {captain ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span className="badge badge-purple">C</span>
            <span style={{ fontSize: "0.875rem" }}>{captain.name}</span>
          </div>
        ) : isHost && status === "WAITING" ? (
          <select className="input" style={{ fontSize: "0.8rem", padding: "0.3rem 0.5rem" }} value={selectedCaptainId || ""} onChange={(e) => onSelectCaptain(e.target.value)}>
            <option value="">Pick a captain…</option>
            {unassigned.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ) : (
          <span style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}>No captain assigned</span>
        )}
      </div>

      {/* Non-captain members */}
      {(nonCaptainMembers.length > 0 || showMemberManagement) && (
        <div style={{ marginTop: "0.5rem" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginBottom: "0.3rem" }}>MEMBERS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {nonCaptainMembers.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{m.name}</span>
                {showMemberManagement && (
                  <button
                    onClick={() => onRemoveMember(m.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "0.9rem", padding: "0 0.1rem", lineHeight: 1 }}
                    title="Remove member"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {showMemberManagement && emptySlots > 0 && (
              <form
                onSubmit={(e) => { e.preventDefault(); onAddMember(memberInput); }}
                style={{ display: "flex", gap: "0.3rem", marginTop: "0.15rem" }}
              >
                <input
                  className="input"
                  placeholder="Player name…"
                  value={memberInput}
                  onChange={(e) => onMemberInputChange(e.target.value)}
                  style={{ flex: 1, fontSize: "0.78rem", padding: "0.25rem 0.4rem" }}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!memberInput.trim() || adding}
                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                >
                  {adding ? "…" : "Add"}
                </button>
              </form>
            )}

            {!showMemberManagement && nonCaptainMembers.length === 0 && (
              <span style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>No members yet</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
