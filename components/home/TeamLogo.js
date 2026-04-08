import { getTeamInitials, getTeamLogoUrl } from "@/lib/teamLogos";

export default function TeamLogo({ team, size = "md" }) {
  const src = getTeamLogoUrl(team);
  const initials = getTeamInitials(team);
  const sizeClass = {
    sm: "h-10 w-10 rounded-2xl text-xs",
    md: "h-12 w-12 rounded-2xl text-sm",
    lg: "h-16 w-16 rounded-[1.35rem] text-base"
  }[size];

  if (!src) {
    return (
      <div className={`flex items-center justify-center border border-white/8 bg-white/[0.04] font-semibold text-white/70 ${sizeClass}`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center border border-white/8 bg-white/[0.04] p-2 ${sizeClass}`}>
      <img src={src} alt={`${team.name} logo`} className="h-full w-full object-contain" />
    </div>
  );
}
