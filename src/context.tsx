// src/context.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { darkTheme, lightTheme, Theme } from './theme';

type Language = 'en' | 'ar' | 'auto';
type ThemeMode = 'light' | 'dark' | 'auto';
type GameMode = 'vsplayer' | 'vsbot';
type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
type Variant = 'classic' | 'infinite' | 'blitz' | 'mega' | 'swap' | 'reverse';

interface Translations {
  [key: string]: string;
}

// --- Translations ---
const translations: Record<'en' | 'ar', Translations> = {
  en: {
    title: 'XO',
    play: 'Play Game',
    settings: 'Settings',
    about: 'About',
    quit: 'Quit',
    exit: 'Exit',
    vsplayer: 'VS Player',
    vsbot: 'VS Bot',
    classic: 'Classic',
    infinite: 'Infinite',
    blitz: 'Blitz',
    mega: 'Mega Board',
    swap: 'Swap',
    reverse: 'Reverse',
    classicDesc: 'Traditional 3×3 tic-tac-toe. Get three in a row to win.',
    infiniteDesc: 'Only 3 marks allowed. placing a 4th removes your oldest.',
    blitzDesc: 'Fast-paced with time limits. Make your move before time runs out!',
    megaDesc: 'Larger boards with customizable win conditions.',
    swapDesc: 'Players swap pieces or sides after few moves. Adapt your strategy!',
    reverseDesc: 'Avoid making three in a row. Force your opponent to win.',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    impossible: 'Impossible',
    mode: 'Game Mode',
    selectMode: 'Select Game Mode',
    difficulty: 'Bot Difficulty',
    variant: 'Game Variant',
    gameVariant: 'Game Variant',
    startGame: 'Start Game',
    back: 'Back',
    restart: 'Restart',
    winner: 'Winner',
    draw: 'Draw',
    xWins: 'X Wins!',
    oWins: 'O Wins!',
    itsADraw: "It's a Draw!",
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    xTurn: "X's Turn",
    oTurn: "O's Turn",
    gameDescription: 'A tic-tac-toe game with multiple modes',
    builtWith: 'Built with React & TypeScript',
    quitGameTitle: 'Quit Game?',
    quitGameMessage: 'Are you sure you want to quit this game?',
    quitAppTitle: 'Quit App?',
    quitAppMessage: 'Are you sure you want to exit?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    gameModes: 'Game Modes',
    playAlone: 'Challenge yourself against AI with multiple difficulty levels',
    playTogether: 'Play with a friend on the same device',
    features: 'Features',
    multiLanguage: 'Supports English and Arabic languages',
    darkMode: 'light and dark themes',
    smartAI: 'AI opponents with varying difficulty',
    createdBy: 'Created by Hamza',
    creatorDesc: 'Just another developer, quietly making apps, wondering if anyone will notice… probably not, but hey, at least I tried',
    modeDetails: 'Mode Details',
    viewRules: 'View Rules',
    comingSoon: 'Coming Soon',
    underDevelopment: 'Under Development',
    availableIn: 'Available in',
    classicMode: 'Classic Mode',
    infiniteMode: 'Infinite Mode',
    passDevice: 'Pass device to other player after your turn',
    yourTurn: 'Your Turn',
    timerDuration: 'Timer Duration',
    perMove: 'Per Move',
    totalTime: 'Total Time',
    seconds: 's',
    timeUp: 'Time Up!',
    playerTimeout: 'Player ran out of time',
    timeWarning: 'Hurry up!',
    blitzSettings: 'Blitz Settings',
    timePerMove: 'Time Per Move',
    totalMatchTime: 'Total Match Time',
    onTimeout: 'On Timeout',
    skipTurn: 'Skip Turn',
    randomMove: 'Random Move',
    loseOnTimeout: 'Lose on Timeout',
    suddenDeath: 'Sudden Death',
    apply: 'Apply',
    boardSize: 'Board Size',
    winCondition: 'Win Condition',
    inARow: 'in a row',
    toWin: 'to win',
    megaSettings: 'Mega Board Settings',
    size4x4: '4×4',
    size5x5: '5×5',
    size7x7: '7×7',
    size8x8: '8×8',
    size9x9: '9×9',
    customWinLength: 'Win Length',
    turns: 'turns',
    botThinking: 'Bot is thinking...',
    nextPowerUp: 'Next power-up in',
    move: 'move',
    moves: 'moves',
    used: 'Used',
    ready: 'Ready',
    chooseGameMode: 'Choose Game Mode',
    selectDifficulty: 'Select Difficulty',
    whoStarts: 'Who Starts?',
    playerStarts: 'I Start',
    botStarts: 'Bot Starts',
    whenTimeRunsOut: 'When Time Runs Out',
    comingSoonMessage: 'This mode is still under development and will be available in a future update.',
    winLength: 'Win Length',
    playAs: 'Play As',
    playAsDescription: 'Choose which symbol you want to play as',
    startingPlayer: 'Starting Player',
    startingPlayerDescription: 'Choose which player starts first',
    player: 'Player',
    blitzTimeoutInfo: 'If time runs out, you lose instantly',
    youWin: 'You Win!',
    youLose: 'You Lost!',
    victory: 'Victory',
    defeat: 'Defeat',
    playAgain: 'Play Again',
    mainMenu: 'Main Menu',
  },
  ar: {
    title: 'XO',
    play: 'العب اللعبة',
    settings: 'الإعدادات',
    about: 'حول',
    quit: 'خروج',
    exit: 'خروج',
    vsplayer: 'ضد لاعب',
    vsbot: 'ضد الروبوت',
    classic: 'كلاسيك',
    infinite: 'لا نهائي',
    blitz: 'سريع',
    mega: 'لوحة كبيرة',
    swap: 'تبديل',
    reverse: 'عكسي',
    classicDesc: 'لعبة XO التقليدية 3×3. احصل على ثلاثة في صف للفوز.',
    infiniteDesc: 'يمكنك وضع 3 علامات فقط. وضع علامة رابعة يزيل أقدم علامة.',
    blitzDesc: 'سريع الوتيرة مع حدود زمنية. قم بحركتك قبل نفاد الوقت!',
    megaDesc: 'لوحات أكبر مع شروط فوز قابلة للتخصيص.',
    swapDesc: 'يتبادل اللاعبون القطع أو الجوانب بعد عدة حركات. تكيّف مع استراتيجيتك!',
    reverseDesc: 'تجنَّب تكوين ثلاثة في صف. اجبر خصمك على الفوز.',
    easy: 'سهل',
    normal: 'عادي',
    hard: 'صعب',
    impossible: 'مستحيل',
    mode: 'وضع اللعبة',
    selectMode: 'اختر وضع اللعبة',
    difficulty: 'صعوبة الروبوت',
    variant: 'نوع اللعبة',
    gameVariant: 'نوع اللعبة',
    startGame: 'ابدأ اللعبة',
    back: 'رجوع',
    restart: 'إعادة',
    winner: 'الفائز',
    draw: 'تعادل',
    xWins: 'فاز X!',
    oWins: 'فاز O!',
    itsADraw: 'تعادل!',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    auto: 'تلقائي',
    language: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    xTurn: 'دور X',
    oTurn: 'دور O',
    gameDescription: 'لعبة XO مع أوضاع متعددة',
    builtWith: 'مبني بـ React و TypeScript',
    quitGameTitle: 'إنهاء اللعبة؟',
    quitGameMessage: 'هل أنت متأكد من إنهاء هذه اللعبة؟',
    quitAppTitle: 'إنهاء التطبيق؟',
    quitAppMessage: 'هل أنت متأكد من الخروج؟',
    nextPowerUp: 'القوة التالية في',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    gameModes: 'أوضاع اللعب',
    playAlone: 'تحدى نفسك ضد الذكاء الاصطناعي بمستويات صعوبة متعددة',
    playTogether: 'العب مع صديق على نفس الجهاز',
    features: 'المميزات',
    multiLanguage: 'يدعم اللغتين الإنجليزية والعربية',
    darkMode: 'مظاهر فاتحة وداكنة',
    smartAI: 'خصوم ذكاء اصطناعي بمستويات صعوبة متنوعة',
    createdBy: 'صنع بواسطة حمزة',
    creatorDesc: 'أنا مجرد مطوّر آخر، أصنع تطبيقاتي بهدوء وأتساءل إن كان أحد سيلاحظ... ربما لا، لكن على الأقل حاولت',
    modeDetails: 'تفاصيل الوضع',
    viewRules: 'عرض القواعد',
    whoStarts: 'من يبدأ؟',
    playerStarts: 'أنا أبدأ',
    botStarts: 'الروبوت يبدأ',
    comingSoon: 'قريباً',
    used: 'مستخدم',
    ready: 'جاهز',
    underDevelopment: 'تحت التطوير',
    availableIn: 'متاح في',
    classicMode: 'الوضع الكلاسيكي',
    infiniteMode: 'الوضع اللانهائي',
    passDevice: 'مرر الجهاز للاعب الآخر بعد دورك',
    yourTurn: 'دورك',
    botThinking: 'الروبوت يفكر...',
    timerDuration: 'مدة المؤقت',
    perMove: 'لكل حركة',
    totalTime: 'الوقت الكلي',
    seconds: 'ث',
    timeUp: 'انتهى الوقت!',
    playerTimeout: 'انتهى وقت اللاعب',
    timeWarning: 'أسرع!',
    blitzSettings: 'إعدادات السريع',
    timePerMove: 'الوقت لكل حركة',
    totalMatchTime: 'وقت المباراة الكلي',
    onTimeout: 'عند انتهاء الوقت',
    skipTurn: 'تخطي الدور',
    randomMove: 'حركة عشوائية',
    loseOnTimeout: 'خسارة عند انتهاء الوقت',
    suddenDeath: 'موت مفاجئ',
    apply: 'تطبيق',
    boardSize: 'حجم اللوحة',
    winCondition: 'شرط الفوز',
    inARow: 'في صف',
    toWin: 'للفوز',
    megaSettings: 'إعدادات اللوحة الكبيرة',
    size4x4: '4×4',
    size5x5: '5×5',
    size7x7: '7×7',
    size8x8: '8×8',
    size9x9: '9×9',
    customWinLength: 'طول الفوز',
    turns: 'دورة',
    
    move: 'حركة',
    moves: 'حركات',
    
    chooseGameMode: 'اختر وضع اللعبة',
    selectDifficulty: 'اختر الصعوبة',
    whenTimeRunsOut: 'عند نفاد الوقت',
    comingSoonMessage: 'هذا الوضع لا يزال قيد التطوير وسيكون متاحاً في تحديث مستقبلي.',
    winLength: 'طول الفوز',
    playAs: 'العب كـ',
    playAsDescription: 'اختر الرمز الذي تريد اللعب به',
    startingPlayer: 'اللاعب البادئ',
    startingPlayerDescription: 'اختر أي لاعب يبدأ أولاً',
    player: 'لاعب',
    blitzTimeoutInfo: 'إذا نفذ الوقت، تخسر فوراً',
    youWin: 'لقد فزت!',
    youLose: 'لقد خسرت!',
    victory: 'انتصار',
    defeat: 'هزيمة',
    playAgain: 'العب مرة أخرى',
    mainMenu: 'القائمة الرئيسية',
  },
};

