// src/components/ConfirmModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoHelpCircle, IoClose, IoCheckmark } from 'react-icons/io5';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  theme: any;
  t: (k: string) => string;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  theme,
  t,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: theme.modalOverlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 140, damping: 16, duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.surface,
              borderRadius: 24,
              padding: 32,
              width: '100%',
              maxWidth: 420,
              textAlign: 'center' as const,
              boxShadow: `0 12px 30px ${theme.shadow}`,
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 120, damping: 12 }}
              style={{ marginBottom: 16 }}
            >
              {React.createElement(IoHelpCircle as any, { size: 56, color: theme.secondary })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
              style={{ fontSize: 24, fontWeight: 700, color: theme.text, marginBottom: 8 }}
            >
              {title}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              style={{
                color: theme.textSecondary,
                marginBottom: 24,
                fontSize: 16,
                lineHeight: '22px',
              }}
            >
              {message}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.2 }}
              style={{ display: 'flex', gap: 12 }}
            >
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 12,
                  background: theme.surfaceVariant,
                  border: `2px solid ${theme.border}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.text,
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = 'scale(0.95)')
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                {React.createElement(IoClose as any, { size: 20, color: theme.text })}
                <span>{t('cancel')}</span>
              </button>

              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: 12,
                  background: theme.secondary,
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 16,
                  fontWeight: 600,
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = 'scale(0.95)')
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'scale(1)')
                }
              >
                {React.createElement(IoCheckmark as any, { size: 20, color: '#FFFFFF' })}
                <span>{t('confirm')}</span>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}