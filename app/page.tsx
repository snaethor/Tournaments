"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError("");
    const raw = joinCode.trim();
    if (!raw) { setJoinError("Paste a join link or tournament ID."); return; }

    // Accept full URL like http://…/join/abc123 or just the ID
    const match = raw.match(/\/join\/([a-z0-9]+)/i) || raw.match(/\/tournament\/([a-z0-9]+)/i);
    const id = match ? match[1] : raw;
    router.push(`/join/${id}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "fixed", inset: 0,
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.15), transparent)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", maxWidth: 560, width: "100%" }}>
        <div className="badge badge-purple" style={{ marginBottom: "1.25rem", fontSize: "0.78rem", padding: "0.3rem 0.8rem" }}>
          Real-time Tournament Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(2.25rem, 6vw, 3.5rem)",
            fontWeight: 800, lineHeight: 1.1,
            marginBottom: "1rem", letterSpacing: "-0.02em",
          }}
        >
          Run tournaments{" "}
          <span style={{ color: "var(--accent)" }}>live</span>{" "}
          for your community
        </h1>

        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Snake drafts, live brackets, randomised match setup — everything your viewers see updates in real-time.
        </p>

        {/* CTA */}
        <Link href="/create" className="btn btn-primary btn-lg" style={{ width: "100%", marginBottom: "1rem" }}>
          Create Tournament
        </Link>

        {/* Join box */}
        <div className="card" style={{ padding: "1.25rem", textAlign: "left" }}>
          <div style={{ fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.9rem" }}>Join a Tournament</div>
          <form onSubmit={handleJoin} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="input"
              placeholder="Paste join link or tournament ID…"
              value={joinCode}
              onChange={(e) => { setJoinCode(e.target.value); setJoinError(""); }}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
              Join →
            </button>
          </form>
          {joinError && (
            <div style={{ color: "var(--red)", fontSize: "0.78rem", marginTop: "0.4rem" }}>{joinError}</div>
          )}
        </div>

        {/* Features */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "0.6rem",
            marginTop: "1.5rem",
            textAlign: "left",
          }}
        >
          {[
            { icon: "🐍", title: "Snake Draft", desc: "Live pick order" },
            { icon: "🏆", title: "Bracket", desc: "Single-elimination" },
            { icon: "🎲", title: "Match Setup", desc: "Random map & side" },
            { icon: "⚡", title: "Real-time", desc: "Socket.io live" },
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "1.25rem" }}>{f.icon}</span>
              <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{f.title}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
