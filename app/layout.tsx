import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tournament Organizer",
  description: "Real-time tournament management for streamers and content creators",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
