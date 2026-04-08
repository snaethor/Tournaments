import type { Tournament, Team, Participant, Match, DraftPick } from "@prisma/client";

export type TournamentStatus = "WAITING" | "DRAFTING" | "BRACKET" | "IN_PROGRESS" | "COMPLETED";
export type ParticipantRole = "HOST" | "CAPTAIN" | "PARTICIPANT";

export type DraftMode = "snake" | "linear";

export type TournamentWithRelations = Omit<Tournament, "mapPool" | "servers" | "roundBestOf"> & {
  mapPool: string[];
  servers: string[];
  draftMode: DraftMode;
  roundBestOf: number[];
  status: TournamentStatus;
  teams: TeamWithRelations[];
  participants: Participant[];
  matches: MatchWithRelations[];
  draftPicks: DraftPickWithRelations[];
};

export type TeamWithRelations = Team & {
  members: Participant[];
  captain: Participant | null;
};

export type MatchWithRelations = Match & {
  team1: TeamWithRelations | null;
  team2: TeamWithRelations | null;
  winner: TeamWithRelations | null;
  bestOf: number;
  team1Score: number;
  team2Score: number;
};

export type DraftPickWithRelations = DraftPick & {
  team: Team;
  participant: Participant;
};

// Socket.io event payloads
export interface DraftPickEvent {
  tournamentId: string;
  participantId: string;
  teamId: string;
  pickNumber: number;
  round: number;
  nextTeamIndex: number;
  nextRound: number;
  nextDirection: string;
}

export interface ServerToClientEvents {
  "draft:pick": (data: DraftPickEvent & { tournament: TournamentWithRelations }) => void;
  "draft:start": (data: { tournament: TournamentWithRelations }) => void;
  "draft:pause": (data: { tournamentId: string }) => void;
  "draft:resume": (data: { tournamentId: string }) => void;
  "bracket:update": (data: { tournament: TournamentWithRelations }) => void;
  "match:setup": (data: { match: MatchWithRelations }) => void;
  "match:result": (data: { match: MatchWithRelations; tournament: TournamentWithRelations }) => void;
  "participant:joined": (data: { participant: Participant }) => void;
  "participant:left": (data: { participant: Participant }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  "join:room": (tournamentId: string) => void;
}
