import Link from "next/link";
import EdgePill from "@/components/EdgePill";
import GameAiRatingBadge from "@/components/GameAiRatingBadge";
import GameAvailabilityBadge from "@/components/GameAvailabilityBadge";
import InjuryBadge from "@/components/InjuryBadge";
import WinProbabilityBar from "@/components/WinProbabilityBar";
import TeamLogo from "@/components/home/TeamLogo";
import { getCombinedTeamGlow } from "@/lib/teamColors";

export default function GameListCard({ game }) {
  const spreadLabel = game.odds?.spread ?? "TBD";
  const totalLabel = game.odds?.total ?? "TBD";
  const ai = game.ai;
  const winProb = ai?.winProbability;

  // Gather questionable/doubtful players for this game
  const flaggedPlayers = game.players?.filter(
    (p) => p.injury?.status === "questionable" || p.injury?.status === "doubtful" || p.injury?.status === "out"
  ) ?? [];

  return (
    <Link
      href={`/game/${game.id}`}
      className="glass-card group block rounded-[26px] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-white/[0.04]"
      style={{
        boxShadow: `${getCombinedTeamGlow([game.awayTeam.abbreviation, game.homeTeam.abbreviation], 30)}, 0 18px 48px rgba(0, 0, 0, 0.28)`
      }}
    >
      <div className="flex h-full flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">{game.timeLabel}</p>
            <p className="mt-2 text-xs text-white/45">
              {new Date(game.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GameAvailabilityBadge availability={game.availability} />
            <GameAiRatingBadge rating={game.homePage.aiRating.score} />
            <EdgePill edge={game.edge} compact />
          </div>
        </div>

        {/* Availability message */}
        {game.availability?.status !== "full" ? (
          <p className="text-sm leading-6 text-white/55">{game.availability.message}</p>
        ) : null}

        {/* Teams */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <TeamLogo team={game.awayTeam} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/30">Away</p>
              <p className="mt-1 text-base font-semibold leading-5">{game.awayTeam.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TeamLogo team={game.homeTeam} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/30">Home</p>
              <p className="mt-1 text-base font-semibold leading-5">{game.homeTeam.name}</p>
            </div>
          </div>
        </div>

        {/* Win probability bar */}
        {winProb ? (
          <div className="rounded-[18px] border border-white/6 bg-white/[0.02] p-3">
            <WinProbabilityBar
              homePct={winProb.home}
              awayPct={winProb.away}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
              compact
            />
          </div>
        ) : null}

        {/* Spread / Total */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Spread</p>
            <p className="mt-2 text-lg font-semibold">{spreadLabel}</p>
          </div>
          <div className="rounded-[20px] bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Total</p>
            <p className="mt-2 text-lg font-semibold">{totalLabel}</p>
          </div>
        </div>

        {/* AI bet recommendation */}
        {ai?.betRecommendation && ai.betConfidence > 0 ? (
          <div className="rounded-[18px] border border-violet-400/20 bg-violet-400/8 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-violet-300/70">AI Pick</p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-violet-100">{ai.betRecommendation}</p>
              <span className="text-sm font-bold text-violet-300">{ai.betConfidence}%</span>
            </div>
          </div>
        ) : null}

        {/* Injury flags */}
        {flaggedPlayers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {flaggedPlayers.slice(0, 3).map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span className="text-xs text-white/40">{p.name.split(" ").pop()}</span>
                <InjuryBadge status={p.injury.status} />
              </div>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-3 text-sm">
          <span className="text-white/45">
            {game.awayTeam.record} / {game.homeTeam.record}
          </span>
          <span className="font-medium text-sky-200 transition group-hover:text-sky-100">Open matchup →</span>
        </div>
      </div>
    </Link>
  );
}
