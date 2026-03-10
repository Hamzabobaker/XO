// src/context.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { darkTheme, lightTheme, Theme } from './theme';
import { playSound as playSoundRaw, SoundId } from './utils/sound';

type Language = 'en' | 'ar' | 'ja' | 'auto';
type ThemeMode = 'light' | 'dark' | 'auto';

interface Translations {
  [key: string]: string;
}

const en: Translations = {
  title: 'XO',
  play: 'Play Game',
  settings: 'Settings',
  about: 'About',
  exit: 'Exit',
  vsplayer: 'VS Player',
  vsbot: 'VS Bot',
  classic: 'Classic',
  infinite: 'Infinite',
  blitz: 'Blitz',
  mega: 'Mega Board',
  gravity: 'Drop Grid',
  reverse: 'Reverse',
  classicDesc: 'Traditional 3x3 tic-tac-toe. Get three in a row to win.',
  infiniteDesc: 'Only 3 marks allowed. Placing a 4th removes your oldest.',
  blitzDesc: 'Fast-paced with time limits. Make your move before time runs out!',
  megaDesc: 'Larger boards with customizable win conditions.',
  gravityDesc: 'Marks fall to the lowest empty cell in a column. Plan each drop.',
  reverseDesc: 'Avoid making three in a row. Force your opponent to win.',
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
  impossible: 'Impossible',
  mode: 'Game Mode',
  selectMode: 'Select Game Mode',
  difficulty: 'Bot Difficulty',
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
  japanese: 'Japanese',
  xTurn: "X's Turn",
  oTurn: "O's Turn",
  gameDescription: 'An XO game with multiple modes',
  sound: 'Sound Effects',
  soundDesc: 'Toggle UI and game sounds',
  on: 'On',
  off: 'Off',
  quitGameTitle: 'Quit Game?',
  quitGameMessage: 'Are you sure you want to quit this game?',
  cancel: 'Cancel',
  confirm: 'Confirm',
  playAlone: 'Challenge yourself against AI with multiple difficulty levels',
  playTogether: 'Play with a friend on the same device',
  multiLanguage: 'Supports English, Arabic, and Japanese',
  darkMode: 'Light and dark themes',
  createdBy: 'Created by Hamza',
  creatorDesc: `This is Hamza.

He was 21 at the time and a university student from Libya when he made XO as part of a university project.

At first, it was just a simple idea, but he ended up building it more seriously to practice what he had learned and make something clean and balanced. He likes things clear and simple, so he made sure the game feels fair, and every detail works the way it should.

The game is built with TypeScript and React, everything is hard-coded, and the AI actually thinks. It blocks, plans ahead, and adjusts its strategy depending on difficulty, Easy is relaxed while Impossible uses deeper calculations and precise strategies.

The AI adapts to difficulty settings, from casual and unpredictable on Easy to highly tactical on Impossible, blocking moves, creating forks, and planning several steps ahead. Every match manages board state, turns, and win conditions carefully, with higher difficulties using deeper calculations and more precise strategies.

Sound was implemented directly in the code using the Web Audio API, generating tones and effects for taps, moves, wins, draws, etc. All audio is code-generated, with no external files, and is tied directly to game actions for consistency and clarity.`,
  modeDetails: 'Mode Details',
  comingSoon: 'Coming Soon',
  seconds: 's',
  timePerMove: 'Time Per Move',
  boardSize: 'Board Size',
  inARow: 'in a row',
  toWin: 'to win',
  customWinLength: 'Win Length',
  botThinking: 'Bot is thinking...',
  whoStarts: 'Who Starts?',
  playerStarts: 'I Start',
  botStarts: 'Bot Starts',
  winLength: 'Win Length',
  playAs: 'Play As',
  startingPlayer: 'Starting Player',
  player: 'Player',
  blitzTimeoutInfo: 'If time runs out, you lose instantly',
  youWin: 'You Win!',
  youLose: 'You Lost!',
  victory: 'Victory',
  defeat: 'Defeat',
  playAgain: 'Play Again',
  aboutQualityTitle: 'Game Highlights',
  aboutQuality1: 'Solo or local two-player matches.',
  aboutQuality2: 'Difficulty levels from casual to unforgiving.',
  aboutQuality3: '6 game modes.',
  aboutQuality4: 'Supports English, Arabic, and Japanese.',
  aboutQuality5: 'Light and dark themes.',
  aboutCreatorButton: 'About Creator',
  aboutCreatorTapHint: 'Tap for more.',
  aboutCreatorClickHint: 'Click for more.',
};