export interface BlitzSettings {
  timePerMove: number;
  onTimeout: 'skip' | 'random' | 'lose';
}

export interface MegaBoardSettings {
  boardSize: 4 | 5 | 6 | 7 | 8 | 9;
  winLength: number;
}

interface AppContextType {
  theme: Theme;
  actualThemeMode: ThemeMode;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  selectedMode: GameMode;
  setSelectedMode: (mode: GameMode) => void;
  selectedDifficulty: Difficulty;
  setSelectedDifficulty: (diff: Difficulty) => void;
  selectedVariant: Variant;
  setSelectedVariant: (variant: Variant) => void;
  blitzSettings: BlitzSettings;
  setBlitzSettings: (settings: BlitzSettings) => void;
  megaBoardSettings: MegaBoardSettings;
  setMegaBoardSettings: (settings: MegaBoardSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Detect device theme & language
  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const deviceColorScheme: ThemeMode = prefersDark ? 'dark' : 'light';
  const deviceLanguage: Language = (navigator.language || 'en').startsWith('ar') ? 'ar' : 'en';

  // --- State ---
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [language, setLanguage] = useState<Language>('auto');
  const [selectedMode, setSelectedModeState] = useState<GameMode>('vsplayer');
  const [selectedDifficulty, setSelectedDifficultyState] = useState<Difficulty>('normal');
  const [selectedVariant, setSelectedVariantState] = useState<Variant>('classic');
  const [blitzSettings, setBlitzSettings] = useState<BlitzSettings>({ timePerMove: 10, onTimeout: 'random' });
  const [megaBoardSettings, setMegaBoardSettings] = useState<MegaBoardSettings>({ boardSize: 5, winLength: 4 });

  // ✅ Sync language to localStorage for index.html
  useEffect(() => {
    try {
      localStorage.setItem('xo-game-language', language);
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [language]);

  // --- Compute actual theme & language ---
  const actualThemeMode = themeMode === 'auto' ? deviceColorScheme : themeMode;
  const theme = actualThemeMode === 'light' ? lightTheme : darkTheme;
  const actualLanguage = language === 'auto' ? deviceLanguage : language;
  const dir: 'ltr' | 'rtl' = actualLanguage === 'ar' ? 'rtl' : 'ltr';

  // --- Apply theme & direction ---
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light-mode', 'dark-mode');
    html.classList.add(actualThemeMode === 'dark' ? 'dark-mode' : 'light-mode');
    html.setAttribute('dir', dir); // handles Arabic flipping automatically
  }, [actualThemeMode, dir]);

  // --- Translation function ---
  const t = (key: string): string => {
    return translations[actualLanguage]?.[key] ?? translations.en?.[key] ?? key;
  };

  // --- Difficulty / Variant safety rules ---
  const setSelectedDifficulty = (diff: Difficulty) => {
    if (diff === 'impossible' && selectedVariant !== 'classic') {
      setSelectedDifficultyState('hard');
      return;
    }
    setSelectedDifficultyState(diff);
  };

  const setSelectedVariant = (variant: Variant) => {
    if (variant !== 'classic' && selectedDifficulty === 'impossible') {
      setSelectedDifficultyState('hard');
    }
    setSelectedVariantState(variant);
  };

  const setSelectedMode = (mode: GameMode) => setSelectedModeState(mode);

  return (
    <AppContext.Provider
      value={{
        theme,
        actualThemeMode,
        themeMode,
        setThemeMode,
        language,
        setLanguage,
        t,
        dir,
        selectedMode,
        setSelectedMode,
        selectedDifficulty,
        setSelectedDifficulty,
        selectedVariant,
        setSelectedVariant,
        blitzSettings,
        setBlitzSettings,
        megaBoardSettings,
        setMegaBoardSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
