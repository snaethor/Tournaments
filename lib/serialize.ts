import type { TournamentWithRelations } from "./types";

type RawTournament = Omit<TournamentWithRelations, "mapPool" | "servers" | "draftMode" | "roundBestOf"> & {
  mapPool: string;
  servers: string;
  draftMode: string;
  roundBestOf: string;
};

/** Convert DB tournament (comma-string arrays) to typed format with string[] */
export function serializeTournament(raw: RawTournament): TournamentWithRelations {
  return {
    ...raw,
    mapPool: raw.mapPool ? raw.mapPool.split(",").map((s) => s.trim()).filter(Boolean) : [],
    servers: raw.servers ? raw.servers.split(",").map((s) => s.trim()).filter(Boolean) : [],
    draftMode: (raw.draftMode === "linear" ? "linear" : "snake") as import("./types").DraftMode,
    roundBestOf: raw.roundBestOf ? raw.roundBestOf.split(",").map((s) => parseInt(s.trim()) || 1) : [],
  };
}
