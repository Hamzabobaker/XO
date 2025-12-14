// src/pages/About.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  IoHardwareChip,
  IoPeople,
  IoLanguage,
  IoMoon,
  IoFlash,
  IoPersonCircle,
  IoArrowBack,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';

export default function About() {
  const { theme, t } = useApp();
  const navigate = useNavigate();

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={styles.content}
      >
        {/* Header */}
        <div style={styles.header}>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={styles.title}
          >
            XO
          </motion.h1>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.card}
        >
          <p style={styles.description}>{t('gameDescription')}</p>

          <div style={styles.divider} />

          <h3 style={styles.sectionTitle}>{t('gameModes')}</h3>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              {React.createElement(IoHardwareChip as any, { size: 24, color: theme.primary })}
            </div>
            <div style={styles.featureText}>
              <div style={styles.featureTitle}>{t('vsbot')}</div>
              <div style={styles.featureDesc}>{t('playAlone')}</div>
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              {React.createElement(IoPeople as any, { size: 24, color: theme.primary })}
            </div>
            <div style={styles.featureText}>
              <div style={styles.featureTitle}>{t('vsplayer')}</div>
              <div style={styles.featureDesc}>{t('playTogether')}</div>
            </div>
          </div>

          <div style={styles.divider} />

          <h3 style={styles.sectionTitle}>{t('features')}</h3>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              {React.createElement(IoLanguage as any, { size: 24, color: theme.accent })}
            </div>
            <div style={styles.featureText}>
              <div style={styles.featureDesc}>{t('multiLanguage')}</div>
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              {React.createElement(IoMoon as any, { size: 24, color: theme.accent })}
            </div>
            <div style={styles.featureText}>
              <div style={styles.featureDesc}>{t('darkMode')}</div>
            </div>
          </div>

          <div style={styles.feature}>
            <div style={styles.featureIcon}>
              {React.createElement(IoFlash as any, { size: 24, color: theme.secondary })}
            </div>
            <div style={styles.featureText}>
              <div style={styles.featureDesc}>{t('smartAI')}</div>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.creatorSection}>
            {React.createElement(IoPersonCircle as any, { size: 48, color: theme.primary })}
            <div style={styles.creatorText}>
              <div style={styles.creatorTitle}>{t('createdBy')}</div>
              <div style={styles.creatorDesc}>{t('creatorDesc')}</div>
            </div>
          </div>

          <div style={styles.footer}>{t('builtWith')}</div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
          <span>{t('back')}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    position: 'relative' as const,
    overflow: 'hidden', // hides scrollbar
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 500,
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minHeight: '100vh',
    position: 'relative' as const,
    zIndex: 1,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  title: {
    fontSize: 56,
    fontWeight: 900,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    letterSpacing: '-2px',
  },
  card: {
    backgroundColor: theme.surface,
    padding: 28,
    borderRadius: 20,
    width: '100%',
    boxShadow: `0 8px 24px ${theme.cardShadow}, 0 4px 8px ${theme.shadow}`,
    marginBottom: 24,
    border: `2px solid ${theme.cardBorder}`,
  },
  description: {
    fontSize: 16,
    color: theme.text,
    lineHeight: '24px',
    textAlign: 'center' as const,
    margin: 0,
    marginBottom: 20,
    fontWeight: 500,
  },
  divider: {
    height: 2,
    background: `linear-gradient(90deg, transparent, ${theme.border}, transparent)`,
    marginTop: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: theme.text,
    margin: 0,
    marginBottom: 20,
  },
  feature: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}10 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: '20px',
  },
  creatorSection: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 16,
    background: `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.accent}05 100%)`,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    border: `1px solid ${theme.cardBorder}`,
  },
  creatorText: {
    flex: 1,
  },
  creatorTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.text,
    marginBottom: 6,
  },
  creatorDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: '19px',
  },
  footer: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center' as const,
    fontWeight: 500,
  },
  backButton: {
    padding: '16px 28px',
    borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    color: '#FFFFFF',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
    transition: 'all 0.2s',
    fontSize: 16,
    width: '100%',
    maxWidth: 220,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none' as const,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
});
