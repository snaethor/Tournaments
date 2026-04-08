import Link from "next/link";
import EdgePill from "@/components/EdgePill";
import GameAiRatingBadge from "@/components/GameAiRatingBadge";
import GameAvailabilityBadge from "@/components/GameAvailabilityBadge";
import SharpMoneyBadge from "@/components/SharpMoneyBadge";
import WinProbabilityBar from "@/components/WinProbabilityBar";
import TeamLogo from "@/components/home/TeamLogo";
import { getCombinedTeamGlow } from "@/lib/teamColors";

function TeamRow({ team, align = "left" }) {
  const rightAligned = align === "right";

  return (
    <div className={`flex items-center gap-4 ${rightAligned ? "justify-end text-right" : ""}`}>
      {!rightAligned ? <TeamLogo team={team} size="lg" /> : null}
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/35">{team.abbreviation}</p>
        <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{team.name}</p>
        <p className="mt-1 text-sm text-white/55">{team.record}</p>
      </div>
      {rightAligned ? <TeamLogo team={team} size="lg" /> : null}
    </div>
  );
}

export default function FeaturedGameCard({ game }) {
  const spreadLabel = game.odds?.spread ?? "TBD";
  const totalLabel = game.odds?.total ?? "TBD";
  const ai = game.ai;
  const winProb = ai?.winProbability;

  return (
    <Link
      href={`/game/${game.id}`}
      className="glass-card group block overflow-hidden rounded-[32px] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-white/[0.04] lg:p-8"
      style={{
        boxShadow: `${getCombinedTeamGlow([game.awayTeam.abbreviation, game.homeTeam.abbreviation], 42)}, 0 18px 48px rgba(0, 0, 0, 0.28)`
      }}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Game of the Day</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Headline matchup</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
            <GameAvailabilityBadge availability={game.availability} />
            <GameAiRatingBadge prominent rating={game.homePage.aiRating.score} />
            <p className="text-sm text-white/55">{game.timeLabel}</p>
            <EdgePill edge={game.edge} compact />
          </div>
        </div>

        {/* Availability message */}
        {game.availability?.status !== "full" ? (
          <div className="rounded-[22px] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {game.availability.message}
          </div>
        ) : null}

        {/* Teams row */}
        <div className="grid gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 lg:grid-cols-[1fr_auto_1fr] lg:p-6">
          <TeamRow team={game.awayTeam} />
          <div className="flex items-center justify-center text-xs uppercase tracking-[0.35em] text-white/30">at</div>
          <TeamRow team={game.homeTeam} align="right" />
        </div>

        {/* Win probability */}
        {winProb ? (
          <div className="rounded-[24px] border border-white/8 bg-white/[0.025] p-5">
            <WinProbabilityBar
              homePct={winProb.home}
              awayPct={winProb.away}
              homeTeam={game.homeTeam}
              awayTeam={game.awayTeam}
            />
          </div>
        ) : null}

        {/* Odds + AI pick */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[24px] bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">Spread</p>
            <p className="mt-2 text-xl font-semibold">{spreadLabel}</p>
          </div>
          <div className="rounded-[24px] bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">Total</p>
            <p className="mt-2 text-xl font-semibold">{totalLabel}</p>
          </div>
          <div className="rounded-[24px] bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">Records</p>
            <p className="mt-2 text-base font-semibold">
              {game.awayTeam.record} / {game.homeTeam.record}
            </p>
          </div>
        </div>

        {/* AI summary */}
        {ai?.aiSummary ? (
          <div className="rounded-[24px] border border-violet-400/18 bg-violet-400/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-violet-300/80">AI Analysis</span>
              {ai.betConfidence > 0 ? (
                <span className="rounded-full border border-violet-400/25 bg-violet-400/12 px-2.5 py-0.5 text-xs font-bold text-violet-200">
                  {ai.betRecommendation} · {ai.betConfidence}%
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-violet-50/85">{ai.aiSummary}</p>
          </div>
        ) : null}

        {/* Sharp money */}
        {ai?.sharpIndicator ? (
          <SharpMoneyBadge
            indicator={ai.sharpIndicator}
            note={ai.sharpNote}
            lineMovement={ai.lineMovement}
          />
        ) : null}

        {/* Why it matters */}
        <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-400/8 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Why it matters</p>
          <p className="mt-2 text-sm leading-6 text-emerald-50/90">{game.homePage.whyItMatters}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-4 text-sm">
          <span className="text-white/55">
            {game.awayTeam.record} / {game.homeTeam.record}
          </span>
          <span className="font-medium text-sky-200 transition group-hover:text-sky-100">
            Full AI breakdown →
          </span>
        </div>
      </div>
    </Link>
  );
}
