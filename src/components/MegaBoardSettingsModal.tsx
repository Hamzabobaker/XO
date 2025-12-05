// src/components/MegaBoardSettingsModal.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MegaBoardSettings {
  boardSize: 4 | 5 | 7 | 8 | 9;
  winLength: number;
}

interface MegaBoardSettingsModalProps {
  visible: boolean;
  settings: MegaBoardSettings;
  onSave: (settings: MegaBoardSettings) => void;
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
}

/**
 * Small SVG icons to avoid react-icons TS runtime/type issues.
 */
const CloseIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function MegaBoardSettingsModal({
  visible,
  settings,
  onSave,
  onClose,
  theme,
  t,
}: MegaBoardSettingsModalProps) {
  const [local, setLocal] = useState<MegaBoardSettings>(settings);

  useEffect(() => {
    if (visible) setLocal(settings);
  }, [visible, settings]);

  const boardOptions: MegaBoardSettings["boardSize"][] = [4, 5, 7, 8, 9];

  // when board size changes, clamp winLength to new board size (and min 3)
  const setBoardSize = (size: MegaBoardSettings["boardSize"]) => {
    const clamped = Math.max(3, Math.min(size, local.winLength));
    setLocal({ boardSize: size, winLength: Math.min(local.winLength, size) });
  };

  const setWinLength = (len: number) => {
    const clamped = Math.max(3, Math.min(local.boardSize, Math.floor(len)));
    setLocal({ ...local, winLength: clamped });
  };

  const handleSave = () => {
    // final clamp & types
    const final: MegaBoardSettings = {
      boardSize: local.boardSize,
      winLength: Math.max(3, Math.min(local.winLength, local.boardSize)),
    };
    onSave(final);
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
            position: "fixed",
            inset: 0,
            backgroundColor: theme.modalOverlay,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            style={{
              width: "100%",
              maxWidth: 560,
              backgroundColor: theme.surface,
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: theme.text }}>{t("megaBoardSettings") || "Mega board settings"}</h3>
                <div style={{ fontSize: 13, color: theme.textSecondary }}>{t("chooseBoardAndWin") || "Board size & win length"}</div>
              </div>
              <button
                onClick={onClose}
                aria-label="close"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: theme.surfaceVariant,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <CloseIcon size={18} color={theme.text} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 8 }}>{t("boardSize") || "Board size"}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {boardOptions.map((size) => {
                    const selected = local.boardSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setBoardSize(size)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: `2px solid ${selected ? theme.primary : theme.border}`,
                          background: selected ? theme.primary : theme.surface,
                          color: selected ? "#fff" : theme.text,
                          cursor: "pointer",
                        }}
                      >
                        {size} × {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 8 }}>{t("winLength") || "Win length"}</div>

                {/* Chips for quick selection (3 .. boardSize) */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {Array.from({ length: local.boardSize - 2 }, (_, i) => i + 3).map((n) => {
                    const selected = local.winLength === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setWinLength(n)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 20,
                          border: `2px solid ${selected ? theme.primary : theme.border}`,
                          background: selected ? theme.primary : theme.surface,
                          color: selected ? "#fff" : theme.text,
                          cursor: "pointer",
                        }}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>

                {/* Range input as alternative control */}
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input
                    type="range"
                    min={3}
                    max={local.boardSize}
                    value={local.winLength}
                    onChange={(e) => setWinLength(Number(e.target.value))}
                    style={{ flex: 1 }}
                  />
                  <div style={{ minWidth: 44, textAlign: "center", fontWeight: 600, color: theme.text }}>{local.winLength}</div>
                </div>
              </div>

              <div style={{ color: theme.textSecondary, fontSize: 13 }}>
                {t("megaBoardNote") ||
                  "Larger boards need a longer line to win. Win length cannot exceed board size."}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 12, padding: 16, borderTop: `1px solid ${theme.border}`, justifyContent: "flex-end" }}>
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
                {t("cancel") || "Cancel"}
              </button>

              <button
                onClick={handleSave}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: theme.primary,
                  color: "#fff",
                  display: "inline-flex",
                  gap: 8,
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <CheckIcon size={16} color="#fff" />
                <span>{t("apply") || "Apply"}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}