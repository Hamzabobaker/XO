// src/pages/Game.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoRefresh, IoExit, IoFlash, IoHourglass } from 'react-icons/io5';
import BlitzTimer from '../components/BlitzTimer';
import Board from '../components/Board';
import ConfirmModal from '../components/ConfirmModal';
import ResultModal from '../components/ResultModal';
import { useApp } from '../context';
import { getBotMove } from '../utils/ai';
import { renderIcon } from '../utils/renderIcon';

type Cell = 'X' | 'O' | null;

interface MoveRecord {
  player: 'X' | 'O';
  index: number;
  time: number;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Game() {
  const navigate = useNavigate();
  const query = useQuery();
  const { theme, t } = useApp();

  const mode = query.get('mode') || 'vsplayer';
  const difficulty = (query.get('difficulty') || 'normal') as
    | 'easy'
    | 'normal'
    | 'hard'
    | 'impossible';
  const variant = (query.get('variant') || 'classic') as string;

  const timePerMove = query.get('timePerMove')
    ? parseInt(query.get('timePerMove')!)
    : 10;
  const onTimeout = (query.get('onTimeout') || 'random') as
    | 'skip'
    | 'random'
    | 'lose';
  const boardSizeParam = query.get('boardSize')
    ? parseInt(query.get('boardSize')!)
    : 5;
  const winLengthParam = query.get('winLength')
    ? parseInt(query.get('winLength')!)
    : 4;
  const turnsUntilDoubleParam = query.get('turnsUntilDouble')
    ? parseInt(query.get('turnsUntilDouble')!)
    : 6;

  const isMegaBoard = variant === 'mega';
  const isDoubleMove = variant === 'doublemove';
  const isBlitzMode = variant === 'blitz';
  const boardSize = isMegaBoard ? (boardSizeParam as 4 | 5 | 7 | 8 | 9) : 3;
  const winLength = isMegaBoard ? winLengthParam : 3;
  const totalCells = boardSize * boardSize;

  const [board, setBoard] = useState<Cell[]>(Array(totalCells).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [winner, setWinner] = useState<Cell | 'draw' | null>(null);
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quitModalVisible, setQuitModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [xTimeLeft, setXTimeLeft] = useState(timePerMove);
  const [oTimeLeft, setOTimeLeft] = useState(timePerMove);
  const timerRef = useRef<number | null>(null);

  const [totalMoves, setTotalMoves] = useState(0);
  const [hasExtraMove, setHasExtraMove] = useState(false);
  const turnsUntilDouble = turnsUntilDoubleParam;

  const moveHistory = useRef<MoveRecord[]>([]);

  const generateWinningCombos = (
    size: number,
    length: number
  ): number[][] => {
    const combos: number[][] = [];

    // Horizontal
    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= size - length; col++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) {
          combo.push(row * size + col + i);
        }
        combos.push(combo);
      }
    }

