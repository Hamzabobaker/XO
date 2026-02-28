// src/pages/About.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  IoArrowBack,
  IoPersonCircle,
  IoPeople,
  IoHardwareChip,
  IoLanguage,
  IoGameController,
  IoColorPalette,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';

const ABOUT_INTRO_LOCK_MS = 600;
const CREATOR_CLOSE_HANDOFF_MS = 16;
const CREATOR_CARD_REOPEN_LOCK_MS = 40;
const CREATOR_BACK_LOCK_MS = 600;

export default function About() {
  const { theme, t, dir, playSound } = useApp();
  const navigate = useNavigate();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isDesktopPointer, setIsDesktopPointer] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [backIntroDone, setBackIntroDone] = useState(false);
  const [isClosingCreator, setIsClosingCreator] = useState(false);
  const [isBackPostCloseLock, setIsBackPostCloseLock] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const closeUnlockTimerRef = useRef<number | null>(null);
  const backUnlockTimerRef = useRef<number | null>(null);
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 720 : true
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const syncPointerMode = () => setIsDesktopPointer(mediaQuery.matches);
    syncPointerMode();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPointerMode);
      return () => mediaQuery.removeEventListener('change', syncPointerMode);
    }
    mediaQuery.addListener(syncPointerMode);
    return () => mediaQuery.removeListener(syncPointerMode);
  }, []);

  useEffect(() => {
    if (!creatorOpen) {
      setShowCurtain(false);
      return;
    }
    const timer = window.setTimeout(() => setShowCurtain(true), 260);
    return () => window.clearTimeout(timer);
  }, [creatorOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsNarrow(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    if (closeUnlockTimerRef.current !== null) {
      window.clearTimeout(closeUnlockTimerRef.current);
    }
    if (backUnlockTimerRef.current !== null) {
      window.clearTimeout(backUnlockTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const introTimer = window.setTimeout(() => setBackIntroDone(true), ABOUT_INTRO_LOCK_MS);
    return () => window.clearTimeout(introTimer);
  }, []);

  const creatorText = t('creatorDesc')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const creatorLines = creatorText.split('\n');
  const firstContentIndex = creatorLines.findIndex((line) => line.trim().length > 0);
  const creatorLead = firstContentIndex >= 0 ? creatorLines[firstContentIndex].trim() : '';
  const creatorBody = firstContentIndex >= 0
    ? creatorLines.slice(firstContentIndex + 1).join('\n').trim()
    : '';
  const creatorFontSize = creatorText.length > 1100
    ? (isNarrow ? 12.6 : 13.4)
    : creatorText.length > 800
      ? (isNarrow ? 13.2 : 14)
      : isNarrow ? 13.8 : 14.6;
  const creatorLineHeight = isNarrow ? 1.56 : 1.62;
  const qualityItems = [
    { icon: IoPeople, text: t('aboutQuality1') },
    { icon: IoHardwareChip, text: t('aboutQuality2') },
    { icon: IoGameController, text: t('aboutQuality3') },
    { icon: IoLanguage, text: t('aboutQuality4') },
    { icon: IoColorPalette, text: t('aboutQuality5') },
  ];
  const isIntroLocked = !backIntroDone;
  const isBackLocked = isIntroLocked || isClosingCreator || isBackPostCloseLock;
  const isCreatorCardLocked = isIntroLocked || isClosingCreator;
  const creatorHintText = isDesktopPointer ? t('aboutCreatorClickHint') : t('aboutCreatorTapHint');

  const closeCreator = () => {
    if (isClosingCreator) return;
    setIsClosingCreator(true);
    setIsBackPostCloseLock(true);
    setShowCurtain(false);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    if (closeUnlockTimerRef.current !== null) {
      window.clearTimeout(closeUnlockTimerRef.current);
    }
    if (backUnlockTimerRef.current !== null) {
      window.clearTimeout(backUnlockTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setCreatorOpen(false);
      closeTimerRef.current = null;
    }, CREATOR_CLOSE_HANDOFF_MS);
    closeUnlockTimerRef.current = window.setTimeout(() => {
      setIsClosingCreator(false);
      closeUnlockTimerRef.current = null;
    }, CREATOR_CARD_REOPEN_LOCK_MS);
    backUnlockTimerRef.current = window.setTimeout(() => {
      setIsBackPostCloseLock(false);
      backUnlockTimerRef.current = null;
    }, CREATOR_BACK_LOCK_MS);
  };

  return (
    <div
      style={{
        ...styles.container,
        direction: dir,
        overflowY: creatorOpen ? 'hidden' : 'auto',
      }}
    >
      <LayoutGroup>
        <style>
          {`
            .about-curtain-scroll {
              scrollbar-width: thin;
              scrollbar-color: rgba(120, 170, 255, 0.45) transparent;
            }
            .about-curtain-scroll::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .about-curtain-scroll::-webkit-scrollbar-button {
              display: none;
              width: 0;
              height: 0;
            }
            .about-curtain-scroll::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 999px;
              margin-block: 10px;
            }
            .about-curtain-scroll::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, rgba(120, 170, 255, 0.58), rgba(164, 141, 255, 0.42));
              border-radius: 999px;
              border: 1px solid transparent;
              background-clip: padding-box;
              min-height: 30px;
            }
            .about-curtain-scroll::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, rgba(120, 170, 255, 0.7), rgba(164, 141, 255, 0.55));
            }
          `}
        </style>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          style={styles.content}
        >
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.38 }}
            style={styles.title}
          >
            XO
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{
              opacity: creatorOpen ? 0 : 1,
              scale: 1,
              y: 0,
            }}
            transition={{ duration: creatorOpen ? 0.08 : 0.24 }}
            style={{
              ...styles.mainStack,
              pointerEvents: creatorOpen || isCreatorCardLocked ? 'none' : 'auto',
            }}
          >
            <motion.button
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{
                opacity: creatorOpen ? 0 : (isCreatorCardLocked ? 0.72 : 1),
                y: 0,
                scale: 1,
              }}
              transition={creatorOpen
                ? { duration: 0.08, ease: 'easeOut' }
                : { delay: 0.18, type: 'spring', stiffness: 130, damping: 16 }}
              layoutId="about-creator-card"
              whileHover={isCreatorCardLocked ? undefined : { scale: 1.01, y: -1 }}
              whileTap={isCreatorCardLocked ? undefined : { scale: 0.99 }}
              style={{
                ...styles.creatorPreviewCard,
                cursor: isCreatorCardLocked ? 'default' : 'pointer',
              }}
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (isCreatorCardLocked) return;
                playSound('tap');
                if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
                if (closeTimerRef.current !== null) {
                  window.clearTimeout(closeTimerRef.current);
                  closeTimerRef.current = null;
                }
                setCreatorOpen(true);
              }}
            >
              <div style={styles.creatorPreviewHead}>
                {React.createElement(IoPersonCircle as any, { size: 44, color: theme.primary })}
                <div style={styles.creatorPreviewTextWrap}>
                  <div style={styles.creatorPreviewTitle}>{t('aboutCreatorButton')}</div>
                  <div style={styles.creatorPreviewName}>{t('createdBy')}</div>
                </div>
              </div>
              <div style={styles.creatorPreviewDesc}>{creatorHintText}</div>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.26, type: 'spring', stiffness: 130, damping: 16 }}
              style={styles.offerCard}
            >
              <h2 style={styles.offerTitle}>{t('aboutQualityTitle')}</h2>
              <div style={styles.qualityList}>
                {qualityItems.map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34 + index * 0.05, duration: 0.26 }}
                    style={styles.qualityRow}
                  >
                    <div style={styles.qualityIcon}>
                      {React.createElement(item.icon as any, { size: 24, color: theme.primary })}
                    </div>
                    <span style={styles.qualityText}>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {creatorOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={styles.creatorBackdrop}
                />
                <div
                  style={{
                    ...styles.creatorOverlay,
                    // Prevent an invisible overlay from eating clicks during close handoff.
                    pointerEvents: creatorOpen && showCurtain && !isClosingCreator ? 'auto' : 'none',
                  }}
                >
                  <motion.div
                    layoutId="about-creator-card"
                    transition={{ type: 'spring', stiffness: 210, damping: 25 }}
                    style={styles.creatorHeroCard}
                  >
                    <div style={styles.creatorPreviewHead}>
                      {React.createElement(IoPersonCircle as any, { size: 44, color: theme.primary })}
                      <div style={styles.creatorPreviewTextWrap}>
                        <div style={styles.creatorPreviewTitle}>{t('aboutCreatorButton')}</div>
                        <div style={styles.creatorPreviewName}>{t('createdBy')}</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={showCurtain ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={showCurtain
                      ? { duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }
                      : { duration: 0.16, ease: [0.4, 0, 1, 1] }}
                    style={styles.curtainPanel}
                  >
                    <div className="about-curtain-scroll" style={styles.curtainScroller}>
                      <div style={styles.creatorTextStack}>
                        {creatorLead && (
                          <p
                            style={{
                              ...styles.creatorLeadLine,
                              fontSize: creatorFontSize + 1.1,
                              lineHeight: creatorLineHeight,
                            }}
                          >
                            {creatorLead}
                          </p>
                        )}
                        {creatorBody && (
                          <p
                            style={{
                              ...styles.creatorBody,
                              fontSize: creatorFontSize,
                              lineHeight: creatorLineHeight,
                            }}
                          >
                            {creatorBody}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>

          <AnimatePresence mode="sync">
            {creatorOpen ? (
              <motion.div
                key="about-back-overlay"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                style={styles.backButtonDockOverlay}
              >
                <motion.button
                  whileHover={isBackLocked ? undefined : { scale: 1.02 }}
                  whileTap={isBackLocked ? undefined : { scale: 0.97 }}
                  style={{
                    ...styles.backButton,
                    opacity: isBackLocked ? 0.62 : 1,
                    cursor: isBackLocked ? 'default' : 'pointer',
                    pointerEvents: isBackLocked ? 'none' : 'auto',
                  }}
                  disabled={isBackLocked}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (isBackLocked) return;
                    playSound('tap');
                    closeCreator();
                  }}
                >
                  {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
                  <span>{t('back')}</span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="about-back-inline"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ delay: backIntroDone ? 0 : 0.34, duration: 0.2, ease: 'easeOut' }}
                style={styles.backButtonDockInline}
              >
                <motion.button
                  whileHover={isBackLocked ? undefined : { scale: 1.02 }}
                  whileTap={isBackLocked ? undefined : { scale: 0.97 }}
                  style={{
                    ...styles.backButton,
                    opacity: isBackLocked ? 0.62 : 1,
                    cursor: isBackLocked ? 'default' : 'pointer',
                    pointerEvents: isBackLocked ? 'none' : 'auto',
                  }}
                  disabled={isBackLocked}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (isBackLocked) return;
                    playSound('tap');
                    navigate(-1);
                  }}
                >
                  {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
                  <span>{t('back')}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px 12px 78px',
    overflowY: 'auto' as const,
  },
  content: {
    width: '100%',
    maxWidth: 900,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 10,
    position: 'relative' as const,
    marginTop: 10,
  },
  title: {
    fontSize: 46,
    fontWeight: 900,
    margin: 0,
    lineHeight: 1,
    letterSpacing: '-0.8px',
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: 10,
  },
  mainStack: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
    paddingBottom: 0,
  },
  offerCard: {
    width: '100%',
    borderRadius: 24,
    border: `2px solid ${theme.cardBorder}`,
    background: `linear-gradient(160deg, ${theme.surface} 0%, ${theme.surfaceVariant || theme.surface} 100%)`,
    boxShadow: `0 14px 34px ${theme.cardShadow}, 0 2px 8px ${theme.shadow}`,
    padding: '22px 20px',
  },
  offerTitle: {
    margin: 0,
    fontSize: 25,
    fontWeight: 900,
    color: theme.text,
    marginBottom: 8,
  },
  offerIntro: {
    margin: 0,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 500,
    color: theme.textSecondary,
    lineHeight: '20px',
  },
  qualityList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  qualityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '4px 1px',
  },
  qualityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: `${theme.primary}16`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 6px 14px ${theme.primary}20`,
  },
  qualityText: {
    fontSize: 14.5,
    fontWeight: 650,
    color: theme.text,
    lineHeight: '20px',
  },
  creatorPreviewCard: {
    width: '100%',
    borderRadius: 22,
    border: `2px solid ${theme.cardBorder}`,
    background: `linear-gradient(150deg, ${theme.surface} 0%, ${theme.surfaceVariant || theme.surface} 100%)`,
    boxShadow: `0 12px 30px ${theme.cardShadow}, 0 2px 8px ${theme.shadow}`,
    padding: 16,
    cursor: 'pointer',
    textAlign: 'start' as const,
    fontFamily: '"Noto Sans JP", "Noto Sans Arabic", "Segoe UI", sans-serif',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  creatorPreviewHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  creatorPreviewTextWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 3,
  },
  creatorPreviewTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: theme.text,
    fontFamily: '"Noto Sans JP", "Noto Sans Arabic", "Segoe UI", sans-serif',
  },
  creatorPreviewName: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.primary,
    fontFamily: '"Noto Sans JP", "Noto Sans Arabic", "Segoe UI", sans-serif',
  },
  creatorPreviewDesc: {
    marginTop: 10,
    fontSize: 13.2,
    color: theme.primary,
    lineHeight: '18px',
    fontWeight: 700,
    letterSpacing: 0,
    fontFamily: '"Noto Sans JP", "Noto Sans Arabic", "Segoe UI", sans-serif',
    paddingInlineStart: 56,
    textAlign: 'start' as const,
  },
  creatorOverlay: {
    position: 'fixed' as const,
    top: 76,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(900px, calc(100vw - 24px))',
    bottom: 78,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    pointerEvents: 'auto' as const,
    zIndex: 24,
  },
  creatorBackdrop: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 23,
    background: `${theme.background || '#0b1835'}88`,
    backdropFilter: 'blur(12px) saturate(120%)',
    WebkitBackdropFilter: 'blur(12px) saturate(120%)',
    pointerEvents: 'none' as const,
  },
  creatorHeroCard: {
    width: '100%',
    borderRadius: 22,
    border: `2px solid ${theme.cardBorder}`,
    background: `linear-gradient(150deg, ${theme.surface} 0%, ${theme.surfaceVariant || theme.surface} 100%)`,
    boxShadow: `0 2px 6px ${theme.shadow}`,
    padding: '14px 16px',
    overflow: 'hidden',
    minHeight: 0,
  },
  curtainPanel: {
    flex: 1,
    borderRadius: 22,
    border: `2px solid ${theme.cardBorder}`,
    background: theme.surface,
    boxShadow: 'none',
    padding: 8,
    transformOrigin: 'top',
    overflowX: 'hidden' as const,
    overflowY: 'hidden' as const,
  },
  curtainScroller: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflowX: 'hidden' as const,
    overflowY: 'auto' as const,
    overscrollBehaviorY: 'none' as const,
    overflowAnchor: 'none' as const,
  },
  creatorTextStack: {
    minHeight: 0,
    width: '100%',
    background: theme.surface,
    padding: '10px 8px 12px',
  },
  creatorLeadLine: {
    margin: 0,
    padding: '2px 0 12px',
    borderBottom: `1px solid ${theme.cardBorder}`,
    marginBottom: 12,
    color: theme.primary,
    fontFamily: '"Noto Sans JP", "Noto Sans Arabic", "Segoe UI", sans-serif',
    fontWeight: 800,
    letterSpacing: '0.18px',
    textAlign: 'start' as const,
    textShadow: `0 1px 10px ${theme.primary}22`,
  },
  creatorBody: {
    margin: 0,
    padding: 0,
    color: theme.text,
    fontFamily: '"Noto Sans JP", "Noto Sans Arabic", "Segoe UI", sans-serif',
    fontWeight: 600,
    letterSpacing: '0.14px',
    textAlign: 'start' as const,
    whiteSpace: 'pre-line' as const,
    textWrap: 'pretty' as const,
    textRendering: 'optimizeLegibility' as const,
  },
  backButtonDockInline: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 14,
  },
  backButtonDockOverlay: {
    position: 'fixed' as const,
    left: 0,
    right: 0,
    bottom: 12,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none' as const,
  },
  backButton: {
    width: 'min(260px, calc(100vw - 24px))',
    border: 'none',
    borderRadius: 14,
    padding: '12px 18px',
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
    pointerEvents: 'auto' as const,
  },
});
