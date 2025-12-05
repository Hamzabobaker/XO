// src/pages/About.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  IoGameController,
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
import { renderIcon } from '../utils/renderIcon';

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
        style={styles.scrollContent}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          {renderIcon(IoGameController, { size: 64, color: theme.primary })}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={styles.title}
        >
          XO
        </motion.h1>

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
            {renderIcon(IoHardwareChip, { size: 24, color: theme.primary })}
            <div style={styles.featureText}>
              <div style={styles.featureTitle}>{t('vsbot')}</div>
              <div style={styles.featureDesc}>{t('playAlone')}</div>
            </div>
          </div>

          <div style={styles.feature}>
            {renderIcon(IoPeople, { size: 24, color: theme.primary })}
            <div style={styles.featureText}>
              <div style={styles.featureTitle}>{t('vsplayer')}</div>
              <div style={styles.featureDesc}>{t('playTogether')}</div>
            </div>
          </div>

          <div style={styles.divider} />

          <h3 style={styles.sectionTitle}>{t('features')}</h3>

          <div style={styles.feature}>
            {renderIcon(IoLanguage, { size: 24, color: theme.primary })}
            <div style={styles.featureText}>
              <div style={styles.featureDesc}>{t('multiLanguage')}</div>
            </div>
          </div>

          <div style={styles.feature}>
            {renderIcon(IoMoon, { size: 24, color: theme.primary })}
            <div style={styles.featureText}>
              <div style={styles.featureDesc}>{t('darkMode')}</div>
            </div>
          </div>

          <div style={styles.feature}>
            {renderIcon(IoFlash, { size: 24, color: theme.secondary })}
            <div style={styles.featureText}>
              <div style={styles.featureDesc}>{t('smartAI')}</div>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.creatorSection}>
            {renderIcon(IoPersonCircle, { size: 40, color: theme.primary })}
            <div style={styles.creatorText}>
              <div style={styles.creatorTitle}>{t('createdBy')}</div>
              <div style={styles.creatorDesc}>{t('creatorDesc')}</div>
            </div>
          </div>

          <div style={styles.footer}>{t('builtWith')}</div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={styles.backButton}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${theme.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 8px ${theme.shadow}`;
          }}
        >
          {renderIcon(IoArrowBack, { size: 20, color: '#FFFFFF' })}
          <span>{t('back')}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    maxWidth: 500,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: theme.text,
    textAlign: 'center' as const,
    margin: 0,
    marginBottom: 32,
  },
  card: {
    backgroundColor: theme.surface,
    padding: 24,
    borderRadius: 16,
    width: '100%',
    boxShadow: `0 4px 8px ${theme.shadow}`,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: theme.text,
    lineHeight: '24px',
    textAlign: 'center' as const,
    margin: 0,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: theme.text,
    margin: 0,
    marginBottom: 16,
  },
  feature: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 600,
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
    gap: 12,
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  creatorText: {
    flex: 1,
  },
  creatorTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: theme.text,
    marginBottom: 4,
  },
  creatorDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: '18px',
  },
  footer: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center' as const,
  },
  backButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.primary,
    color: '#FFFFFF',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: `0 4px 8px ${theme.shadow}`,
    transition: 'all 0.2s',
    fontSize: 16,
    width: '100%',
    maxWidth: 200,
  },
});