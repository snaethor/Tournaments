import Link from "next/link";
import GameAiRatingBadge from "@/components/GameAiRatingBadge";
import GameAvailabilityBadge from "@/components/GameAvailabilityBadge";
import TeamLogo from "@/components/home/TeamLogo";
import { getAiRatingMeta } from "@/lib/getAiRatingMeta";
import { getCombinedTeamGlow } from "@/lib/teamColors";

function StatItem({ label, value }) {
  return (
    <div className="rounded-[22px] bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

export default function BestBettingSpotCard({ game }) {
  const { bettingAngle } = game.homePage;
  const aiMeta = getAiRatingMeta(game.homePage.aiRating.score);

  return (
    <Link
      href={`/game/${game.id}`}
      className="glass-card group block rounded-[30px] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-white/[0.04]"
      style={{
        boxShadow: `${getCombinedTeamGlow([game.awayTeam.abbreviation, game.homeTeam.abbreviation], 40)}, 0 18px 48px rgba(0, 0, 0, 0.28)`
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Best Betting Spot</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Best betting angle</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <GameAvailabilityBadge availability={game.availability} />
            <GameAiRatingBadge prominent rating={game.homePage.aiRating.score} />
            <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-100">
              {game.homePage.bettingSpotTag}
            </span>
          </div>
        </div>

        {game.availability?.status !== "full" ? (
          <div className="rounded-[22px] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {game.availability.message}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 text-sm text-white/65">
          <div className="flex items-center gap-3">
            <TeamLogo team={game.awayTeam} size="md" />
            <span className="font-medium text-white">{game.awayTeam.name}</span>
          </div>
          <span className="text-white/30">@</span>
          <div className="flex items-center gap-3">
            <TeamLogo team={game.homeTeam} size="md" />
            <span className="font-medium text-white">{game.homeTeam.name}</span>
          </div>
          <span className="ml-auto text-white/55">{game.timeLabel}</span>
        </div>

        <p className="max-w-3xl text-sm leading-6 text-white/65">{game.homePage.bettingSpotReason}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatItem label={`${bettingAngle.offenseTeam.abbreviation} Avg Points`} value={bettingAngle.targetPoints} />
          <StatItem label={`${bettingAngle.defenseTeam.abbreviation} Def Rank`} value={`#${bettingAngle.defenseRank}`} />
          <StatItem label="AI Rating" value={`${bettingAngle.aiScore} · ${aiMeta.label}`} />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-4 text-sm">
          <span className="text-white/55">{bettingAngle.offenseTeam.name} scoring angle</span>
          <span className="font-medium text-sky-200 transition group-hover:text-sky-100">Open matchup</span>
        </div>
      </div>
    </Link>
  );
}
