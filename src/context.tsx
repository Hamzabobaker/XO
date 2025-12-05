import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { darkTheme, lightTheme, Theme } from './theme';

type Language = 'en' | 'ar' | 'auto';
type ThemeMode = 'light' | 'dark' | 'auto';
type GameMode = 'vsplayer' | 'vsbot';
type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
type Variant = 'classic' | 'infinite' | 'blitz' | 'mega' | 'doublemove' | 'swap' | 'reverse';

interface Translations { [key: string]: string; }

// keep your translations exactly as provided (omitted here to save space).
// Paste the exact translations object from your original context.tsx into the `translations` const below.
const translations: Record<'en'|'ar', Translations> = {
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
    doublemove: 'Double Move',
    swap: 'Swap',
    reverse: 'Reverse',
    classicDesc: 'Traditional 3×3 tic-tac-toe. Get three in a row to win.',
    infiniteDesc: 'Only 3 marks allowed. placing a 4th removes your oldest.',
    blitzDesc: 'Fast-paced with time limits. Make your move before time runs out!',
    megaDesc: 'Larger boards with customizable win conditions.',
    doublemoveDesc: 'Get an extra move every few turns. Plan your double-move strategy!',
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
    gameDescription: 'A modern tic-tac-toe game with multiple exciting modes',
    builtWith: 'Built with React Native & Expo',
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
    darkMode: 'Beautiful light and dark themes',
    smartAI: 'Intelligent AI opponents with varying difficulty',
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
    doubleMoveSettings: 'Double Move Settings',
    movesUntilDouble: 'Moves Until Double',
    doubleMoveTurns: 'Double Move Every',
    turns: 'turns',
    doubleActive: 'Double Move Active!',
    nextDoubleIn: 'Next double in',
    move: 'move',
    moves: 'moves',
    doubleMoveDescription: 'Players get an extra move every N turns',
    doubleMoveExample: 'With {turns} turns: After every {turns} moves, the current player gets to move twice in a row!',
    chooseGameMode: 'Choose Game Mode',
    selectDifficulty: 'Select Difficulty',
    whenTimeRunsOut: 'When Time Runs Out',
    comingSoonMessage: 'This mode is still under development and will be available in a future update.',
    winLength: 'Win Length',
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
    doublemove: 'حركة مزدوجة',
    swap: 'تبديل',
    reverse: 'عكسي',
    classicDesc: 'لعبة XO التقليدية 3×3. احصل على ثلاثة في صف للفوز.',
    infiniteDesc: 'يمكنك وضع 3 علامات فقط. وضع علامة رابعة يزيل أقدم علامة.',
    blitzDesc: 'سريع الوتيرة مع حدود زمنية. قم بحركتك قبل نفاد الوقت!',
    megaDesc: 'لوحات أكبر مع شروط فوز قابلة للتخصيص.',
    doublemoveDesc: 'احصل على حركة إضافية كل عدة دورات. خطط لاستراتيجية حركتك المزدوجة!',
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
    xWins: 'X فاز!',
    oWins: 'O فاز!',
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
    gameDescription: 'لعبة XO حديثة مع أوضاع متعددة ومثيرة',
    builtWith: 'مبني بواسطة React Native و Expo',
    quitGameTitle: 'إنهاء اللعبة؟',
    quitGameMessage: 'هل أنت متأكد من إنهاء هذه اللعبة؟',
    quitAppTitle: 'إنهاء التطبيق؟',
    quitAppMessage: 'هل أنت متأكد من الخروج؟',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    gameModes: 'أوضاع اللعب',
    playAlone: 'تحدى نفسك ضد الذكاء الاصطناعي بمستويات صعوبة متعددة',
    playTogether: 'العب مع صديق على نفس الجهاز',
    features: 'المميزات',
    multiLanguage: 'يدعم اللغتين الإنجليزية والعربية',
    darkMode: 'مظاهر فاتحة وداكنة جميلة',
    smartAI: 'خصوم ذكاء اصطناعي بمستويات صعوبة متنوعة',
    createdBy: 'صنع بواسطة حمزة',
    creatorDesc: 'مجرد مطور آخر، يصنع تطبيقاته بهدوء… واضح إنك حوّلت للغة العربية بس عشان تعرف إيش مكتوب هنا، المرة الجاية حاول تتعلم الإنجليزي',
    modeDetails: 'تفاصيل الوضع',
    viewRules: 'عرض القواعد',
    comingSoon: 'قريباً',
    underDevelopment: 'تحت التطوير',
    availableIn: 'متاح في',
    classicMode: 'الوضع الكلاسيكي',
    infiniteMode: 'الوضع اللانهائي',
    passDevice: 'مرر الجهاز للاعب الآخر بعد دورك',
    yourTurn: 'دورك',
    timerDuration: 'مدة المؤقت',
    perMove: 'لكل حركة',
    totalTime: 'الوقت الكلي',
    seconds: 'ث',
    timeUp: 'انتهى الوقت!',
    playerTimeout: 'نفذ وقت اللاعب',
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
    doubleMoveSettings: 'إعدادات الحركة المزدوجة',
    movesUntilDouble: 'الحركات حتى المزدوجة',
    doubleMoveTurns: 'حركة مزدوجة كل',
    turns: 'دورة',
    doubleActive: 'الحركة المزدوجة نشطة!',
    nextDoubleIn: 'المزدوجة التالية في',
    move: 'حركة',
    moves: 'حركات',
    doubleMoveDescription: 'يحصل اللاعب على حركة إضافية بعد كل N دورة',
    doubleMoveExample: 'مع {turns} دورات: بعد كل {turns} حركة، يحصل اللاعب الحالي على فرصة للحركة مرتين متتاليتين!',
    chooseGameMode: 'اختر وضع اللعبة',
    selectDifficulty: 'اختر الصعوبة',
    whenTimeRunsOut: 'عند نفاد الوقت',
    comingSoonMessage: 'هذا الوضع لا يزال قيد التطوير وسيكون متاحاً في تحديث مستقبلي.',
    winLength: 'طول الفوز',
  },
};