const ar: Translations = {
  title: 'XO',
  play: 'ابدأ اللعبة',
  settings: 'الإعدادات',
  about: 'حول',
  exit: 'خروج',
  vsplayer: 'ضد لاعب',
  vsbot: 'ضد الروبوت',
  classic: 'كلاسيكي',
  infinite: 'لا نهائي',
  blitz: 'بليتز',
  mega: 'لوحة كبيرة',
  gravity: 'لوحة السقوط',
  reverse: 'عكسي',
  classicDesc: 'لعبة 3x3 التقليدية. ضع ثلاثة في صف للفوز.',
  infiniteDesc: 'مسموح بثلاث علامات فقط. وضع الرابعة يزيل أقدم علامة.',
  blitzDesc: 'وضع سريع بحدود زمنية. العب قبل انتهاء الوقت!',
  megaDesc: 'لوحات أكبر مع شروط فوز قابلة للتخصيص.',
  gravityDesc: 'العلامة تسقط إلى أدنى خانة فارغة في العمود. خطّط لكل إسقاط.',
  reverseDesc: 'تجنب عمل ثلاثة في صف. اجعل خصمك يربح.',
  easy: 'سهل',
  normal: 'عادي',
  hard: 'صعب',
  impossible: 'مستحيل',
  mode: 'وضع اللعب',
  selectMode: 'اختر وضع اللعب',
  difficulty: 'صعوبة الروبوت',
  gameVariant: 'نوع اللعبة',
  startGame: 'ابدأ اللعبة',
  back: 'رجوع',
  restart: 'إعادة',
  winner: 'الفائز',
  draw: 'تعادل',
  xWins: 'X فاز!',
  oWins: 'O فاز!',
  itsADraw: 'لا غالب ولا مغلوب.',
  theme: 'المظهر',
  light: 'فاتح',
  dark: 'داكن',
  auto: 'تلقائي',
  language: 'اللغة',
  english: 'الإنجليزية',
  arabic: 'العربية',
  japanese: 'اليابانية',
  xTurn: 'دور X',
  oTurn: 'دور O',
  gameDescription: 'لعبة إكس أو بأنماط متعددة',
  sound: 'المؤثرات الصوتية',
  soundDesc: 'تفعيل أصوات الواجهة واللعبة',
  on: 'تشغيل',
  off: 'إيقاف',
  quitGameTitle: 'إنهاء اللعبة؟',
  quitGameMessage: 'هل تريد إنهاء هذه اللعبة؟',
  cancel: 'إلغاء',
  confirm: 'تأكيد',
  playAlone: 'تحدَّ نفسك ضد الذكاء الاصطناعي بمستويات متعددة',
  playTogether: 'العب مع صديق على نفس الجهاز',
  multiLanguage: 'يدعم الإنجليزية والعربية واليابانية',
  darkMode: 'سمات فاتحة وداكنة',
  createdBy: 'صنع بواسطة حمزة',
  creatorDesc: `هذا حمزة.

كان عمره واحد وعشرون عامًا عندما صنع XO كجزء من مشروع جامعي،
وكان طالبًا في الجامعة من ليبيا.

في البداية كانت الفكرة بسيطة،
لكن قرر تطويرها بجدية لتطبيق ما تعلّمه وإنتاج شيء منظم ومتوازن.

يحب الأشياء الواضحة والبسيطة،
لذلك حرص على أن تكون اللعبة عادلة،
وأن تعمل كل التفاصيل كما ينبغي.

اللعبة مبنية باستخدام TypeScript وReact،
والكود مكتوب مباشرة بالكامل،
والذكاء الاصطناعي يفكر فعليًا،
يقوم بالصد والتخطيط للأمام،
ويعدل استراتيجيته حسب مستوى الصعوبة.
في مستوى سهل يكون اللعب مريحًا،
أما في مستوى مستحيل فتُستخدم حسابات أعمق واستراتيجيات دقيقة.

يغير الذكاء الاصطناعي سلوكه وفقًا للصعوبة،
من حركات عشوائية ومريحة في السهل
إلى استراتيجيات متقدمة مثل صد الحركات، إنشاء الفُرَق، والتخطيط لعدة خطوات في المستحيل.
تُدار كل مباراة بعناية من حيث حالة اللوحة، الأدوار، وشروط الفوز.

تمت إضافة الأصوات مباشرة في الكود باستخدام Web Audio API،
حيث يتم توليد نغمات وتأثيرات للنقر، الحركة، الفوز، التعادل، وغيرها.
كل الصوتيات مولدة برمجيًا، دون استخدام ملفات خارجية،
ومرتبطة مباشرة بأحداث اللعبة.`,
  modeDetails: 'تفاصيل الوضع',
  comingSoon: 'قريباً',
  seconds: 'ث',
  timePerMove: 'الوقت لكل حركة',
  boardSize: 'حجم اللوحة',
  inARow: 'على التوالي',
  toWin: 'للفوز',
  customWinLength: 'طول الفوز',
  botThinking: 'الروبوت يفكر...',
  whoStarts: 'من يبدأ؟',
  playerStarts: 'أنا أبدأ',
  botStarts: 'الروبوت يبدأ',
  winLength: 'طول الفوز',
  playAs: 'اللعب كـ',
  startingPlayer: 'لاعب البداية',
  player: 'لاعب',
  blitzTimeoutInfo: 'عند انتهاء الوقت تخسر فوراً',
  youWin: 'أنت فزت!',
  youLose: 'أنت خسرت!',
  victory: 'انتصار',
  defeat: 'هزيمة',
  playAgain: 'العب مرة أخرى',
  aboutQualityTitle: 'أبرز مميزات اللعبة',
  aboutQuality1: 'مباريات فردية ضد الذكاء الاصطناعي أو لعب محلي لشخصين.',
  aboutQuality2: 'مستويات صعوبة تبدأ من الهادئ وتنتهي بتحدٍ قاسٍ.',
  aboutQuality3: 'ستة أوضاع لعب.',
  aboutQuality4: 'واجهة كاملة بالعربية والإنجليزية واليابانية.',
  aboutQuality5: 'يتوفر وضعي الفاتح والداكن.',
  aboutCreatorButton: 'عن المطور',
  aboutCreatorTapHint: 'اضغط للمزيد.',
  aboutCreatorClickHint: 'انقر للمزيد.',
};

