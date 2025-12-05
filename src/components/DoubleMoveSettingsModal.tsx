import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DoubleMoveSettingsModalProps {
  visible: boolean;
  settings: {
    turnsUntilDouble: number;
    maxDoubleMoves: number;
  };
  onSave: (settings: { turnsUntilDouble: number; maxDoubleMoves: number }) => void;
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
}

// Inline icons to avoid TS issues
const CloseIcon = (props: { size?: number; color?: string }) => (
  <svg
    width={props.size || 22}
    height={props.size || 22}
    viewBox="0 0 24 24"
    stroke={props.color || "#000"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InfoIcon = (props: { size?: number; color?: string }) => (
  <svg
    width={props.size || 20}
    height={props.size || 20}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.color || "#000"}
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <circle cx="12" cy="8" r="1" fill={props.color || "#000"} />
  </svg>
);

const CheckIcon = (props: { size?: number; color?: string }) => (
  <svg
    width={props.size || 20}
    height={props.size || 20}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.color || "#fff"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function DoubleMoveSettingsModal({
  visible,
  settings,
  onSave,
  onClose,
  theme,
  t,
}: DoubleMoveSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (visible) setLocalSettings(settings);
  }, [visible, settings]);

  const turnOptions = [1, 2, 3, 4, 5];
  const doubleCountOptions = [1, 2, 3];

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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 24,
              padding: 20,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: theme.text,
                }}
              >
                {t("doubleMoveSettings")}
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.surfaceVariant,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                <CloseIcon size={24} color={theme.text} />
              </button>
            </div>

            {/* Turns until double */}
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                {t("turnsUntilDouble")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {turnOptions.map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setLocalSettings({ ...localSettings, turnsUntilDouble: n })
                    }
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `2px solid ${
                        localSettings.turnsUntilDouble === n
                          ? theme.primary
                          : theme.border
                      }`,
                      backgroundColor:
                        localSettings.turnsUntilDouble === n
                          ? theme.primary
                          : theme.background,
                      color:
                        localSettings.turnsUntilDouble === n
                          ? "#FFF"
                          : theme.text,
                      cursor: "pointer",
                      fontWeight:
                        localSettings.turnsUntilDouble === n ? 700 : 400,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Max double moves */}
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: theme.text,
                  marginBottom: 8,
                }}
              >
                {t("maxDoubleMoves")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {doubleCountOptions.map((n) => (
                  <button
                    key={n}
                    onClick={() =>
                      setLocalSettings({ ...localSettings, maxDoubleMoves: n })
                    }
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `2px solid ${
                        localSettings.maxDoubleMoves === n
                          ? theme.primary
                          : theme.border
                      }`,
                      backgroundColor:
                        localSettings.maxDoubleMoves === n
                          ? theme.primary
                          : theme.background,
                      color:
                        localSettings.maxDoubleMoves === n
                          ? "#FFF"
                          : theme.text,
                      cursor: "pointer",
                      fontWeight:
                        localSettings.maxDoubleMoves === n ? 700 : 400,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: theme.surfaceVariant,
                padding: 12,
                borderRadius: 12,
              }}
            >
              <InfoIcon size={20} color={theme.primary} />
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: theme.text,
                  lineHeight: "18px",
                }}
              >
                {t("doubleMoveExample").replaceAll(
                  "{turns}",
                  localSettings.turnsUntilDouble.toString()
                )}
              </span>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              style={{
                backgroundColor: theme.primary,
                color: "#FFF",
                fontWeight: 700,
                padding: 14,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                border: "none",
              }}
            >
              <CheckIcon size={24} color="#FFF" />
              {t("apply")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}