// src/components/ResultModal.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onRestart: () => void;
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
}

/* Simple inline SVG icons (avoids react-icons type/runtime problems) */
const TrophyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 4h14v2a5 5 0 0 1-4 4.9V12a6 6 0 0 1-6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 6a5 5 0 0 1-2-1.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 6a5 5 0 0 0 2-1.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HandPaperIcon: React.FC<{ size?: number; color?: string }> = ({ size = 56, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M8 9v6a4 4 0 0 0 4 4h0" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 5v6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 7v6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RedoIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 7v6h-6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17a9 9 0 0 1 9-9h6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeftIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M19 12H5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 18l-6-6 6-6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ResultModal({
  visible,
  title,
  message,
  onRestart,
  onClose,
  theme,
  t,
}: ResultModalProps) {
  const isDraw = message ? message.includes(t("itsADraw")) : false;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="result-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: theme.modalOverlay,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 16,
          }}
          aria-hidden={!visible}
        >
          <motion.div
            key="result-modal"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 420,
              textAlign: "center" as const,
              boxShadow: `0 12px 30px ${theme.shadow || "rgba(0,0,0,0.12)"}`,
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div style={{ marginBottom: 16 }}>
              {isDraw ? (
                <HandPaperIcon size={56} color={theme.textSecondary} />
              ) : (
                <TrophyIcon size={56} color={theme.primary} />
              )}
            </div>

            <h2 style={{ fontSize: 28, fontWeight: 700, color: theme.text, margin: 0, marginBottom: 8 }}>{title}</h2>

            {message && (
              <p style={{ fontSize: 16, color: theme.textSecondary, marginTop: 8, marginBottom: 20 }}>{message}</p>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={onRestart}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  backgroundColor: theme.primary,
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                aria-label={t("restart")}
              >
                <RedoIcon size={18} color="#fff" />
                <span>{t("restart")}</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  backgroundColor: theme.surfaceVariant || theme.textSecondary,
                  color: theme.text,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: `1px solid ${theme.border}`,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
                aria-label={t("back")}
              >
                <ArrowLeftIcon size={18} color={theme.text} />
                <span>{t("back")}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}