import React from 'react';
import WinLine from './WinLine';

type Cell = 'X' | 'O' | null;

interface BoardProps {
  board: Cell[];
  onPress: (index: number) => void;
  boardSize?: number;
  cellSize?: number;
  theme: any;
  winningCombo?: number[] | null;
  winningPlayer?: Cell | null;
}

export default function Board({
  board,
  onPress,
  boardSize = 3,
  cellSize,
  theme,
  winningCombo,
  winningPlayer,
}: BoardProps) {
  const totalSize = 300;
  const calculatedCellSize = cellSize || totalSize / boardSize;

  // Generate rows dynamically
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        style={{
          position: 'relative',
          backgroundColor: theme.border,
          padding: 3,
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          boxShadow: `0 4px 8px ${theme.shadow}`,
        }}
      >
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: 3 }}>
            {row.map((i) => (
              <div
                key={i}
                onClick={() => onPress(i)}
                style={{
                  width: calculatedCellSize,
                  height: calculatedCellSize,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.surface,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {board[i] && (
                  <span
                    style={{
                      fontSize: calculatedCellSize * 0.5,
                      fontWeight: 'bold',
                      color: board[i] === 'X' ? theme.xColor : theme.oColor,
                      textShadow: winningCombo?.includes(i)
                        ? `0 0 15px ${winColor}`
                        : 'none',
                    }}
                  >
                    {board[i]}
                  </span>
                )}
              </div>
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
      </div>
    </div>
  );
}
