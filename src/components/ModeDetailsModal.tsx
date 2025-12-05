// src/components/ModeDetailsModal.tsx
import React, { CSSProperties } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Mode {
  id?: string;
  title: string;
  description?: string;
  fullDescription?: string;
  isComingSoon?: boolean;
  // icon may exist in original app but we avoid rendering external icon components
  // to prevent the react-icons/TS issues seen before.
}

interface ModeDetailsModalProps {
  visible: boolean;
  mode: Mode | null;
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
}

/**
 * Small inline SVG Close icon to avoid react-icons typing/runtime issues.
 */
const CloseIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18L18 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Simple placeholder icon (circle with letter) used instead of external icon components.
 * Keeps layout similar to mobile app where an icon sits in a rounded square.
 */
const PlaceholderIcon = ({ label = "M", size = 36, bg = "#00000020", color = "currentColor" }: { label?: string; size?: number; bg?: string; color?: string }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.2),
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      color,
      fontSize: Math.round(size * 0.45),
      userSelect: "none",
    }}
    aria-hidden
  >
    {label[0]?.toUpperCase() || "M"}
  </div>
);

export default function ModeDetailsModal({ visible, mode, onClose, theme, t }: ModeDetailsModalProps) {
  if (!visible || !mode) return null;

  // Use portal to document.body
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: theme.modalOverlay,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.97, y: 8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.97, y: 8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
          style={{
            width: "100%",
            maxWidth: 680,
            maxHeight: "86vh",
            overflowY: "auto",
            borderRadius: 16,
            background: theme.surface,
            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
          }}
          role="dialog"
          aria-modal="true"
          aria-label={mode.title}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: theme.primary + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* show placeholder initial to avoid react-icons runtime/type issues */}
                <PlaceholderIcon label={mode.title || "M"} size={44} bg={theme.primary + "20"} color={theme.primary} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{mode.title}</div>
                {mode.description && <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>{mode.description}</div>}
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label={t("close") || "Close"}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: theme.surfaceVariant,
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginLeft: 12,
              }}
            >
              <CloseIcon size={18} color={theme.text} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ color: theme.textSecondary, fontSize: 14 }}>
              {mode.fullDescription || mode.description || t("noDescription") || "No description available."}
            </div>

            {/* Additional info area — keep structure for future expansion */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
              {mode.isComingSoon && (
                <div style={{ padding: "8px 12px", borderRadius: 12, background: theme.textSecondary, color: "#fff", fontWeight: 700 }}>
                  {t("comingSoon") || "Coming soon"}
                </div>
              )}

              {/* Example placeholder metadata (you can expand this later) */}
              <div style={{ padding: "8px 12px", borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.surfaceVariant, color: theme.text }}>
                {t("modeId") || "Mode"}: {mode.id ?? "-"}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: 16, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.border}`,
                background: theme.surfaceVariant,
                color: theme.text,
                cursor: "pointer",
              }}
            >
              {t("close") || "Close"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    typeof document !== "undefined" ? document.body : (null as unknown as Element)
  );
}