const ja: Translations = {
  title: 'XO',
  play: 'プレイ',
  settings: '設定',
  about: '概要',
  exit: '退出',
  vsplayer: '対人戦',
  vsbot: '対ボット',
  classic: 'クラシック',
  infinite: 'インフィニット',
  blitz: 'ブリッツ',
  mega: 'メガボード',
  gravity: 'ドロップグリッド',
  reverse: 'リバース',
  classicDesc: '3×3の定番ルール。3つ揃えれば勝ち。',
  infiniteDesc: '置ける印は3つまで。4つ目で最古の印が消える。',
  blitzDesc: '制限時間内に手を打つスピード勝負。',
  megaDesc: '大きな盤面と勝利条件のカスタマイズ。',
  gravityDesc: '印は列の最下段の空きマスに落ちる。落下を読んで戦略を立てよう。',
  reverseDesc: '3つ揃えないように。相手に揃えさせる。',
  easy: '簡単',
  normal: '普通',
  hard: '難しい',
  impossible: '無理',
  mode: 'ゲームモード',
  selectMode: 'モード選択',
  difficulty: 'ボット難易度',
  gameVariant: 'ゲームタイプ',
  startGame: 'ゲーム開始',
  back: '戻る',
  restart: 'リスタート',
  winner: '勝者',
  draw: '引き分け',
  xWins: 'Xの勝ち！',
  oWins: 'Oの勝ち！',
  itsADraw: 'いい勝負でした！',
  theme: 'テーマ',
  light: 'ライト',
  dark: 'ダーク',
  auto: '自動',
  language: '言語',
  english: '英語',
  arabic: 'アラビア語',
  japanese: '日本語',
  xTurn: 'Xの番',
  oTurn: 'Oの番',
  gameDescription: '複数のモードで遊べる三目並べゲーム',
  sound: '効果音',
  soundDesc: 'UIとゲーム音を切り替え',
  on: 'オン',
  off: 'オフ',
  quitGameTitle: '終了しますか？',
  quitGameMessage: 'このゲームを終了してもよろしいですか？',
  cancel: 'キャンセル',
  confirm: '終了',
  playAlone: 'AIと複数難易度で対戦',
  playTogether: '同じ端末で友だちと対戦',
  multiLanguage: '英語・アラビア語・日本語に対応',
  darkMode: 'ライト/ダークテーマ',
  createdBy: '制作：ハムザ',
creatorDesc: `これはハムザ。

XOを大学の課題として作ったとき、彼は21歳でリビア出身の大学生だった。

最初はちょっとした思いつきだったが、学んだことを試すつもりで、本気でバランスの取れたものを作った。

シンプルで分かりやすいものが好きなので、ゲームが公平に感じられるように、細かい部分まで気を配っている。

ゲームはTypeScriptとReactで作られていて、すべてコードに直接実装されている。AIはちゃんと考えて動き、ブロックしたり先を読んだり、難易度に応じて戦略を変える。簡単では気楽に動き、無理では深い計算と精密な戦略を使う。

AIは難易度に合わせて挙動を変え、簡単ではカジュアルで予測しにくい動き、無理ではブロックやフォーク作成、数手先の計画など、高度な戦術を行う。各対局は盤面、ターン、勝利条件をきちんと管理しており、高難度ほど計算も戦略も精密になる。

音はWeb Audio APIでコード内から生成され、タップや移動、勝利、引き分けなどの効果音を作っている。外部ファイルは使わず、すべてゲームの動作に直接結び付けられている。`,
  modeDetails: 'モード詳細',
  comingSoon: '近日公開',
  seconds: '秒',
  timePerMove: '1手の時間',
  boardSize: '盤面サイズ',
  inARow: '連続',
  toWin: 'で勝利',
  customWinLength: '勝利ライン',
  botThinking: 'ボットが考え中…',
  whoStarts: '先手は？',
  playerStarts: '自分が先手',
  botStarts: 'ボットが先手',
  winLength: '勝利ライン',
  playAs: '自分の記号',
  startingPlayer: '先手',
  player: 'プレイヤー',
  blitzTimeoutInfo: '時間切れで即負け',
  youWin: '勝ち！',
  youLose: '負け…',
  victory: '勝利',
  defeat: '敗北',
  playAgain: 'もう一度',
  aboutQualityTitle: 'ゲームの見どころ',
  aboutQuality1: '1人対AIでも、同じ端末での2人対戦でも遊べます。',
  aboutQuality2: '気軽に遊べる難易度から、容赦ない難易度まで対応。',
  aboutQuality3: '6つのゲームモードを収録。',
  aboutQuality4: '日本語・英語・アラビア語に対応。',
  aboutQuality5: 'ライト/ダークテーマを搭載。',
  aboutCreatorButton: '制作者について',
  aboutCreatorTapHint: 'タップして続きを読む',
  aboutCreatorClickHint: 'クリックして続きを読む',
};

