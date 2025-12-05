// src/pages/MainMenu.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IoPlayCircle,
  IoSettingsSharp,
  IoInformationCircle,
  IoExit,
} from 'react-icons/io5';
import ConfirmModal from '../components/ConfirmModal';
import { useApp } from '../context';
import { renderIcon } from '../utils/renderIcon';

export default function MainMenu() {
  const navigate = useNavigate();
  const { theme, t } = useApp();
  const [quitVisible, setQuitVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const buttons = [
    {
      Icon: IoPlayCircle,
      text: t('play'),
      action: () => navigate('/play'),
      style: 'primary',
    },
    {
      Icon: IoSettingsSharp,
      text: t('settings'),
      action: () => navigate('/settings'),
      style: 'secondary',
    },
    {
      Icon: IoInformationCircle,
      text: t('about'),
      action: () => navigate('/about'),
      style: 'secondary',
    },
    {
      Icon: IoExit,
      text: t('quit'),
      action: () => setQuitVisible(true),
      style: 'danger',
    },
  ];

  const handleQuit = () => {
    setQuitVisible(false);
    // For web, we can try to close the window, but it may not work
    // depending on browser security settings
    window.close();
    // If window.close() doesn't work (most modern browsers block it),
    // you could redirect to a "goodbye" page or just do nothing
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <motion.h1
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
            delay: 0.1,
          }}
          style={styles.title}
        >
          {t('title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={styles.subtitle}
        >
          {t('gameDescription')}
        </motion.p>
      </div>

      <div style={styles.menu}>
        {buttons.map((btn, i) => {
          const Icon = btn.Icon;
          return (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + i * 0.1,
                type: 'spring',
                stiffness: 100,
                damping: 10,
              }}
            >
              <button
                style={{
                  ...styles.button,
                  ...(btn.style === 'secondary' && styles.buttonSecondary),
                  ...(btn.style === 'danger' && styles.buttonDanger),
                }}
                onClick={btn.action}
                disabled={isAnimating}
                onMouseEnter={(e) => {
                  if (!isAnimating) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${theme.shadow}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAnimating) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.shadow}`;
                  }
                }}
              >
                {renderIcon(Icon, { size: 24, color: '#FFFFFF' })}
                <span style={styles.buttonText}>{btn.text}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      <ConfirmModal
        visible={quitVisible}
        title={t('quitAppTitle')}
        message={t('quitAppMessage')}
        onConfirm={handleQuit}
        onCancel={() => setQuitVisible(false)}
        theme={theme}
        t={t}
      />
    </div>
  );
}

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: theme.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    flexDirection: 'column' as const,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold' as const,
    color: theme.primary,
    margin: 0,
    marginBottom: 8,
    textShadow: `0 2px 8px ${theme.shadow}`,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
    margin: 0,
    textAlign: 'center' as const,
  },
  menu: {
    width: '100%',
    maxWidth: 320,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 18,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
    boxShadow: `0 4px 12px ${theme.shadow}`,
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
  },
  buttonSecondary: {
    backgroundColor: theme.primary,
    opacity: 0.95,
  },
  buttonDanger: {
    backgroundColor: theme.secondary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 600,
  },
});