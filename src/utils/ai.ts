// src/utils/ai.ts
type Cell = 'X' | 'O' | null;
type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
type Variant = 'classic' | 'infinite' | 'blitz' | 'mega' | 'gravity' | 'reverse';
interface MoveRecord {
  player: 'X' | 'O';
  index: number;
  time: number;
}
const WINNING_COMBOS_3X3 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const winningComboCache = new Map<string, number[][]>();
let moveEvaluationCount = 0;
const shouldYield = () => {
  moveEvaluationCount++;
  return moveEvaluationCount % 50 === 0;
};
const resetYieldCounter = () => {
  moveEvaluationCount = 0;
};
const randomChoice = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const pickPersonalityMove = (
  board: Cell[],
  available: number[],
  boardSize: number
): number | null => {
  if (available.length === 0) return null;
  if (boardSize === 3) {
    if (board[4] === null) return 4;
    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length > 0) return randomChoice(corners);
    return null;
  }
  const center = Math.floor(boardSize / 2) * boardSize + Math.floor(boardSize / 2);
  if (board[center] === null) return center;
  const offsets = [-1, 1, -boardSize, boardSize, -boardSize - 1, -boardSize + 1, boardSize - 1, boardSize + 1];
  const nearCenter = offsets
    .map((offset) => center + offset)
    .filter((idx) => idx >= 0 && idx < board.length && board[idx] === null);
  if (nearCenter.length > 0) return randomChoice(nearCenter);
  return null;
};
type PersonaArchetype = 'balanced' | 'aggressive' | 'defensive' | 'tricky';
const pickPersonaArchetype = (difficulty: Difficulty): PersonaArchetype => {
  const roll = Math.random();
  if (difficulty === 'easy') {
    if (roll < 0.45) return 'tricky';
    if (roll < 0.75) return 'aggressive';
    return 'balanced';
  }
  if (difficulty === 'normal') {
    if (roll < 0.4) return 'balanced';
    if (roll < 0.7) return 'aggressive';
    return 'defensive';
  }
  if (difficulty === 'hard') {
    if (roll < 0.34) return 'aggressive';
    if (roll < 0.62) return 'defensive';
    if (roll < 0.88) return 'balanced';
    return 'tricky';
  }
  if (roll < 0.3) return 'aggressive';
  if (roll < 0.55) return 'defensive';
  if (roll < 0.8) return 'balanced';
  return 'tricky';
};
const getPositionalBonus = (
  move: number,
  boardSize: number,
  archetype: PersonaArchetype
): number => {
  const x = move % boardSize;
  const y = Math.floor(move / boardSize);
  const centerX = (boardSize - 1) / 2;
  const centerY = (boardSize - 1) / 2;
  const dist = Math.abs(x - centerX) + Math.abs(y - centerY);
  const maxDist = boardSize - 1;
  const centerCloseness = Math.max(0, 1 - dist / Math.max(1, maxDist));
  const isCorner =
    (x === 0 || x === boardSize - 1) &&
    (y === 0 || y === boardSize - 1);
  const isEdge = !isCorner && (x === 0 || y === 0 || x === boardSize - 1 || y === boardSize - 1);

  if (archetype === 'aggressive') {
    return centerCloseness * 18 + (isEdge ? 5 : 0) + (isCorner ? 8 : 0);
  }
  if (archetype === 'defensive') {
    return centerCloseness * 22 + (isCorner ? 6 : 0);
  }
  if (archetype === 'tricky') {
    return (isCorner ? 14 : 0) + (isEdge ? 8 : 0) + centerCloseness * 8;
  }
  return centerCloseness * 14 + (isCorner ? 9 : 0) + (isEdge ? 3 : 0);
};
const pickWeightedMove = (
  items: { move: number; score: number }[],
  sharpness: number = 3.5
): number => {
  if (items.length === 0) return -1;

  const sorted = [...items].sort((a, b) => b.score - a.score);
  const top = sorted[0].score;
  const bottom = sorted[sorted.length - 1].score;
  const range = Math.max(1e-6, top - bottom);
  const tunedSharpness = Math.max(0.2, sharpness);

  const weights = sorted.map((item, index) => {
    const normalized = (item.score - bottom) / range;
    const scoreWeight = Math.exp(normalized * tunedSharpness);
    const rankWeight = 1 / Math.pow(index + 1, 0.35);
    return scoreWeight * rankWeight;
  });

  const total = weights.reduce((acc, w) => acc + w, 0);
  let ticket = Math.random() * total;
  for (let i = 0; i < sorted.length; i++) {
    ticket -= weights[i];
    if (ticket <= 0) return sorted[i].move;
  }
  return sorted[0].move;
};
interface PersonaSelectionProfile {
  maxPool: number;
  qualityBand: number;
  bestSharpness: number;
  missSharpness: number;
  missPool: number;
}
const getPersonaSelectionProfile = (difficulty: Difficulty): PersonaSelectionProfile => {
  if (difficulty === 'easy') {
    return { maxPool: 8, qualityBand: 1, bestSharpness: 2.1, missSharpness: 1.45, missPool: 5 };
  }
  if (difficulty === 'normal') {
    return { maxPool: 7, qualityBand: 0.88, bestSharpness: 2.5, missSharpness: 1.7, missPool: 4 };
  }
  if (difficulty === 'hard') {
    return { maxPool: 6, qualityBand: 0.72, bestSharpness: 3, missSharpness: 2, missPool: 3 };
  }
  return { maxPool: 1, qualityBand: 0, bestSharpness: 4, missSharpness: 2.5, missPool: 1 };
};
const getDifficultyAccuracy = (difficulty: Difficulty): number => {
  if (difficulty === 'hard') return 0.75;
  if (difficulty === 'normal') return 0.5;
  if (difficulty === 'easy') return 0.25;
  return 1;
};
const shouldUseBestMove = (difficulty: Difficulty): boolean =>
  Math.random() < getDifficultyAccuracy(difficulty);
