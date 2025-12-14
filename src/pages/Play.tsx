// src/pages/Play.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';
import {
  IoGrid,
  IoInfinite,
  IoTimer,
  IoExpand,
  IoSwapHorizontal,
  IoReturnDownBack,
  IoArrowBack,
  IoGameController,
} from 'react-icons/io5';
import ModeCard from '../components/ModeCard';
import GameSettingsModal from '../components/GameSettingsModal';
import { motion } from 'framer-motion';
import { useApp } from '../context';

type Variant =
  | 'classic'
  | 'infinite'
  | 'blitz'
  | 'mega'
  | 'swap'
  | 'reverse';

export default function Play() {
  const navigate = useNavigate();
  const { theme, t, blitzSettings, megaBoardSettings, dir } = useApp();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false); // ✅ ADD

  const gameModes: {
    id: Variant;
    title: string;
    description: string;
    fullDescription: string;
    icon: IconType;
    isComingSoon: boolean;
    availableDifficulties: string[];
  }[] = [
    {
      id: 'classic',
      title: t('classic'),
      description: t('classicDesc'),
      fullDescription: t('classicDesc'),
      icon: IoGrid,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard', 'impossible'],
    },
    {
      id: 'infinite',
      title: t('infinite'),
      description: t('infiniteDesc'),
      fullDescription: t('infiniteDesc'),
      icon: IoInfinite,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard', 'impossible'],
    },
    {
      id: 'blitz',
      title: t('blitz'),
      description: t('blitzDesc'),
      fullDescription: t('blitzDesc'),
      icon: IoTimer,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard', 'impossible'],
    },
    {
      id: 'mega',
      title: t('mega'),
      description: t('megaDesc'),
      fullDescription: t('megaDesc'),
      icon: IoExpand,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard', 'impossible'],
    },
    {
      id: 'swap',
      title: t('swap'),
      description: t('swapDesc'),
      fullDescription: t('swapDesc'),
      icon: IoSwapHorizontal,
      isComingSoon: true,
      availableDifficulties: ['easy', 'normal', 'hard'],
    },
    {
      id: 'reverse',
      title: t('reverse'),
      description: t('reverseDesc'),
      fullDescription: t('reverseDesc'),
      icon: IoReturnDownBack,
      isComingSoon: true,
      availableDifficulties: ['easy', 'normal', 'hard'],
    },
  ];

  // ✅ Enable interaction after animations complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000); // Animations finish around 0.7s + buffer

    return () => clearTimeout(timer);
  }, []);

  const handleModeSelect = (modeId: Variant) => {
    if (!animationComplete) return; // ✅ Prevent clicks during animation
    setSelectedVariant(modeId);
    setSettingsModalVisible(true);
  };

  const selectedModeData = gameModes.find((m) => m.id === selectedVariant);

  const styles = getStyles(theme);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={styles.container}
    >
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 12,
              delay: 0.1,
            }}
            style={styles.iconContainer}
          >
            {React.createElement(IoGameController as any, { size: 48, color: theme.primary })}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={styles.title}
          >
            {t('selectMode')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={styles.subtitle}
          >
            {t('gameVariant')}
          </motion.p>
        </div>

        {/* Game modes grid */}
        <div style={styles.grid}>
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.35 + index * 0.05,
                duration: 0.4,
                type: 'spring',
                stiffness: 100,
              }}
              style={{ opacity: animationComplete ? 1 : 0.6 }} // ✅ Visual feedback
            >
              <ModeCard
                id={mode.id}
                title={mode.title}
                description={mode.description}
                icon={mode.icon}
                isSelected={false}
                isComingSoon={mode.isComingSoon}
                onPress={() => handleModeSelect(mode.id)}
                theme={theme}
                t={t}
                isRTL={dir === 'rtl'}
              />
            </motion.div>
          ))}
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          style={styles.backButtonContainer}
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0 }}
            style={styles.backButton}
            onClick={() => navigate(-1)}
          >
            {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
            <span>{t('back')}</span>
          </motion.button>
        </motion.div>
      </div>

      <GameSettingsModal
        visible={settingsModalVisible}
        variant={selectedVariant}
        variantTitle={selectedModeData?.title || ''}
        variantDescription={selectedModeData?.description || ''}
        availableDifficulties={
          selectedModeData?.availableDifficulties || ['easy', 'normal', 'hard']
        }
        onClose={() => {
          setSettingsModalVisible(false);
          setSelectedVariant(null);
        }}
        theme={theme}
        t={t}
        blitzSettings={blitzSettings}
        megaBoardSettings={megaBoardSettings}
        
      />
    </motion.div>
  );
}

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    position: 'relative' as const,
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
});
