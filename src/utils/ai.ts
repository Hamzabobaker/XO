type Cell = 'X' | 'O' | null;
type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
type Variant = 'classic' | 'infinite' | 'blitz' | 'mega' | 'doublemove';

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

const checkWinner = (board: Cell[]): Cell | 'draw' | null => {
  for (const combo of WINNING_COMBOS_3X3) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
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

const simulateMove = (board: Cell[], index: number, player: Cell): Cell[] => {
  const newBoard = [...board];
  newBoard[index] = player;
  return newBoard;
};

// ⚡ OPTIMIZED: Fast heuristic-based evaluation for Blitz mode
const evaluatePosition = (board: Cell[], player: 'X' | 'O'): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  let score = 0;

  // Check each winning combo for scoring
  for (const combo of WINNING_COMBOS_3X3) {
    const [a, b, c] = combo;
    const cells = [board[a], board[b], board[c]];
    
    const playerCount = cells.filter(c => c === player).length;
    const opponentCount = cells.filter(c => c === opponent).length;
    const emptyCount = cells.filter(c => c === null).length;

    // Player advantage
    if (opponentCount === 0) {
      if (playerCount === 3) score += 1000; // Win
      else if (playerCount === 2) score += 100; // Two in a row
      else if (playerCount === 1) score += 10; // One in a row
    }

    // Opponent threat
    if (playerCount === 0) {
      if (opponentCount === 3) score -= 1000; // Opponent wins
      else if (opponentCount === 2) score -= 150; // Block needed!
      else if (opponentCount === 1) score -= 10; // Opponent setup
    }
  }

  return score;
};

// ⚡ FAST HEURISTIC: For Blitz mode - quick decisions
const getBlitzMove = (board: Cell[], player: 'X' | 'O'): number => {
  const available = getAvailableMoves(board);
  const opponent = player === 'X' ? 'O' : 'X';

  // 1. Check for immediate win
  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    if (checkWinner(testBoard) === player) {
      return move;
    }
  }

  // 2. Block opponent win
  for (const move of available) {
    const testBoard = simulateMove(board, move, opponent);
    if (checkWinner(testBoard) === opponent) {
      return move;
    }
  }

  // 3. Take center if available
  if (board[4] === null) {
    return 4;
  }

  // 4. Take corners
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length > 0) {
    // Prioritize opposite corner if opponent took one
    if (board[0] === opponent && corners.includes(8)) return 8;
    if (board[2] === opponent && corners.includes(6)) return 6;
    if (board[6] === opponent && corners.includes(2)) return 2;
    if (board[8] === opponent && corners.includes(0)) return 0;
    
    return corners[0];
  }

  // 5. Take any edge
  const edges = [1, 3, 5, 7].filter(i => board[i] === null);
  if (edges.length > 0) {
    return edges[0];
  }

  // Fallback
  return available[0];
};

// 🎯 MINIMAX with alpha-beta pruning (for non-Blitz modes)
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
      if (beta <= alpha) break; // Alpha-beta pruning
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
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minScore;
  }
};

const getBestMove = (board: Cell[], player: 'X' | 'O', useQuickEval: boolean = false): number => {
  const available = getAvailableMoves(board);
  let bestScore = -Infinity;
  let bestMove = available[0];

  // Use heuristic evaluation for quick decisions
  if (useQuickEval) {
    for (const move of available) {
      const newBoard = simulateMove(board, move, player);
      const score = evaluatePosition(newBoard, player);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Full minimax for accurate play
  for (const move of available) {
    const newBoard = simulateMove(board, move, player);
    const score = minimax(newBoard, 0, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

// 🎮 MAIN BOT FUNCTION
export const getBotMove = (
  board: Cell[],
  bot: 'X' | 'O',
  difficulty: Difficulty,
  variant: Variant,
  history: MoveRecord[],
  isBlitzMode: boolean = false
): number => {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // ⚡ BLITZ MODE: Always use fast heuristics
  if (isBlitzMode || variant === 'blitz') {
    if (difficulty === 'easy') {
      // 70% random, 30% smart
      return Math.random() < 0.7 
        ? available[Math.floor(Math.random() * available.length)]
        : getBlitzMove(board, bot);
    }
    
    if (difficulty === 'normal') {
      // 50% heuristic, 50% random
      return Math.random() < 0.5
        ? getBlitzMove(board, bot)
        : available[Math.floor(Math.random() * available.length)];
    }
    
    // Hard: Always use fast heuristics
    return getBlitzMove(board, bot);
  }

  // 🎯 REGULAR MODES: Use full minimax
  switch (difficulty) {
    case 'easy':
      return available[Math.floor(Math.random() * available.length)];

    case 'normal':
      if (Math.random() < 0.4) {
        return getBestMove(board, bot, true); // Quick eval
      }
      return available[Math.floor(Math.random() * available.length)];

    case 'hard':
      if (Math.random() < 0.8) {
        return getBestMove(board, bot, false); // Full minimax
      }
      return getBestMove(board, bot, true); // Quick eval

    case 'impossible':
      return getBestMove(board, bot, false); // Always perfect

    default:
      return available[Math.floor(Math.random() * available.length)];
  }
};