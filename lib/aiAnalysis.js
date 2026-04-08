// ─── AI Analysis Data Layer ───────────────────────────────────────────────────
// Win probability, key factors, sharp money, player props, injuries, hot streaks

// ── Game-level AI data ─────────────────────────────────────────────────────────
export const gameAiData = {
  7001: {
    // OKC (home) vs GSW (away)
    winProbability: { home: 72, away: 28 },
    sharpIndicator: "sharp", // "sharp" | "public" | "neutral"
    sharpNote: "72% of sharp money on OKC -5.5",
    lineMovement: "OKC -5 → -5.5 (24h)",
    keyFactors: [
      {
        label: "Perimeter Defense",
        edge: "home",
        note: "OKC holds SGs to 14.8 PPG — league best. Limits Curry's rhythm."
      },
      {
        label: "Pace Control",
        edge: "home",
        note: "OKC runs 99.6 pace, eliminating GSW's preferred transition attack."
      },
      {
        label: "Rest Advantage",
        edge: "home",
        note: "Thunder on 2-day rest. Warriors played yesterday in Dallas."
      },
      {
        label: "3PT Variance Risk",
        edge: "away",
        note: "Curry shoots 41.8% from 3 — highest variance ceiling in the league."
      }
    ],
    aiSummary:
      "OKC's perimeter lockdown and pace mastery are the dominant forces here. SGA is the league's best two-way guard in this spot. Fade Curry unless he's unconscious from the jump.",
    betRecommendation: "OKC -5.5",
    betConfidence: 74,
    projectedTotal: 237
  },
  7002: {
    // BOS (home) vs MIL (away)
    winProbability: { home: 68, away: 32 },
    sharpIndicator: "sharp",
    sharpNote: "68% sharp action on BOS -6",
    lineMovement: "BOS -5.5 → -6 (12h)",
    keyFactors: [
      {
        label: "Offensive Mismatch",
        edge: "home",
        note: "BOS #1 offense (121.5 Ortg) vs MIL #18 defense (116.8 Drtg)."
      },
      {
        label: "Home Court",
        edge: "home",
        note: "Celtics are 31-8 at TD Garden this season — dominant home record."
      },
      {
        label: "Giannis Load",
        edge: "away",
        note: "Giannis listed Questionable (knee). If limited, MIL lose 32+ PPG."
      },
      {
        label: "3PT Volume",
        edge: "home",
        note: "BOS attempts 45+ 3s per game — highest in NBA. Tatum + Brown combo."
      }
    ],
    aiSummary:
      "Boston's offense against Milwaukee's porous defense is one of the cleanest mismatches on the slate. The only risk is a healthy Giannis going berserk in a spot where MIL needs a statement win.",
    betRecommendation: "BOS -6",
    betConfidence: 68,
    projectedTotal: 233
  },
  7003: {
    // MIN (home) vs DEN (away)
    winProbability: { home: 54, away: 46 },
    sharpIndicator: "neutral",
    sharpNote: "50/50 sharp split — market uncertain",
    lineMovement: "MIN -1.5 → -2 (48h)",
    keyFactors: [
      {
        label: "Gobert Factor",
        edge: "home",
        note: "Rudy Gobert is the only center who consistently limits Jokic's paint touches."
      },
      {
        label: "Low Pace Trap",
        edge: "home",
        note: "MIN plays 96.9 pace — slowest matchup of the week. Drains DEN's offense."
      },
      {
        label: "Jokic Triple-Double Threat",
        edge: "away",
        note: "Jokic averages 10.2 APG — MIN perimeter defense can't guard 5-out playmaking."
      },
      {
        label: "Edwards Hot Streak",
        edge: "home",
        note: "Ant is averaging 33.4 PPG over last 5. Elite isolation scorer vs DEN guards."
      }
    ],
    aiSummary:
      "Closest game of the slate. MIN's defense is the only system that genuinely slows Jokic, but DEN's playmaking typically finds ways to exploit MIN's weak SF position. A 3-point game decided in the 4th.",
    betRecommendation: "Under 225.5",
    betConfidence: 61,
    projectedTotal: 222
  },
  7004: {
    // LAC (home) vs MIA (away)
    winProbability: { home: 62, away: 38 },
    sharpIndicator: "public",
    sharpNote: "60% public money on LAC — possible fade spot",
    lineMovement: "LAC -3 → -3.5 (24h)",
    keyFactors: [
      {
        label: "Wing Depth Advantage",
        edge: "home",
        note: "George + Leonard give LAC two elite wings vs MIA's single-star approach."
      },
      {
        label: "Butler Cold Streak",
        edge: "home",
        note: "Jimmy Butler averaging only 19.7 PPG last 5 — shot selection struggling."
      },
      {
        label: "Low Total Environment",
        edge: "neutral",
        note: "221 total — both defenses ranked top-8. Expect a half-court grind."
      },
      {
        label: "Leonard Load Management Risk",
        edge: "away",
        note: "Kawhi has played only 42 games — could sit on second night of back-to-back."
      }
    ],
    aiSummary:
      "LAC's wing duo makes them the logical side, but public money inflated this number. If Leonard sits, this number is wrong by 4 points. Best angle may be targeting the under 221.",
    betRecommendation: "Under 221",
    betConfidence: 63,
    projectedTotal: 218
  },
  7005: {
    // MIL (home) vs OKC (away)
    winProbability: { home: 38, away: 62 },
    sharpIndicator: "sharp",
    sharpNote: "74% sharp action on OKC -4",
    lineMovement: "OKC -3.5 → -4 (36h)",
    keyFactors: [
      {
        label: "OKC Road Record",
        edge: "away",
        note: "Thunder are 22-9 away from home — best road record in the West."
      },
      {
        label: "MIL Defensive Struggles",
        edge: "away",
        note: "Bucks ranked #18 defense — SGA's midrange is unguardable vs this scheme."
      },
      {
        label: "Giannis Revenge Spot",
        edge: "home",
        note: "Giannis lost last 3 vs OKC — expects to be highly motivated."
      }
    ],
    aiSummary:
      "OKC's road dominance combined with MIL's defensive collapse makes this a strong lean for Thunder. Watch Giannis's injury designation — it flips the entire model.",
    betRecommendation: "OKC -4",
    betConfidence: 66,
    projectedTotal: 230
  },
  7006: {
    // DEN (home) vs BOS (away)
    winProbability: { home: 48, away: 52 },
    sharpIndicator: "neutral",
    sharpNote: "52% sharp on BOS -1.5",
    lineMovement: "Pick → BOS -1.5 (72h)",
    keyFactors: [
      {
        label: "Mile High Altitude",
        edge: "home",
        note: "Denver's altitude historically hurts visiting team's shooting efficiency by 3-4%."
      },
      {
        label: "Jokic vs BOS Defense",
        edge: "home",
        note: "BOS has no answer for Jokic — ranks #7 vs C but struggles with playmaking bigs."
      },
      {
        label: "BOS Perimeter Shooting",
        edge: "away",
        note: "Celtics lead league in 3PA. Altitude impacts long-range shooting less than mid-range."
      }
    ],
    aiSummary:
      "One of the tightest games of the stretch. BOS's offensive firepower is real, but Jokic at home in Denver is elite. This is a coin-flip dressed up as a number.",
    betRecommendation: "DEN +1.5",
    betConfidence: 54,
    projectedTotal: 229
  },
  7007: {
    // GSW (home) vs MIN (away)
    winProbability: { home: 52, away: 48 },
    sharpIndicator: "neutral",
    sharpNote: "No line available yet",
    lineMovement: "No odds posted",
    keyFactors: [
      {
        label: "Chase Center Atmosphere",
        edge: "home",
        note: "Curry at home with crowd support — his 3PT% rises 3.2% at Chase Center."
      },
      {
        label: "MIN Defense",
        edge: "away",
        note: "Timberwolves rank #2 defense — slowest pace matchup for GSW all season."
      }
    ],
    aiSummary:
      "No odds posted. Watch injury reports closely for both sides before this one develops.",
    betRecommendation: "Wait for line",
    betConfidence: 0,
    projectedTotal: 222
  },
  7008: {
    // MIA (home) vs BOS (away)
    winProbability: { home: 42, away: 58 },
    sharpIndicator: "neutral",
    sharpNote: "No line posted yet",
    lineMovement: "No odds posted",
    keyFactors: [
      {
        label: "BOS Playoff Mode",
        edge: "away",
        note: "Celtics locked in second seed — expect full rotation at full effort."
      },
      {
        label: "MIA Half-Court Identity",
        edge: "home",
        note: "Heat thrive at slow pace — will try to keep the game under 215."
      }
    ],
    aiSummary:
      "BOS should be favored here when the line drops. MIA is a tough cover when Butler is engaged and they control tempo.",
    betRecommendation: "Wait for line",
    betConfidence: 0,
    projectedTotal: 214
  }
};

