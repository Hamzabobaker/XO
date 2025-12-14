// src/pages/Game.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoRefresh, IoExit } from 'react-icons/io5';
import BlitzTimer from '../components/BlitzTimer';
import Board from '../components/Board';
import ConfirmModal from '../components/ConfirmModal';
import ResultModal from '../components/ResultModal';
import { useApp } from '../context';
import { getBotMove } from '../utils/ai';

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

  const mode = (query.get('mode') || 'vsplayer') as 'vsplayer' | 'vsbot';
  const difficulty = (query.get('difficulty') || 'normal') as
    | 'easy'
    | 'normal'
    | 'hard'
    | 'impossible';
  const variant = (query.get('variant') || 'classic') as string;
  const playerSymbol = (query.get('playerSymbol') || 'X') as 'X' | 'O';
  const botStarts = query.get('botStarts') === 'true';

  const timePerMove = query.get('timePerMove') ? parseInt(query.get('timePerMove')!, 10) : 10;
  const boardSizeParam = query.get('boardSize') ? parseInt(query.get('boardSize')!, 10) : 5;
  const winLengthParam = query.get('winLength') ? parseInt(query.get('winLength')!, 10) : 4;

  const isMegaBoard = variant === 'mega';
  const isBlitzMode = variant === 'blitz';
  const isInfiniteMode = variant === 'infinite';
  const boardSize = isMegaBoard ? (boardSizeParam as 4 | 5 | 6 | 7 | 8 | 9) : 3;
  // Sanitize winLength according to new rules: no 4 for 7×7+, add 8 option from 8×8+
  let computedWin = isMegaBoard ? winLengthParam : 3;
  if (isMegaBoard) {
    // minimums
    if (boardSizeParam >= 7) {
      if (computedWin < 5) computedWin = 5;
    } else {
      if (computedWin < 4) computedWin = 4;
    }

    // maximum caps: 7 for 7×7, 8 for 8×8 and above (but never exceed board size)
    if (boardSizeParam >= 8) {
      if (computedWin > 8) computedWin = 8;
    } else if (boardSizeParam === 7) {
      if (computedWin > 7) computedWin = 7;
    }

    computedWin = Math.min(computedWin, boardSizeParam);
  }
  const winLength = computedWin;
  const totalCells = boardSize * boardSize;

  const getBoardDisplaySize = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const maxWidth = Math.min(screenWidth - 40, 600);

    if (!isMegaBoard) return Math.min(300, maxWidth);

    let idealSize = 300;
    if (boardSize === 6) idealSize = 360;
    else if (boardSize === 7) idealSize = 400;
    else if (boardSize === 8) idealSize = 440;
    else if (boardSize === 9) idealSize = 480;

    return Math.min(idealSize, maxWidth);
  };

  const boardDisplaySize = getBoardDisplaySize();

  const [board, setBoard] = useState<Cell[]>(Array(totalCells).fill(null));

  const getInitialTurn = () => {
    if (mode === 'vsbot' && botStarts) {
      return playerSymbol === 'O';
    }
    return playerSymbol === 'X';
  };

  const [xTurn, setXTurn] = useState<boolean>(getInitialTurn());
  const [winner, setWinner] = useState<Cell | 'draw' | null>(null);
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quitModalVisible, setQuitModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // xTimeLeft / oTimeLeft are exposed as numbers with two decimals (e.g. 12.34)
  const [xTimeLeft, setXTimeLeft] = useState<number>(timePerMove);
  const [oTimeLeft, setOTimeLeft] = useState<number>(timePerMove);
  const timerRef = useRef<number | null>(null);

  // higher-precision internal refs to avoid float accumulation errors
  const xTimeDecimal = useRef<number>(timePerMove);
  const oTimeDecimal = useRef<number>(timePerMove);

  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const moveHistory = useRef<MoveRecord[]>([]);
  const [botThinking, setBotThinking] = useState(false);
  const megaCacheRef = useRef<Map<string, number> | null>(new Map());
  const botRunRef = useRef(0);
  const botTimersRef = useRef<number[]>([]);

  // small ref to read botThinking inside effects without including it in deps
  const botThinkingRef = useRef(botThinking);
  useEffect(() => { botThinkingRef.current = botThinking; }, [botThinking]);

  const generateWinningCombos = React.useCallback((size: number, length: number): number[][] => {
    const combos: number[][] = [];

    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= size - length; col++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) combo.push(row * size + col + i);
        combos.push(combo);
      }
    }

    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - length; row++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) combo.push((row + i) * size + col);
        combos.push(combo);
      }
    }

    for (let row = 0; row <= size - length; row++) {
      for (let col = 0; col <= size - length; col++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) combo.push((row + i) * size + (col + i));
        combos.push(combo);
      }
    }

    for (let row = 0; row <= size - length; row++) {
      for (let col = length - 1; col < size; col++) {
        const combo: number[] = [];
        for (let i = 0; i < length; i++) combo.push((row + i) * size + (col - i));
        combos.push(combo);
      }
    }

    return combos;
  }, []);

  const checkWinnerWithCombo = React.useCallback((b: Cell[]): { result: Cell | 'draw' | null; combo: number[] | null } => {
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
  }, [boardSize, winLength, generateWinningCombos]);

  const handleTimeout = useCallback((player: 'X' | 'O') => {
    if (!winner && isBlitzMode) {
      const winnerPlayer = player === 'X' ? 'O' : 'X';
      setWinner(winnerPlayer);
      setModalTitle(t('winner'));
      setModalMessage(winnerPlayer === 'X' ? t('xWins') : t('oWins'));
      setModalVisible(true);
    }
  }, [winner, isBlitzMode, t]);

  // Blitz timer — centisecond-accurate (updates exposed time with two decimals)
  // Intentionally omit `botThinking` from dependencies so the effect
  // doesn't re-run and cancel its own timers when `botThinking` flips.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Clear existing interval if present
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isBlitzMode || winner || !gameStarted) return;

    // decimals are tracked in refs; no need to seed from state here

    // run at 10ms to allow hundredths to be represented (00.00)
    timerRef.current = window.setInterval(() => {
      if (xTurn) {
        // decrement by 0.01 seconds
        xTimeDecimal.current = Math.max(0, +(xTimeDecimal.current - 0.01).toFixed(4));
        // expose two decimals for UI (keeps trailing zero)
        setXTimeLeft(+xTimeDecimal.current.toFixed(2));

        if (xTimeDecimal.current <= 0) {
          window.clearInterval(timerRef.current!);
          timerRef.current = null;
          handleTimeout('X');
        }
      } else {
        oTimeDecimal.current = Math.max(0, +(oTimeDecimal.current - 0.01).toFixed(4));
        setOTimeLeft(+oTimeDecimal.current.toFixed(2));

        if (oTimeDecimal.current <= 0) {
          window.clearInterval(timerRef.current!);
          timerRef.current = null;
          handleTimeout('O');
        }
      }
    }, 10);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isBlitzMode, xTurn, winner, gameStarted, handleTimeout]);

  const applyMove = useCallback((index: number, symbol: 'X' | 'O') => {
    const newBoard = [...board];

    if (!gameStarted) {
      const isHumanMove = mode === 'vsplayer' || (mode === 'vsbot' && symbol === playerSymbol);
      if (isHumanMove) {
        setGameStarted(true);
      }
    }

    if (isInfiniteMode) {
      const playerMoves = moveHistory.current.filter((m) => m.player === symbol);
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
          if (mode === 'vsbot') {
            const playerWon = result === playerSymbol;
            setModalTitle(playerWon ? t('victory') : t('defeat'));
            setModalMessage(playerWon ? t('youWin') : t('youLose'));
          } else {
            setModalTitle(t('winner'));
            setModalMessage(result === 'X' ? t('xWins') : t('oWins'));
          }
        }
        setModalVisible(true);
      }, 700);
    } else {
      // switch turn — don't sync decimals here (avoids time-gain exploit)
      setXTurn((prev) => !prev);
    }
  }, [board, gameStarted, mode, playerSymbol, isInfiniteMode, t, checkWinnerWithCombo]);

  const onCellPress = (i: number) => {
    if (board[i] || winner) return;

    if (mode === 'vsbot') {
      const isHumanTurn = (playerSymbol === 'X' && xTurn) || (playerSymbol === 'O' && !xTurn);
      if (!isHumanTurn) return;
    }

    applyMove(i, xTurn ? 'X' : 'O');
  };

  // ----------------- BOT SCHEDULING EFFECT (fixed) -----------------
  useEffect(() => {
    // use botThinkingRef.current so we don't need to include botThinking in deps
    if (mode !== 'vsbot' || winner || botThinkingRef.current) return;

    const isBotTurn = (playerSymbol === 'X' && !xTurn) || (playerSymbol === 'O' && xTurn);
    if (!isBotTurn) return;

    let minThinkingTime = 300;

    if (isMegaBoard) {
      if (boardSize <= 5) minThinkingTime = 400;
      else if (boardSize === 6) minThinkingTime = 600;
      else if (boardSize === 7) minThinkingTime = 800;
      else minThinkingTime = 1000;
    }

    if (isBlitzMode) {
      const botSymbol = playerSymbol === 'X' ? 'O' : 'X';
      const botTimeLeft = botSymbol === 'X' ? xTimeDecimal.current : oTimeDecimal.current;

      if (botTimeLeft <= 3) {
        minThinkingTime = 200;
      } else if (botTimeLeft <= 5) {
        minThinkingTime = 350;
      } else {
        minThinkingTime = 500;
      }
    }

    const delay = 200;
    const runId = ++botRunRef.current; // capture stable run id for closures
    const localTimers: number[] = [];

    const timeoutId = window.setTimeout(() => {
      if (runId !== botRunRef.current) return;
      setBotThinking(true);
      const thinkStartTime = Date.now();

      const rafId = window.requestAnimationFrame(() => {
        if (runId !== botRunRef.current) return;

        const innerId = window.setTimeout(() => {
          if (runId !== botRunRef.current) return;
          const botSymbol = playerSymbol === 'X' ? 'O' : 'X';
          let aiTimeBudget: number | undefined = undefined;
          if (difficulty === 'impossible') {
            aiTimeBudget = isMegaBoard ? 6000 : 3500;
          } else if (difficulty === 'hard') {
            aiTimeBudget = isMegaBoard ? 3000 : 1800;
          }

          const botIdx = getBotMove(
            board,
            botSymbol as 'X' | 'O',
            difficulty,
            variant as any,
            moveHistory.current,
            isBlitzMode,
            boardSize,
            winLength,
            aiTimeBudget,
            megaCacheRef.current ?? undefined
          );

          const thinkTime = Date.now() - thinkStartTime;
          const remainingTime = Math.max(0, minThinkingTime - thinkTime);

          const afterId = window.setTimeout(() => {
            if (runId !== botRunRef.current) return;
            setBotThinking(false);
            if (botIdx !== -1) {
              applyMove(botIdx, botSymbol as 'X' | 'O');
            }
          }, remainingTime);

          localTimers.push(afterId);
          botTimersRef.current.push(afterId);
        }, 0);

        localTimers.push(innerId);
        botTimersRef.current.push(innerId);
      });

      localTimers.push(rafId as unknown as number);
      botTimersRef.current.push(rafId as unknown as number);
    }, delay);

    localTimers.push(timeoutId as unknown as number);
    botTimersRef.current.push(timeoutId as unknown as number);

    return () => {
      // clear only timers created by this effect run
      for (const id of localTimers) {
        try { window.clearTimeout(id); } catch (e) {}
        try { window.cancelAnimationFrame(id); } catch (e) {}
      }
      // remove cleared ids from global list so restart won't try to clear them again
      botTimersRef.current = botTimersRef.current.filter((id) => !localTimers.includes(id));
    };
  }, [xTurn, winner, board, gameStarted, mode, playerSymbol, isMegaBoard, isBlitzMode, difficulty, variant, boardSize, winLength, applyMove]);
  // ----------------------------------------------------------------

  const getOldestMarkIndex = (player: 'X' | 'O'): number => {
    if (!isInfiniteMode || winner) return -1;

    const isCurrentPlayer = (player === 'X' && xTurn) || (player === 'O' && !xTurn);
    if (!isCurrentPlayer) return -1;

    const playerMoves = moveHistory.current.filter((m) => m.player === player);
    if (playerMoves.length < 3) return -1;
    const sorted = playerMoves.sort((a, b) => a.time - b.time);
    return sorted[0]?.index ?? -1;
  };

  const restart = () => {
    setBoard(Array(totalCells).fill(null));
    setXTurn(getInitialTurn());
    setWinner(null);
    setWinningCombo(null);
    setModalVisible(false);
    moveHistory.current = [];
    setGameStarted(false);

    // reset times to integer starting value
    setXTimeLeft(timePerMove);
    setOTimeLeft(timePerMove);
    xTimeDecimal.current = timePerMove;
    oTimeDecimal.current = timePerMove;

    setBotThinking(false);
    megaCacheRef.current = new Map();
    // invalidate any pending bot callbacks and clear scheduled timers
    botRunRef.current++;
    for (const id of botTimersRef.current) {
      try { window.clearTimeout(id); } catch (e) {}
      try { window.cancelAnimationFrame(id); } catch (e) {}
    }
    botTimersRef.current = [];
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const goBack = () => navigate(-1);

  const handleQuit = () => {
    setQuitModalVisible(false);
    goBack();
  };

  const styles = getStyles(theme);

  if (
    !variant ||
    ![
      'classic',
      'infinite',
      'blitz',
      'mega',
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
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={styles.container}
    >
      <div style={styles.contentWrapper}>
        <div style={styles.header}>

          {!isBlitzMode && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              minHeight: 80,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={styles.turnIndicator}
            >
              <div
                style={{
                  ...styles.turnDot,
                  backgroundColor:
                    winner && winner !== 'draw' ? (winner === 'X' ? theme.xColor : theme.oColor) : xTurn ? theme.xColor : theme.oColor,
                }}
              />
              <div style={styles.turn}>
                {winner && winner !== 'draw' ? (winner === 'X' ? t('xWins') : t('oWins')) : xTurn ? t('xTurn') : t('oTurn')}
              </div>
            </motion.div>

            <div
              style={{
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {botThinking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: theme.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 12,
                    backgroundColor: theme.primary + '15',
                    border: `1px solid ${theme.primary}40`,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{
                      width: 10,
                      height: 10,
                      border: `2px solid ${theme.primary}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                    }}
                  />
                  <span>{t('botThinking')}</span>
                </motion.div>
              )}
            </div>
          </div>
          )}

          {isBlitzMode && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              minHeight: 110,
            }}>
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
                  t={t}
                />
                <BlitzTimer
                  timeLeft={oTimeLeft}
                  totalTime={timePerMove}
                  isActive={!xTurn}
                  theme={theme}
                  playerLabel="O"
                  t={t}
                />
              </motion.div>

              {/* whose turn indicator (match non-blitz style) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={styles.turnIndicator}
              >
                <div
                  style={{
                    ...styles.turnDot,
                    backgroundColor:
                      winner && winner !== 'draw' ? (winner === 'X' ? theme.xColor : theme.oColor) : xTurn ? theme.xColor : theme.oColor,
                  }}
                />
                <div style={styles.turn}>
                  {winner && winner !== 'draw' ? (winner === 'X' ? t('xWins') : t('oWins')) : xTurn ? t('xTurn') : t('oTurn')}
                </div>
              </motion.div>

              <div style={{ height: 28 }}>
                {botThinking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: theme.primary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 12px',
                      borderRadius: 10,
                      backgroundColor: theme.primary + '15',
                      border: `1px solid ${theme.primary}40`,
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: 8,
                        height: 8,
                        border: `2px solid ${theme.primary}`,
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                      }}
                    />
                    <span>{t('botThinking')}</span>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.35 }}>
          <Board
            board={board}
            onPress={onCellPress}
            theme={theme}
            winningCombo={winningCombo}
            winningPlayer={winner && winner !== 'draw' ? winner : null}
            boardSize={isMegaBoard ? boardSize : 3}
            totalSize={boardDisplaySize}
            cellSize={
              isMegaBoard ? Math.min((boardDisplaySize - 6 - 3 * (boardSize - 1)) / boardSize, 70) : undefined
            }
            oldestXIndex={getOldestMarkIndex('X')}
            oldestOIndex={getOldestMarkIndex('O')}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={styles.controls}>
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
            {React.createElement(IoRefresh as any, { size: 20 })}
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
            {React.createElement(IoExit as any, { size: 20 })}
            {t('exit')}
          </button>
        </motion.div>
      </div>

      <ResultModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onRestart={restart}
        onClose={goBack}
        theme={theme}
        t={t}
        winner={winner}
        isDraw={winner === 'draw'}
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
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none' as const,
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '100vw',
    height: '100%',
    overflow: 'hidden',
    padding: '10px',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column' as const,
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
  controls: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 20,
  },
  button: {
    padding: '12px 20px',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    boxShadow: `0 4px 12px ${theme.shadow}`,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 16,
    transition: 'all 0.2s',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none' as const,
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
