// src/pages/Play.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconType } from 'react-icons';
import {
  IoGrid,
  IoInfinite,
  IoTimer,
  IoExpand,
  IoPlayForward,
  IoSwapHorizontal,
  IoReturnDownBack,
  IoArrowBack,
} from 'react-icons/io5';
import ModeCard from '../components/ModeCard';
import GameSettingsModal from '../components/GameSettingsModal';
import { motion } from 'framer-motion';
import { useApp } from '../context';
import { renderIcon } from '../utils/renderIcon';

type Variant =
  | 'classic'
  | 'infinite'
  | 'blitz'
  | 'mega'
  | 'doublemove'
  | 'swap'
  | 'reverse';

export default function Play() {
  const navigate = useNavigate();
  const { theme, t, blitzSettings, megaBoardSettings, doubleMoveSettings } = useApp();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

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
      availableDifficulties: ['easy', 'normal', 'hard'],
    },
    {
      id: 'blitz',
      title: t('blitz'),
      description: t('blitzDesc'),
      fullDescription: t('blitzDesc'),
      icon: IoTimer,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard'],
    },
    {
      id: 'mega',
      title: t('mega'),
      description: t('megaDesc'),
      fullDescription: t('megaDesc'),
      icon: IoExpand,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard'],
    },
    {
      id: 'doublemove',
      title: t('doublemove'),
      description: t('doublemoveDesc'),
      fullDescription: t('doublemoveDesc'),
      icon: IoPlayForward,
      isComingSoon: false,
      availableDifficulties: ['easy', 'normal', 'hard'],
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

  const handleModeSelect = (modeId: Variant) => {
    setSelectedVariant(modeId);
    setSettingsModalVisible(true);
  };

  const selectedModeData = gameModes.find((m) => m.id === selectedVariant);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        minHeight: '100vh',
        backgroundColor: theme.background,
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: theme.text,
              marginBottom: 8,
              margin: 0,
            }}
          >
            {t('selectMode')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ fontSize: 16, color: theme.textSecondary, margin: 0 }}
          >
            {t('gameVariant')}
          </motion.p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
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
              />
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            padding: '14px 20px',
            borderRadius: 12,
            backgroundColor: theme.primary,
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 4px 12px ${theme.shadow}`,
            transition: 'all 0.2s',
            maxWidth: 200,
          }}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${theme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${theme.shadow}`;
          }}
        >
          {renderIcon(IoArrowBack, { size: 20 })}
          {t('back')}
        </motion.button>
      </div>

      <GameSettingsModal
        visible={settingsModalVisible}
        variant={selectedVariant}
        variantTitle={selectedModeData?.title || ''}
        variantDescription={selectedModeData?.description || ''}
        availableDifficulties={
          selectedModeData?.availableDifficulties || ['easy', 'normal', 'hard']
        }
        onClose={() => setSettingsModalVisible(false)}
        theme={theme}
        t={t}
        blitzSettings={blitzSettings}
        megaBoardSettings={megaBoardSettings}
        doubleMoveSettings={doubleMoveSettings}
      />
    </motion.div>
  );
}