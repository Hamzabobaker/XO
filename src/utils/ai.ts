// src/utils/ai.ts

type Cell = 'X' | 'O' | null;
type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
type Variant = 'classic' | 'infinite' | 'blitz' | 'mega';

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

let moveEvaluationCount = 0;
const shouldYield = () => {
  moveEvaluationCount++;
  return moveEvaluationCount % 50 === 0;
};

const resetYieldCounter = () => {
  moveEvaluationCount = 0;
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

const checkWinner = (board: Cell[], boardSize: number = 3, winLength: number = 3): Cell | 'draw' | null => {
  const combos = boardSize === 3 && winLength === 3 ? WINNING_COMBOS_3X3 : generateWinningCombos(boardSize, winLength);

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
  const combos = generateWinningCombos(boardSize, winLength);
  
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
  const combos = generateWinningCombos(boardSize, winLength);
  
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
  history: MoveRecord[]
): { board: Cell[]; newHistory: MoveRecord[] } => {
  const newBoard = [...board];
  let newHistory = [...history];

  const playerMoves = newHistory.filter((m) => m.player === player);

  if (playerMoves.length >= 3) {
    const oldest = playerMoves.sort((a, b) => a.time - b.time)[0];
    newBoard[oldest.index] = null;
    newHistory = newHistory.filter((m) => m !== oldest);
  }

  newBoard[index] = player;
  newHistory.push({ player, index, time: Date.now() });

  return { board: newBoard, newHistory };
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

const getBlitzMove = (board: Cell[], player: 'X' | 'O'): number => {
  const available = getAvailableMoves(board);
  const opponent = player === 'X' ? 'O' : 'X';

  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    if (checkWinner(testBoard) === player) {
      return move;
    }
  }

  for (const move of available) {
    const testBoard = simulateMove(board, move, opponent);
    if (checkWinner(testBoard) === opponent) {
      return move;
    }
  }

  if (board[4] === null) {
    return 4;
  }

  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length > 0) {
    if (board[0] === opponent && corners.includes(8)) return 8;
    if (board[2] === opponent && corners.includes(6)) return 6;
    if (board[6] === opponent && corners.includes(2)) return 2;
    if (board[8] === opponent && corners.includes(0)) return 0;

    return corners[0];
  }

  const edges = [1, 3, 5, 7].filter(i => board[i] === null);
  if (edges.length > 0) {
    return edges[0];
  }

  return available[0];
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

const minimaxInfinite = (
  board: Cell[],
  history: MoveRecord[],
  depth: number,
  isMaximizing: boolean,
  player: 'X' | 'O',
  alpha: number = -Infinity,
  beta: number = Infinity,
  maxDepth: number = 6
): number => {
  const winner = checkWinner(board);

  if (winner === player) return 100 - depth;
  if (winner && winner !== 'draw') return depth - 100;
  if (depth >= maxDepth) {
    return evaluateInfinitePosition(board, player, history);
  }

  const available = getAvailableMoves(board);
  if (available.length === 0) return evaluateInfinitePosition(board, player, history);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of available) {
      const { board: newBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
      const score = minimaxInfinite(newBoard, newHistory, depth + 1, false, player, alpha, beta, maxDepth);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    const opponent = player === 'X' ? 'O' : 'X';
    for (const move of available) {
      const { board: newBoard, newHistory } = simulateInfiniteMove(board, move, opponent, history);
      const score = minimaxInfinite(newBoard, newHistory, depth + 1, true, player, alpha, beta, maxDepth);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
};

const evaluateMegaPosition = (
  board: Cell[],
  player: 'X' | 'O',
  boardSize: number,
  winLength: number
): number => {
  const opponent = player === 'X' ? 'O' : 'X';
  const combos = generateWinningCombos(boardSize, winLength);
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

  // Transposition table lookup
  const key = board.join('') + `|d${depth}|m${maxDepth}|g${isMaximizing}`;
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

  const orderedMoves = available.sort((a, b) => {
    let scoreA = 0, scoreB = 0;
    if (a === center) scoreA += 100;
    if (b === center) scoreB += 100;
    if (corners.includes(a)) scoreA += 50;
    if (corners.includes(b)) scoreB += 50;
    return scoreB - scoreA;
  }).slice(0, 12);

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

  // ✅ EASY: Only check wins 50% of the time, misses blocks often
  if (difficulty === 'easy') {
    // Check own win 50% of the time
    if (Math.random() < 0.5) {
      for (const move of available) {
        const testBoard = simulateMove(board, move, player);
        if (checkWinner(testBoard, boardSize, winLength) === player) {
          return move;
        }
      }
    }

    // Block opponent win only 40% of the time
    if (Math.random() < 0.4) {
      for (const move of available) {
        const testBoard = simulateMove(board, move, opponent);
        if (checkWinner(testBoard, boardSize, winLength) === opponent) {
          return move;
        }
      }
    }

    // Otherwise just play random
    return available[Math.floor(Math.random() * available.length)];
  }

  // ✅ NORMAL: Always checks wins, blocks 70% of time, no fork detection
  if (difficulty === 'normal') {
    // Always check for own win
    for (const move of available) {
      const testBoard = simulateMove(board, move, player);
      if (checkWinner(testBoard, boardSize, winLength) === player) {
        return move;
      }
    }

    // Block opponent win 70% of time
    if (Math.random() < 0.7) {
      for (const move of available) {
        const testBoard = simulateMove(board, move, opponent);
        if (checkWinner(testBoard, boardSize, winLength) === opponent) {
          return move;
        }
      }
    }

    // Use simple evaluation (no fork detection)
    const evaluateMove = (move: number): number => {
      const testBoard = simulateMove(board, move, player);
      return evaluateMegaPosition(testBoard, player, boardSize, winLength);
    };

    const moveScores = available.map(move => ({ move, score: evaluateMove(move) }))
                                .sort((a, b) => b.score - a.score);
    
    // 30% random, 70% best move
    if (Math.random() < 0.3) {
      return available[Math.floor(Math.random() * available.length)];
    }
    return moveScores[0].move;
  }

  // ✅ HARD: Always wins/blocks, uses fork detection, occasionally misses strategic moves
  if (difficulty === 'hard') {
    // Always check for win
    for (const move of available) {
      const testBoard = simulateMove(board, move, player);
      if (checkWinner(testBoard, boardSize, winLength) === player) {
        return move;
      }
    }

    // Always block opponent win
    for (const move of available) {
      const testBoard = simulateMove(board, move, opponent);
      if (checkWinner(testBoard, boardSize, winLength) === opponent) {
        return move;
      }
    }

    // Check fork opportunities 80% of time
    if (Math.random() < 0.8) {
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

    // Use evaluation
    const evaluateMove = (move: number): number => {
      const testBoard = simulateMove(board, move, player);
      return evaluateMegaPosition(testBoard, player, boardSize, winLength);
    };

    const moveScores = available.map(move => ({ move, score: evaluateMove(move) }))
                                .sort((a, b) => b.score - a.score);
    
    // 15% random move
    if (Math.random() < 0.15) {
      return available[Math.floor(Math.random() * available.length)];
    }

    return moveScores[0].move;
  }

  // ✅ IMPOSSIBLE: Perfect play (unchanged)
  // Always check for win
  for (const move of available) {
    const testBoard = simulateMove(board, move, player);
    if (checkWinner(testBoard, boardSize, winLength) === player) {
      return move;
    }
  }

  // Always block
  for (const move of available) {
    const testBoard = simulateMove(board, move, opponent);
    if (checkWinner(testBoard, boardSize, winLength) === opponent) {
      return move;
    }
  }

  // Always use fork detection
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

  // Opening book
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

  // Full minimax search
  const evaluateMove = (move: number): number => {
    const testBoard = simulateMove(board, move, player);
    return evaluateMegaPosition(testBoard, player, boardSize, winLength);
  };

  const moveScores = available.map(move => ({ move, score: evaluateMove(move) }))
                              .sort((a, b) => b.score - a.score);

  let topMoves: number[] = [];
  let maxDepth = 3;
  let timeLimit = 1000;

  // Base move selection and search limits — tuned per branching
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

  // If impossible difficulty, allow deeper/longer search and better move ordering
  if (difficulty === 'impossible') {
    // increase candidate set and time budget for harder positions
    topMoves = moveScores.slice(0, Math.min(24, moveScores.length)).map(m => m.move);
    // bump depth more aggressively for smaller win lengths
    maxDepth = Math.min((winLength <= 4 ? maxDepth + 2 : maxDepth + 1), 8);
    timeLimit = Math.max(timeLimit * 3, 3000);
  
  // allow caller to request a minimum time budget
  if (typeof timeBudget === 'number' && timeBudget > 0) {
    timeLimit = Math.max(timeLimit, timeBudget);
  }

    // prefer moves near existing marks (reduce branching) and those creating threats
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

    // enhanced ordering: combine evaluation, forks, and proximity
    topMoves = topMoves.map(m => ({
      m,
      score: evaluateMegaPosition(simulateMove(board, m, player), player, boardSize, winLength)
        + (detectFork(board, player, boardSize, winLength)?.move === m ? 3000 : 0)
        + (detectFork(board, opponent, boardSize, winLength)?.move === m ? -2500 : 0)
        + proximity(m)
    }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.m);
  }

  // Check 2-move ahead threats (try to catch immediate double-win replies)
  for (const move of topMoves.slice(0, 8)) {
    const testBoard = simulateMove(board, move, opponent);
    const opponentMoves = getAvailableMoves(testBoard);
    let winningMoves = 0;
    for (const oMove of opponentMoves.slice(0, 12)) {
      const oBoard = simulateMove(testBoard, oMove, opponent);
      if (checkWinner(oBoard, boardSize, winLength) === opponent) {
        winningMoves++;
        if (winningMoves >= 2) return move;
      }
    }
  }

  // Minimax
  const startTime = Date.now();
  let bestMove = topMoves[0];
  let bestScore = -Infinity;

  // Iterative deepening for impossible difficulty to get better results when time allows
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
      }
      if (shouldYield()) {}
    }
  }

  return bestMove;
};

const getBestInfiniteMove = (
  board: Cell[],
  player: 'X' | 'O',
  history: MoveRecord[],
  difficulty: Difficulty
): number => {
  const available = getAvailableMoves(board);
  const opponent = player === 'X' ? 'O' : 'X';

  for (const move of available) {
    const { board: testBoard } = simulateInfiniteMove(board, move, player, history);
    if (checkWinner(testBoard) === player) {
      return move;
    }
  }

  for (const move of available) {
    const { board: testBoard } = simulateInfiniteMove(board, move, opponent, history);
    if (checkWinner(testBoard) === opponent) {
      return move;
    }
  }

  if (difficulty === 'impossible') {
    let bestScore = -Infinity;
    let bestMove = available[0];

    for (const move of available) {
      const { board: newBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
      const score = minimaxInfinite(newBoard, newHistory, 0, false, player);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    const { board: newBoard, newHistory } = simulateInfiniteMove(board, move, player, history);
    const score = evaluateInfinitePosition(newBoard, player, newHistory);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};
const getBestMove = (board: Cell[], player: 'X' | 'O', useQuickEval: boolean = false): number => {
  const available = getAvailableMoves(board);
  let bestScore = -Infinity;
  let bestMove = available[0];

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
  const available = getAvailableMoves(board);
  const opponent = bot === 'X' ? 'O' : 'X';
  if (available.length === 0) return -1;

  if (variant === 'mega') {
    return getBestMegaMove(board, bot, boardSize, winLength, difficulty, timeBudget, sharedCache);
  }

  if (variant === 'infinite') {
    if (difficulty === 'easy') {
      return Math.random() < 0.8
        ? available[Math.floor(Math.random() * available.length)]
        : getBestInfiniteMove(board, bot, history, 'normal');
    }

    if (difficulty === 'normal') {
      return Math.random() < 0.5
        ? getBestInfiniteMove(board, bot, history, 'normal')
        : available[Math.floor(Math.random() * available.length)];
    }

    if (difficulty === 'hard') {
      return Math.random() < 0.8
        ? getBestInfiniteMove(board, bot, history, 'hard')
        : available[Math.floor(Math.random() * available.length)];
    }

    return getBestInfiniteMove(board, bot, history, 'impossible');
  }

  if (isBlitzMode || variant === 'blitz') {
    if (difficulty === 'easy') {
      return Math.random() < 0.7
        ? available[Math.floor(Math.random() * available.length)]
        : getBlitzMove(board, bot);
    }

    if (difficulty === 'normal') {
      return Math.random() < 0.5
        ? getBlitzMove(board, bot)
        : available[Math.floor(Math.random() * available.length)];
    }

    return getBlitzMove(board, bot);
  }

  switch (difficulty) {
    case 'easy':
      return available[Math.floor(Math.random() * available.length)];

    case 'normal':
      // Always check for immediate win
      for (const move of available) {
        const testBoard = simulateMove(board, move, bot);
        if (checkWinner(testBoard) === bot) return move;
      }
      // Try to block opponent win most of the time
      if (Math.random() < 0.85) {
        for (const move of available) {
          const testBoard = simulateMove(board, move, opponent);
          if (checkWinner(testBoard) === opponent) return move;
        }
      }
      // Otherwise prefer a quick-eval move sometimes
      if (Math.random() < 0.4) {
        return getBestMove(board, bot, true);
      }
      return available[Math.floor(Math.random() * available.length)];

    case 'hard':
      // Always check immediate wins and blocks
      for (const move of available) {
        const testBoard = simulateMove(board, move, bot);
        if (checkWinner(testBoard) === bot) return move;
      }
      for (const move of available) {
        const testBoard = simulateMove(board, move, opponent);
        if (checkWinner(testBoard) === opponent) return move;
      }
      // Prefer deeper best move mostly, but allow occasional variation
      if (Math.random() < 0.85) {
        return getBestMove(board, bot, false);
      }
      return getBestMove(board, bot, true);

    case 'impossible':
      return getBestMove(board, bot, false);

    default:
      return available[Math.floor(Math.random() * available.length)];
  }
};