"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.tournament) setTournamentName(d.tournament.name);
        else setFetchError("Tournament not found");
      })
      .catch(() => setFetchError("Could not load tournament"));
  }, [id]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join");

      // Save participant ID to localStorage so they can make picks
      localStorage.setItem(`participant:${id}`, data.participant.id);

      router.push(`/tournament/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (fetchError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <p style={{ color: "var(--red)" }}>{fetchError}</p>
        <Link href="/" className="btn btn-secondary">Go Home</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.1), transparent)",
            pointerEvents: "none",
          }}
        />
        <div className="card" style={{ padding: "2rem", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div className="badge badge-purple" style={{ marginBottom: "0.75rem" }}>
              You&apos;re invited
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              {tournamentName || "Loading…"}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Enter your name to join as a participant
            </p>
          </div>

          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <label>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Your Name
              </div>
              <input
                className="input"
                placeholder="e.g. xXFragzXx"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </label>

            {error && (
              <div
                style={{
                  padding: "0.6rem 0.8rem",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 7,
                  color: "var(--red)",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.25rem" }} disabled={loading}>
              {loading ? "Joining…" : "Join Tournament →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
            <Link href={`/tournament/${id}`} style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              Watch as viewer instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
