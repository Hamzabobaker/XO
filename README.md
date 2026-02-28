# XO Game

XO is a multi-mode tic-tac-toe game by Hamza, built around fast matches, strong AI, and a polished mobile-friendly interface.

## Core Gameplay

- Local play: Player vs Player
- Solo play: Player vs Bot
- Symbol choice: X or O
- Starting side selection in bot matches
- Restart and quit controls during every match

## Game Modes

### Classic
- Standard 3x3 board
- First to connect 3 wins

### Infinite
- 3x3 board
- Each side can keep only 3 marks on the board
- Placing a 4th mark removes that side's oldest mark
- Oldest active mark is visually highlighted

### Blitz
- 3x3 board with per-turn countdown
- Supported move timer options: 5s, 10s, 15s, 20s, 30s
- Timeout ends the round as a loss for the side that ran out of time

### Mega Board
- Board sizes: 4x4, 5x5, 6x6, 7x7, 8x8, 9x9
- Configurable win length based on board size
- Dynamic board scaling for different screens

### Drop Grid (Gravity)
- Pieces are dropped by column
- Marks fall to the lowest available cell
- Includes column indicators and drop animation

### Reverse
- Misere rule set
- Making three in a row loses; opponent is declared winner

## Bot System

- Difficulties: Easy, Normal, Hard, Impossible
- Tactical behavior includes winning move priority, blocking, anti-fork logic, and variant-specific heuristics
- Exact solver logic for key 3x3 variants on Impossible difficulty
- Extended search for Mega Board and Infinite with time budgets and cache reuse
- Visible "Bot is thinking..." state during bot turns

### AI Decision Model

- Core search uses minimax with alpha-beta pruning
- Search output is blended with tactical heuristics for practical move quality
- Move generation and win-line combinations are cached to reduce repeated computation
- Difficulty scaling is not only depth-based; it also adjusts move accuracy and selection sharpness

### Difficulty Behavior

- Easy:
  - Lower tactical consistency
  - Higher chance to choose non-optimal but still legal and plausible moves
- Normal:
  - Balanced between strong tactical play and occasional misses
  - Better blocking and fork awareness than Easy
- Hard:
  - High tactical reliability
  - Strong fork creation and prevention behavior
- Impossible:
  - Uses exact solving paths in supported 3x3 variants
  - Uses deeper iterative search and larger candidate pools in larger-board modes

### Variant-Specific AI

- Classic (3x3):
  - Uses tactical checks first (immediate wins/blocks/forks)
  - Uses minimax scoring for deeper selection
  - Impossible resolves through exact 3x3 search
- Blitz:
  - Uses classic tactical engine with variant timing context
  - Bot move scheduling adapts to remaining clock
- Infinite:
  - Evaluates move expiry effects (oldest-mark removal) as part of planning
  - Uses dedicated minimax and position scoring for expiring-piece states
- Drop Grid (Gravity):
  - Generates legal moves from column drops only
  - Uses gravity-aware immediate win/block/fork checks
  - Impossible uses exact 3x3 solving for gravity rules
- Reverse:
  - Inverts terminal win interpretation (forming three is losing)
  - Includes reverse-specific exact evaluation path for strong endgame decisions
- Mega Board:
  - Uses iterative deepening minimax with time caps
  - Expands top candidate pool based on board size, win length, and difficulty
  - Combines strategic scores with tactical safety checks (threats, forks, risk filtering)

### Performance and Stability

- Shared memoization caches are reused during bot search
- Time budgets are applied to expensive searches to keep gameplay responsive
- Candidate ordering and pruning are used to reach stronger moves earlier
- Search loops include periodic yield checkpoints to avoid long blocking runs

## Match Presentation

- Winner/draw detection with animated win line
- Result modal for victory, defeat, or draw
- Quit confirmation modal
- Sound effects for tap, move, start, line, win, lose, and draw events

## Theme and Language

- Theme modes: Auto, Light, Dark
- Languages: Auto, English, Arabic, Japanese
- RTL support for Arabic
- Persistent settings for:
  - Theme mode
  - Language
  - Sound enabled state
  - Sound volume

## Audio Controls

- Sound on/off toggle
- Volume slider (0-100)
- Volume preview tap
- Dynamic gain curve and compressor for consistent output

## Responsive Experience

- Designed for desktop and mobile layouts
- Intro/loading flow with mobile start screen and optional fullscreen action
- Animated transitions across menu, mode selection, settings, gameplay, and results

## Credit

Created by Hamza.
