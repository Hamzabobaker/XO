// src/pages/Settings.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  IoArrowBack,
  IoPhonePortraitOutline,
  IoSunny,
  IoMoon,
  IoGlobe,
  IoLanguage,
  IoSettingsSharp,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, themeMode, setThemeMode, language, setLanguage, t, dir } = useApp();

  const styles = getStyles(theme);

  return (
    <div style={{ ...styles.container, direction: dir }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={styles.content}
      >
        {/* Header with icon */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={styles.header}
        >
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 12,
              delay: 0.15,
            }}
            style={styles.iconWrapper}
          >
            {React.createElement(IoSettingsSharp as any, { size: 56, color: theme.primary })}
          </motion.div>

          <h2 style={styles.title}>{t('settings')}</h2>
        </motion.div>

        {/* Theme Section */}
        <Section
          label={t('theme')}
          options={[
            { icon: IoPhonePortraitOutline, label: t('auto'), value: 'auto' },
            { icon: IoSunny, label: t('light'), value: 'light' },
            { icon: IoMoon, label: t('dark'), value: 'dark' },
          ]}
          selected={themeMode}
          onSelect={setThemeMode}
          theme={theme}
          delay={0.3}
        />

        {/* Language Section */}
        <Section
          label={t('language')}
          options={[
            { icon: IoGlobe, label: t('auto'), value: 'auto' },
            { icon: IoLanguage, label: t('english'), value: 'en' },
            { icon: IoLanguage, label: t('arabic'), value: 'ar' },
          ]}
          selected={language}
          onSelect={setLanguage}
          theme={theme}
          delay={0.4}
        />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={styles.backButton}
          onClick={() => navigate(-1)}
        >
          {/* Arabic: text LEFT, arrow RIGHT (pointing left) | English: arrow LEFT, text RIGHT */}
              {dir === 'rtl' ? (
            <>
              <span>{t('back')}</span>
              {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })} {/* ✅ NO FLIP - normal left arrow on right side */}
            </>
          ) : (
            <>
              {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
              <span>{t('back')}</span>
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

// Section Component
function Section({ label, options, selected, onSelect, theme, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        marginBottom: 24,
        backgroundColor: theme.surface,
        padding: 20,
        borderRadius: 20,
        border: `2px solid ${theme.cardBorder}`,
        boxShadow: `0 4px 16px ${theme.cardShadow}, 0 2px 4px ${theme.shadow}`,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
        {label}
      </div>

      {/* Keep buttons LTR even in RTL */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 12, direction: 'ltr' }}>
        {options.map((opt: any) => (
          <motion.button
            key={opt.value}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{
              scale: { type: 'spring', stiffness: 400, damping: 25 },
              y: { type: 'spring', stiffness: 400, damping: 25 },
            }}
            onClick={() => onSelect(opt.value)}
            style={getOptionStyle(theme, selected === opt.value)}
          >
            {React.createElement(opt.icon as any, {
              size: 20,
              color: selected === opt.value ? '#FFFFFF' : theme.text,
            })}
            <span style={getOptionTextStyle(theme, selected === opt.value)}>
              {opt.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

const getOptionStyle = (theme: any, selected: boolean) => ({
  flex: 1,
  padding: '16px 12px',
  borderRadius: 14,
  background: selected
    ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
    : theme.surface,
  border: `2px solid ${selected ? theme.primary : theme.border}`,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: selected
    ? `0 6px 16px ${theme.primary}30, 0 2px 6px ${theme.shadow}`
    : `0 2px 8px ${theme.cardShadow}`,
  cursor: 'pointer',
  transition: 'all 0.2s',
  WebkitTapHighlightColor: 'transparent',
  outline: 'none',
  userSelect: 'none' as const,
});

const getOptionTextStyle = (theme: any, selected: boolean) => ({
  fontSize: 14,
  color: selected ? '#FFFFFF' : theme.text,
  fontWeight: selected ? 700 : 600,
  textShadow: selected ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
});

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative' as const,
    overflow: 'auto',
    background: 'transparent',
  },
  content: {
    maxWidth: 480,
    width: '100%',
    position: 'relative' as const,
    zIndex: 1,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: 40,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 20,
    filter: `drop-shadow(0 4px 12px ${theme.primary}40)`,
  },
  title: {
    fontSize: 48,
    fontWeight: 900,
    margin: 0,
    padding: 0,
    letterSpacing: '-1px',
    color: theme.text,
    position: 'relative' as const,
  },
  backButton: {
    padding: '16px 24px',
    borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: 16,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
    transition: 'all 0.2s',
    width: '100%',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none' as const,
    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
    // Keep default flex direction, handle with conditional rendering
  },
});