const chooseMoveWithPersona = (
  scored: { move: number; score: number }[],
  boardSize: number,
  difficulty: Difficulty,
  forceBestOnly: boolean = false
): number => {
  if (scored.length === 0) return -1;
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const archetype = pickPersonaArchetype(difficulty);
  const bestScore = sorted[0].score;

  const profile = getPersonaSelectionProfile(difficulty);
  const center = (boardSize - 1) / 2;
  const normDen = Math.max(1, center);
  const sideBiasX = difficulty === 'impossible' ? 0 : Math.random() * 2 - 1;
  const sideBiasY = difficulty === 'impossible' ? 0 : Math.random() * 2 - 1;
  const sideBiasStrength =
    difficulty === 'easy'
      ? 5
      : difficulty === 'normal'
      ? 3.5
      : difficulty === 'hard'
      ? 2.2
      : 0;
  const candidates = forceBestOnly
    ? sorted.filter((item) => Math.abs(item.score - bestScore) <= 1e-6)
    : (() => {
        const pool = sorted.slice(0, Math.max(1, Math.min(profile.maxPool, sorted.length)));
        const poolRange = Math.max(0, pool[0].score - pool[pool.length - 1].score);
        const allowedDrop = poolRange * profile.qualityBand + 1e-6;
        const refined = pool.filter((item) => pool[0].score - item.score <= allowedDrop);
        return refined.length > 0 ? refined : [pool[0]];
      })();

  const boosted = candidates
    .map((item) => ({
      move: item.move,
      score: (() => {
        const x = item.move % boardSize;
        const y = Math.floor(item.move / boardSize);
        const nx = (x - center) / normDen;
        const ny = (y - center) / normDen;
        const directionalBonus = (nx * sideBiasX + ny * sideBiasY) * sideBiasStrength;
        const variationNoise =
          difficulty === 'impossible'
            ? 0
            : (Math.random() - 0.5) *
              (difficulty === 'easy' ? 0.7 : difficulty === 'normal' ? 0.45 : 0.28);
        return item.score + getPositionalBonus(item.move, boardSize, archetype) + directionalBonus + variationNoise;
      })(),
    }))
    .sort((a, b) => b.score - a.score);

  if (forceBestOnly) {
    const sharpness = difficulty === 'impossible' ? 1.9 : profile.bestSharpness;
    return pickWeightedMove(boosted, sharpness);
  }

  if (difficulty === 'impossible') {
    return pickWeightedMove(boosted, profile.bestSharpness);
  }

  const bestScoreAfterBoost = boosted[0].score;
  const exactBest = boosted.filter((item) => Math.abs(item.score - bestScoreAfterBoost) <= 1e-6);
  const accuracy = getDifficultyAccuracy(difficulty);
  if (Math.random() < accuracy || boosted.length === exactBest.length) {
    return pickWeightedMove(exactBest.length > 0 ? exactBest : [boosted[0]], profile.bestSharpness);
  }

  const misses = boosted.filter((item) => item.score < bestScoreAfterBoost - 1e-6);
  if (misses.length === 0) {
    return pickWeightedMove(exactBest.length > 0 ? exactBest : [boosted[0]], profile.bestSharpness);
  }
  const missPool = misses.slice(0, Math.min(profile.missPool, misses.length));
  return pickWeightedMove(missPool, profile.missSharpness);
};
const generateWinningCombos = (size: number, length: number): number[][] => {
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
};
const getWinningCombos = (boardSize: number, winLength: number): number[][] => {
  if (boardSize === 3 && winLength === 3) return WINNING_COMBOS_3X3;
  const key = `${boardSize}x${boardSize}-${winLength}`;
  const cached = winningComboCache.get(key);
  if (cached) return cached;
  const generated = generateWinningCombos(boardSize, winLength);
  winningComboCache.set(key, generated);
  return generated;
};
const checkWinner = (board: Cell[], boardSize: number = 3, winLength: number = 3): Cell | 'draw' | null => {
  const combos = getWinningCombos(boardSize, winLength);
  for (const combo of combos) {
    const firstCell = board[combo[0]];
    if (firstCell && combo.every((idx) => board[idx] === firstCell)) {
      return firstCell;
    }
  }
  if (board.every((cell) => cell !== null)) {
    return 'draw';
  }
  return null;
};
const getAvailableMoves = (board: Cell[]): number[] => {
  return board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);
};
const boardKey = (board: Cell[]): string => board.map((cell) => cell ?? '-').join('');
const countImmediateWins = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number,
  maxCount: number = Number.POSITIVE_INFINITY
): number => {
  const available = getAvailableMoves(board);
  let wins = 0;
  for (const move of available) {
    if (checkWinner(simulateMove(board, move, player), boardSize, winLength) === player) {
      wins++;
      if (wins >= maxCount) return wins;
    }
  }
  return wins;
};

const getGravityDropIndex = (
  board: Cell[],
  column: number,
  boardSize: number = 3
): number => {
  for (let row = boardSize - 1; row >= 0; row--) {
    const idx = row * boardSize + column;
    if (board[idx] === null) return idx;
  }
  return -1;
};

