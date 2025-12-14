// src/pages/MainMenu.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoPlayCircle, IoSettingsSharp, IoInformationCircle } from 'react-icons/io5';
import ConfirmModal from '../components/ConfirmModal';
import { useApp } from '../context';

export default function MainMenu() {
  const navigate = useNavigate();
  const { theme, t, dir, actualThemeMode } = useApp(); // dir = 'ltr' or 'rtl'
  const [quitVisible, setQuitVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [playEntrance, setPlayEntrance] = useState(false);

  // Watch `#root` for the `visible` class and trigger entrance animations when added
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    if (root.classList.contains('visible')) {
      setPlayEntrance(true);
      return;
    }

    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'attributes' && root.classList.contains('visible')) {
          setPlayEntrance(true);
          obs.disconnect();
          return;
        }
      }
    });

    obs.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Disable buttons while entrance animation runs
  useEffect(() => {
    if (!playEntrance) return;
    setIsAnimating(true);
    const t = setTimeout(() => setIsAnimating(false), 900);
    return () => clearTimeout(t);
  }, [playEntrance]);

  const buttons = [
    { Icon: IoPlayCircle, text: t('play'), action: () => navigate('/play'), style: 'primary', gradient: true },
    { Icon: IoSettingsSharp, text: t('settings'), action: () => navigate('/settings'), style: 'secondary', gradient: false },
    { Icon: IoInformationCircle, text: t('about'), action: () => navigate('/about'), style: 'secondary', gradient: false },
  ];

  const handleQuit = () => {
    setQuitVisible(false);
    window.close();
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <motion.h1
            initial="hidden"
            animate={playEntrance ? 'visible' : 'hidden'}
            variants={{
              hidden: { scale: 0, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 10, delay: 0.2 } },
            }}
            style={styles.title}
          >
            {t('title')}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate={playEntrance ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.4 } },
            }}
            style={styles.subtitle}
          >
            {t('gameDescription')}
          </motion.p>
        </div>

        {/* Menu Buttons */}
        <div style={styles.menu}>
          {buttons.map((btn, i) => {
            const Icon = btn.Icon;
            const isSecondary = btn.style === 'secondary';
            const iconColor = isSecondary && actualThemeMode === 'light' ? '#000' : '#FFFFFF';
            const textColor = isSecondary && actualThemeMode === 'light' ? '#000' : '#FFFFFF';

            const iconBackground =
              isSecondary
                ? (typeof theme.primary === 'string' && /^#/.test(theme.primary)
                    ? `${theme.primary}10`
                    : theme.surfaceVariant)
                : 'rgba(255, 255, 255, 0.2)';

            return (
              <motion.div
                key={i}
                initial="hidden"
                animate={playEntrance ? 'visible' : 'hidden'}
                custom={i}
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: (index: number) => ({ y: 0, opacity: 1, transition: { delay: 0.4 + index * 0.08, type: 'spring', stiffness: 120, damping: 12 } }),
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{
                    scale: { type: "spring", stiffness: 400, damping: 25 },
                    y: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  style={{
                    ...styles.button,
                    ...(isSecondary ? styles.buttonSecondary : {}),
                    ...(btn.gradient ? styles.buttonGradient : {}),
                    // layout based on direction
                    flexDirection: dir === 'rtl' ? 'row-reverse' : 'row',
                  }}
                  onClick={btn.action}
                  disabled={isAnimating}
                >
                  <div
                    style={{
                      ...styles.buttonIcon,
                      backgroundColor: iconBackground,
                    }}
                  >
                    {React.createElement(Icon as any, { size: 24, color: iconColor })}
                  </div>
                  <span
                    style={{
                      ...styles.buttonText,
                      color: textColor,
                      textAlign: dir === 'rtl' ? 'right' : 'left',
                      flex: 1,
                    }}
                  >
                    {btn.text}
                  </span>
                  {btn.gradient && (
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                      style={styles.buttonShine}
                    />
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          initial="hidden"
          animate={playEntrance ? 'visible' : 'hidden'}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 0.7, duration: 0.5 } },
          }}
          style={styles.footer}
        >
          <span style={styles.footerText}>v1.1.0</span>
        </motion.div>
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative' as const,
    overflow: 'visible' as const,
  },
  content: {
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  header: { textAlign: 'center' as const, marginBottom: 40 },
  title: {
    fontSize: 72,
    fontWeight: 900,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    marginBottom: 8,
    letterSpacing: '-2px',
    textShadow: `0 4px 20px ${theme.primary}20`,
  },
  subtitle: { fontSize: 16, color: theme.textSecondary, margin: 0, fontWeight: 500 },
  menu: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: 14 },
  button: {
    backgroundColor: theme.surface,
    padding: '18px 24px',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    boxShadow: `0 4px 16px ${theme.cardShadow}, 0 2px 4px ${theme.shadow}`,
    border: `1px solid ${theme.border}`,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0s',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none' as const,
  },
  buttonGradient: {
    background: `linear-gradient(135deg, ${theme.primary}ee 0%, ${theme.accent}ee 100%)`,
    border: 'none',
    boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
  },
  buttonSecondary: {
    background: `linear-gradient(135deg, ${theme.surfaceVariant} 0%, ${theme.surface} 100%)`,
    border: `2px solid ${theme.border}`,
  },
  buttonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backdropFilter: 'blur(8px)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 700,
    flex: 1,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none' as const,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  buttonShine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    pointerEvents: 'none' as const,
  },
  footer: { marginTop: 40, display: 'flex', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 13, color: theme.textSecondary, fontWeight: 500 },
});
