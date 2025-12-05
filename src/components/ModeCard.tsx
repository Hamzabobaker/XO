import React from 'react';
import { IconType } from 'react-icons';
import { renderIcon } from '../utils/renderIcon';

interface ModeCardProps {
  id: string;
  title: string;
  description: string;
  icon: IconType | React.ElementType; // Icon component
  isSelected: boolean;
  isComingSoon?: boolean;
  badge?: string;
  onPress: () => void;
  onLongPress?: () => void;
  theme: any;
  t: (key: string) => string;
}

export default function ModeCard({
  title,
  description,
  icon: Icon,
  isSelected,
  isComingSoon = false,
  badge,
  onPress,
  theme,
  t,
}: ModeCardProps) {
  return (
    <div
      onClick={isComingSoon ? undefined : onPress}
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
      }}
    >
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
          }}
        >
          {renderIcon(Icon, { size: 28, color: isSelected ? '#FFFFFF' : theme.primary })}
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
        }}
      >
        {description}
      </p>

      {isComingSoon && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
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
    </div>
  );
}