    // Vertical
    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - length; row++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) {
          combo.push((row + i) * size + col);
        }
        combos.push(combo);
      }
    }

    // Diagonal (top-left to bottom-right)
    for (let row = 0; row <= size - length; row++) {
      for (let col = 0; col <= size - length; col++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) {
          combo.push((row + i) * size + (col + i));
        }
        combos.push(combo);
      }
    }

    // Diagonal (top-right to bottom-left)
    for (let row = 0; row <= size - length; row++) {
      for (let col = length - 1; col < size; col++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) {
          combo.push((row + i) * size + (col - i));
        }
        combos.push(combo);
      }
    }

    return combos;
  };

  const checkWinnerWithCombo = (
    b: Cell[]
  ): { result: Cell | 'draw' | null; combo: number[] | null } => {
    const winningCombos = generateWinningCombos(boardSize, winLength);

    for (const combo of winningCombos) {
      const firstCell = b[combo[0]];
      if (firstCell && combo.every((idx) => b[idx] === firstCell)) {
        return { result: firstCell, combo };
      }
    }

    if (b.every((cell) => cell !== null)) {
      return { result: 'draw', combo: null };
    }

    return { result: null, combo: null };
  };

  const handleTimeout = (player: 'X' | 'O') => {
    if (!winner && isBlitzMode) {
      if (onTimeout === 'lose') {
        const winnerPlayer = player === 'X' ? 'O' : 'X';
        setWinner(winnerPlayer);
        setModalTitle(t('winner'));
        setModalMessage(winnerPlayer === 'X' ? t('xWins') : t('oWins'));
        setModalVisible(true);
      } else if (onTimeout === 'random') {
        const available = board
          .map((cell, i) => (cell === null ? i : -1))
          .filter((i) => i !== -1);
        if (available.length > 0) {
          const randomIndex =
            available[Math.floor(Math.random() * available.length)];
          applyMove(randomIndex, player);
        }
      } else {
        // skip
        setXTurn((prev) => !prev);
      }
    }
  };

  useEffect(() => {
    if (isBlitzMode && !winner) {
      if (mode === 'vsbot' && !xTurn) return;

      timerRef.current = window.setInterval(() => {
        if (xTurn) {
          setXTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimeout('X');
              return 0;
            }
            return prev - 1;
          });
        } else {
          setOTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimeout('O');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBlitzMode, xTurn, winner, board]);

  const applyMove = (index: number, symbol: 'X' | 'O') => {
    const newBoard = [...board];

    // Infinite mode: remove oldest mark if 3+ marks exist
    if (variant === 'infinite') {
      const playerMoves = moveHistory.current.filter(
        (m) => m.player === symbol
      );
      if (playerMoves.length >= 3) {
        const oldest = playerMoves.sort((a, b) => a.time - b.time)[0];
        newBoard[oldest.index] = null;
        moveHistory.current = moveHistory.current.filter((m) => m !== oldest);
      }
    }

    newBoard[index] = symbol;
    moveHistory.current.push({ player: symbol, index, time: Date.now() });
    setBoard(newBoard);

    const { result, combo } = checkWinnerWithCombo(newBoard);
    if (result) {
      setWinner(result);
      setWinningCombo(combo);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeout(() => {
        if (result === 'draw') {
          setModalTitle(t('draw'));
          setModalMessage(t('itsADraw'));
        } else {
          setModalTitle(t('winner'));
          setModalMessage(result === 'X' ? t('xWins') : t('oWins'));
        }
        setModalVisible(true);
      }, 400);
    } else {
      // Double move logic
      if (isDoubleMove) {
        const newTotalMoves = totalMoves + 1;
        setTotalMoves(newTotalMoves);

        if (newTotalMoves % turnsUntilDouble === 0 && !hasExtraMove) {
          setHasExtraMove(true);
          return;
        } else if (hasExtraMove) {
          setHasExtraMove(false);
        }
      }

      setXTurn((prev) => !prev);
    }
  };

  const onCellPress = (i: number) => {
    if (board[i] || winner) return;
    if (mode === 'vsbot' && !xTurn) return;

    applyMove(i, xTurn ? 'X' : 'O');
  };

  useEffect(() => {
    if (mode === 'vsbot' && !xTurn && !winner) {
      const delay = isBlitzMode ? 300 : 500;
      setTimeout(() => {
        const botIdx = getBotMove(
          board,
          'O',
          difficulty,
          variant as any,
          moveHistory.current,
          isBlitzMode
        );
        if (botIdx !== -1) {
          applyMove(botIdx, 'O');
        }
      }, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xTurn, winner]);

  const restart = () => {
    setBoard(Array(totalCells).fill(null));
    setXTurn(true);
    setWinner(null);
    setWinningCombo(null);
    setModalVisible(false);
    moveHistory.current = [];
    setTotalMoves(0);
    setHasExtraMove(false);
    setXTimeLeft(timePerMove);
    setOTimeLeft(timePerMove);
  };

  const goBack = () => navigate(-1);

  const handleQuit = () => {
    setQuitModalVisible(false);
    goBack();
  };

  const styles = getStyles(theme);

  // Invalid variant fallback
  if (
    !variant ||
    ![
      'classic',
      'infinite',
      'blitz',
      'mega',
      'doublemove',
      'swap',
      'reverse',
    ].includes(variant)
  ) {
    return (
      <div
        style={{
          ...styles.container,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            color: theme.text,
            fontSize: 18,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Invalid game mode
        </div>
        <button style={{ ...styles.button, ...styles.restartButton }} onClick={goBack}>
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={styles.container}
    >
      <div style={styles.header}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={styles.title}
        >
          XO
        </motion.div>

        {!winner && isBlitzMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.timersContainer}
          >
            <BlitzTimer
              timeLeft={xTimeLeft}
              totalTime={timePerMove}
              isActive={xTurn}
              theme={theme}
              playerLabel="X"
            />
            <BlitzTimer
              timeLeft={oTimeLeft}
              totalTime={timePerMove}
              isActive={!xTurn}
              theme={theme}
              playerLabel="O"
            />
          </motion.div>
        )}

        {!winner && !isBlitzMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={styles.turnIndicator}
          >
            <div
              style={{
                ...styles.turnDot,
                backgroundColor: xTurn ? theme.xColor : theme.oColor,
              }}
            />
            <div style={styles.turn}>
              {xTurn ? t('xTurn') : t('oTurn')}
            </div>
          </motion.div>
        )}
      </div>

      {isDoubleMove && !winner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.doubleMoveContainer}
        >
          {hasExtraMove ? (
            <div
              style={{
                ...styles.doubleMoveIndicator,
                ...styles.doubleMoveActive,
              }}
            >
              {renderIcon(IoFlash, { size: 20, color: '#FFFFFF' })}
              <div style={styles.doubleMoveText}>{t('doubleActive')}</div>
            </div>
          ) : (
            <div style={styles.doubleMoveIndicator}>
              {renderIcon(IoHourglass, { size: 16, color: theme.textSecondary })}
              <div style={styles.doubleMoveTextInactive}>
                {t('nextDoubleIn')}{' '}
                {turnsUntilDouble - (totalMoves % turnsUntilDouble)}{' '}
                {turnsUntilDouble - (totalMoves % turnsUntilDouble) === 1
                  ? t('move')
                  : t('moves')}
              </div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <Board
          board={board}
          onPress={onCellPress}
          theme={theme}
          winningCombo={winningCombo}
          winningPlayer={winner && winner !== 'draw' ? winner : null}
          boardSize={isMegaBoard ? boardSize : 3}
          cellSize={
            isMegaBoard
              ? Math.min((300 - 6 - 3 * (boardSize - 1)) / boardSize, 60)
              : undefined
          }
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={styles.controls}
      >
        <button
          style={{ ...styles.button, ...styles.restartButton }}
          onClick={restart}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${theme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
          }}
        >
          {renderIcon(IoRefresh, { size: 20 })}
          {t('restart')}
        </button>

        <button
          style={{ ...styles.button, ...styles.quitButton }}
          onClick={() => setQuitModalVisible(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${theme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
          }}
        >
          {renderIcon(IoExit, { size: 20 })}
          {t('exit')}
        </button>
      </motion.div>

      <ResultModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onRestart={restart}
        onClose={goBack}
        theme={theme}
        t={t}
      />

      <ConfirmModal
        visible={quitModalVisible}
        title={t('quitGameTitle')}
        message={t('quitGameMessage')}
        onConfirm={handleQuit}
        onCancel={() => setQuitModalVisible(false)}
        theme={theme}
        t={t}
      />
    </motion.div>
  );
}

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: theme.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flexDirection: 'column' as const,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    color: theme.primary,
    marginBottom: 12,
  },
  timersContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  turnIndicator: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    padding: '8px 16px',
    backgroundColor: theme.surface,
    borderRadius: 20,
  },
  turnDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  turn: {
    fontSize: 18,
    color: theme.text,
    fontWeight: 600,
  },
  doubleMoveContainer: {
    marginBottom: 16,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  doubleMoveIndicator: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    padding: '8px 16px',
    backgroundColor: theme.surface,
    borderRadius: 20,
    border: `2px solid ${theme.border}`,
  },
  doubleMoveActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  doubleMoveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 600,
  },
  doubleMoveTextInactive: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: 500,
  },
  controls: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 30,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    padding: '12px 20px',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    boxShadow: `0 2px 8px ${theme.shadow}`,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 16,
    transition: 'all 0.2s',
  },
  restartButton: {
    backgroundColor: theme.primary,
    color: '#FFFFFF',
  },
  quitButton: {
    backgroundColor: theme.secondary,
    color: '#FFFFFF',
  },
});