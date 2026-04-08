"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTournamentStore } from "@/store/tournament";
import { getSocket } from "@/lib/socket-client";
import type { TournamentWithRelations } from "@/lib/types";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import ParticipantsTab from "@/components/tournament/ParticipantsTab";
import DraftTab from "@/components/tournament/DraftTab";
import BracketTab from "@/components/tournament/BracketTab";
import ScheduleTab from "@/components/tournament/ScheduleTab";
import Confetti from "@/components/ui/Confetti";
import Link from "next/link";

type Tab = "participants" | "draft" | "bracket" | "schedule";

function TournamentPageInner() {
  const { id } = useParams<{ id: string }>();
  const { tournament, setTournament, checkHost, isHost, setDraftPaused } = useTournamentStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("participants");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const loadTournament = useCallback(async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTournament(data.tournament);
      checkHost(data.tournament.hostToken);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id, setTournament, checkHost]);

  useEffect(() => {
    loadTournament();
  }, [loadTournament]);

  // Socket.io
  useEffect(() => {
    if (!id) return;
    const socket = getSocket();
    socket.emit("join:room", id);

    socket.on("participant:joined", ({ participant }) => {
      addToast(`${participant.name} joined the tournament`, "info");
      loadTournament();
    });

    socket.on("participant:left", ({ participant }) => {
      addToast(`${participant.name} removed`, "info");
      loadTournament();
    });

    socket.on("draft:start", ({ tournament: t }) => {
      setTournament(t);
      setActiveTab("draft");
      addToast("Draft has started!", "success");
    });

    socket.on("draft:pick", ({ tournament: t, participantId }) => {
      const picked = t.participants.find((p: { id: string }) => p.id === participantId);
      const team = t.teams.find((tm: { members: { id: string }[] }) =>
        tm.members.some((m: { id: string }) => m.id === participantId)
      );
      if (picked && team) {
        addToast(`${team.name} picked ${picked.name}`, "info");
      }
      setTournament(t);
    });

    socket.on("draft:pause", () => {
      setDraftPaused(true);
      addToast("Draft paused", "warning");
    });

    socket.on("draft:resume", () => {
      setDraftPaused(false);
      addToast("Draft resumed", "success");
    });

    socket.on("bracket:update", ({ tournament: t }) => {
      setTournament(t);
      setActiveTab("bracket");
      addToast("Bracket generated!", "success");
    });

    socket.on("match:setup", ({ match }) => {
      loadTournament();
      addToast(`Match setup: ${match.team1?.name} vs ${match.team2?.name}`, "info");
    });

    socket.on("match:result", ({ match, tournament: t }) => {
      setTournament(t);
      addToast(`${match.winner?.name} wins!`, "success");
      if (t.status === "COMPLETED") {
        setShowConfetti(true);
        setActiveTab("bracket");
      }
    });

    return () => {
      socket.off("participant:joined");
      socket.off("participant:left");
      socket.off("draft:start");
      socket.off("draft:pick");
      socket.off("draft:pause");
      socket.off("draft:resume");
      socket.off("bracket:update");
      socket.off("match:setup");
      socket.off("match:result");
    };
  }, [id, addToast, loadTournament, setTournament, setDraftPaused]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)" }}>Loading tournament…</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <p style={{ color: "var(--red)" }}>{error || "Tournament not found"}</p>
        <Link href="/" className="btn btn-secondary">Go Home</Link>
      </div>
    );
  }

  const statusColor =
    tournament.status === "WAITING"
      ? "badge-gray"
      : tournament.status === "DRAFTING"
      ? "badge-yellow"
      : tournament.status === "IN_PROGRESS"
      ? "badge-green"
      : tournament.status === "COMPLETED"
      ? "badge-purple"
      : "badge-blue";

  const statusLabel =
    tournament.status === "WAITING"
      ? "Waiting"
      : tournament.status === "DRAFTING"
      ? "Draft in progress"
      : tournament.status === "BRACKET"
      ? "Generating bracket"
      : tournament.status === "IN_PROGRESS"
      ? "In progress"
      : "Completed";

  const tabs: { key: Tab; label: string }[] = [
    { key: "participants", label: "Participants" },
    { key: "draft", label: "Draft" },
    { key: "bracket", label: "Bracket" },
    { key: "schedule", label: "Schedule" },
  ];

  const joinLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${id}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {showConfetti && <Confetti />}

      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "1.25rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                <Link href="/" style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginRight: "0.25rem" }}>← Home</Link>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{tournament.name}</h1>
                <span className={`badge ${statusColor}`}>{statusLabel}</span>
                {isHost && <span className="badge badge-purple">Host</span>}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", gap: "1rem" }}>
                <span>{tournament.game}</span>
                <span>{tournament.teamCount} teams · {tournament.playersPerTeam}v{tournament.playersPerTeam}</span>
                <span>{tournament.participants.length} participants</span>
              </div>
            </div>

            {tournament.status === "WAITING" && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Join link:</span>
                <code
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    padding: "0.3rem 0.6rem",
                    borderRadius: 6,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    maxWidth: 240,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title="Click to copy"
                  onClick={() => {
                    const el = document.createElement("textarea");
                    el.value = joinLink;
                    el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
                    document.body.appendChild(el);
                    el.select();
                    document.execCommand("copy");
                    document.body.removeChild(el);
                    addToast("Link copied!", "success");
                  }}
                >
                  {joinLink}
                </code>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginTop: "1rem" }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1.5rem" }}>
        {activeTab === "participants" && (
          <ParticipantsTab tournament={tournament} isHost={isHost} onUpdate={loadTournament} />
        )}
        {activeTab === "draft" && (
          <DraftTab tournament={tournament} isHost={isHost} onUpdate={loadTournament} />
        )}
        {activeTab === "bracket" && (
          <BracketTab tournament={tournament} isHost={isHost} onUpdate={loadTournament} />
        )}
        {activeTab === "schedule" && (
          <ScheduleTab tournament={tournament} isHost={isHost} onUpdate={loadTournament} />
        )}
      </div>
    </div>
  );
}

export default function TournamentPage() {
  return (
    <ToastProvider>
      <TournamentPageInner />
    </ToastProvider>
  );
}