// ── Player props ───────────────────────────────────────────────────────────────
export const playerPropsData = {
  sga: {
    points: { line: 30.5, aiPick: "over", confidence: 74, note: "6/10 over this line — hot streak continues" },
    assists: { line: 6.5, aiPick: "over", confidence: 62, note: "GSW's PG defense ranked #12 — open lanes" },
    rebounds: { line: 4.5, aiPick: "under", confidence: 55, note: "GSW big men limit paint rebounds for guards" }
  },
  chet: {
    points: { line: 17.5, aiPick: "over", confidence: 61, note: "GSW ranks #10 defending centers — open looks" },
    rebounds: { line: 7.5, aiPick: "over", confidence: 66, note: "Chet has 8+ rebounds in 4 of last 5 games" },
    blocks: { line: 2.5, aiPick: "over", confidence: 69, note: "GSW's Wiggins forces frequent rim attempts" }
  },
  jt: {
    points: { line: 27.5, aiPick: "over", confidence: 66, note: "Last 5 avg 30.0 PPG — Tatum in peak form" },
    rebounds: { line: 8.5, aiPick: "over", confidence: 58, note: "MIL ranked #20 vs PF/SF rebounds" },
    assists: { line: 4.5, aiPick: "over", confidence: 60, note: "Tatum's playmaking up 1.2 APG last 10 games" }
  },
  jb: {
    points: { line: 23.5, aiPick: "over", confidence: 59, note: "MIL #17 perimeter D — Brown will get to his spots" },
    rebounds: { line: 5.5, aiPick: "under", confidence: 54, note: "MIL plays drop coverage limiting offensive boards" },
    assists: { line: 3.5, aiPick: "under", confidence: 52, note: "Brown's assist numbers inconsistent" }
  },
  nj: {
    points: { line: 30.5, aiPick: "under", confidence: 58, note: "Gobert holds Jokic to 24.0 PPG historically" },
    assists: { line: 10.5, aiPick: "over", confidence: 67, note: "MIN guards can't contain playmaking — dish city" },
    rebounds: { line: 13.5, aiPick: "under", confidence: 55, note: "Gobert dominates boards at home — limits Jokic's 2nd chances" }
  },
  kcp: {
    points: { line: 12.5, aiPick: "under", confidence: 57, note: "MIN elite perimeter D limits corner 3 looks" },
    rebounds: { line: 3.5, aiPick: "under", confidence: 53, note: "MIN's rebounding scheme shuts down role players" },
    assists: { line: 2.5, aiPick: "under", confidence: 51, note: "KCP's assist numbers volatile game to game" }
  },
  sw: {
    points: { line: 27.5, aiPick: "over", confidence: 64, note: "Last 5 avg 30.2 PPG — on fire at home" },
    rebounds: { line: 4.5, aiPick: "under", confidence: 57, note: "OKC big men dominate boards" },
    threes: { line: 3.5, aiPick: "over", confidence: 69, note: "Curry at Chase Center: 3PM/g rises to 5.1" }
  },
  at: {
    points: { line: 17.5, aiPick: "under", confidence: 54, note: "MIN's perimeter lockdown limits Wiggins' drives" },
    rebounds: { line: 5.5, aiPick: "under", confidence: 52, note: "MIN's Gobert controls boards in his zip code" },
    assists: { line: 2.5, aiPick: "under", confidence: 51, note: "Low usage role vs MIN's system" }
  },
  jb2: {
    points: { line: 20.5, aiPick: "under", confidence: 59, note: "Butler cold last 5 games — knee affecting his drives" },
    assists: { line: 5.5, aiPick: "over", confidence: 56, note: "Butler's pass-first mode when scoring struggles" },
    rebounds: { line: 5.5, aiPick: "over", confidence: 57, note: "LAC SF defense leaves Butler free to crash boards" }
  },
  bg: {
    points: { line: 20.5, aiPick: "over", confidence: 63, note: "LAC's center D ranked #6 but Bam is a mismatch" },
    rebounds: { line: 10.5, aiPick: "over", confidence: 66, note: "Bam averages 12+ boards vs physical frontcourts" },
    assists: { line: 3.5, aiPick: "under", confidence: 52, note: "LAC's half-court D limits easy passes to center" }
  },
  gab: {
    points: { line: 31.5, aiPick: "over", confidence: 70, note: "Giannis revenge game vs BOS — last 3 avg 34.0" },
    rebounds: { line: 11.5, aiPick: "over", confidence: 64, note: "BOS has no answer for Giannis' board dominance" },
    assists: { line: 6.5, aiPick: "under", confidence: 53, note: "BOS's switching defense limits Giannis drive-and-kick" }
  },
  db2: {
    points: { line: 24.5, aiPick: "under", confidence: 57, note: "BOS ranks #2 PG defense — limits Lillard off screens" },
    assists: { line: 7.5, aiPick: "over", confidence: 60, note: "Lillard's playmaking elevates when scoring is shut down" },
    threes: { line: 3.5, aiPick: "under", confidence: 58, note: "BOS perimeter D forces long closeouts on Dame" }
  },
  ae: {
    points: { line: 27.5, aiPick: "over", confidence: 71, note: "Ant averaging 34.3 PPG over last 3 — on absolute fire" },
    rebounds: { line: 5.5, aiPick: "under", confidence: 54, note: "DEN's Jokic dominates boards, limits guard rebounds" },
    assists: { line: 5.5, aiPick: "over", confidence: 60, note: "Edwards' playmaking improving — 7+ assists last 2 games" }
  },
  rg: {
    points: { line: 13.5, aiPick: "under", confidence: 56, note: "DEN forces mobile centers away from paint — limits Gobert" },
    rebounds: { line: 12.5, aiPick: "over", confidence: 67, note: "Gobert dominates glass at home — DEN lacks elite rebounder" },
    blocks: { line: 2.5, aiPick: "over", confidence: 64, note: "Jokic posts up = rim attacks = Gobert blocks" }
  },
  pb: {
    points: { line: 22.5, aiPick: "over", confidence: 63, note: "MIA ranks #5 SF defense but PG13 gets mid-range all day" },
    rebounds: { line: 5.5, aiPick: "over", confidence: 58, note: "George actively crashing boards to improve numbers" },
    assists: { line: 4.5, aiPick: "under", confidence: 53, note: "MIA's zone disrupts typical PG13 facilitating" }
  },
  kl: {
    points: { line: 23.5, aiPick: "over", confidence: 60, note: "When Leonard plays, he elevates vs defensive-minded teams" },
    rebounds: { line: 6.5, aiPick: "over", confidence: 57, note: "Kawhi's board numbers spike vs physical teams like MIA" },
    steals: { line: 1.5, aiPick: "over", confidence: 65, note: "Kawhi leads all SFs in deflections — MIA's sloppy passes" }
  }
};

