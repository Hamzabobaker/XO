// src/components/WinLine.tsx
import React from 'react';
import { useApp } from '../context';
import { motion } from 'framer-motion';
interface WinLineProps {
  combo: number[];
  boardSize: number;
  totalSize: number;
  color: string;
  cellSize: number;
  gap?: number;
  padding?: number;
  offsetX?: number;
  offsetY?: number;
}
function WinLine({
  combo,
  boardSize,
  totalSize,
  color,
  cellSize,
  gap = 6,
  padding = 6,
  offsetX,
  offsetY,
}: WinLineProps) {
  const { actualThemeMode } = useApp();
  const hexToRgb = (hex: string) => {
    if (!hex) return null;
    const h = hex.replace('#', '');
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b };
    }
    if (h.length === 6) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return { r, g, b };
    }
    return null;
  };
  const rgba = (c: string, a: number) => {
    if (!c) return c;
    if (c.startsWith('rgba') || c.startsWith('rgb')) return c;
    const rgb = hexToRgb(c);
    if (!rgb) return c;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
  };
  const tonedColor = actualThemeMode === 'light' ? rgba(color, 0.75) : color;
  const shadowColor = actualThemeMode === 'light' ? rgba(color, 0.45) : `${color}66`;
  const baseX = offsetX ?? padding;
  const baseY = offsetY ?? padding;
  const getCenter = (idx: number) => {
    const row = Math.floor(idx / boardSize);
    const col = idx % boardSize;
    return {
      x: baseX + col * (cellSize + gap) + cellSize / 2,
      y: baseY + row * (cellSize + gap) + cellSize / 2,
    };
  };
  if (!combo || combo.length < 2) {
    return null;
  }
  const start = getCenter(combo[0]);
  const end = getCenter(combo[combo.length - 1]);
  const lineThickness = Math.max(4, Math.round(cellSize * 0.10));
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <motion.line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={tonedColor}
        strokeWidth={lineThickness}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          filter: `drop-shadow(0 0 ${Math.max(6, lineThickness)}px ${shadowColor})`,
        }}
      />
    </svg>
  );
}

export default React.memo(WinLine);