const translations: Record<'en' | 'ar' | 'ja', Translations> = {
  en,
  ar,
  ja,
};

interface AppContextType {
  theme: Theme;
  actualThemeMode: ThemeMode;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  sfxEnabled: boolean;
  setSfxEnabled: (enabled: boolean) => void;
  sfxVolume: number;
  setSfxVolume: (value: number) => void;
  playSound: (sound: SoundId) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const readStored = (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const deviceColorScheme: ThemeMode = prefersDark ? 'dark' : 'light';

  const detectLanguage = (): Language => {
    if (typeof navigator === 'undefined') return 'en';
    const lang = (navigator.language || 'en').toLowerCase();
    if (lang.startsWith('ar')) return 'ar';
    if (lang.startsWith('ja')) return 'ja';
    return 'en';
  };

  const deviceLanguage: Language = detectLanguage();
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const stored = readStored('xo-theme-mode');
    return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
  });
  const [language, setLanguage] = useState<Language>(() => {
    const stored = readStored('xo-game-language');
    return stored === 'en' || stored === 'ar' || stored === 'ja' || stored === 'auto' ? stored : 'auto';
  });
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => {
    const stored = readStored('xo-sfx-enabled');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return true;
  });
  const [sfxVolume, setSfxVolume] = useState<number>(() => {
    const stored = readStored('xo-sfx-volume');
    if (!stored) return 100;
    const parsed = Number(stored);
    if (!Number.isFinite(parsed)) return 100;
    return Math.max(0, Math.min(100, Math.round(parsed)));
  });

  useEffect(() => {
    try {
      localStorage.setItem('xo-game-language', language);
    } catch {}
  }, [language]);
  useEffect(() => {
    try {
      localStorage.setItem('xo-theme-mode', themeMode);
    } catch {}
  }, [themeMode]);
  useEffect(() => {
    try {
      localStorage.setItem('xo-sfx-enabled', String(sfxEnabled));
    } catch {}
  }, [sfxEnabled]);
  useEffect(() => {
    try {
      localStorage.setItem('xo-sfx-volume', String(sfxVolume));
    } catch {}
  }, [sfxVolume]);

  const actualThemeMode = themeMode === 'auto' ? deviceColorScheme : themeMode;
  const theme = actualThemeMode === 'light' ? lightTheme : darkTheme;
  const actualLanguage = (language === 'auto' ? deviceLanguage : language) as keyof typeof translations;
  const dir: 'ltr' | 'rtl' = actualLanguage === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light-mode', 'dark-mode');
    html.classList.add(actualThemeMode === 'dark' ? 'dark-mode' : 'light-mode');
    html.setAttribute('dir', dir);
  }, [actualThemeMode, dir]);

  const t = useCallback((key: string): string => {
    return translations[actualLanguage]?.[key] ?? translations.en?.[key] ?? key;
  }, [actualLanguage]);

  const sfxGain = useMemo(() => {
    const maxVolume = 16;
    const clamped = Math.max(0, Math.min(100, sfxVolume));
    const normalized = clamped / 100;
    const curve = Math.pow(normalized, 1.8);
    return normalized <= 0 ? 0 : curve * maxVolume;
  }, [sfxVolume]);

  const playSound = useCallback((sound: SoundId) => {
    if (!sfxEnabled) return;
    playSoundRaw(sound, sfxGain);
  }, [sfxEnabled, sfxGain]);

  const contextValue = useMemo<AppContextType>(() => ({
    theme,
    actualThemeMode,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
    dir,
    sfxEnabled,
    setSfxEnabled,
    sfxVolume,
    setSfxVolume,
    playSound,
  }), [
    theme,
    actualThemeMode,
    themeMode,
    language,
    t,
    dir,
    sfxEnabled,
    sfxVolume,
    playSound,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
