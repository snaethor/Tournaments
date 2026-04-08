import { create } from "zustand";
import type { TournamentWithRelations } from "@/lib/types";

interface TournamentStore {
  tournament: TournamentWithRelations | null;
  hostToken: string | null;
  isHost: boolean;
  draftPaused: boolean;
  setTournament: (t: TournamentWithRelations) => void;
  setHostToken: (token: string) => void;
  checkHost: (token: string) => void;
  setDraftPaused: (paused: boolean) => void;
  clearTournament: () => void;
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  tournament: null,
  hostToken: null,
  isHost: false,
  draftPaused: false,

  setTournament: (tournament) => set({ tournament }),

  setHostToken: (token) => {
    set({ hostToken: token });
    if (typeof window !== "undefined") {
      localStorage.setItem("hostToken", token);
    }
  },

  checkHost: (tournamentHostToken) => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("hostToken");
    set({ isHost: stored === tournamentHostToken, hostToken: stored });
  },

  setDraftPaused: (draftPaused) => set({ draftPaused }),

  clearTournament: () =>
    set({ tournament: null, isHost: false, draftPaused: false }),
}));
