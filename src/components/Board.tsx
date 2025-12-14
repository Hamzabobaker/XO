// src/components/Board.tsx
import React from 'react';
import { useApp } from '../context';
import { motion } from 'framer-motion';
import WinLine from './WinLine';

type Cell = 'X' | 'O' | null;

interface BoardProps {
  board: Cell[];
  onPress: (index: number) => void;
  boardSize?: number;
  cellSize?: number;
  totalSize?: number;
  theme: any;
  winningCombo?: number[] | null;
  winningPlayer?: Cell | null;
  oldestXIndex?: number;
  oldestOIndex?: number;
}

export default function Board({
  board,
  onPress,
  boardSize = 3,
  cellSize,
  totalSize = 300,
  theme,
  winningCombo,
  winningPlayer,
  oldestXIndex = -1,
  oldestOIndex = -1,
}: BoardProps) {
  const calculatedCellSize = cellSize || totalSize / boardSize;

  const rows: number[][] = [];
  for (let i = 0; i < boardSize; i++) {
    const row: number[] = [];
    for (let j = 0; j < boardSize; j++) {
      row.push(i * boardSize + j);
    }
    rows.push(row);
  }

  const winColor =
    winningPlayer === 'X'
      ? theme.xColor
      : winningPlayer === 'O'
      ? theme.oColor
      : theme.winLine;

  const { actualThemeMode } = useApp();

  const hexToRgb = (hex: string) => {
    if (!hex) return null;
    // strip #
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

  const rgba = (color: string, alpha: number) => {
    if (!color) return color;
    if (color.startsWith('rgba') || color.startsWith('rgb')) return color;
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const tonedWinColor = actualThemeMode === 'light' ? rgba(winColor, 0.6) : winColor;

  const isOldestMark = (index: number): boolean =>
    index === oldestXIndex || index === oldestOIndex;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        direction: 'ltr', // keep board LTR even in RTL layout
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'relative',
          backgroundColor: theme.boardBg,
          padding: 6,
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          boxShadow: `0 8px 24px ${theme.shadow}, inset 0 2px 4px ${theme.shadow}`,
          border: `2px solid ${theme.cellBorder}`,
        }}
      >
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: 6 }}>
            {row.map((i) => (
              <motion.div
                key={i}
                whileHover={!board[i] ? { scale: 1.05 } : {}}
                whileTap={!board[i] ? { scale: 0.95 } : {}}
                transition={{ scale: { duration: 0.15, ease: 'easeOut' } }}
                onClick={() => onPress(i)}
                style={{
                  width: calculatedCellSize,
                  height: calculatedCellSize,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.cellBg,
                  borderRadius: 12,
                  cursor: board[i] ? 'default' : 'pointer',
                  boxShadow: board[i]
                    ? `inset 0 2px 4px ${theme.cellShadow}`
                    : `0 2px 8px ${theme.cellShadow}`,
                  border: `2px solid ${theme.cellBorder}`,
                  position: 'relative',
                  overflow: 'hidden',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  outline: 'none',
                }}
              >
                {!board[i] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle, ${theme.hoverGlow} 0%, transparent 70%)`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {board[i] && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 600,
                      damping: 30,
                      mass: 0.5,
                    }}
                    style={{
                      fontSize: calculatedCellSize * 0.5,
                      fontWeight: 900,
                      color: winningCombo?.includes(i) && actualThemeMode === 'light'
                        ? rgba(board[i] === 'X' ? theme.xColor : theme.oColor, 0.92)
                        : (board[i] === 'X' ? theme.xColor : theme.oColor),
                      opacity: isOldestMark(i) ? 0.3 : 1,
                      textShadow: winningCombo?.includes(i)
                        ? `0 0 12px ${tonedWinColor}, 0 0 6px ${tonedWinColor}`
                        : `0 2px 4px ${theme.cellShadow}`,
                      transition: 'opacity 0.3s',
                      filter: winningCombo?.includes(i)
                        ? `drop-shadow(0 0 6px ${tonedWinColor})`
                        : 'none',
                    }}
                  >
                    {board[i]}
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        ))}

        {winningCombo && winningCombo.length >= 3 && winColor && (
          <WinLine
            combo={winningCombo}
            boardSize={boardSize}
            totalSize={totalSize}
            color={winColor}
            cellSize={calculatedCellSize}
          />
        )}
      </motion.div>
    </div>
  );
}
