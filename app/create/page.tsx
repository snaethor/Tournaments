"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TIMER_OPTIONS = [
  { label: "No timer", value: "" },
  { label: "30 seconds", value: "30" },
  { label: "60 seconds", value: "60" },
  { label: "90 seconds", value: "90" },
];

const PRESET_GAMES = [
  { name: "Valorant", players: 6 },
  { name: "CS2", players: 6 },
  { name: "League of Legends", players: 6 },
  { name: "Rocket League", players: 4 },
  { name: "Overwatch 2", players: 6 },
  { name: "Custom", players: 5 },
];

type Mode = "team" | "solo";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("team");

  const [form, setForm] = useState({
    name: "",
    game: "",
    teamCount: "4",
    playersPerTeam: "6",
    mapPool: "",
    servers: "",
    draftEnabled: true,
    draftMode: "snake" as "snake" | "linear",
    draftTimer: "",
    teamNames: [] as string[],
    roundBestOf: [1, 1] as number[], // default: 2 rounds for 4 teams
  });

  function setField(key: string, value: string | boolean | string[]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePreset(preset: { name: string; players: number }) {
    setField("game", preset.name);
    if (mode === "team") setField("playersPerTeam", String(preset.players));
  }

  function handleTeamCount(val: string) {
    const n = parseInt(val) || 2;
    const rounds = Math.ceil(Math.log2(n));
    setForm((f) => ({
      ...f,
      teamCount: val,
      teamNames: Array.from({ length: n }, (_, i) => f.teamNames[i] || `Player ${i + 1}`),
      roundBestOf: Array.from({ length: rounds }, (_, i) => f.roundBestOf[i] ?? 1),
    }));
  }

  function setRoundBestOf(roundIndex: number, bo: number) {
    setForm((f) => {
      const arr = [...f.roundBestOf];
      arr[roundIndex] = bo;
      return { ...f, roundBestOf: arr };
    });
  }

  function setTeamName(i: number, name: string) {
    setForm((f) => {
      const arr = [...f.teamNames];
      arr[i] = name;
      return { ...f, teamNames: arr };
    });
  }

  function switchMode(m: Mode) {
    setMode(m);
    if (m === "solo") {
      setField("playersPerTeam", "1");
      setField("draftEnabled", false);
    } else {
      setField("playersPerTeam", "6");
      setField("draftEnabled", true);
    }
  }

  function setDraftMode(dm: "snake" | "linear") {
    setForm((f) => ({ ...f, draftMode: dm, draftEnabled: true }));
  }

  function disableDraft() {
    setForm((f) => ({ ...f, draftEnabled: false }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.game.trim()) {
      setError("Tournament name and game are required.");
      return;
    }
    const tc = parseInt(form.teamCount);
    if (tc < 2 || tc > 16 || tc % 2 !== 0) {
      setError("Team count must be an even number between 2 and 16.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          game: form.game.trim(),
          teamCount: tc,
          playersPerTeam: mode === "solo" ? 1 : parseInt(form.playersPerTeam),
          mapPool: form.mapPool ? form.mapPool.split(",").map((s) => s.trim()).filter(Boolean) : [],
          servers: form.servers ? form.servers.split(",").map((s) => s.trim()).filter(Boolean) : [],
          draftEnabled: mode === "solo" ? false : form.draftEnabled,
          draftMode: mode === "solo" ? "snake" : form.draftMode,
          roundBestOf: form.roundBestOf,
          draftTimer: form.draftTimer || null,
          teamNames: form.teamNames.filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create tournament");
      localStorage.setItem("hostToken", data.hostToken);
      router.push(`/tournament/${data.tournament.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const teamCount = parseInt(form.teamCount) || 2;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>← Back</Link>
          <h1 style={{ marginTop: "0.75rem", fontSize: "1.75rem", fontWeight: 700 }}>Create Tournament</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Fill in the details below to set up your tournament.
          </p>
        </div>

        {/* Mode picker */}
        <div
          className="card"
          style={{ padding: "0.35rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem", marginBottom: "1.5rem" }}
        >
          {(["team", "solo"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                padding: "0.75rem",
                borderRadius: 8,
                border: "none",
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "white" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              <span style={{ fontSize: "1.3rem" }}>{m === "team" ? "👥" : "🎮"}</span>
              <span>{m === "team" ? "Team Tournament" : "Solo / 1v1"}</span>
              <span style={{ fontSize: "0.72rem", opacity: 0.75 }}>
                {m === "team" ? "Draft picks, full rosters" : "1 player per team, no draft"}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Basic Info */}
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "1rem" }}>Basic Info</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <label>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Tournament Name *</div>
                <input
                  className="input"
                  placeholder="e.g. Sunday Showdown"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </label>
              <label>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Game *</div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
                  {PRESET_GAMES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      className={`btn btn-sm ${form.game === p.name ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => handlePreset(p)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <input
                  className="input"
                  placeholder="or type a custom game"
                  value={form.game}
                  onChange={(e) => setField("game", e.target.value)}
                />
              </label>
            </div>
          </section>

          {/* Format */}
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "1rem" }}>
              {mode === "solo" ? "Bracket Format" : "Format"}
            </h2>

            {mode === "solo" ? (
              /* Solo mode — just team count, labelled as "Slots" */
              <div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  Number of Players (bracket slots)
                </div>
                <select className="input" value={form.teamCount} onChange={(e) => handleTeamCount(e.target.value)}>
                  {[2, 4, 6, 8, 10, 12, 14, 16].map((n) => (
                    <option key={n} value={n}>{n} Players</option>
                  ))}
                </select>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Each player that joins will be auto-assigned to a bracket slot.
                </p>

                <div style={{ marginTop: "1rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                    Slot Names (optional — leave blank to use player names)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                    {Array.from({ length: teamCount }, (_, i) => (
                      <input
                        key={i}
                        className="input"
                        placeholder={`Slot ${i + 1}`}
                        value={form.teamNames[i] || ""}
                        onChange={(e) => setTeamName(i, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Team mode */
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <label>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Number of Teams</div>
                    <select className="input" value={form.teamCount} onChange={(e) => handleTeamCount(e.target.value)}>
                      {[2, 4, 6, 8, 10, 12, 14, 16].map((n) => (
                        <option key={n} value={n}>{n} Teams</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Players per Team</div>
                    <input
                      className="input"
                      type="number"
                      min={2}
                      max={20}
                      value={form.playersPerTeam}
                      onChange={(e) => setField("playersPerTeam", e.target.value)}
                    />
                  </label>
                </div>
                <div style={{ marginTop: "0.85rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Team Names (optional)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                    {Array.from({ length: teamCount }, (_, i) => (
                      <input
                        key={i}
                        className="input"
                        placeholder={`Team ${i + 1}`}
                        value={form.teamNames[i] || ""}
                        onChange={(e) => setTeamName(i, e.target.value)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Draft Settings — team mode only */}
          {mode === "team" && (
            <section className="card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "1rem" }}>Draft Settings</h2>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Draft Order</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginBottom: "1rem" }}>
                {([
                  { key: "no-draft", label: "No Draft", desc: "Skip to bracket", icon: "⏭" },
                  { key: "snake", label: "Snake", desc: "1→2→3→3→2→1", icon: "🐍" },
                  { key: "linear", label: "Linear", desc: "1→2→3→1→2→3", icon: "➡️" },
                ] as const).map((opt) => {
                  const active = opt.key === "no-draft" ? !form.draftEnabled : (form.draftEnabled && form.draftMode === opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => opt.key === "no-draft" ? disableDraft() : setDraftMode(opt.key)}
                      style={{
                        padding: "0.75rem 0.5rem",
                        borderRadius: 8,
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "rgba(99,102,241,0.12)" : "transparent",
                        color: active ? "var(--accent)" : "var(--text-muted)",
                        cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{opt.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{opt.label}</span>
                      <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>{opt.desc}</span>
                    </button>
                  );
                })}
              </div>

              {form.draftEnabled && (
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Pick Timer</div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    {TIMER_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`btn btn-sm ${form.draftTimer === o.value ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setField("draftTimer", o.value)}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Match Setup */}
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "1rem" }}>Match Setup <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "0.8rem" }}>(optional)</span></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <label>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Map Pool (comma-separated)</div>
                <input
                  className="input"
                  placeholder="Ascent, Bind, Haven, Split..."
                  value={form.mapPool}
                  onChange={(e) => setField("mapPool", e.target.value)}
                />
              </label>
              <label>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>Servers (comma-separated)</div>
                <input
                  className="input"
                  placeholder="EU West, NA East, NA West..."
                  value={form.servers}
                  onChange={(e) => setField("servers", e.target.value)}
                />
              </label>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.75rem" }}>
              When you set up a match, one team gets assigned the map and the other gets to choose side.
            </p>
          </section>

          {error && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "var(--red)", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Creating..." : "Create Tournament →"}
          </button>
        </form>
      </div>
    </div>
  );
}