export interface BlitzSettings {
  timePerMove: number;
  onTimeout: 'skip' | 'random' | 'lose';
}
export interface MegaBoardSettings {
  boardSize: 4 | 5 | 7 | 8 | 9;
  winLength: number;
}
export interface DoubleMoveSettings {
  turnsUntilDouble: number;
}

interface AppContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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
  doubleMoveSettings: DoubleMoveSettings;
  setDoubleMoveSettings: (settings: DoubleMoveSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // browser prefers-color-scheme
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const deviceColorScheme = prefersDark ? 'dark' : 'light';

  const deviceLanguage = (navigator.language || 'en').startsWith('ar') ? 'ar' : 'en';


  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [language, setLanguage] = useState<Language>('auto');
  const [selectedMode, setSelectedModeState] = useState<GameMode>('vsplayer');
  const [selectedDifficulty, setSelectedDifficultyState] = useState<Difficulty>('normal');
  const [selectedVariant, setSelectedVariantState] = useState<Variant>('classic');
  const [blitzSettings, setBlitzSettings] = useState<BlitzSettings>({ timePerMove: 10, onTimeout: 'random' });
  const [megaBoardSettings, setMegaBoardSettings] = useState<MegaBoardSettings>({ boardSize: 5, winLength: 4 });
  const [doubleMoveSettings, setDoubleMoveSettings] = useState<DoubleMoveSettings>({ turnsUntilDouble: 6 });

  const actualThemeMode = themeMode === 'auto' ? (deviceColorScheme === 'dark' ? 'dark' : 'light') : themeMode;
  const theme = actualThemeMode === 'light' ? lightTheme : darkTheme;

  const actualLanguage = language === 'auto' ? deviceLanguage : language;

  const t = (key: string): string => {
    return (translations as any)[actualLanguage]?.[key] ?? (translations as any).en?.[key] ?? key;
  };

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
    <AppContext.Provider value={{
      theme,
      themeMode,
      setThemeMode,
      language,
      setLanguage,
      t,
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
      doubleMoveSettings,
      setDoubleMoveSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
