"use client";

import { useEffect, useState } from "react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#38bdf8", "#f472b6", "#a78bfa"];

interface Piece {
  id: number;
  color: string;
  left: string;
  duration: string;
  delay: string;
  size: string;
}

export default function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const arr: Piece[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      left: `${Math.random() * 100}%`,
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </>
  );
}
