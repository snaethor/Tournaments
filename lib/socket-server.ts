import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { ServerToClientEvents, ClientToServerEvents } from "./types";

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

export function initSocketServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
    addTrailingSlash: false,
  });

  io.on("connection", (socket) => {
    socket.on("join:room", (tournamentId: string) => {
      socket.join(`tournament:${tournamentId}`);
    });

    socket.on("disconnect", () => {
      // cleanup handled automatically
    });
  });

  return io;
}

export function getSocketServer() {
  return io;
}

export function emitToTournament(
  tournamentId: string,
  event: keyof ServerToClientEvents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  if (!io) return;
  io.to(`tournament:${tournamentId}`).emit(event, data);
}
