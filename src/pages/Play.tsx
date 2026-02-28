
// src/pages/Play.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';
import {
  IoArrowBack,
  IoGameController,
  IoGrid,
  IoInfinite,
  IoTimer,
  IoExpand,
  IoArrowDownCircle,
  IoReturnDownBack,
  IoPeople,
  IoHardwareChip,
  IoInformationCircle,
  IoPlay,
} from 'react-icons/io5';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import ModeCard from '../components/ModeCard';
import { useApp } from '../context';

type Variant = 'classic' | 'infinite' | 'blitz' | 'mega' | 'gravity' | 'reverse';
type GameMode = 'vsplayer' | 'vsbot';
type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';
type PlayerSymbol = 'X' | 'O';
interface BlitzSettings {
  timePerMove: number;
}
interface MegaBoardSettings {
  boardSize: 4 | 5 | 6 | 7 | 8 | 9;
  winLength: number;
}

let savedSettings = {
  symbol: 'X' as PlayerSymbol,
  difficulty: 'easy' as Difficulty,
  botStarts: false,
  blitz: { timePerMove: 10 },
  mega: { boardSize: 5 as 4 | 5 | 6 | 7 | 8 | 9, winLength: 4 },
};

export default function Play() {
  const navigate = useNavigate();
  const { theme, t, dir, playSound } = useApp();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const [selectedSymbol, setSelectedSymbol] = useState<PlayerSymbol>('X');
  const [blitzSettings, setBlitzSettings] = useState<BlitzSettings>(savedSettings.blitz);
  const [megaBoardSettings, setMegaBoardSettings] = useState<MegaBoardSettings>(savedSettings.mega);
  const [botStarts, setBotStarts] = useState(false);
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 900 : true
  );
  const selectionScrollRef = useRef<HTMLDivElement | null>(null);
  const settingsScrollRef = useRef<HTMLDivElement | null>(null);
  const returningRef = useRef(false);
  const actionLockUntilRef = useRef(0);

  const gameModes: {
    id: Variant;
    title: string;
    description: string;
    icon: IconType;
    isComingSoon: boolean;
  }[] = useMemo(
    () => [
      {
        id: 'classic',
        title: t('classic'),
        description: t('classicDesc'),
        icon: IoGrid,
        isComingSoon: false,
      },
      {
        id: 'infinite',
        title: t('infinite'),
        description: t('infiniteDesc'),
        icon: IoInfinite,
        isComingSoon: false,
      },
      {
        id: 'blitz',
        title: t('blitz'),
        description: t('blitzDesc'),
        icon: IoTimer,
        isComingSoon: false,
      },
      {
        id: 'mega',
        title: t('mega'),
        description: t('megaDesc'),
        icon: IoExpand,
        isComingSoon: false,
      },
      {
        id: 'gravity',
        title: t('gravity'),
        description: t('gravityDesc'),
        icon: IoArrowDownCircle,
        isComingSoon: false,
      },
      {
        id: 'reverse',
        title: t('reverse'),
        description: t('reverseDesc'),
        icon: IoReturnDownBack,
        isComingSoon: false,
      },
    ],
    [t]
  );

  const activeVariant = selectedVariant
    ? gameModes.find((mode) => mode.id === selectedVariant) || null
    : null;
  const selectModeText = t('selectMode');
  const isCjkTitle = /[\u3040-\u30ff\u3400-\u9fff]/.test(selectModeText);

  useEffect(() => {
    if (hasIntroPlayed) {
      setAnimationComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      setHasIntroPlayed(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [hasIntroPlayed]);

  useEffect(() => {
    if (!selectedVariant) {
      setShowSettings(false);
      return;
    }
    setSelectedMode(null);
    setSelectedSymbol(savedSettings.symbol);
    setSelectedDifficulty(savedSettings.difficulty);
    setBlitzSettings(savedSettings.blitz);
    setMegaBoardSettings(savedSettings.mega);
    setBotStarts(savedSettings.botStarts);
    const timer = setTimeout(() => setShowSettings(true), 400);
    return () => clearTimeout(timer);
  }, [selectedVariant]);

  useEffect(() => {
    if (!showSettings) return;
    requestAnimationFrame(() => {
      if (settingsScrollRef.current) {
        settingsScrollRef.current.scrollTop = lastScrollTop;
      }
    });
  }, [showSettings, lastScrollTop]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsNarrow(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMegaMode = selectedVariant === 'mega';
  const isBlitzMode = selectedVariant === 'blitz';
  const isModeChosen = selectedMode !== null;

  const getRecommendedWinLength = (size: number) => (size <= 6 ? 4 : 5);
  const getWinLengthOptions = (size: number) => {
    const options: number[] = [];
    const minLength = size >= 7 ? 5 : 4;
    let maxLength = 6;
    if (size >= 8) maxLength = 8;
    else if (size >= 7) maxLength = 7;
    const upper = Math.min(size, maxLength);
    for (let i = minLength; i <= upper; i++) options.push(i);
    return options;
  };

  const handleBoardSizeChange = (size: 4 | 5 | 6 | 7 | 8 | 9) => {
    const recommended = getRecommendedWinLength(size);
    setMegaBoardSettings({ boardSize: size, winLength: recommended });
  };

  const isUiLocked = () =>
    returningRef.current || isReturning || Date.now() < actionLockUntilRef.current;
  const lockUi = (ms: number) => {
    actionLockUntilRef.current = Date.now() + ms;
  };

  const tap = () => {
    if (isUiLocked()) return;
    playSound('tap');
  };

  const handleModeSelect = (modeId: Variant) => {
    if (!animationComplete || selectedVariant || isUiLocked()) return;
    tap();
    const scrollTop = selectionScrollRef.current?.scrollTop ?? 0;
    setLastScrollTop(scrollTop);
    setSelectedVariant(modeId);
  };

  const handleBack = () => {
    if (isUiLocked()) return;
    if (selectedVariant) {
      playSound('tap');
      lockUi(420);
      returningRef.current = true;
      setShowSettings(false);
      setIsReturning(true);
      setSelectedVariant(null);
      window.setTimeout(() => {
        setIsReturning(false);
        returningRef.current = false;
      }, 320);
      return;
    }
    tap();
    lockUi(300);
    navigate(-1);
  };

  const handleStartGame = () => {
    if (!isModeChosen || !selectedVariant || isUiLocked()) return;
    playSound('start');
    lockUi(350);
    savedSettings = {
      symbol: selectedSymbol,
      difficulty: selectedDifficulty,
      botStarts,
      blitz: blitzSettings,
      mega: megaBoardSettings,
    };

    const params = new URLSearchParams({
      mode: selectedMode as string,
      difficulty: selectedDifficulty,
      variant: selectedVariant,
      playerSymbol: selectedSymbol,
      botStarts: botStarts.toString(),
    });
    if (isBlitzMode) {
      params.append('timePerMove', blitzSettings.timePerMove.toString());
    }
    if (isMegaMode) {
      params.append('boardSize', megaBoardSettings.boardSize.toString());
      params.append('winLength', megaBoardSettings.winLength.toString());
    }
    navigate(`/game?${params.toString()}`);
  };

  const summaryItems = useMemo(() => ([
    { label: t('mode'), value: selectedMode ? t(selectedMode) : '-' },
    ...(selectedMode === 'vsbot'
      ? [
          { label: t('difficulty'), value: t(selectedDifficulty) },
          { label: t('whoStarts'), value: botStarts ? t('botStarts') : t('playerStarts') },
        ]
      : []),
    ...(isBlitzMode
      ? [{ label: t('timePerMove'), value: `${blitzSettings.timePerMove}${t('seconds')}` }]
      : []),
    ...(isMegaMode
      ? [
          { label: t('boardSize'), value: `${megaBoardSettings.boardSize}x${megaBoardSettings.boardSize}` },
          { label: t('winLength'), value: `${megaBoardSettings.winLength}` },
        ]
      : []),
    { label: t('playAs'), value: selectedSymbol },
  ]), [
    t,
    selectedMode,
    selectedDifficulty,
    botStarts,
    isBlitzMode,
    blitzSettings.timePerMove,
    isMegaMode,
    megaBoardSettings.boardSize,
    megaBoardSettings.winLength,
    selectedSymbol,
  ]);

  const selectionHidden = Boolean(selectedVariant || isReturning);
  const selectionFadeDelay = selectionHidden ? 0.05 : 0;
  const styles = useMemo(() => getStyles(theme), [theme]);
  const winLengthOptions = useMemo(
    () => getWinLengthOptions(megaBoardSettings.boardSize),
    [megaBoardSettings.boardSize]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ ...styles.container, direction: dir }}
    >
      <style>{`
        .play-settings-scroll::-webkit-scrollbar { width: 0; height: 0; }
        .play-settings-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .play-selection-scroll::-webkit-scrollbar { width: 0; height: 0; }
        .play-selection-scroll { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      <LayoutGroup>
        <AnimatePresence
          initial={!hasIntroPlayed}
          mode="sync"
          onExitComplete={() => {
            if (!isReturning) return;
            requestAnimationFrame(() => {
              if (selectionScrollRef.current) {
                selectionScrollRef.current.scrollTop = lastScrollTop;
              }
            });
          }}
        >
          <motion.div
            key="select"
            initial={hasIntroPlayed ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: selectionHidden ? 0 : 1, scale: selectionHidden ? 0.99 : 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: selectionFadeDelay }}
            style={{
              ...styles.content,
              pointerEvents: selectedVariant || isReturning ? 'none' : 'auto',
            }}
            ref={selectionScrollRef}
            className="play-selection-scroll"
          >
              <div style={styles.header}>
                <motion.div
                  initial={hasIntroPlayed ? false : { scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 12, delay: hasIntroPlayed ? 0 : 0.1 }}
                  style={styles.iconContainer}
                >
                  {React.createElement(IoGameController as any, { size: 48, color: theme.primary })}
                </motion.div>
                <motion.h1
                  initial={hasIntroPlayed ? false : { opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: hasIntroPlayed ? 0 : 0.2, duration: 0.4 }}
                  style={{
                    ...styles.title,
                    ...(isCjkTitle
                      ? {
                          fontSize: 'clamp(34px, 9.2vw, 44px)',
                          letterSpacing: 0,
                          whiteSpace: 'nowrap',
                          lineHeight: 1.12,
                        }
                      : null),
                  }}
                >
                  {selectModeText}
                </motion.h1>
                <motion.p
                  initial={hasIntroPlayed ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: hasIntroPlayed ? 0 : 0.3, duration: 0.4 }}
                  style={styles.subtitle}
                >
                  {t('gameVariant')}
                </motion.p>
              </div>

              <div style={styles.grid}>
                {gameModes.map((mode, index) => (
                  <motion.div
                    key={mode.id}
                    initial={hasIntroPlayed ? false : { opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: hasIntroPlayed ? 0 : 0.35 + index * 0.05,
                      duration: 0.4,
                      type: 'spring',
                      stiffness: 120,
                      damping: 14,
                    }}
                    style={{ opacity: animationComplete ? 1 : 0.6 }}
                  >
                    <ModeCard
                      title={mode.title}
                      description={mode.description}
                      icon={mode.icon}
                      isSelected={false}
                      isComingSoon={mode.isComingSoon}
                      layoutId={`mode-card-${mode.id}`}
                      onPress={() => handleModeSelect(mode.id)}
                      theme={theme}
                      t={t}
                      isRTL={dir === 'rtl'}
                      styleOverride={
                        selectedVariant === mode.id
                          ? { opacity: 0, pointerEvents: 'none' }
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={hasIntroPlayed ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: hasIntroPlayed ? 0 : 0.7, duration: 0.4 }}
                style={styles.backButtonContainer}
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0 }}
                  style={styles.backButton as any}
                  onClick={handleBack}
                >
                  {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
                  <span>{t('back')}</span>
                </motion.button>
              </motion.div>
            </motion.div>
          {selectedVariant && activeVariant && (
            <motion.div
              key="settings"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="play-settings-scroll"
              style={{
                ...styles.settingsContent,
                pointerEvents: isReturning ? 'none' : 'auto',
              }}
              ref={settingsScrollRef}
            >
              {!isNarrow && (
                <div style={styles.topBar}>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.05 }}
                    style={styles.backButton as any}
                    onClick={handleBack}
                  >
                    {React.createElement(IoArrowBack as any, { size: 18, color: '#FFFFFF' })}
                    <span>{t('back')}</span>
                  </motion.button>
                </div>
              )}

              <motion.div
                layout
                layoutId={`mode-card-${activeVariant.id}`}
                transition={{ type: 'spring', stiffness: 190, damping: 22, mass: 0.9 }}
                style={styles.heroCard as any}
              >
                <div style={styles.heroIcon}>
                  {React.createElement(activeVariant.icon as any, { size: 34, color: theme.primary })}
                </div>
                <div style={styles.heroTitle}>{activeVariant.title}</div>
                <div style={styles.heroDesc}>{activeVariant.description}</div>
              </motion.div>

              <AnimatePresence initial={false}>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    style={styles.settingsGrid(isNarrow) as any}
                  >
                    <div style={styles.settingsMain}>
                      <div style={styles.sectionCard}>
                        <div style={styles.sectionHeader}>
                          <div style={styles.sectionStep}>1</div>
                          <div style={styles.sectionTitle}>{t('mode')}</div>
                        </div>
                        <div style={styles.optionGrid(isNarrow)}>
                          <button
                            style={
                              selectedMode === 'vsplayer'
                                ? styles.optionButtonActive
                                : styles.optionButton
                            }
                            onClick={() => {
                              tap();
                              setSelectedMode('vsplayer');
                            }}
                          >
                            {React.createElement(IoPeople as any, { size: 18 })}
                            <span>{t('vsplayer')}</span>
                          </button>
                          <button
                            style={
                              selectedMode === 'vsbot'
                                ? styles.optionButtonActive
                                : styles.optionButton
                            }
                            onClick={() => {
                              tap();
                              setSelectedMode('vsbot');
                            }}
                          >
                            {React.createElement(IoHardwareChip as any, { size: 18 })}
                            <span>{t('vsbot')}</span>
                          </button>
                        </div>
                        {selectedMode && (
                          <div style={styles.infoBox}>
                            {React.createElement(IoInformationCircle as any, { size: 16, color: theme.primary })}
                            <span>{selectedMode === 'vsplayer' ? t('playTogether') : t('playAlone')}</span>
                          </div>
                        )}
                      </div>

                      {isModeChosen && (
                        <div style={styles.sectionCard}>
                          <div style={styles.sectionHeader}>
                            <div style={styles.sectionStep}>2</div>
                            <div style={styles.sectionTitle}>
                              {selectedMode === 'vsbot' ? t('playAs') : t('startingPlayer')}
                            </div>
                          </div>
                          <div style={styles.optionGrid(isNarrow)}>
                            <button
                              style={
                                selectedSymbol === 'X'
                                  ? styles.symbolButtonActive(theme.xColor)
                                  : styles.symbolButton
                              }
                              onClick={() => {
                                tap();
                                setSelectedSymbol('X');
                              }}
                            >
                              X
                            </button>
                            <button
                              style={
                                selectedSymbol === 'O'
                                  ? styles.symbolButtonActive(theme.oColor)
                                  : styles.symbolButton
                              }
                              onClick={() => {
                                tap();
                                setSelectedSymbol('O');
                              }}
                            >
                              O
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedMode === 'vsbot' && (
                        <div style={styles.sectionCard}>
                          <div style={styles.sectionHeader}>
                            <div style={styles.sectionStep}>3</div>
                            <div style={styles.sectionTitle}>{t('whoStarts')}</div>
                          </div>
                          <div style={styles.optionGrid(isNarrow)}>
                            <button
                              style={!botStarts ? styles.optionButtonActive : styles.optionButton}
                              onClick={() => {
                                tap();
                                setBotStarts(false);
                              }}
                            >
                              {t('playerStarts')}
                            </button>
                            <button
                              style={botStarts ? styles.optionButtonActive : styles.optionButton}
                              onClick={() => {
                                tap();
                                setBotStarts(true);
                              }}
                            >
                              {t('botStarts')}
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedMode === 'vsbot' && (
                        <div style={styles.sectionCard}>
                          <div style={styles.sectionHeader}>
                            <div style={styles.sectionStep}>4</div>
                            <div style={styles.sectionTitle}>{t('difficulty')}</div>
                          </div>
                          <div style={styles.optionGrid(isNarrow)}>
                            {(['easy', 'normal', 'hard', 'impossible'] as Difficulty[]).map((diff) => (
                              <button
                                key={diff}
                                style={
                                  selectedDifficulty === diff
                                    ? styles.optionButtonActive
                                    : styles.optionButton
                                }
                                onClick={() => {
                                  tap();
                                  setSelectedDifficulty(diff);
                                }}
                              >
                                {t(diff)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isModeChosen && isBlitzMode && (
                        <div style={styles.sectionCard}>
                          <div style={styles.sectionHeader}>
                            <div style={styles.sectionStep}>5</div>
                            <div style={styles.sectionTitle}>{t('timePerMove')}</div>
                          </div>
                          <div style={styles.optionGrid(isNarrow)}>
                            {[5, 10, 15, 20, 30].map((time) => (
                              <button
                                key={time}
                                style={
                                  blitzSettings.timePerMove === time
                                    ? styles.optionButtonActive
                                    : styles.optionButton
                                }
                                onClick={() => {
                                  tap();
                                  setBlitzSettings({ ...blitzSettings, timePerMove: time });
                                }}
                              >
                                {time}
                                {t('seconds')}
                              </button>
                            ))}
                          </div>
                          <div style={styles.infoBox}>
                            {React.createElement(IoInformationCircle as any, { size: 16, color: theme.primary })}
                            <span>{t('blitzTimeoutInfo')}</span>
                          </div>
                        </div>
                      )}

                      {isModeChosen && isMegaMode && (
                        <>
                          <div style={styles.sectionCard}>
                            <div style={styles.sectionHeader}>
                              <div style={styles.sectionStep}>5</div>
                              <div style={styles.sectionTitle}>{t('boardSize')}</div>
                            </div>
                            <div style={styles.optionGrid(isNarrow)}>
                              {([4, 5, 6, 7, 8, 9] as const).map((size) => (
                                <button
                                  key={size}
                                  style={
                                    megaBoardSettings.boardSize === size
                                      ? styles.optionButtonActive
                                      : styles.optionButton
                                  }
                                  onClick={() => {
                                    tap();
                                    handleBoardSizeChange(size);
                                  }}
                                >
                                  {size}x{size}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div style={styles.sectionCard}>
                            <div style={styles.sectionHeader}>
                              <div style={styles.sectionStep}>6</div>
                              <div style={styles.sectionTitle}>{t('customWinLength')}</div>
                            </div>
                            <div style={styles.optionGrid(isNarrow)}>
                              {winLengthOptions.map((length) => (
                                <button
                                  key={length}
                                  style={
                                    megaBoardSettings.winLength === length
                                      ? styles.optionButtonActive
                                      : styles.optionButton
                                  }
                                  onClick={() => {
                                    tap();
                                    setMegaBoardSettings({ ...megaBoardSettings, winLength: length });
                                  }}
                                >
                                  {length}
                                </button>
                              ))}
                            </div>
                            <div style={styles.miniNote}>
                              {megaBoardSettings.winLength} {t('inARow')} {t('toWin')}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div style={styles.settingsSide}>
                      <div style={styles.summaryCard}>
                        <div style={styles.summaryHeader}>
                          <span style={styles.summaryTitle}>{t('modeDetails')}</span>
                        </div>
                        <div style={styles.summaryBody}>
                          {summaryItems.map((item) => (
                            <div key={item.label} style={styles.summaryRow}>
                              <span style={styles.summaryLabel}>{item.label}</span>
                              <span style={styles.summaryValue}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        style={{
                          ...styles.startButton,
                          opacity: isModeChosen ? 1 : 0.5,
                          cursor: isModeChosen ? 'pointer' : 'default',
                        }}
                        onClick={handleStartGame}
                        disabled={!isModeChosen}
                      >
                        {React.createElement(IoPlay as any, { size: 18 })}
                        {t('startGame')}
                      </button>
                      {isNarrow && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          transition={{ duration: 0.05 }}
                          style={{ ...styles.backButton, width: '100%' } as any}
                          onClick={handleBack}
                        >
                          {React.createElement(IoArrowBack as any, { size: 18, color: '#FFFFFF' })}
                          <span>{t('back')}</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
}
const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    position: 'relative' as const,
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    position: 'relative' as const,
    zIndex: 1,
    padding: '40px 20px',
    maxWidth: 1200,
    margin: '0 auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
    maxHeight: '100vh',
    boxSizing: 'border-box' as const,
  },
  settingsContent: {
    position: 'absolute' as const,
    inset: 0,
    zIndex: 3,
    padding: '28px 18px 48px',
    width: '100%',
    maxWidth: 1200,
    margin: '0 auto',
    minHeight: '100vh',
    maxHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 20,
    boxSizing: 'border-box' as const,
    overflowY: 'auto' as const,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'center',
    filter: `drop-shadow(0 4px 12px ${theme.primary}30)`,
  },
  title: {
    fontSize: 48,
    fontWeight: 900,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    marginBottom: 8,
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    margin: 0,
    fontWeight: 500,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    marginBottom: 32,
    flex: 1,
  },
  backButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 20,
  },
  backButton: {
    padding: '14px 28px',
    borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    border: 'none',
    cursor: 'pointer',
    boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
    transition: 'all 0.3s',
    minWidth: 180,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none' as const,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
  },
  heroCard: {
    borderRadius: 26,
    padding: '28px 20px',
    border: `2px solid ${theme.cardBorder}`,
    background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.surfaceVariant || theme.surface} 100%)`,
    boxShadow: `0 20px 40px ${theme.cardShadow}, 0 2px 8px ${theme.shadow}`,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    gap: 10,
    transformOrigin: 'center top',
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    background: `${theme.primary}16`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 900,
    color: theme.text,
  },
  heroDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: '18px',
    maxWidth: 700,
  },
  settingsGrid: (isNarrow: boolean) => ({
    display: 'grid',
    gridTemplateColumns: isNarrow ? '1fr' : '1.5fr 0.7fr',
    gap: 18,
    alignItems: 'start',
  }),
  settingsMain: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  settingsSide: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    border: `2px solid ${theme.cardBorder}`,
    background: theme.surface,
    boxShadow: `0 12px 28px ${theme.cardShadow}, 0 2px 6px ${theme.shadow}`,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: theme.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: theme.text,
  },
  optionGrid: (isNarrow: boolean) => ({
    display: 'grid',
    gridTemplateColumns: isNarrow ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  }),
  optionButton: {
    padding: '14px 12px',
    borderRadius: 14,
    border: `2px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    fontWeight: 700,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
  },
  optionButtonActive: {
    padding: '14px 12px',
    borderRadius: 14,
    border: `2px solid ${theme.primary}`,
    background: `${theme.primary}15`,
    color: theme.primary,
    fontWeight: 800,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    boxShadow: `0 8px 16px ${theme.primary}25`,
  },
  symbolButton: {
    padding: '14px 12px',
    borderRadius: 14,
    border: `2px solid ${theme.border}`,
    background: theme.surface,
    color: theme.text,
    fontWeight: 800,
    fontSize: 16,
    cursor: 'pointer',
  },
  symbolButtonActive: (color: string) => ({
    padding: '14px 12px',
    borderRadius: 14,
    border: `2px solid ${color}`,
    background: `${color}18`,
    color,
    fontWeight: 900,
    fontSize: 16,
    cursor: 'pointer',
    boxShadow: `0 8px 16px ${color}25`,
  }),
  infoBox: {
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${theme.primary}25`,
    background: `${theme.primary}10`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: theme.text,
  },
  miniNote: {
    marginTop: 10,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center' as const,
  },
  summaryCard: {
    background: theme.surface,
    borderRadius: 20,
    padding: 16,
    border: `2px solid ${theme.cardBorder}`,
    boxShadow: `0 12px 28px ${theme.cardShadow}, 0 2px 6px ${theme.shadow}`,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  summaryHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: theme.text,
  },
  summaryBadgeRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  summaryPill: {
    borderRadius: 999,
    padding: '6px 10px',
    background: `${theme.primary}12`,
    color: theme.primary,
    fontWeight: 700,
    fontSize: 11,
  },
  summaryBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
  },
  summaryLabel: {
    color: theme.textSecondary,
    fontWeight: 600,
  },
  summaryValue: {
    color: theme.text,
    fontWeight: 700,
  },
  startButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    color: '#FFF',
    fontWeight: 700,
    fontSize: 16,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'all 0.2s',
  },
});
