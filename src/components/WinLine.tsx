// src/components/WinLine.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface WinLineProps {
  combo: number[];
  boardSize: number;
  totalSize: number;
  color: string;
  cellSize: number;
}

export default function WinLine({
  combo,
  boardSize,
  totalSize,
  color,
  cellSize,
}: WinLineProps) {
  const gap = 3;
  const padding = 3;

  const getCenter = (idx: number) => {
    const row = Math.floor(idx / boardSize);
    const col = idx % boardSize;
    return {
      x: padding + col * (cellSize + gap) + cellSize / 2,
      y: padding + row * (cellSize + gap) + cellSize / 2,
    };
  };

  const start = getCenter(combo[0]);
  const end = getCenter(combo[combo.length - 1]);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  const containerSize = totalSize + padding * 2;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: containerSize,
        height: containerSize,
        pointerEvents: 'none',
      }}
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          height: 6,
          borderRadius: 3,
          width: length,
          backgroundColor: color,
          left: start.x,
          top: start.y,
          transformOrigin: 'left center',
          transform: `translateY(-3px) rotate(${angle}rad)`,
        }}
      />
    </div>
  );
}

// Fix for TS1208: ensures this is treated as an ES module
export {};