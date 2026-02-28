// src/pages/Settings.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IoArrowBack,
  IoPhonePortraitOutline,
  IoSunny,
  IoMoon,
  IoGlobe,
  IoLanguage,
  IoSettingsSharp,
  IoMusicalNotes,
  IoVolumeHigh,
  IoVolumeLow,
  IoVolumeMute,
  IoVolumeMedium,
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
export default function Settings() {
  const navigate = useNavigate();
  const {
    theme,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    t,
    dir,
    playSound,
    sfxEnabled,
    setSfxEnabled,
    sfxVolume,
    setSfxVolume,
  } = useApp();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 860 : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsNarrow(window.innerWidth < 860);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <div style={{ ...styles.container, direction: dir }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={styles.content}
      >
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          style={styles.header}
        >
          <motion.div
            initial={{ scale: 0.6, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 12 }}
            style={styles.headerIcon}
          >
            {React.createElement(IoSettingsSharp as any, { size: 48, color: theme.primary })}
          </motion.div>
          <div style={styles.headerText}>
            <h2 style={styles.title}>{t('settings')}</h2>
            <div style={styles.subtitle}>{t('theme')} · {t('language')} · {t('sound')}</div>
          </div>
        </motion.div>

        <div style={styles.grid(isNarrow)}>
          <SettingsCard
            icon={IoPhonePortraitOutline}
            title={t('theme')}
            subtitle={t('darkMode')}
            theme={theme}
            delay={0.18}
          >
            <OptionRow
              options={[
                { icon: IoPhonePortraitOutline, label: t('auto'), value: 'auto' },
                { icon: IoSunny, label: t('light'), value: 'light' },
                { icon: IoMoon, label: t('dark'), value: 'dark' },
              ]}
              selected={themeMode}
              onSelect={setThemeMode}
              playSound={playSound}
              theme={theme}
              columns={isNarrow ? 3 : 3}
            />
          </SettingsCard>

          <SettingsCard
            icon={IoLanguage}
            title={t('language')}
            subtitle={t('multiLanguage')}
            theme={theme}
            delay={0.26}
          >
            <OptionRow
              options={[
                { icon: IoGlobe, label: t('auto'), value: 'auto' },
                { icon: IoLanguage, label: t('english'), value: 'en' },
                { icon: IoLanguage, label: t('arabic'), value: 'ar' },
                { icon: IoLanguage, label: t('japanese'), value: 'ja' },
              ]}
              selected={language}
              onSelect={setLanguage}
              playSound={playSound}
              theme={theme}
              columns={isNarrow ? 2 : 4}
            />
          </SettingsCard>

          <SettingsCard
            icon={IoMusicalNotes}
            title={t('sound')}
            subtitle={t('soundDesc')}
            theme={theme}
            delay={0.34}
            fullWidth={!isNarrow}
          >
            <ToggleRow
              value={sfxEnabled}
              onChange={(next: boolean) => {
                if (next) {
                  setSfxEnabled(true);
                  setSfxVolume(100);
                  playSound('tap');
                } else {
                  setSfxEnabled(false);
                  setSfxVolume(0);
                }
              }}
              onLabel={t('on')}
              offLabel={t('off')}
              theme={theme}
            />
            <VolumeRow
              value={sfxVolume}
              min={0}
              max={100}
              step={1}
              onChange={(next: number) => {
                setSfxVolume(next);
                if (next <= 0) {
                  setSfxEnabled(false);
                } else if (!sfxEnabled) {
                  setSfxEnabled(true);
                }
              }}
              onPreview={() => playSound('tap')}
              theme={theme}
              isMuted={!sfxEnabled || sfxVolume <= 0}
            />
          </SettingsCard>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={styles.backButton}
          onClick={() => {
            playSound('tap');
            navigate(-1);
          }}
        >
          {React.createElement(IoArrowBack as any, { size: 20, color: '#FFFFFF' })}
          <span>{t('back')}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

function SettingsCard({ icon, title, subtitle, theme, delay, children, fullWidth }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={getCardStyle(theme, fullWidth)}
    >
      <div style={styles.cardHeader(theme)}>
        <div style={styles.cardIcon(theme)}>
          {React.createElement(icon as any, { size: 20, color: theme.primary })}
        </div>
        <div>
          <div style={styles.cardTitle(theme)}>{title}</div>
          <div style={styles.cardSubtitle(theme)}>{subtitle}</div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function OptionRow({ options, selected, onSelect, playSound, theme, columns }: any) {
  return (
    <div style={styles.optionRow(columns)}>
      {options.map((opt: any) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          onClick={() => {
            playSound('tap');
            onSelect(opt.value);
          }}
          style={getOptionStyle(theme, selected === opt.value)}
        >
          <div style={styles.optionIcon(selected)}>
            {React.createElement(opt.icon as any, {
              size: 18,
              color: selected === opt.value ? '#FFFFFF' : theme.text,
            })}
          </div>
          <span style={getOptionTextStyle(theme, selected === opt.value)}>{opt.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function ToggleRow({ value, onChange, onLabel, offLabel, theme }: any) {
  return (
    <div style={styles.toggleRow}>
      <button
        style={styles.toggleButton(theme, !value)}
        onClick={() => onChange(false)}
      >
        {offLabel}
      </button>
      <button
        style={styles.toggleButton(theme, value)}
        onClick={() => onChange(true)}
      >
        {onLabel}
      </button>
    </div>
  );
}

function VolumeRow({ value, min, max, step, onChange, onPreview, theme, isMuted }: any) {
  const VolumeIcon = isMuted
    ? IoVolumeMute
    : value >= 66
      ? IoVolumeHigh
      : value >= 33
        ? IoVolumeMedium
        : IoVolumeLow;
  return (
    <div style={styles.volumeRow}>
      <div style={styles.volumeLabel(theme)}>
        {React.createElement(VolumeIcon as any, { size: 16, color: theme.textSecondary })}
        <span style={styles.volumeText(theme)}>{Math.round(value)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onPreview}
        onTouchEnd={onPreview}
        style={styles.slider}
      />
    </div>
  );
}
const getOptionStyle = (theme: any, selected: boolean) => ({
  padding: '14px 10px',
  borderRadius: 14,
  background: selected
    ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
    : theme.surface,
  border: `2px solid ${selected ? theme.primary : theme.border}`,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
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
  fontSize: 12,
  color: selected ? '#FFFFFF' : theme.text,
  fontWeight: selected ? 700 : 600,
  textShadow: selected ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
  whiteSpace: 'nowrap' as const,
});

const getCardStyle = (theme: any, fullWidth?: boolean) => ({
  backgroundColor: theme.surface,
  padding: 20,
  borderRadius: 20,
  border: `2px solid ${theme.cardBorder}`,
  boxShadow: `0 4px 16px ${theme.cardShadow}, 0 2px 4px ${theme.shadow}`,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 16,
  gridColumn: fullWidth ? '1 / -1' : undefined,
});

const styles = {
  cardHeader: (theme: any) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  }),
  cardIcon: (theme: any) => ({
    width: 36,
    height: 36,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.accent}20 100%)`,
  }),
  cardTitle: (theme: any) => ({
    fontSize: 18,
    fontWeight: 800,
    color: theme.text,
  }),
  cardSubtitle: (theme: any) => ({
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: 600,
  }),
  optionRow: (columns: number) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 10,
  }),
  optionIcon: (selected: boolean) => ({
    width: 28,
    height: 28,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: selected ? 'rgba(255,255,255,0.2)' : 'transparent',
  }),
  toggleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  volumeRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: 12,
  },
  volumeLabel: (theme: any) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: 700,
  }),
  volumeText: (theme: any) => ({
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: 700,
  }),
  slider: {
    width: '100%',
    accentColor: '#7b8cff',
  },
  toggleButton: (theme: any, selected: boolean) => ({
    padding: '14px 12px',
    borderRadius: 12,
    background: selected
      ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
      : theme.surface,
    border: `2px solid ${selected ? theme.primary : theme.border}`,
    color: selected ? '#FFFFFF' : theme.text,
    fontWeight: selected ? 800 : 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: selected
      ? `0 6px 16px ${theme.primary}30, 0 2px 6px ${theme.shadow}`
      : `0 2px 8px ${theme.cardShadow}`,
  }),
};
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
    maxWidth: 720,
    width: '100%',
    position: 'relative' as const,
    zIndex: 1,
  },
  header: {
    marginBottom: 26,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.accent}20 100%)`,
    filter: `drop-shadow(0 8px 18px ${theme.primary}30)`,
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 900,
    margin: 0,
    padding: 0,
    letterSpacing: '-1px',
    color: theme.text,
    position: 'relative' as const,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: 600,
    marginTop: 6,
  },
  grid: (isNarrow: boolean) => ({
    display: 'grid',
    gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr',
    gap: 16,
    marginBottom: 22,
  }),
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
  },
});
