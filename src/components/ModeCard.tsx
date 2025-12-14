// src/components/ModeCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ModeCardProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  isSelected: boolean;
  isComingSoon?: boolean;
  badge?: string;
  onPress: () => void;
  onLongPress?: () => void;
  theme: any;
  t: (key: string) => string;
  isRTL?: boolean;
}

export default function ModeCard({
  title,
  description,
  icon,
  isSelected,
  isComingSoon = false,
  badge,
  onPress,
  theme,
  t,
  isRTL = false,
}: ModeCardProps) {
  return (
    <motion.div
      whileHover={!isComingSoon ? { y: -4, scale: 1.02 } : {}}
      whileTap={!isComingSoon ? { scale: 0.98 } : {}}
      transition={{
        scale: { duration: 0.2, ease: 'easeOut' },
        y: { duration: 0 },
      }}
      onClick={isComingSoon ? undefined : onPress}
      onTouchStart={(e) => {
        if (!isComingSoon) {
          e.currentTarget.style.borderColor = theme.primary;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 16px ${theme.shadow}`;
        }
      }}
      onTouchEnd={(e) => {
        if (!isComingSoon) {
          e.currentTarget.style.borderColor = isSelected ? theme.primary : theme.border;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
        }
      }}
      onMouseEnter={(e) => {
        if (!isComingSoon) {
          e.currentTarget.style.borderColor = theme.primary;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 16px ${theme.shadow}`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isComingSoon) {
          e.currentTarget.style.borderColor = isSelected ? theme.primary : theme.border;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${theme.shadow}`;
        }
      }}
      style={{
        backgroundColor: isSelected ? theme.primary + '15' : theme.surface,
        borderRadius: 16,
        padding: 20,
        border: `2px solid ${isSelected ? theme.primary : theme.border}`,
        minHeight: 200,
        cursor: isComingSoon ? 'not-allowed' : 'pointer',
        opacity: isComingSoon ? 0.5 : 1,
        position: 'relative',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isSelected
          ? `0 8px 24px ${theme.primary}20, 0 4px 8px ${theme.shadow}`
          : `0 4px 12px ${theme.cardShadow}, 0 2px 4px ${theme.shadow}`,
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        userSelect: 'none' as const,
      }}
    >
      {!isComingSoon && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute' as const,
            inset: -2,
            background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.accent}15 100%)`,
            borderRadius: 16,
            pointerEvents: 'none' as const,
            filter: 'blur(8px)',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            backgroundColor: isSelected ? theme.primary : theme.primary + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            backdropFilter: 'blur(6px)',
          }}
        >
          {React.createElement(icon as any, { size: 28, color: isSelected ? '#FFFFFF' : theme.primary })}
        </div>
        {badge && (
          <div
            style={{
              backgroundColor: theme.secondary,
              padding: '4px 8px',
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
          >
            <span style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 600 }}>{badge}</span>
          </div>
        )}
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: isComingSoon ? theme.textSecondary : theme.text,
          margin: 0,
          marginBottom: 6,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 12,
          color: theme.textSecondary,
          lineHeight: '17px',
          opacity: isComingSoon ? 0.6 : 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          margin: 0,
          flex: 1,
        }}
      >
        {description}
      </p>

      {isComingSoon && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: isRTL ? 8 : undefined,
            right: isRTL ? undefined : 8,
            backgroundColor: theme.textSecondary,
            padding: '4px 10px',
            borderRadius: 12,
          }}
        >
          <span style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 600 }}>
            {t('comingSoon')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
