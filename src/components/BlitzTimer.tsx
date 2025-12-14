// src/components/BlitzTimer.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  timeLeft: number;      // seconds with decimals from Game.tsx
  totalTime: number;
  isActive: boolean;
  theme: any;
  size?: number;         // rectangle height (default 70)
  playerLabel?: string;
  t?: (key: string) => string;
}

export default function BlitzTimer({
  timeLeft,
  totalTime,
  isActive,
  theme,
  size = 70,
  playerLabel,
  t,
}: Props) {
  // Ensure non-negative value
  const safe = Math.max(0, Number(timeLeft) || 0);
  // Format to two decimals (keeps trailing zero)
  const display = safe.toFixed(2);

  const secsRounded = Math.ceil(safe);
  const isLow = secsRounded <= 3;
  const isCritical = secsRounded <= 1;

  const playerColor = playerLabel === 'X' ? theme.xColor : theme.oColor;
  const barColor = isCritical ? theme.secondary : isLow ? '#F59E0B' : playerColor;

  const rectWidth = size * 1.8;
  const percentage = totalTime > 0 ? Math.max(0, Math.min(100, (safe / totalTime) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: rectWidth }}>
      <motion.div
        animate={isCritical && isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ repeat: isCritical && isActive ? Infinity : 0, duration: 0.6 }}
        style={{
          width: rectWidth,
          height: size,
          borderRadius: 12,
          background: theme.surface,
          border: `3px solid ${barColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          boxShadow: `0 6px 18px ${barColor}25`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* progress background */}
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            background: `linear-gradient(90deg, ${barColor}20, ${barColor}08)`,
            zIndex: 0,
          }}
        />

        {/* Time text — using the same simple font style as your old file */}
        <div
          aria-live="polite"
          style={{
            zIndex: 1,
            fontSize: size * 0.45, // same scale as old file
            fontWeight: 700,       // same as old file
            color: isLow ? theme.secondary : theme.text,
            // NOTE: no custom fontFamily — uses app/default font like the old file
            letterSpacing: '0.01em',
            textShadow: isActive ? `0 3px 12px ${barColor}50` : `0 1px 3px ${theme.shadow}`,
            lineHeight: 1,
            minWidth: rectWidth - 28,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {display}
        </div>
      </motion.div>

      {playerLabel && (
        <div
          style={{
            marginTop: 8,
            padding: '4px 8px',
            borderRadius: 12,
            border: `1.5px solid ${playerColor}`,
            background: playerColor + '20',
          }}
        >
          <div style={{ color: playerColor, fontWeight: 600, fontSize: 13 }}>
            {t ? t('player') : 'Player'} {playerLabel}
          </div>
        </div>
      )}
    </div>
  );
}