const getAvailableGravityMoves = (board: Cell[], boardSize: number = 3): number[] => {
  const moves: number[] = [];
  for (let col = 0; col < boardSize; col++) {
    const idx = getGravityDropIndex(board, col, boardSize);
    if (idx !== -1) moves.push(idx);
  }
  return moves;
};
const countImmediateWinsGravity = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number = 3,
  maxCount: number = Number.POSITIVE_INFINITY
): number => {
  const available = getAvailableGravityMoves(board, boardSize);
  let wins = 0;
  for (const move of available) {
    if (checkWinner(simulateMove(board, move, player), boardSize, 3) === player) {
      wins++;
      if (wins >= maxCount) return wins;
    }
  }
  return wins;
};
const getGravityForkThreatMoves = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number = 3
): number[] => {
  const available = getAvailableGravityMoves(board, boardSize);
  const threats: number[] = [];
  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    const immediateWins = countImmediateWinsGravity(testBoard, player, boardSize, 2);
    if (immediateWins >= 2) threats.push(move);
  }
  return threats;
};
type ExactVariant = 'classic' | 'blitz' | 'gravity' | 'reverse';
const exact3x3Cache: Record<ExactVariant, Map<string, number>> = {
  classic: new Map<string, number>(),
  blitz: new Map<string, number>(),
  gravity: new Map<string, number>(),
  reverse: new Map<string, number>(),
};
const getExactVariantOutcome = (
  board: Cell[],
  variant: ExactVariant
): { winner: 'X' | 'O' | null; draw: boolean } => {
  if (variant === 'reverse') {
    const { winner, isDraw } = checkReverseOutcome(board);
    return { winner, draw: isDraw };
  }
  const result = checkWinner(board, 3, 3);
  if (result === 'draw') return { winner: null, draw: true };
  return { winner: result, draw: false };
};
const getExactVariantMoves = (board: Cell[], variant: ExactVariant): number[] => {
  if (variant === 'gravity') return getAvailableGravityMoves(board, 3);
  return getAvailableMoves(board);
};
const solveExact3x3 = (
  board: Cell[],
  turn: 'X' | 'O',
  bot: 'X' | 'O',
  variant: ExactVariant
): number => {
  const stateKey = `${boardKey(board)}|t${turn}|b${bot}`;
  const cache = exact3x3Cache[variant];
  const cached = cache.get(stateKey);
  if (cached !== undefined) return cached;

  const outcome = getExactVariantOutcome(board, variant);
  if (outcome.winner) {
    const terminalScore = outcome.winner === bot ? 1 : -1;
    cache.set(stateKey, terminalScore);
    return terminalScore;
  }
  if (outcome.draw) {
    cache.set(stateKey, 0);
    return 0;
  }

  const moves = getExactVariantMoves(board, variant);
  if (moves.length === 0) {
    cache.set(stateKey, 0);
    return 0;
  }

  const maximizing = turn === bot;
  let bestScore = maximizing ? -1 : 1;
  for (const move of moves) {
    const nextBoard = simulateMove(board, move, turn);
    const nextTurn = turn === 'X' ? 'O' : 'X';
    const score = solveExact3x3(nextBoard, nextTurn, bot, variant);
    if (maximizing) {
      bestScore = Math.max(bestScore, score);
    } else {
      bestScore = Math.min(bestScore, score);
    }
  }
  cache.set(stateKey, bestScore);
  return bestScore;
};
const getBestExact3x3Move = (
  board: Cell[],
  bot: 'X' | 'O',
  variant: ExactVariant
): number => {
  const moves = getExactVariantMoves(board, variant);
  if (moves.length === 0) return -1;

  let bestScore = -2;
  let bestMoves: number[] = [];
  for (const move of moves) {
    const nextBoard = simulateMove(board, move, bot);
    const score = solveExact3x3(nextBoard, bot === 'X' ? 'O' : 'X', bot, variant);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }
  return chooseMoveWithPersona(
    bestMoves.map((move) => ({ move, score: bestScore })),
    3,
    'impossible',
    true
  );
};
const minimaxGravity = (
  board: Cell[],
  depth: number,
  isMaximizing: boolean,
  player: 'X' | 'O',
  alpha: number = -Infinity,
  beta: number = Infinity,
  maxDepth: number = 9
): number => {
  const winner = checkWinner(board, 3, 3);
  const opponent = player === 'X' ? 'O' : 'X';
  if (winner === player) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (winner === 'draw' || depth >= maxDepth) return 0;

  const available = getAvailableGravityMoves(board, 3);
  if (available.length === 0) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const move of available) {
      const score = minimaxGravity(
        simulateMove(board, move, player),
        depth + 1,
        false,
        player,
        alpha,
        beta,
        maxDepth
      );
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of available) {
    const score = minimaxGravity(
      simulateMove(board, move, opponent),
      depth + 1,
      true,
      player,
      alpha,
      beta,
      maxDepth
    );
    best = Math.min(best, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  return best;
};

const getBestGravityMove = (
  board: Cell[],
  player: 'X' | 'O',
  difficulty: Difficulty
): number => {
  if (difficulty === 'impossible') {
    return getBestExact3x3Move(board, player, 'gravity');
  }
  const available = getAvailableGravityMoves(board, 3);
  if (available.length === 0) return -1;
  const opponent = player === 'X' ? 'O' : 'X';

  const winningMoves = available.filter(
    (move) => checkWinner(simulateMove(board, move, player), 3, 3) === player
  );
  if (winningMoves.length > 0) {
    if (shouldUseBestMove(difficulty)) {
      return chooseMoveWithPersona(winningMoves.map((move) => ({ move, score: 1000 })), 3, difficulty, true);
    }
  }

  const blockingMoves = available.filter(
    (move) => checkWinner(simulateMove(board, move, opponent), 3, 3) === opponent
  );
  if (blockingMoves.length > 0) {
    if (Math.random() > getDifficultyAccuracy(difficulty)) {
      const nonBlockingMoves = available.filter((move) => !blockingMoves.includes(move));
      if (nonBlockingMoves.length > 0) {
        return chooseMoveWithPersona(
          nonBlockingMoves.map((move) => ({ move, score: evaluatePosition(simulateMove(board, move, player), player) })),
          3,
          difficulty
        );
      }
    }
    return chooseMoveWithPersona(blockingMoves.map((move) => ({ move, score: 950 })), 3, difficulty, true);
  }

  const opponentForkMoves = getGravityForkThreatMoves(board, opponent, 3);
  if (opponentForkMoves.length > 0 && shouldUseBestMove(difficulty)) {
    const safeMoves = available.filter((move) => {
      const nextBoard = simulateMove(board, move, player);
      const opponentImmediateWins = countImmediateWinsGravity(nextBoard, opponent, 3, 1);
      if (opponentImmediateWins > 0) return false;
      const nextForkMoves = getGravityForkThreatMoves(nextBoard, opponent, 3);
      if (nextForkMoves.length === 0) return true;
      const forcingThreats = countImmediateWinsGravity(nextBoard, player, 3, 1);
      return forcingThreats > 0 && nextForkMoves.length <= 1;
    });

    if (safeMoves.length > 0) {
      const antiForkDepth = difficulty === 'hard' ? 7 : difficulty === 'normal' ? 5 : 4;
      const scoredSafeMoves = safeMoves.map((move) => {
        const nextBoard = simulateMove(board, move, player);
        const strategic = minimaxGravity(nextBoard, 0, false, player, -Infinity, Infinity, antiForkDepth);
        const tactical = evaluatePosition(nextBoard, player);
        const strategicWeight = difficulty === 'hard' ? 19 : difficulty === 'normal' ? 15 : 12;
        return { move, score: strategic * strategicWeight + tactical };
      });
      return chooseMoveWithPersona(scoredSafeMoves, 3, difficulty);
    }

    if (opponentForkMoves.length === 1 && available.includes(opponentForkMoves[0])) {
      return opponentForkMoves[0];
    }
  }

  const searchDepth = difficulty === 'hard' ? 6 : difficulty === 'normal' ? 4 : 3;
  const scored = available.map((move) => {
    const nextBoard = simulateMove(board, move, player);
    const minimaxScore = minimaxGravity(nextBoard, 0, false, player, -Infinity, Infinity, searchDepth);
    const heuristicScore = evaluatePosition(nextBoard, player);
    const strategicWeight = difficulty === 'hard' ? 16 : difficulty === 'normal' ? 12 : 10;
    const score = minimaxScore * strategicWeight + heuristicScore;
    return { move, score };
  });
  return chooseMoveWithPersona(scored, 3, difficulty);
};
const simulateMove = (board: Cell[], index: number, player: Cell): Cell[] => {
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
};
const detectThreat = (
  board: Cell[],
  combo: number[],
  player: 'X' | 'O',
  winLength: number
): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  const cells = combo.map(idx => board[idx]);
  const playerCount = cells.filter(c => c === player).length;
  const opponentCount = cells.filter(c => c === opponent).length;
  const emptyCount = cells.filter(c => c === null).length;
  if (opponentCount > 0 && playerCount > 0) return 0;
  const immediateWinScore = 10000;
  const almostWinScore = Math.floor(1000 * (winLength / 3));
  const setupScore = Math.floor(100 * (winLength / 3));
  const earlyScore = Math.floor(20 * (winLength / 3));
  if (playerCount === 0 && opponentCount > 0) {
    if (opponentCount === winLength - 1 && emptyCount === 1) return -immediateWinScore;
    if (opponentCount === winLength - 2 && emptyCount === 2) return -almostWinScore;
    if (opponentCount >= winLength - 3 && emptyCount >= 3) return -setupScore;
    return -earlyScore * opponentCount;
  }
  if (opponentCount === 0 && playerCount > 0) {
    if (playerCount === winLength - 1 && emptyCount === 1) return immediateWinScore;
    if (playerCount === winLength - 2 && emptyCount === 2) return almostWinScore;
    if (playerCount >= winLength - 3 && emptyCount >= 3) return setupScore;
    return earlyScore * playerCount;
  }
  if (emptyCount === winLength) return 5;
  return 0;
};
const detectFork = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number
): { move: number; threatCount: number } | null => {
  const available = getAvailableMoves(board);
  const combos = getWinningCombos(boardSize, winLength);
  let bestFork: { move: number; threatCount: number } | null = null;
  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    let threatCount = 0;
    for (const combo of combos) {
      if (!combo.includes(move)) continue;
      const cells = combo.map(idx => testBoard[idx]);
      const playerCount = cells.filter(c => c === player).length;
      const emptyCount = cells.filter(c => c === null).length;
      const opponent = player === 'X' ? 'O' : 'X';
      const opponentCount = cells.filter(c => c === opponent).length;
      if (playerCount === winLength - 1 && emptyCount === 1 && opponentCount === 0) {
        threatCount++;
      }
    }
    if (threatCount >= 2) {
      if (!bestFork || threatCount > bestFork.threatCount) {
        bestFork = { move, threatCount };
      }
    }
  }
  return bestFork;
};
const getForkThreatMoves = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number
): number[] => {
  const available = getAvailableMoves(board);
  const threats: number[] = [];
  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    const immediateWins = countImmediateWins(testBoard, player, boardSize, winLength, 2);
    if (immediateWins >= 2) threats.push(move);
  }
  return threats;
};
const detectOpponentForkThreat = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number
): number | null => {
  const opponent = player === 'X' ? 'O' : 'X';
  const available = getAvailableMoves(board);
  for (const move of available) {
    const testBoard = simulateMove(board, move, opponent);
    const fork = detectFork(testBoard, opponent, boardSize, winLength);
    if (fork && fork.threatCount >= 2) {
      return move;
    }
  }
  return null;
};
const preventCommonForkPatterns = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number
): number | null => {
  if (winLength > 5 || boardSize < 5) return null;
  const opponent = player === 'X' ? 'O' : 'X';
  const combos = getWinningCombos(boardSize, winLength);
  for (const combo of combos) {
    const cells = combo.map(idx => ({ idx, val: board[idx] }));
    const opponentCells = cells.filter(c => c.val === opponent);
    const emptyCells = cells.filter(c => c.val === null);
    if (opponentCells.length >= 2 && emptyCells.length >= 1) {
      for (const emptyCell of emptyCells) {
        const testBoard = simulateMove(board, emptyCell.idx, opponent);
        const threats = detectFork(testBoard, opponent, boardSize, winLength);
        if (threats && threats.threatCount >= 2) {
          return emptyCell.idx;
        }
      }
    }
  }
  return null;
};
const simulateInfiniteMove = (
  board: Cell[],
  index: number,
  player: 'X' | 'O',
  history: MoveRecord[],
  timeOverride?: number
): { board: Cell[]; newHistory: MoveRecord[] } => {
  const newBoard = [...board];
  let newHistory = [...history];
  const playerMoves = newHistory.filter((m) => m.player === player);
  if (playerMoves.length >= 3) {
    const oldest = playerMoves.sort((a, b) => a.time - b.time || a.index - b.index)[0];
    newBoard[oldest.index] = null;
    newHistory = newHistory.filter((m) => m !== oldest);
  }
  newBoard[index] = player;
  newHistory.push({ player, index, time: timeOverride ?? Date.now() });
  return { board: newBoard, newHistory };
};
const isSafePersonaMove3x3 = (
  board: Cell[],
  move: number,
  player: 'X' | 'O'
): boolean => {
  const opponent = player === 'X' ? 'O' : 'X';
  const nextBoard = simulateMove(board, move, player);
  if (checkWinner(nextBoard, 3, 3) === player) return true;
  if (countImmediateWins(nextBoard, opponent, 3, 3, 1) > 0) return false;
  return getForkThreatMoves(nextBoard, opponent, 3, 3).length === 0;
};
const isSafePersonaMoveInfinite3x3 = (
  board: Cell[],
  history: MoveRecord[],
  move: number,
  player: 'X' | 'O'
): boolean => {
  const opponent = player === 'X' ? 'O' : 'X';
  const { board: nextBoard } = simulateInfiniteMove(board, move, player, history);
  if (checkWinner(nextBoard) === player) return true;
  if (countImmediateWins(nextBoard, opponent, 3, 3, 1) > 0) return false;
  return getForkThreatMoves(nextBoard, opponent, 3, 3).length === 0;
};
const evaluatePosition = (board: Cell[], player: 'X' | 'O'): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  let score = 0;
  for (const combo of WINNING_COMBOS_3X3) {
    const [a, b, c] = combo;
    const cells = [board[a], board[b], board[c]];
    const playerCount = cells.filter(c => c === player).length;
    const opponentCount = cells.filter(c => c === opponent).length;
    if (opponentCount === 0) {
      if (playerCount === 3) score += 1000;
      else if (playerCount === 2) score += 100;
      else if (playerCount === 1) score += 10;
    }
    if (playerCount === 0) {
      if (opponentCount === 3) score -= 1000;
      else if (opponentCount === 2) score -= 150;
      else if (opponentCount === 1) score -= 10;
    }
  }
  return score;
};
const evaluateInfinitePosition = (
  board: Cell[],
  player: 'X' | 'O',
  history: MoveRecord[]
): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  let score = 0;
  const winner = checkWinner(board);
  if (winner === player) return 10000;
  if (winner === opponent) return -10000;
  const playerMoves = history.filter((m) => m.player === player).sort((a, b) => a.time - b.time);
  const opponentMoves = history.filter((m) => m.player === opponent).sort((a, b) => a.time - b.time);
  const playerOldestIdx = playerMoves.length >= 3 ? playerMoves[0].index : -1;
  const opponentOldestIdx = opponentMoves.length >= 3 ? opponentMoves[0].index : -1;
  for (const combo of WINNING_COMBOS_3X3) {
    const [a, b, c] = combo;
    const cells = [board[a], board[b], board[c]];
    const indices = [a, b, c];
    const playerCount = cells.filter(c => c === player).length;
    const opponentCount = cells.filter(c => c === opponent).length;
    const hasPlayerOldMark = indices.includes(playerOldestIdx);
    const hasOpponentOldMark = indices.includes(opponentOldestIdx);
    if (opponentCount === 0) {
      if (playerCount === 2) {
        score += hasPlayerOldMark ? 50 : 100;
      } else if (playerCount === 1) {
        score += 5;
      }
    }
    if (playerCount === 0) {
      if (opponentCount === 2) {
        score -= hasOpponentOldMark ? 75 : 150;
      } else if (opponentCount === 1) {
        score -= 5;
      }
    }
  }
  if (board[4] === player) score += 15;
  if (board[4] === opponent) score -= 15;
  [0, 2, 6, 8].forEach(i => {
    if (board[i] === player) score += 5;
    if (board[i] === opponent) score -= 5;
  });
  return score;
};
const minimax = (
  board: Cell[],
  depth: number,
  isMaximizing: boolean,
  player: 'X' | 'O',
  alpha: number = -Infinity,
  beta: number = Infinity,
  maxDepth: number = 9
): number => {
  const winner = checkWinner(board);
  if (winner === player) return 10 - depth;
  if (winner && winner !== 'draw') return depth - 10;
  if (winner === 'draw' || depth >= maxDepth) return 0;
  const available = getAvailableMoves(board);
  if (available.length === 0) return 0;
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of available) {
      const newBoard = simulateMove(board, move, player);
      const score = minimax(newBoard, depth + 1, false, player, alpha, beta, maxDepth);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    const opponent = player === 'X' ? 'O' : 'X';
    for (const move of available) {
      const newBoard = simulateMove(board, move, opponent);
      const score = minimax(newBoard, depth + 1, true, player, alpha, beta, maxDepth);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
};
const reverseExactCache = new Map<string, number>();
const decayScoreByPly = (score: number): number => {
  if (score > 0) return score - 1;
  if (score < 0) return score + 1;
  return 0;
};
const solveReverseExact = (
  board: Cell[],
  turn: 'X' | 'O',
  bot: 'X' | 'O'
): number => {
  const key = `${boardKey(board)}|t${turn}|b${bot}`;
  const cached = reverseExactCache.get(key);
  if (cached !== undefined) return cached;

  const { winner, isDraw } = checkReverseOutcome(board);
  if (winner) {
    const terminal = winner === bot ? 1000 : -1000;
    reverseExactCache.set(key, terminal);
    return terminal;
  }
  if (isDraw) {
    reverseExactCache.set(key, 0);
    return 0;
  }

  const available = getAvailableMoves(board);
  if (available.length === 0) {
    reverseExactCache.set(key, 0);
    return 0;
  }

  const maximizing = turn === bot;
  let bestScore = maximizing ? -Infinity : Infinity;
  for (const move of available) {
    const childBoard = simulateMove(board, move, turn);
    const childTurn = turn === 'X' ? 'O' : 'X';
    const childScore = solveReverseExact(childBoard, childTurn, bot);
    const score = decayScoreByPly(childScore);
    if (maximizing) {
      bestScore = Math.max(bestScore, score);
    } else {
      bestScore = Math.min(bestScore, score);
    }
  }

  reverseExactCache.set(key, bestScore);
  return bestScore;
};
const getReverseExactScoredMoves = (
  board: Cell[],
  bot: 'X' | 'O'
): { move: number; score: number }[] => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return [];
  return available
    .map((move) => {
      const childBoard = simulateMove(board, move, bot);
      const score = decayScoreByPly(
        solveReverseExact(childBoard, bot === 'X' ? 'O' : 'X', bot)
      );
      return { move, score };
    })
    .sort((a, b) => b.score - a.score);
};
const getBestReverseMove = (
  board: Cell[],
  player: 'X' | 'O',
  difficulty: Difficulty
): number => {
  const scored = getReverseExactScoredMoves(board, player);
  if (scored.length === 0) return -1;

  const bestScore = scored[0].score;
  const bestMoves = scored.filter((entry) => Math.abs(entry.score - bestScore) <= 1e-6);
  if (difficulty === 'impossible') {
    return chooseMoveWithPersona(bestMoves, 3, 'impossible', true);
  }

  const accuracy = getDifficultyAccuracy(difficulty);
  if (Math.random() < accuracy) {
    return chooseMoveWithPersona(bestMoves, 3, difficulty, true);
  }

  const misses = scored.filter((entry) => entry.score < bestScore);
  if (misses.length === 0) {
    return chooseMoveWithPersona(bestMoves, 3, difficulty, true);
  }

  const dropAllowance =
    difficulty === 'hard' ? 40 : difficulty === 'normal' ? 140 : Number.POSITIVE_INFINITY;
  const nearMisses = misses.filter((entry) => bestScore - entry.score <= dropAllowance);
  const missPool = nearMisses.length > 0 ? nearMisses : misses;
  return chooseMoveWithPersona(missPool, 3, difficulty);
};
interface InfiniteCacheEntry {
  remainingDepth: number;
  score: number;
}
const INFINITE_TIME_STEP = 32;
const getOrderedPlayerHistory = (
  history: MoveRecord[],
  player: 'X' | 'O'
): number[] => {
  return history
    .filter((m) => m.player === player)
    .sort((a, b) => a.time - b.time || a.index - b.index)
    .map((m) => m.index);
};
const getInfiniteStateKey = (
  board: Cell[],
  history: MoveRecord[],
  turn: 'X' | 'O'
): string => {
  const xAges = getOrderedPlayerHistory(history, 'X').join('.');
  const oAges = getOrderedPlayerHistory(history, 'O').join('.');
  return `${boardKey(board)}|x:${xAges}|o:${oAges}|t:${turn}`;
};
const minimaxInfinite = (
  board: Cell[],
  history: MoveRecord[],
  turn: 'X' | 'O',
  player: 'X' | 'O',
  depth: number,
  alpha: number,
  beta: number,
  maxDepth: number,
  startTime: number,
  timeLimit: number,
  cache: Map<string, InfiniteCacheEntry>,
  path: Set<string>
): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  const winner = checkWinner(board);
  if (winner === player) return 10000 - depth;
  if (winner === opponent) return depth - 10000;
  if (winner === 'draw') return 0;
  if (depth >= maxDepth || Date.now() - startTime >= timeLimit) {
    return evaluateInfinitePosition(board, player, history);
  }

  const stateKey = getInfiniteStateKey(board, history, turn);
  if (path.has(stateKey)) return 0;

  const remainingDepth = maxDepth - depth;
  const cached = cache.get(stateKey);
  if (cached && cached.remainingDepth >= remainingDepth) {
    return cached.score;
  }

  const available = getAvailableMoves(board);
  if (available.length === 0) return evaluateInfinitePosition(board, player, history);

  const maximizing = turn === player;
  path.add(stateKey);

  const orderedMoves = available
    .map((move, idx) => {
      const simulatedAt = startTime + depth * INFINITE_TIME_STEP + idx;
      const { board: nextBoard, newHistory: nextHistory } = simulateInfiniteMove(
        board,
        move,
        turn,
        history,
        simulatedAt
      );
      const result = checkWinner(nextBoard);
      let orderingScore = evaluateInfinitePosition(nextBoard, player, nextHistory);
      if (result === turn) orderingScore += turn === player ? 200000 : -200000;
      const nextTurn = turn === 'X' ? 'O' : 'X';
      const immediateThreats = countImmediateWins(nextBoard, nextTurn, 3, 3, 2);
      orderingScore += immediateThreats === 0 ? 1500 : immediateThreats === 1 ? -500 : -2000;
      return { move, nextBoard, nextHistory, orderingScore };
    })
    .sort((a, b) => (maximizing ? b.orderingScore - a.orderingScore : a.orderingScore - b.orderingScore));

  if (maximizing) {
    let best = -Infinity;
    for (const candidate of orderedMoves) {
      if (Date.now() - startTime >= timeLimit) break;
      const nextTurn = turn === 'X' ? 'O' : 'X';
      const score = minimaxInfinite(
        candidate.nextBoard,
        candidate.nextHistory,
        nextTurn,
        player,
        depth + 1,
        alpha,
        beta,
        maxDepth,
        startTime,
        timeLimit,
        cache,
        path
      );
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    path.delete(stateKey);
    cache.set(stateKey, { remainingDepth, score: best });
    return best;
  }

  let best = Infinity;
  for (const candidate of orderedMoves) {
    if (Date.now() - startTime >= timeLimit) break;
    const nextTurn = turn === 'X' ? 'O' : 'X';
    const score = minimaxInfinite(
      candidate.nextBoard,
      candidate.nextHistory,
      nextTurn,
      player,
      depth + 1,
      alpha,
      beta,
      maxDepth,
      startTime,
      timeLimit,
      cache,
      path
    );
    best = Math.min(best, score);
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  path.delete(stateKey);
  cache.set(stateKey, { remainingDepth, score: best });
  return best;
};
const evaluateMegaPosition = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number
): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  const combos = getWinningCombos(boardSize, winLength);
  let score = 0;
  for (const combo of combos) {
    const threat = detectThreat(board, combo, player, winLength);
    if (winLength <= 4) {
      score += threat * 1.8;
    } else {
      score += threat * 1.5;
    }
  }
  const centerBonus = Math.floor(boardSize * 5);
  const cornerBonus = Math.floor(boardSize * 2.5);
  const edgeBonus = Math.floor(boardSize * 1.5);
  const center = Math.floor(boardSize / 2) * boardSize + Math.floor(boardSize / 2);
  if (board[center] === player) score += centerBonus;
  if (board[center] === opponent) score -= centerBonus;
  const corners = [
    0,
    boardSize - 1,
    boardSize * (boardSize - 1),
    boardSize * boardSize - 1
  ];
  corners.forEach(i => {
    if (board[i] === player) score += cornerBonus;
    if (board[i] === opponent) score -= cornerBonus;
  });
  if (boardSize >= 5) {
    const nearCenter = [
      center - 1, center + 1,
      center - boardSize, center + boardSize
    ].filter(i => i >= 0 && i < board.length);
    nearCenter.forEach(i => {
      if (board[i] === player) score += edgeBonus;
      if (board[i] === opponent) score -= edgeBonus;
    });
  }
  return score;
};
const minimaxMegaIterative = (
  board: Cell[],
  depth: number,
  isMaximizing: boolean,
  player: 'X' | 'O',
  boardSize: number,
  winLength: number,
  alpha: number = -Infinity,
  beta: number = Infinity,
  maxDepth: number = 4,
  startTime: number = Date.now(),
  timeLimit: number = 1000,
  cache?: Map<string, number>
): number => {
  if (!cache) cache = new Map<string, number>();
  if (Date.now() - startTime > timeLimit) {
    return evaluateMegaPosition(board, player, boardSize, winLength);
  }
  const winner = checkWinner(board, boardSize, winLength);
  const key = `${boardKey(board)}|d${depth}|m${maxDepth}|g${isMaximizing}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  if (winner === player) return 10000 - depth;
  if (winner && winner !== 'draw') return depth - 10000;
  if (depth >= maxDepth) return evaluateMegaPosition(board, player, boardSize, winLength);
  const available = getAvailableMoves(board);
  if (available.length === 0) return evaluateMegaPosition(board, player, boardSize, winLength);
  const center = Math.floor(boardSize / 2) * boardSize + Math.floor(boardSize / 2);
  const corners = [0, boardSize - 1, boardSize * (boardSize - 1), boardSize * boardSize - 1];
  const limit = Math.min(
    available.length,
    boardSize <= 5 ? 16 : boardSize <= 7 ? 14 : 12
  );
  const orderedMoves = available.sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    if (a === center) scoreA += 100;
    if (b === center) scoreB += 100;
    if (corners.includes(a)) scoreA += 50;
    if (corners.includes(b)) scoreB += 50;
    return scoreB - scoreA;
  }).slice(0, limit);
  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of orderedMoves) {
      const newBoard = simulateMove(board, move, player);
      const score = minimaxMegaIterative(
        newBoard, depth + 1, false, player, boardSize, winLength,
        alpha, beta, maxDepth, startTime, timeLimit, cache
      );
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
      if (shouldYield()) {}
    }
    cache.set(key, maxScore);
    return maxScore;
  } else {
    let minScore = Infinity;
    const opponent = player === 'X' ? 'O' : 'X';
    for (const move of orderedMoves) {
      const newBoard = simulateMove(board, move, opponent);
      const score = minimaxMegaIterative(
        newBoard, depth + 1, true, player, boardSize, winLength,
        alpha, beta, maxDepth, startTime, timeLimit, cache
      );
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
      if (shouldYield()) {}
    }
    cache.set(key, minScore);
    return minScore;
  }
};
const getBestMegaMove = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number,
  difficulty: Difficulty
  , timeBudget?: number
  , sharedCache?: Map<string, number>
): number => {
  const available = getAvailableMoves(board);
  const opponent = player === 'X' ? 'O' : 'X';
  if (available.length === 0) return -1;
  if (difficulty === 'easy') {
    const winningMoves = available.filter((move) => {
      const testBoard = simulateMove(board, move, player);
      return checkWinner(testBoard, boardSize, winLength) === player;
    });
    if (winningMoves.length > 0 && shouldUseBestMove('easy')) {
      return chooseMoveWithPersona(winningMoves.map((move) => ({ move, score: 1000 })), boardSize, 'easy', true);
    }

    const blockingMoves = available.filter((move) => {
      const testBoard = simulateMove(board, move, opponent);
      return checkWinner(testBoard, boardSize, winLength) === opponent;
    });
    if (blockingMoves.length > 0) {
      if (Math.random() > getDifficultyAccuracy('easy')) {
        const nonBlockingMoves = available.filter((move) => !blockingMoves.includes(move));
        if (nonBlockingMoves.length > 0) {
          const missScores = nonBlockingMoves.map((move) => {
            const testBoard = simulateMove(board, move, player);
            return { move, score: evaluateMegaPosition(testBoard, player, boardSize, winLength) };
          });
          return chooseMoveWithPersona(missScores, boardSize, 'easy');
        }
      }
      return chooseMoveWithPersona(blockingMoves.map((move) => ({ move, score: 900 })), boardSize, 'easy', true);
    }

    const scored = available.map((move) => {
      const testBoard = simulateMove(board, move, player);
      return { move, score: evaluateMegaPosition(testBoard, player, boardSize, winLength) };
    });
    return chooseMoveWithPersona(scored, boardSize, 'easy');
  }
  if (difficulty === 'normal') {
    const winningMoves = available.filter((move) => {
      const testBoard = simulateMove(board, move, player);
      return checkWinner(testBoard, boardSize, winLength) === player;
    });
    if (winningMoves.length > 0 && shouldUseBestMove('normal')) {
      return chooseMoveWithPersona(
        winningMoves.map((move) => ({ move, score: 1800 })),
        boardSize,
        'normal',
        true
      );
    }
    const blockingMoves = available.filter((move) => {
      const testBoard = simulateMove(board, move, opponent);
      return checkWinner(testBoard, boardSize, winLength) === opponent;
    });
    if (blockingMoves.length > 0) {
      if (Math.random() > getDifficultyAccuracy('normal')) {
        const nonBlockingMoves = available.filter((move) => !blockingMoves.includes(move));
        if (nonBlockingMoves.length > 0) {
          const missScores = nonBlockingMoves.map((move) => {
            const testBoard = simulateMove(board, move, player);
            return { move, score: evaluateMegaPosition(testBoard, player, boardSize, winLength) };
          });
          return chooseMoveWithPersona(missScores, boardSize, 'normal');
        }
      }
      return chooseMoveWithPersona(
        blockingMoves.map((move) => ({ move, score: 1400 })),
        boardSize,
        'normal',
        true
      );
    }
    const evaluateMove = (move: number): number => {
      const testBoard = simulateMove(board, move, player);
      return evaluateMegaPosition(testBoard, player, boardSize, winLength);
    };
    const moveScores = available.map(move => ({ move, score: evaluateMove(move) }));
    return chooseMoveWithPersona(moveScores, boardSize, 'normal');
  }
  if (difficulty === 'hard') {
    const winningMoves = available.filter((move) => {
      const testBoard = simulateMove(board, move, player);
      return checkWinner(testBoard, boardSize, winLength) === player;
    });
    if (winningMoves.length > 0 && shouldUseBestMove('hard')) {
      return chooseMoveWithPersona(
        winningMoves.map((move) => ({ move, score: 2000 })),
        boardSize,
        'hard',
        true
      );
    }
    const blockingMoves = available.filter((move) => {
      const testBoard = simulateMove(board, move, opponent);
      return checkWinner(testBoard, boardSize, winLength) === opponent;
    });
    if (blockingMoves.length > 0) {
      if (Math.random() > getDifficultyAccuracy('hard')) {
        const nonBlockingMoves = available.filter((move) => !blockingMoves.includes(move));
        if (nonBlockingMoves.length > 0) {
          const missScores = nonBlockingMoves.map((move) => {
            const testBoard = simulateMove(board, move, player);
            return { move, score: evaluateMegaPosition(testBoard, player, boardSize, winLength) };
          });
          return chooseMoveWithPersona(missScores, boardSize, 'hard');
        }
      }
      return chooseMoveWithPersona(
        blockingMoves.map((move) => ({ move, score: 1600 })),
        boardSize,
        'hard',
        true
      );
    }
    if (shouldUseBestMove('hard')) {
      const myFork = detectFork(board, player, boardSize, winLength);
      if (myFork && myFork.threatCount >= 2) {
        return myFork.move;
      }
      const opponentFork = detectFork(board, opponent, boardSize, winLength);
      if (opponentFork && opponentFork.threatCount >= 2) {
        return opponentFork.move;
      }
      if (winLength <= 5) {
        const forkPrevention = preventCommonForkPatterns(board, player, boardSize, winLength);
        if (forkPrevention !== null) {
          return forkPrevention;
        }
      }
    }
    const evaluateMove = (move: number): number => {
      const testBoard = simulateMove(board, move, player);
      return evaluateMegaPosition(testBoard, player, boardSize, winLength);
    };
    const moveScores = available.map(move => ({ move, score: evaluateMove(move) }));
    return chooseMoveWithPersona(moveScores, boardSize, 'hard');
  }
  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    if (checkWinner(testBoard, boardSize, winLength) === player) {
      return move;
    }
  }
  for (const move of available) {
    const testBoard = simulateMove(board, move, opponent);
    if (checkWinner(testBoard, boardSize, winLength) === opponent) {
      return move;
    }
  }
  const myFork = detectFork(board, player, boardSize, winLength);
  if (myFork && myFork.threatCount >= 2) {
    return myFork.move;
  }
  const opponentFork = detectFork(board, opponent, boardSize, winLength);
  if (opponentFork && opponentFork.threatCount >= 2) {
    return opponentFork.move;
  }
  if (winLength <= 5) {
    const forkPrevention = preventCommonForkPatterns(board, player, boardSize, winLength);
    if (forkPrevention !== null) {
      return forkPrevention;
    }
    const opponentForkThreat = detectOpponentForkThreat(board, player, boardSize, winLength);
    if (opponentForkThreat !== null) {
      return opponentForkThreat;
    }
  }
  const totalMoves = board.filter(c => c !== null).length;
  if (totalMoves === 0) {
    const center = Math.floor(boardSize / 2) * boardSize + Math.floor(boardSize / 2);
    return center;
  }
  if (totalMoves === 1) {
    const center = Math.floor(boardSize / 2) * boardSize + Math.floor(boardSize / 2);
    if (board[center] === null) return center;
    const corners = [0, boardSize - 1, boardSize * (boardSize - 1), boardSize * boardSize - 1];
    return corners.find(c => board[c] === null) || available[0];
  }
  const evaluateMove = (move: number): number => {
    const testBoard = simulateMove(board, move, player);
    return evaluateMegaPosition(testBoard, player, boardSize, winLength);
  };
  const moveScores = available.map(move => ({ move, score: evaluateMove(move) }))
                              .sort((a, b) => b.score - a.score);
  let topMoves: number[] = [];
  let maxDepth = 3;
  let timeLimit = 1000;
  if (available.length <= 10) {
    topMoves = moveScores.slice(0, 10).map(m => m.move);
    maxDepth = boardSize <= 5 ? 5 : 4;
    timeLimit = 1500;
  } else if (available.length <= 20) {
    topMoves = moveScores.slice(0, 12).map(m => m.move);
    maxDepth = boardSize <= 5 ? 4 : 3;
    timeLimit = 1200;
  } else {
    topMoves = moveScores.slice(0, 15).map(m => m.move);
    maxDepth = 3;
    timeLimit = 1000;
  }
  if (winLength === 4) maxDepth = Math.min(maxDepth + 1, 6);
  if (winLength >= 5) maxDepth = Math.max(maxDepth - 1, 3);
  if (difficulty === 'impossible') {
    const maxCandidates = boardSize <= 5 ? 30 : boardSize <= 7 ? 26 : 22;
    topMoves = moveScores.slice(0, Math.min(maxCandidates, moveScores.length)).map(m => m.move);
    const depthCap = boardSize <= 6 ? 9 : 8;
    maxDepth = Math.min((winLength <= 4 ? maxDepth + 2 : maxDepth + 1), depthCap);
    timeLimit = Math.max(timeLimit * 3.5, boardSize <= 5 ? 7000 : 9000);
    if (typeof timeBudget === 'number' && timeBudget > 0) {
      timeLimit = Math.max(timeLimit, timeBudget);
    }
    const proximity = (idx: number) => {
      const x = idx % boardSize;
      const y = Math.floor(idx / boardSize);
      let score = 0;
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= boardSize || ny >= boardSize) continue;
          const nidx = ny * boardSize + nx;
          if (board[nidx] !== null) score += Math.max(0, 3 - (Math.abs(dx) + Math.abs(dy)));
        }
      }
      return score;
    };
    topMoves = topMoves.map(m => ({
      m,
      score: evaluateMegaPosition(simulateMove(board, m, player), player, boardSize, winLength)
        + (detectFork(board, player, boardSize, winLength)?.move === m ? 3000 : 0)
        + (detectFork(board, opponent, boardSize, winLength)?.move === m ? -2500 : 0)
        + proximity(m)
    }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.m);
    const tactical = topMoves.map((move) => {
      const nextBoard = simulateMove(board, move, player);
      const myThreats = countImmediateWins(nextBoard, player, boardSize, winLength, 2);
      const opponentThreats = countImmediateWins(nextBoard, opponent, boardSize, winLength, 2);
      return { move, myThreats, opponentThreats };
    });
    const winningFork = tactical.find((entry) => entry.myThreats >= 2 && entry.opponentThreats === 0);
    if (winningFork) return winningFork.move;

    const fullySafe = tactical.filter((entry) => entry.opponentThreats === 0).map((entry) => entry.move);
    if (fullySafe.length > 0) {
      topMoves = fullySafe;
    } else {
      const bestRisk = Math.min(...tactical.map((entry) => entry.opponentThreats));
      topMoves = tactical
        .filter((entry) => entry.opponentThreats === bestRisk)
        .map((entry) => entry.move);
      if (topMoves.length === 0) {
        topMoves = [moveScores[0].move];
      }
    }
  }
  const startTime = Date.now();
  let bestMove = topMoves[0];
  let bestScore = -Infinity;
  const bestMoves: number[] = [];
  resetYieldCounter();
  const endTime = startTime + timeLimit;
  const cache = sharedCache || new Map<string, number>();
  if (difficulty === 'impossible') {
    for (let depth = 3; depth <= maxDepth; depth++) {
      if (Date.now() > endTime) break;
      for (const move of topMoves) {
        if (Date.now() > endTime) break;
        const newBoard = simulateMove(board, move, player);
        const score = minimaxMegaIterative(
          newBoard, 0, false, player, boardSize, winLength,
          -Infinity, Infinity, depth, startTime, timeLimit, cache
        );
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
          bestMoves.length = 0;
          bestMoves.push(move);
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
        if (shouldYield()) {}
      }
    }
  } else {
    for (const move of topMoves) {
      if (Date.now() - startTime > timeLimit * 0.85) break;
      const newBoard = simulateMove(board, move, player);
      const score = minimaxMegaIterative(
        newBoard, 0, false, player, boardSize, winLength,
        -Infinity, Infinity, maxDepth, startTime, timeLimit, cache
      );
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
        bestMoves.length = 0;
        bestMoves.push(move);
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
      if (shouldYield()) {}
    }
  }
  if (bestMoves.length > 1) {
    return chooseMoveWithPersona(
      bestMoves.map((move) => ({ move, score: bestScore })),
      boardSize,
      difficulty,
      difficulty === 'impossible'
    );
  }
  return bestMove;
};
const getBestInfiniteMove = (
  board: Cell[],
  player: 'X' | 'O',
  history: MoveRecord[],
  difficulty: Difficulty,
  timeBudget?: number
): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  const opponent = player === 'X' ? 'O' : 'X';

  for (const move of available) {
    const { board: testBoard } = simulateInfiniteMove(board, move, player, history);
    if (checkWinner(testBoard) === player) {
      return move;
    }
  }
  const blockingMoves = available.filter((move) => {
    const { board: testBoard } = simulateInfiniteMove(board, move, opponent, history);
    return checkWinner(testBoard) === opponent;
  });
  if (blockingMoves.length > 0) {
    if (difficulty !== 'impossible' && Math.random() > getDifficultyAccuracy(difficulty)) {
      const nonBlockingMoves = available.filter((move) => !blockingMoves.includes(move));
      if (nonBlockingMoves.length > 0) {
        const missScores = nonBlockingMoves.map((move) => {
          const { board: nextBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
          return { move, score: evaluateInfinitePosition(nextBoard, player, newHistory) };
        });
        return chooseMoveWithPersona(missScores, 3, difficulty);
      }
    }
    return chooseMoveWithPersona(
      blockingMoves.map((move) => ({ move, score: 1900 })),
      3,
      difficulty,
      true
    );
  }

  const playerMoveCount = history.filter((m) => m.player === player).length;
  const opponentMoveCount = history.filter((m) => m.player === opponent).length;
  const inNoExpiryOpening = playerMoveCount < 3 && opponentMoveCount < 3;

  if (inNoExpiryOpening && difficulty !== 'impossible') {
    const opponentForkMoves = getForkThreatMoves(board, opponent, 3, 3);
    if (opponentForkMoves.length > 0 && shouldUseBestMove(difficulty)) {
      const safeMoves = available.filter((move) => {
        const { board: nextBoard } = simulateInfiniteMove(board, move, player, history);
        if (checkWinner(nextBoard) === player) return true;
        const opponentImmediateWins = countImmediateWins(nextBoard, opponent, 3, 3, 1);
        if (opponentImmediateWins > 0) return false;
        const nextForkMoves = getForkThreatMoves(nextBoard, opponent, 3, 3);
        if (nextForkMoves.length === 0) return true;
        const forcingThreats = countImmediateWins(nextBoard, player, 3, 3, 1);
        return forcingThreats > 0 && nextForkMoves.length <= 1;
      });

      if (safeMoves.length > 0) {
        const scoredSafeMoves = safeMoves.map((move) => {
          const { board: nextBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
          const score = evaluateInfinitePosition(nextBoard, player, newHistory);
          const edgeBonus = [1, 3, 5, 7].includes(move) ? 16 : 0;
          return { move, score: score + edgeBonus };
        });
        return chooseMoveWithPersona(scoredSafeMoves, 3, difficulty);
      }

      if (opponentForkMoves.length === 1 && available.includes(opponentForkMoves[0])) {
        return opponentForkMoves[0];
      }
    }
  }

  if (difficulty === 'impossible') {
    const startTime = Date.now();
    const timeLimit = Math.max(typeof timeBudget === 'number' ? timeBudget : 3200, 2200);
    const maxDepthTarget = 16;
    const searchCache = new Map<string, InfiniteCacheEntry>();
    const orderedMoves = available
      .map((move) => {
        const { board: newBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
        let score = evaluateInfinitePosition(newBoard, player, newHistory);
        if (move === 4) score += 30;
        if (move === 0 || move === 2 || move === 6 || move === 8) score += 12;
        const oppImmediateWins = countImmediateWins(newBoard, opponent, 3, 3, 2);
        score += oppImmediateWins === 0 ? 120 : oppImmediateWins === 1 ? -50 : -200;
        return { move, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.move);

    let bestMove = orderedMoves[0];
    let bestScore = -Infinity;
    for (let depth = 5; depth <= maxDepthTarget; depth++) {
      if (Date.now() - startTime >= timeLimit) break;
      let depthBestMove = bestMove;
      let depthBestScore = -Infinity;
      let depthBestMoves: number[] = [];
      let depthCompleted = true;

      for (let i = 0; i < orderedMoves.length; i++) {
        if (Date.now() - startTime >= timeLimit) {
          depthCompleted = false;
          break;
        }
        const move = orderedMoves[i];
        const simulatedAt = startTime + depth * INFINITE_TIME_STEP + i;
        const { board: newBoard, newHistory } = simulateInfiniteMove(
          board,
          move,
          player,
          history,
          simulatedAt
        );
        if (checkWinner(newBoard) === player) return move;

        const score = minimaxInfinite(
          newBoard,
          newHistory,
          opponent,
          player,
          1,
          -Infinity,
          Infinity,
          depth,
          startTime,
          timeLimit,
          searchCache,
          new Set<string>()
        );
        if (score > depthBestScore) {
          depthBestScore = score;
          depthBestMove = move;
          depthBestMoves = [move];
        } else if (score === depthBestScore) {
          depthBestMoves.push(move);
        }
      }

      if (depthCompleted) {
        if (depthBestMoves.length > 1) {
          depthBestMove = chooseMoveWithPersona(
            depthBestMoves.map((move) => ({ move, score: depthBestScore })),
            3,
            'impossible',
            true
          );
        }
        bestMove = depthBestMove;
        bestScore = depthBestScore;
      } else {
        break;
      }
    }

    if (bestScore === -Infinity) {
      return orderedMoves[0];
    }
    return bestMove;
  }

  const scored = available.map((move) => {
    const { board: newBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
    const quickLookahead =
      difficulty === 'hard'
        ? minimaxInfinite(
            newBoard,
            newHistory,
            player === 'X' ? 'O' : 'X',
            player,
            1,
            -Infinity,
            Infinity,
            4,
            Date.now(),
            60,
            new Map<string, InfiniteCacheEntry>(),
            new Set<string>()
          )
        : evaluateInfinitePosition(newBoard, player, newHistory);
    const score = quickLookahead + evaluateInfinitePosition(newBoard, player, newHistory) * 0.6;
    return { move, score };
  });
  return chooseMoveWithPersona(scored, 3, difficulty);
};
const getClassicMoveByDifficulty = (
  board: Cell[],
  player: 'X' | 'O',
  difficulty: Exclude<Difficulty, 'impossible'>
): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  const opponent = player === 'X' ? 'O' : 'X';

  const winningMoves = available.filter(
    (move) => checkWinner(simulateMove(board, move, player), 3, 3) === player
  );
  if (winningMoves.length > 0 && shouldUseBestMove(difficulty)) {
    return chooseMoveWithPersona(winningMoves.map((move) => ({ move, score: 2000 })), 3, difficulty, true);
  }

  const blockingMoves = available.filter(
    (move) => checkWinner(simulateMove(board, move, opponent), 3, 3) === opponent
  );
  if (blockingMoves.length > 0) {
    if (Math.random() > getDifficultyAccuracy(difficulty)) {
      const nonBlockingMoves = available.filter((move) => !blockingMoves.includes(move));
      if (nonBlockingMoves.length > 0) {
        return chooseMoveWithPersona(
          nonBlockingMoves.map((move) => ({ move, score: evaluatePosition(simulateMove(board, move, player), player) })),
          3,
          difficulty
        );
      }
    }
    return chooseMoveWithPersona(blockingMoves.map((move) => ({ move, score: 1900 })), 3, difficulty, true);
  }

  const myFork = detectFork(board, player, 3, 3);
  if (myFork && shouldUseBestMove(difficulty)) {
    return myFork.move;
  }

  const opponentForkMoves = getForkThreatMoves(board, opponent, 3, 3);
  if (opponentForkMoves.length > 0 && shouldUseBestMove(difficulty)) {
    const antiForkDepth = difficulty === 'hard' ? 6 : difficulty === 'normal' ? 4 : 3;
    const safeMoves = available.filter((move) => {
      const nextBoard = simulateMove(board, move, player);
      if (checkWinner(nextBoard, 3, 3) === player) return true;
      const opponentImmediateWins = countImmediateWins(nextBoard, opponent, 3, 3, 1);
      if (opponentImmediateWins > 0) return false;
      const nextForkMoves = getForkThreatMoves(nextBoard, opponent, 3, 3);
      if (nextForkMoves.length === 0) return true;
      const forcingThreats = countImmediateWins(nextBoard, player, 3, 3, 1);
      return forcingThreats > 0 && nextForkMoves.length <= 1;
    });

    if (safeMoves.length > 0) {
      const scoredSafeMoves = safeMoves.map((move) => {
        const nextBoard = simulateMove(board, move, player);
        const strategic = minimax(nextBoard, 0, false, player, -Infinity, Infinity, antiForkDepth);
        const tactical = evaluatePosition(nextBoard, player);
        const edgeBonus = [1, 3, 5, 7].includes(move) ? 16 : 0;
        return { move, score: strategic * 24 + tactical + edgeBonus };
      });
      return chooseMoveWithPersona(scoredSafeMoves, 3, difficulty);
    }

    if (opponentForkMoves.length === 1 && available.includes(opponentForkMoves[0])) {
      return opponentForkMoves[0];
    }

    const edgeMoves = [1, 3, 5, 7].filter((move) => available.includes(move));
    if (edgeMoves.length > 0) {
      return chooseMoveWithPersona(
        edgeMoves.map((move) => ({ move, score: 1600 })),
        3,
        difficulty,
        difficulty === 'hard'
      );
    }
  }

  const maxDepth = difficulty === 'hard' ? 5 : difficulty === 'normal' ? 3 : 2;
  const scored = available.map((move) => {
    const nextBoard = simulateMove(board, move, player);
    const strategic = minimax(nextBoard, 0, false, player, -Infinity, Infinity, maxDepth);
    const tactical = evaluatePosition(nextBoard, player);
    const strategicWeight = difficulty === 'hard' ? 17 : difficulty === 'normal' ? 13 : 10;
    return { move, score: strategic * strategicWeight + tactical };
  });
  return chooseMoveWithPersona(scored, 3, difficulty);
};
const getBlitzMoveByDifficulty = (
  board: Cell[],
  player: 'X' | 'O',
  difficulty: Difficulty
): number => {
  if (difficulty === 'impossible') {
    return getBestExact3x3Move(board, player, 'blitz');
  }

  const best = getClassicMoveByDifficulty(board, player, difficulty);
  if (best !== -1) return best;

  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  return randomChoice(available);
};
export const getBotMove = (
  board: Cell[],
  bot: 'X' | 'O',
  difficulty: Difficulty,
  variant: Variant,
  history: MoveRecord[],
  isBlitzMode: boolean = false,
  boardSize: number = 3,
  winLength: number = 3,
  timeBudget?: number,
  sharedCache?: Map<string, number>
): number => {
  const available = shuffle(getAvailableMoves(board));
  if (available.length === 0) return -1;
  const personalityMove = pickPersonalityMove(board, available, boardSize);
  if (variant === 'gravity') {
    return getBestGravityMove(board, bot, difficulty);
  }
  if (variant === 'mega') {
    return getBestMegaMove(board, bot, boardSize, winLength, difficulty, timeBudget, sharedCache);
  }
  if (variant === 'infinite') {
    if (difficulty === 'easy') {
      if (
        personalityMove !== null &&
        Math.random() < 0.34 &&
        isSafePersonaMoveInfinite3x3(board, history, personalityMove, bot)
      ) {
        return personalityMove;
      }
      return getBestInfiniteMove(board, bot, history, 'easy', timeBudget);
    }
    if (difficulty === 'normal') {
      if (
        personalityMove !== null &&
        Math.random() < 0.32 &&
        isSafePersonaMoveInfinite3x3(board, history, personalityMove, bot)
      ) {
        return personalityMove;
      }
      return getBestInfiniteMove(board, bot, history, 'normal', timeBudget);
    }
    if (difficulty === 'hard') {
      if (
        personalityMove !== null &&
        Math.random() < 0.22 &&
        isSafePersonaMoveInfinite3x3(board, history, personalityMove, bot)
      ) {
        return personalityMove;
      }
      return getBestInfiniteMove(board, bot, history, 'hard', timeBudget);
    }
    return getBestInfiniteMove(board, bot, history, 'impossible', timeBudget);
  }
  if (isBlitzMode || variant === 'blitz') {
    if (personalityMove !== null && difficulty !== 'impossible') {
      const chance = difficulty === 'easy' ? 0.32 : difficulty === 'normal' ? 0.3 : 0.2;
      if (Math.random() < chance && isSafePersonaMove3x3(board, personalityMove, bot)) {
        return personalityMove;
      }
    }
    return getBlitzMoveByDifficulty(board, bot, difficulty);
  }
  if (variant === 'reverse') {
    return getBestReverseMove(board, bot, difficulty);
  }
  switch (difficulty) {
    case 'easy':
      return getClassicMoveByDifficulty(board, bot, 'easy');
    case 'normal':
      return getClassicMoveByDifficulty(board, bot, 'normal');
    case 'hard':
      return getClassicMoveByDifficulty(board, bot, 'hard');
    case 'impossible':
      return getBestExact3x3Move(board, bot, 'classic');
    default:
      return available[Math.floor(Math.random() * available.length)];
  }
};
const checkReverseOutcome = (board: Cell[]): { winner: 'X' | 'O' | null; isDraw: boolean } => {
  const result = checkWinner(board);
  if (result === 'draw') return { winner: null, isDraw: true };
  if (result === 'X' || result === 'O') {
    return { winner: result === 'X' ? 'O' : 'X', isDraw: false };
  }
  return { winner: null, isDraw: false };
};
