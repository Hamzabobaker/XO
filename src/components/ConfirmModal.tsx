// src/components/ConfirmModal.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  if (!visible) return null;

  // Inline simple help SVG to avoid react-icons TS issues
  const HelpIcon = (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
      aria-hidden
    >
      <circle cx="12" cy="12" r="11" stroke={theme.secondary} strokeWidth="2" fill="none" />
      <path
        d="M9.5 9.5a1.75 1.75 0 1 1 3.5 0c0 .966-1 1.5-1.25 1.75-.3.3-.25 1.25-.25 1.25"
        stroke={theme.secondary}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="12" cy="17" r="0.75" fill={theme.secondary} />
    </svg>
  );

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 16 }}
          style={{
            background: theme.surface,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 420,
            textAlign: 'center' as const,
            boxShadow: `0 12px 30px ${theme.shadow}`,
          }}
        >
          <div style={{ marginBottom: 12 }}>{HelpIcon}</div>

          <div style={{ fontSize: 20, fontWeight: 700, color: theme.text }}>{title}</div>
          <div style={{ color: theme.textSecondary, marginTop: 8 }}>{message}</div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                background: theme.surfaceVariant,
                border: '1px solid ' + theme.border,
                cursor: 'pointer',
              }}
            >
              {t('cancel')}
            </button>

            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                background: theme.secondary,
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {t('confirm')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    // portal target
    (typeof document !== 'undefined' && document.body) || (null as any)
  );
}