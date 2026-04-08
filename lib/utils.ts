import { v4 as uuidv4 } from "uuid";

export function generateHostToken(): string {
  return uuidv4();
}

/** Linear-draft order: always 1→2→3…→N, repeating each round */
export function nextLinearPickState(
  currentTeamIndex: number,
  currentRound: number,
  teamCount: number
): { teamIndex: number; round: number; direction: "forward" } {
  if (currentTeamIndex < teamCount - 1) {
    return { teamIndex: currentTeamIndex + 1, round: currentRound, direction: "forward" };
  } else {
    return { teamIndex: 0, round: currentRound + 1, direction: "forward" };
  }
}

/** Snake-draft order: given teamCount and current state, return {teamIndex, round, direction} for next pick */
export function nextSnakePickState(
  currentTeamIndex: number,
  currentRound: number,
  direction: "forward" | "backward",
  teamCount: number
): { teamIndex: number; round: number; direction: "forward" | "backward" } {
  if (direction === "forward") {
    if (currentTeamIndex < teamCount - 1) {
      return { teamIndex: currentTeamIndex + 1, round: currentRound, direction: "forward" };
    } else {
      // Last team picks again next round starts backward
      return { teamIndex: currentTeamIndex, round: currentRound + 1, direction: "backward" };
    }
  } else {
    if (currentTeamIndex > 0) {
      return { teamIndex: currentTeamIndex - 1, round: currentRound, direction: "backward" };
    } else {
      // First team picks again, next round starts forward
      return { teamIndex: currentTeamIndex, round: currentRound + 1, direction: "forward" };
    }
  }
}

/** Generate single-elimination bracket matches */
export function generateBracketMatches(
  teams: { id: string }[],
  tournamentId: string,
  roundBestOf: number[] = []
): Array<{
  tournamentId: string;
  round: number;
  matchIndex: number;
  team1Id: string | null;
  team2Id: string | null;
  bestOf: number;
}> {
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const totalRounds = Math.ceil(Math.log2(shuffled.length));
  const bracketSize = Math.pow(2, totalRounds);
  const matches: Array<{
    tournamentId: string;
    round: number;
    matchIndex: number;
    team1Id: string | null;
    team2Id: string | null;
    bestOf: number;
  }> = [];

  // Round 1: fill with real teams, pad with byes (null)
  const slots: (string | null)[] = [...shuffled.map((t) => t.id)];
  while (slots.length < bracketSize) slots.push(null);

  // roundBestOf is indexed from round 1 (index 0 = round 1)
  const getBestOf = (round: number) => roundBestOf[round - 1] ?? 1;

  for (let i = 0; i < bracketSize / 2; i++) {
    matches.push({
      tournamentId,
      round: 1,
      matchIndex: i,
      team1Id: slots[i * 2] ?? null,
      team2Id: slots[i * 2 + 1] ?? null,
      bestOf: getBestOf(1),
    });
  }

  // Subsequent rounds: TBD matches
  let matchesInRound = bracketSize / 4;
  for (let r = 2; r <= totalRounds; r++) {
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournamentId,
        round: r,
        matchIndex: i,
        team1Id: null,
        team2Id: null,
        bestOf: getBestOf(r),
      });
    }
    matchesInRound = Math.floor(matchesInRound / 2);
  }

  return matches;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