// ── Injury / availability report ───────────────────────────────────────────────
// status: "healthy" | "questionable" | "doubtful" | "out" | "gtd"
export const injuryData = {
  sga: { status: "healthy" },
  chet: { status: "healthy" },
  jt: { status: "questionable", note: "Right ankle soreness — limited in practice" },
  jb: { status: "healthy" },
  nj: { status: "healthy" },
  kcp: { status: "healthy" },
  sw: { status: "healthy" },
  at: { status: "healthy" },
  jb2: { status: "questionable", note: "Left knee management — day-to-day" },
  bg: { status: "healthy" },
  gab: { status: "questionable", note: "Right knee — listed Q but expected to play" },
  db2: { status: "healthy" },
  ae: { status: "healthy" },
  rg: { status: "healthy" },
  pb: { status: "healthy" },
  kl: { status: "doubtful", note: "Load management — second night of back-to-back" }
};

// ── Hot / cold streaks ─────────────────────────────────────────────────────────
// last5Avg vs seasonAvg threshold triggers streak label
export const playerStreaks = {
  sga: { streak: "hot", note: "31.2 avg last 5 · season avg 31.2 · 41-pt explosion vs DEN" },
  ae: { streak: "hot", note: "33.4 avg last 5 · season avg 27.4 · career-high potential coming" },
  gab: { streak: "hot", note: "33.0 avg last 5 · revenge game energy vs BOS" },
  sw: { streak: "hot", note: "30.2 avg last 5 · 38-pt performance at BOS" },
  jt: { streak: "warm", note: "29.2 avg last 5 · ankle is the only question mark" },
  nj: { streak: "warm", note: "28.6 avg last 5 · triple-double machine even in slow games" },
  jb2: { streak: "cold", note: "20.4 avg last 5 · knee impacting first step explosiveness" },
  db2: { streak: "cold", note: "26.4 avg last 5 · 0/7 from 3 last two games" },
  kcp: { streak: "cold", note: "12.8 avg last 5 · MIN held him to 11 points in last matchup" }
};

// ── Helper functions ───────────────────────────────────────────────────────────

export function getGameAiData(gameId) {
  return gameAiData[gameId] ?? null;
}

export function getPlayerProps(playerId) {
  return playerPropsData[playerId] ?? null;
}

export function getInjuryStatus(playerId) {
  return injuryData[playerId] ?? { status: "healthy" };
}

export function getPlayerStreak(playerId) {
  return playerStreaks[playerId] ?? null;
}

export function getHotPlayers(allPlayers) {
  const hotIds = Object.entries(playerStreaks)
    .filter(([, v]) => v.streak === "hot")
    .map(([id]) => id);

  return allPlayers.filter((player) => hotIds.includes(player.id)).slice(0, 4);
}
