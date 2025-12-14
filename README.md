## Author

**Hamza**

# XO - Modern Tic-Tac-Toe Game

A Tic-Tac-Toe game built with React and TypeScript, featuring multiple game modes, AI opponents with adjustable difficulty, and a beautiful, responsive UI.

## Features

### Game Modes
- **Classic** - Traditional 3×3 Tic-Tac-Toe
- **Infinite** - Only 3 marks allowed per player; placing a 4th removes your oldest
- **Blitz** - Fast-paced mode with time limits (5-30 seconds per move)
- **Mega Board** - Larger boards (4×4 to 9×9) with customizable win conditions
- **Swap** *(Coming Soon)* - Players swap pieces after a few moves
- **Reverse** *(Coming Soon)* - Avoid making three in a row

### AI Opponents
- **4 Difficulty Levels**: Easy, Normal, Hard, Impossible
- **Smart AI with Fork Detection** - Advanced AI that creates and blocks multi-directional threats
- **Adaptive Strategy** - AI adjusts thinking time based on board size and time remaining (Blitz mode)
- **Minimax Algorithm** - Uses alpha-beta pruning for optimal moves

### Customization
- **Dark/Light Themes** with smooth transitions
- **Multi-Language Support** - English and Arabic (RTL support)
- **Persistent Settings** - Your preferences are remembered between sessions
- **Smooth Animations** - Framer Motion powered transitions

### Advanced Features
- **VS Player & VS Bot** modes
- **Choose starting player** (X/O and who goes first)
- **Transparent oldest marks** in Infinite mode
- **Winning line animations** with color-matched effects
- **Responsive design** - Works on all screen sizes
- **Bot thinking indicator** with spinner
- **Confetti celebration** on victory

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router v6** - Navigation
- **Framer Motion v11** - Animations
- **React Icons** - Icon library
- **Create React App** - Build tooling

---

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn

### Steps

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/xo-game.git
   cd xo-game
```

2. **Install dependencies**
```bash
   npm install
   # or
   yarn install
```

3. **Start the development server**
```bash
   npm start
   # or
   yarn start
```

4. **Open your browser**
   Navigate to `http://localhost:3000`

---

## Project Structure
```
XO/
├── public/
│   ├── index.html              # Main HTML with loading screen
│   └── ...
├── src/
│   ├── components/
│   │   ├── BlitzTimer.tsx      # Chess-style timer with 00.00 format
│   │   ├── Board.tsx           # Game board with animations
│   │   ├── ConfirmModal.tsx    # Confirmation dialogs
│   │   ├── GameSettingsModal.tsx # Game setup with rolling animations
│   │   ├── ModeCard.tsx        # Mode selection cards
│   │   ├── ResultModal.tsx     # Win/loss/draw modal with confetti
│   │   └── WinLine.tsx         # SVG winning line animation
│   │
│   ├── pages/
│   │   ├── About.tsx           # Credits and info page
│   │   ├── Game.tsx            # Main gameplay logic
│   │   ├── MainMenu.tsx        # Home screen
│   │   ├── Play.tsx            # Mode selection screen
│   │   └── Settings.tsx        # Theme and language settings
│   │
│   ├── utils/
│   │   └── ai.ts               # Minimax AI with fork detection
│   │
│   ├── App.tsx                 # Main app with routing
│   ├── context.tsx             # Global state (theme, language, settings)
│   ├── index.css               # Global styles
│   ├── index.tsx               # Entry point
│   └── theme.ts                # Light/Dark theme definitions
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## How to Play

### Classic Mode
1. Select **VS Player** or **VS Bot**
2. Choose your symbol (X or O)
3. Select difficulty (if playing vs bot)
4. First to get 3 in a row wins!

### Infinite Mode
- Each player can only have **3 marks** on the board
- Placing a 4th mark removes your oldest one
- Strategy changes as marks disappear!

### Blitz Mode
- Set time per move (5-30 seconds)
- Make your move before time runs out
- Fast thinking required!

### Mega Board
- Choose board size (4×4 to 9×9)
- Customize win length (4-7 in a row)
- Larger boards require deeper strategy

---

## AI Implementation

### Algorithm
The AI uses **Minimax with Alpha-Beta Pruning** for optimal move selection:
```typescript
minimax(board, depth, isMaximizing, alpha, beta)
  ├─ Check win/loss/draw
  ├─ Evaluate position
  └─ Recursively search best moves
```

### Fork Detection (Mega Board)
For win lengths 3-5, the AI:
1. **Detects forks** - Moves that create 2+ winning threats
2. **Blocks opponent forks** - Prevents multi-threat setups
3. **Prevents fork patterns** - Stops early fork preparation

### Difficulty Levels
- **Easy** - 70% random moves
- **Normal** - 50% optimal, 50% random
- **Hard** - 80% optimal with occasional mistakes
- **Impossible** - Perfect play with full minimax search

---

## Configuration

### Customizable Settings
All stored in `context.tsx`:
- **Theme Mode** - Auto, Light, Dark
- **Language** - Auto, English, Arabic
- **Blitz Time** - 5, 10, 15, 20, 30 seconds
- **Mega Board Size** - 4×4 to 9×9
- **Win Length** - 4 to 7 in a row

Settings are **persisted** between sessions (except game mode selection).

---

## Theming

### Color Palette

**Dark Theme:**
```typescript
{
  background: '#0A0E1A',
  surface: '#151B2E',
  primary: '#60A5FA',
  secondary: '#F87171',
  accent: '#A78BFA',
  xColor: '#60A5FA',
  oColor: '#F87171'
}
```

**Light Theme:**
```typescript
{
  background: '#EEF2FF',
  surface: '#FFFFFF',
  primary: '#3B82F6',
  secondary: '#EF4444',
  accent: '#8B5CF6',
  xColor: '#3B82F6',
  oColor: '#EF4444'
}
```

---

## Internationalization

### Supported Languages
- 🇬🇧 **English** (LTR)
- 🇸🇦 **Arabic** (RTL with proper text direction)

### Adding New Languages
1. Add translations to `context.tsx`:
```typescript
   const translations = {
     en: { ... },
     ar: { ... },
     newLang: { ... } // Add here
   }
```

2. Update language selector in `Settings.tsx`

---

## 🚧 Roadmap

- [ ] **Swap Mode** - Players swap pieces mid-game
- [ ] **Reverse Mode** - Avoid making three in a row
- [ ] **Online Multiplayer** - Play with friends remotely
- [ ] **Game History** - Review past games
- [ ] **Achievements System** - Unlock badges
- [ ] **Custom Themes** - Create your own color schemes
- [ ] **Sound Effects** - Audio feedback
- [ ] **Replay System** - Watch game replays

---

## Development

### Available Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from CRA (irreversible)
```

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (recommended)

### Performance Optimizations
- **Memoization** - React.memo on components
- **Lazy Loading** - Code splitting with React.lazy
- **Optimized Animations** - GPU-accelerated with Framer Motion
- **AI Time Limits** - Prevents UI freezing on large boards

---

## License

MIT License - Feel free to use this project for learning or personal use.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with React & TypeScript**