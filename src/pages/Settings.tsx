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
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { renderIcon } from '../utils/renderIcon';

export default function Settings() {
  const navigate = useNavigate();
  const {
    theme,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
  } = useApp();

  const styles = getStyles(theme);

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={styles.content}
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.title}
        >
          {t('settings')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.section}
        >
          <div style={styles.label}>{t('theme')}</div>
          <div style={styles.options}>
            <button
              onClick={() => setThemeMode('auto')}
              style={getOptionStyle(theme, themeMode === 'auto')}
              onMouseEnter={(e) => {
                if (themeMode !== 'auto') {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.primary + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (themeMode !== 'auto') {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              {renderIcon(IoPhonePortraitOutline, {
                size: 20,
                color: themeMode === 'auto' ? '#FFFFFF' : theme.text,
              })}
              <span
                style={getOptionTextStyle(theme, themeMode === 'auto')}
              >
                {t('auto')}
              </span>
            </button>

            <button
              onClick={() => setThemeMode('light')}
              style={getOptionStyle(theme, themeMode === 'light')}
              onMouseEnter={(e) => {
                if (themeMode !== 'light') {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.primary + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (themeMode !== 'light') {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              {renderIcon(IoSunny, {
                size: 20,
                color: themeMode === 'light' ? '#FFFFFF' : theme.text,
              })}
              <span
                style={getOptionTextStyle(theme, themeMode === 'light')}
              >
                {t('light')}
              </span>
            </button>

            <button
              onClick={() => setThemeMode('dark')}
              style={getOptionStyle(theme, themeMode === 'dark')}
              onMouseEnter={(e) => {
                if (themeMode !== 'dark') {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.primary + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (themeMode !== 'dark') {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              {renderIcon(IoMoon, {
                size: 20,
                color: themeMode === 'dark' ? '#FFFFFF' : theme.text,
              })}
              <span
                style={getOptionTextStyle(theme, themeMode === 'dark')}
              >
                {t('dark')}
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={styles.section}
        >
          <div style={styles.label}>{t('language')}</div>
          <div style={styles.options}>
            <button
              onClick={() => setLanguage('auto')}
              style={getOptionStyle(theme, language === 'auto')}
              onMouseEnter={(e) => {
                if (language !== 'auto') {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.primary + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== 'auto') {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              {renderIcon(IoGlobe, {
                size: 20,
                color: language === 'auto' ? '#FFFFFF' : theme.text,
              })}
              <span
                style={getOptionTextStyle(theme, language === 'auto')}
              >
                {t('auto')}
              </span>
            </button>

            <button
              onClick={() => setLanguage('en')}
              style={getOptionStyle(theme, language === 'en')}
              onMouseEnter={(e) => {
                if (language !== 'en') {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.primary + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== 'en') {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              {renderIcon(IoLanguage, {
                size: 20,
                color: language === 'en' ? '#FFFFFF' : theme.text,
              })}
              <span
                style={getOptionTextStyle(theme, language === 'en')}
              >
                {t('english')}
              </span>
            </button>

            <button
              onClick={() => setLanguage('ar')}
              style={getOptionStyle(theme, language === 'ar')}
              onMouseEnter={(e) => {
                if (language !== 'ar') {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.backgroundColor = theme.primary + '15';
                }
              }}
              onMouseLeave={(e) => {
                if (language !== 'ar') {
                  e.currentTarget.style.borderColor = theme.border;
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              {renderIcon(IoLanguage, {
                size: 20,
                color: language === 'ar' ? '#FFFFFF' : theme.text,
              })}
              <span
                style={getOptionTextStyle(theme, language === 'ar')}
              >
                {t('arabic')}
              </span>
            </button>
          </div>
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

const getOptionStyle = (theme: any, selected: boolean) => ({
  flex: 1,
  padding: '14px',
  borderRadius: 12,
  backgroundColor: selected ? theme.primary : theme.surface,
  border: `2px solid ${selected ? theme.primary : theme.border}`,
  display: 'flex',
  flexDirection: 'row' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  boxShadow: selected
    ? `0 4px 12px ${theme.primary}30`
    : `0 2px 4px ${theme.shadow}`,
  cursor: 'pointer',
  transition: 'all 0.2s',
});

const getOptionTextStyle = (theme: any, selected: boolean) => ({
  fontSize: 14,
  color: selected ? '#FFFFFF' : theme.text,
  fontWeight: selected ? 600 : 500,
});

const getStyles = (theme: any) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: theme.background,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    color: theme.text,
    textAlign: 'center' as const,
    margin: 0,
    marginBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.text,
    marginBottom: 12,
  },
  options: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: 10,
  },
  backButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.primary,
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: 16,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    boxShadow: `0 4px 8px ${theme.shadow}`,
    transition: 'all 0.2s',
    width: '100%',
  },
});