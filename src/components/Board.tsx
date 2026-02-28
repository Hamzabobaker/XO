// src/components/Board.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import WinLine from './WinLine';

type Cell = 'X' | 'O' | null;

interface BoardProps {
  board: Cell[];
  onPress: (index: number) => void;
  boardSize?: number;
  cellSize?: number;
  totalSize?: number;
  theme: any;
  gravityMode?: boolean;
  interactionDisabled?: boolean;
  winningCombo?: number[] | null;
  winningPlayer?: Cell | null;
  oldestXIndex?: number;
  oldestOIndex?: number;
}

interface ActiveDrop {
  index: number;
  symbol: 'X' | 'O';
  key: number;
}

const CELL_GAP = 6;
const BOARD_PADDING = 10;
const DROP_LANE_HEIGHT = 16;
const TOUCH_SUPPRESSION_MS = 220;
const SYNTHETIC_CLICK_GUARD_MS = 220;

function Board({
  board,
  onPress,
  boardSize = 3,
  cellSize,
  totalSize = 300,
  theme,
  gravityMode = false,
  interactionDisabled = false,
  winningCombo,
  winningPlayer,
  oldestXIndex = -1,
  oldestOIndex = -1,
}: BoardProps) {
  const calculatedCellSize = cellSize || totalSize / boardSize;
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [touchHeldColumn, setTouchHeldColumn] = useState<number | null>(null);
  const [activeDrop, setActiveDrop] = useState<ActiveDrop | null>(null);
  const previousBoardRef = useRef<Cell[]>(board);
  const touchInteractionUntilRef = useRef(0);
  const ignoreSyntheticClickUntilRef = useRef(0);
  const supportsHoverRef = useRef(
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
      : true
  );
  const { actualThemeMode } = useApp();

  let latestPlacedIndex = -1;
  for (let i = 0; i < board.length; i++) {
    if (previousBoardRef.current[i] === null && board[i] !== null) {
      latestPlacedIndex = i;
    }
  }

  useEffect(() => {
    if (!gravityMode || latestPlacedIndex < 0) return;
    const symbol = board[latestPlacedIndex];
    if (!symbol) return;

    setActiveDrop({ index: latestPlacedIndex, symbol, key: Date.now() + latestPlacedIndex });
  }, [gravityMode, latestPlacedIndex, board]);

  useEffect(() => {
    previousBoardRef.current = board;
  }, [board]);

  useEffect(() => {
    if (!gravityMode) {
      setHoveredColumn(null);
      setTouchHeldColumn(null);
      setActiveDrop(null);
      ignoreSyntheticClickUntilRef.current = 0;
    }
  }, [gravityMode]);

  useEffect(() => {
    if (!interactionDisabled) return;
    setHoveredColumn(null);
    setTouchHeldColumn(null);
    // Swallow delayed synthetic clicks that can fire after a disabled touch period.
    ignoreSyntheticClickUntilRef.current = Date.now() + SYNTHETIC_CLICK_GUARD_MS;
  }, [interactionDisabled]);

  useEffect(() => {
    if (!gravityMode) return;
    const clearTouchHold = () => {
      touchInteractionUntilRef.current = Date.now() + TOUCH_SUPPRESSION_MS;
      setTouchHeldColumn(null);
      setHoveredColumn(null);
    };
    const clearTouchHoldFromPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') clearTouchHold();
    };
    window.addEventListener('touchend', clearTouchHold);
    window.addEventListener('touchcancel', clearTouchHold);
    window.addEventListener('pointerup', clearTouchHoldFromPointer);
    window.addEventListener('pointercancel', clearTouchHoldFromPointer);
    return () => {
      window.removeEventListener('touchend', clearTouchHold);
      window.removeEventListener('touchcancel', clearTouchHold);
      window.removeEventListener('pointerup', clearTouchHoldFromPointer);
      window.removeEventListener('pointercancel', clearTouchHoldFromPointer);
    };
  }, [gravityMode]);

  const canUseHover = () =>
    !interactionDisabled &&
    supportsHoverRef.current &&
    touchHeldColumn === null &&
    Date.now() >= touchInteractionUntilRef.current;
  const shouldIgnoreSyntheticClick = () =>
    Date.now() < ignoreSyntheticClickUntilRef.current;
  const isColumnOpen = (col: number) => board[col] === null;
  const triggerColumnPress = (col: number) => {
    if (interactionDisabled) return;
    if (shouldIgnoreSyntheticClick()) return;
    if (!isColumnOpen(col)) return;
    setTouchHeldColumn(null);
    onPress(col);
  };
  const beginTouchHold = (col: number) => {
    touchInteractionUntilRef.current = Date.now() + TOUCH_SUPPRESSION_MS;
    setHoveredColumn(null);
    setTouchHeldColumn(col);
  };
  const endTouchHold = (
    col: number,
    triggerPress: boolean,
    event?: React.TouchEvent<HTMLElement>
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    touchInteractionUntilRef.current = Date.now() + TOUCH_SUPPRESSION_MS;
    setHoveredColumn(null);
    setTouchHeldColumn((prev) => (prev === col ? null : prev));
    if (triggerPress) {
      ignoreSyntheticClickUntilRef.current = Date.now() + SYNTHETIC_CLICK_GUARD_MS;
      if (!interactionDisabled && isColumnOpen(col)) {
        onPress(col);
      }
    }
  };
  const activeColumnHighlight = interactionDisabled ? null : touchHeldColumn ?? hoveredColumn;

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

  const rgba = (color: string, alpha: number) => {
    if (!color) return color;
    if (color.startsWith('rgba') || color.startsWith('rgb')) return color;
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  };

  const boardBorder = actualThemeMode === 'light' ? rgba(theme.primary, 0.3) : theme.cellBorder;
  const boardGlow = actualThemeMode === 'light' ? rgba(theme.primary, 0.18) : theme.shadow;
  const boardFill =
    actualThemeMode === 'light'
      ? `linear-gradient(170deg, ${theme.surfaceVariant} 0%, ${theme.boardBg} 80%)`
      : `linear-gradient(170deg, ${theme.surfaceVariant || theme.boardBg} 0%, ${theme.boardBg} 88%)`;
  const cellFillBase =
    actualThemeMode === 'light'
      ? `linear-gradient(170deg, ${theme.cellBg} 0%, ${rgba(theme.primary, 0.1)} 100%)`
      : `linear-gradient(170deg, ${theme.cellBg} 0%, ${theme.surface} 100%)`;
  const tonedWinColor = actualThemeMode === 'light' ? rgba(winColor, 0.6) : winColor;
  const activeOldestIndex = oldestXIndex >= 0 ? oldestXIndex : oldestOIndex;
  const isOldestMark = (index: number): boolean => index === activeOldestIndex;

  const gridOffsetY = gravityMode ? DROP_LANE_HEIGHT + CELL_GAP : 0;
  const dropStartY = BOARD_PADDING + DROP_LANE_HEIGHT / 2;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        direction: 'ltr',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{
          position: 'relative',
          padding: BOARD_PADDING,
          borderRadius: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: CELL_GAP,
          border: `2px solid ${boardBorder}`,
          overflow: 'hidden',
          background: boardFill,
          boxShadow: `0 12px 30px ${boardGlow}, inset 0 1px 0 ${rgba(theme.primary, 0.24)}`,
          pointerEvents: interactionDisabled ? 'none' : 'auto',
        }}
      >
        {gravityMode && (
          <div style={{ display: 'flex', gap: CELL_GAP }}>
            {Array.from({ length: boardSize }).map((_, col) => {
              const columnOpen = isColumnOpen(col);
              const isHighlighted = activeColumnHighlight === col;
              return (
                <motion.button
                  key={`gravity-col-${col}`}
                  whileHover={columnOpen ? { scale: 1.05 } : {}}
                  whileTap={columnOpen ? { scale: 0.95 } : {}}
                  transition={{ duration: 0.12 }}
                  onClick={() => triggerColumnPress(col)}
                  onMouseEnter={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn(col);
                  }}
                  onMouseLeave={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn((prev) => (prev === col ? null : prev));
                  }}
                  onFocus={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn(col);
                  }}
                  onBlur={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn((prev) => (prev === col ? null : prev));
                  }}
                  onTouchStart={() => beginTouchHold(col)}
                  onTouchEnd={(event) => endTouchHold(col, columnOpen, event)}
                  onTouchCancel={(event) => endTouchHold(col, false, event)}
                  disabled={!columnOpen}
                  style={{
                    width: calculatedCellSize,
                    height: DROP_LANE_HEIGHT,
                    borderRadius: 999,
                    border: `1.5px solid ${isHighlighted ? rgba(theme.primary, 0.8) : theme.cellBorder}`,
                    background: columnOpen
                      ? isHighlighted
                        ? `linear-gradient(135deg, ${rgba(theme.primary, 0.38)} 0%, ${rgba(theme.accent, 0.28)} 100%)`
                        : `linear-gradient(135deg, ${rgba(theme.primary, 0.24)} 0%, ${rgba(theme.accent, 0.18)} 100%)`
                      : `${theme.surface}88`,
                    cursor: columnOpen ? 'pointer' : 'default',
                    opacity: columnOpen ? 1 : 0.45,
                    boxShadow: isHighlighted ? `0 0 14px ${rgba(theme.primary, 0.55)}` : 'none',
                  }}
                />
              );
            })}
          </div>
        )}

        {gravityMode && (
          <div
            style={{
              position: 'absolute',
              left: BOARD_PADDING,
              top: BOARD_PADDING + DROP_LANE_HEIGHT + CELL_GAP,
              width: boardSize * calculatedCellSize + (boardSize - 1) * CELL_GAP,
              height: boardSize * calculatedCellSize + (boardSize - 1) * CELL_GAP,
              display: 'flex',
              zIndex: 2,
            }}
          >
            {Array.from({ length: boardSize }).map((_, col) => {
              const columnOpen = isColumnOpen(col);
              return (
                <button
                  key={`gravity-hit-col-${col}`}
                  onClick={() => triggerColumnPress(col)}
                  onMouseEnter={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn(col);
                  }}
                  onMouseLeave={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn((prev) => (prev === col ? null : prev));
                  }}
                  onFocus={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn(col);
                  }}
                  onBlur={() => {
                    if (!canUseHover()) return;
                    setHoveredColumn((prev) => (prev === col ? null : prev));
                  }}
                  onTouchStart={() => beginTouchHold(col)}
                  onTouchEnd={(event) => endTouchHold(col, columnOpen, event)}
                  onTouchCancel={(event) => endTouchHold(col, false, event)}
                  disabled={!columnOpen}
                  aria-label={`gravity-column-${col + 1}`}
                  style={{
                    width:
                      (boardSize * calculatedCellSize + (boardSize - 1) * CELL_GAP) / boardSize,
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    margin: 0,
                    cursor: columnOpen ? 'pointer' : 'default',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              );
            })}
          </div>
        )}

        {rows.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: CELL_GAP }}>
            {row.map((i) => {
              const col = i % boardSize;
              const columnIsOpen = board[col] === null;
              const hideCellMarkDuringDrop =
                gravityMode &&
                (i === latestPlacedIndex || (activeDrop !== null && activeDrop.index === i));
              const markTargetOpacity = hideCellMarkDuringDrop
                ? 0
                : isOldestMark(i)
                ? 0.3
                : 1;

              return (
                <motion.div
                  key={i}
                  whileHover={!gravityMode && !board[i] ? { scale: 1.05 } : {}}
                  whileTap={!gravityMode && !board[i] ? { scale: 0.95 } : {}}
                  transition={{ scale: { duration: 0.15, ease: 'easeOut' } }}
                  onClick={(event) => {
                    if (interactionDisabled || shouldIgnoreSyntheticClick()) return;
                    if (!gravityMode) {
                      onPress(i);
                      return;
                    }
                    event.stopPropagation();
                    triggerColumnPress(col);
                  }}
                  onMouseEnter={() => {
                    if (!gravityMode || !canUseHover()) return;
                    setHoveredColumn(col);
                  }}
                  onMouseLeave={() => {
                    if (!gravityMode || !canUseHover()) return;
                    setHoveredColumn((prev) => (prev === col ? null : prev));
                  }}
                  onTouchStart={() => {
                    if (!gravityMode) return;
                    beginTouchHold(col);
                  }}
                  onTouchEnd={(event) => {
                    if (!gravityMode) return;
                    endTouchHold(col, columnIsOpen, event);
                  }}
                  onTouchCancel={(event) => {
                    if (!gravityMode) return;
                    endTouchHold(col, false, event);
                  }}
                  style={{
                    width: calculatedCellSize,
                    height: calculatedCellSize,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: cellFillBase,
                    borderRadius: 14,
                    cursor: gravityMode
                      ? columnIsOpen
                        ? 'pointer'
                        : 'default'
                      : board[i]
                      ? 'default'
                      : 'pointer',
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
                  {!board[i] && !gravityMode && (
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
                      initial={gravityMode ? false : { scale: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: markTargetOpacity,
                      }}
                      transition={
                        gravityMode
                          ? { duration: hideCellMarkDuringDrop ? 0.01 : 0.18 }
                          : hideCellMarkDuringDrop
                          ? { duration: 0.01 }
                          : {
                              scale: { type: 'spring', stiffness: 600, damping: 30, mass: 0.5 },
                              opacity: { duration: 0.2 },
                            }
                      }
                      style={{
                        fontSize: calculatedCellSize * 0.5,
                        fontWeight: 900,
                        color:
                          winningCombo?.includes(i) && actualThemeMode === 'light'
                            ? rgba(board[i] === 'X' ? theme.xColor : theme.oColor, 0.92)
                            : board[i] === 'X'
                            ? theme.xColor
                            : theme.oColor,
                        textShadow: winningCombo?.includes(i)
                          ? `0 0 12px ${tonedWinColor}, 0 0 6px ${tonedWinColor}`
                          : `0 2px 4px ${theme.cellShadow}`,
                        filter: winningCombo?.includes(i)
                          ? `drop-shadow(0 0 6px ${tonedWinColor})`
                          : 'none',
                      }}
                    >
                      {board[i]}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}

        {gravityMode && activeDrop && (
          (() => {
            const dropKey = activeDrop.key;
            const row = Math.floor(activeDrop.index / boardSize);
            const col = activeDrop.index % boardSize;
            const targetCenterY =
              BOARD_PADDING +
              DROP_LANE_HEIGHT +
              CELL_GAP +
              row * (calculatedCellSize + CELL_GAP) +
              calculatedCellSize / 2;
            const fallDistance = targetCenterY - dropStartY;
            const overshoot = Math.max(20, Math.min(38, calculatedCellSize * 0.26));
            const settleDuration = 0.3;
            const fallSpeedPxPerSec = 3000;
            const fallDuration = Math.max(0.055, Math.min(0.12, fallDistance / fallSpeedPxPerSec));
            const totalDuration = fallDuration + settleDuration;
            const impactTime = fallDuration / totalDuration;
            const preImpactTime = impactTime * 0.86;
            return (
              <div
                key={`drop-shell-${dropKey}`}
                style={{
                  position: 'absolute',
                  left: BOARD_PADDING + col * (calculatedCellSize + CELL_GAP) + calculatedCellSize / 2,
                  top: targetCenterY,
                  width: calculatedCellSize,
                  height: calculatedCellSize,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              >
                <motion.div
                  key={`active-drop-${dropKey}`}
                  initial={{ y: -fallDistance, scale: 0.92, opacity: 0.95 }}
                  animate={{
                    y: [-fallDistance, -overshoot * 0.18, overshoot, 0],
                    scale: [0.92, 0.985, 1.06, 1],
                    opacity: [0.95, 1, 1, 1],
                  }}
                  transition={{
                    duration: totalDuration,
                    times: [0, preImpactTime, impactTime, 1],
                    ease: ['linear', 'easeOut', [0.2, 0.9, 0.2, 1]],
                  }}
                  onAnimationComplete={() => {
                    setActiveDrop((current) =>
                      current && current.key === dropKey ? null : current
                    );
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: calculatedCellSize * 0.5,
                      lineHeight: 1,
                      fontWeight: 900,
                      width: '1em',
                      textAlign: 'center',
                      display: 'block',
                      color: activeDrop.symbol === 'X' ? theme.xColor : theme.oColor,
                      textShadow: `0 6px 14px ${rgba(theme.shadow, 0.9)}`,
                      filter: `drop-shadow(0 0 6px ${rgba(
                        activeDrop.symbol === 'X' ? theme.xColor : theme.oColor,
                        0.4
                      )})`,
                    }}
                  >
                    {activeDrop.symbol}
                  </span>
                </motion.div>
              </div>
            );
          })()
        )}

        {winningCombo && winningCombo.length >= 3 && winColor && (
          <WinLine
            combo={winningCombo}
            boardSize={boardSize}
            totalSize={totalSize}
            color={winColor}
            cellSize={calculatedCellSize}
            gap={CELL_GAP}
            offsetX={BOARD_PADDING}
            offsetY={BOARD_PADDING + gridOffsetY}
          />
        )}
      </motion.div>
    </div>
  );
}

export default React.memo(Board);
