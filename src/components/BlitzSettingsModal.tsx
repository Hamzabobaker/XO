import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IconBaseProps } from 'react-icons';
import * as IoIcons from 'react-icons/io5';

// Wrap icons as functions returning JSX.Element
const CloseIcon = (props: IconBaseProps): JSX.Element => IoIcons.IoClose(props) as JSX.Element;
const CheckIcon = (props: IconBaseProps): JSX.Element => IoIcons.IoCheckmark(props) as JSX.Element;

interface BlitzSettingsModalProps {
  visible: boolean;
  settings: {
    timePerMove: number;
    onTimeout: 'skip' | 'random' | 'lose';
  };
  onSave: (settings: { timePerMove: number; onTimeout: 'skip' | 'random' | 'lose' }) => void;
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
}

export default function BlitzSettingsModal({ visible, settings, onSave, onClose, theme, t }: BlitzSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (visible) setLocalSettings(settings);
  }, [visible, settings]);

  const timeOptions = [5, 10, 15, 20, 30];
  const onTimeoutOptions: Array<'skip' | 'random' | 'lose'> = ['skip', 'random', 'lose'];

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: theme.modalOverlay,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              padding: 20,
              width: '100%',
              maxWidth: 520,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.text }}>{t('blitzSettings')}</h2>
              <button
                onClick={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.surfaceVariant,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <CloseIcon size={24} color={theme.text} />
              </button>
            </div>

            {/* Time per Move */}
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: theme.text, marginBottom: 8 }}>{t('timePerMove')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    onClick={() => setLocalSettings({ ...localSettings, timePerMove: time })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `2px solid ${localSettings.timePerMove === time ? theme.primary : theme.border}`,
                      backgroundColor: localSettings.timePerMove === time ? theme.primary : theme.background,
                      color: localSettings.timePerMove === time ? '#FFF' : theme.text,
                      fontWeight: localSettings.timePerMove === time ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {time}{t('seconds')}
                  </button>
                ))}
              </div>
            </div>

            {/* On Timeout */}
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: theme.text, marginBottom: 8 }}>{t('onTimeout')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {onTimeoutOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setLocalSettings({ ...localSettings, onTimeout: opt })}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: `2px solid ${localSettings.onTimeout === opt ? theme.primary : theme.border}`,
                      backgroundColor: localSettings.onTimeout === opt ? theme.primary : theme.background,
                      color: localSettings.onTimeout === opt ? '#FFF' : theme.text,
                      fontWeight: localSettings.onTimeout === opt ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {t(opt === 'skip' ? 'skipTurn' : opt === 'random' ? 'randomMove' : 'loseOnTimeout')}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              style={{
                backgroundColor: theme.primary,
                color: '#FFF',
                fontWeight: 700,
                padding: 14,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <CheckIcon size={20} color="#FFF" />
              {t('apply')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add this for --isolatedModules
export {};
