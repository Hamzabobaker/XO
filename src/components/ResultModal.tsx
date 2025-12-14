// src/components/ResultModal.tsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoTrophy,
  IoHandLeftOutline,
  IoRefresh,
  IoHome,
  IoCloseCircle,
  IoSparkles,
} from "react-icons/io5";

interface ResultModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onRestart: () => void;
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
  winner?: "X" | "O" | "draw" | null;
  isDraw?: boolean;
}

export default function ResultModal({
  visible,
  title,
  message,
  onRestart,
  onClose,
  theme,
  t,
  winner,
  isDraw = false,
}: ResultModalProps) {
  const isVictory = !!message && message.includes(t("youWin"));
  const isDefeat = !!message && message.includes(t("youLose"));

  const [showConfetti, setShowConfetti] = useState(false);
  const [showStars, setShowStars] = useState(false);

  // ✅ Button cooldown state
  const [buttonsEnabled, setButtonsEnabled] = useState(false);

  // Confetti & stars timing
  useEffect(() => {
    if (visible && !isDraw && !isDefeat) {
      const confettiTimer = setTimeout(() => setShowConfetti(true), 150);
      const starsTimer = setTimeout(() => setShowStars(true), 300);
      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(starsTimer);
      };
    } else {
      setShowConfetti(false);
      setShowStars(false);
    }
  }, [visible, isDraw, isDefeat]);

  // Enable buttons shortly after modal becomes visible
  useEffect(() => {
    if (visible) {
      setButtonsEnabled(false);
      // Enable after 1.1s (just before main animations complete)
      const timer = setTimeout(() => setButtonsEnabled(true), 1100);
      return () => clearTimeout(timer);
    } else {
      setButtonsEnabled(false);
    }
  }, [visible]);

  // Confetti particle generator
  const confettiParticles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const distance = 120 + Math.random() * 20;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: [
        theme.primary,
        theme.secondary,
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
      ][i % 5],
      delay: 0.1 + i * 0.015,
      rotate: Math.random() * 720 - 360,
      scale: 0.8 + Math.random() * 0.4,
    };
  });

  // Floating stars for victory
  const stars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -50 - Math.random() * 50,
    delay: 0.3 + i * 0.1,
    duration: 1.5 + Math.random() * 0.5,
  }));

  // Determine icon & colors
  const getResultStyle = () => {
    if (isVictory) {
      return { Icon: IoTrophy, iconColor: theme.primary, iconSize: 72 };
    } else if (isDefeat) {
      return { Icon: IoCloseCircle, iconColor: theme.secondary, iconSize: 72 };
    } else if (isDraw) {
      return {
        Icon: IoHandLeftOutline,
        iconColor: theme.textSecondary,
        iconSize: 64,
      };
    } else {
      return { Icon: IoTrophy, iconColor: theme.primary, iconSize: 72 };
    }
  };

  const style = getResultStyle();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: theme.modalOverlay,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.4,
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 28,
              padding: 40,
              paddingTop: 48,
              paddingBottom: 32,
              width: "100%",
              maxWidth: 420,
              textAlign: "center" as const,
              boxShadow: `0 20px 60px ${theme.shadow}, 0 0 0 1px ${theme.border}`,
              position: "relative",
              overflow: "visible",
            }}
          >
            {/* Confetti explosion */}
            {!isDraw && !isDefeat && showConfetti && (
              <div
                style={{
                  position: "absolute",
                  top: 65,
                  left: "50%",
                  pointerEvents: "none",
                  zIndex: 1,
                  transform: "translateX(-50%)",
                }}
              >
                {confettiParticles.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0 }}
                    animate={{
                      x: particle.x,
                      y: particle.y,
                      opacity: [0, 1, 1, 0.7, 0],
                      rotate: particle.rotate,
                      scale: [
                        0,
                        particle.scale,
                        particle.scale,
                        particle.scale * 0.5,
                        0,
                      ],
                    }}
                    transition={{
                      delay: particle.delay,
                      duration: 1.2,
                      times: [0, 0.15, 0.5, 0.85, 1],
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    style={{
                      position: "absolute",
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: particle.color,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Floating stars */}
            {isVictory && showStars && (
              <>
                {stars.map((star) => (
                  <motion.div
                    key={star.id}
                    initial={{ x: star.x, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      y: star.y,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      delay: star.delay,
                      duration: star.duration,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      top: "30%",
                      left: "50%",
                      pointerEvents: "none",
                      transform: "translateX(-50%)",
                    }}
                  >
                    {React.createElement(IoSparkles as any, {
                      size: 20,
                      color: "#F59E0B",
                    })}
                  </motion.div>
                ))}
              </>
            )}

            {/* Result icon */}
            <motion.div
              initial={{ scale: 0, rotate: isDefeat ? 0 : -180 }}
              animate={{
                scale: [0, 1.2, 1],
                rotate: isDefeat ? [0, -10, 10, 0] : [0, 360],
              }}
              transition={{
                scale: {
                  delay: 0.1,
                  duration: 0.5,
                  times: [0, 0.6, 1],
                  ease: [0.4, 0, 0.2, 1],
                },
                rotate: {
                  delay: 0.1,
                  duration: isDefeat ? 0.6 : 0.7,
                  ease: isDefeat ? [0.4, 0, 0.2, 1] : "easeOut",
                },
              }}
              style={{
                marginBottom: 24,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {React.createElement((style.Icon as any), {
                size: style.iconSize,
                color: style.iconColor,
              })}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: theme.text,
                margin: 0,
                marginBottom: 12,
                letterSpacing: "-0.5px",
              }}
            >
              {title}
            </motion.h2>

            {/* Message */}
            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                style={{
                  fontSize: 22,
                  color: theme.text,
                  marginTop: 0,
                  marginBottom: 32,
                  fontWeight: 500,
                }}
              >
                {message}
              </motion.p>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
              }}
            >
              {/* Play Again */}
              <motion.button
                whileHover={buttonsEnabled ? { scale: 1.02, y: -2 } : {}}
                whileTap={buttonsEnabled ? { scale: 0.98 } : {}}
                onClick={buttonsEnabled ? onRestart : undefined}
                disabled={!buttonsEnabled}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.primary}dd)`,
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  border: "none",
                  cursor: buttonsEnabled ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  fontSize: 17,
                  boxShadow: `0 4px 16px ${theme.primary}40`,
                  transition: "all 0.2s",
                  opacity: buttonsEnabled ? 1 : 0.6,
                }}
              >
                {React.createElement(IoRefresh as any, { size: 22, color: "#FFFFFF" })}
                <span>{t("playAgain")}</span>
              </motion.button>

              {/* Main Menu */}
              <motion.button
                whileHover={buttonsEnabled ? { scale: 1.02 } : {}}
                whileTap={buttonsEnabled ? { scale: 0.98 } : {}}
                onClick={buttonsEnabled ? onClose : undefined}
                disabled={!buttonsEnabled}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 14,
                  backgroundColor: theme.surfaceVariant,
                  color: theme.text,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  border: `2px solid ${theme.border}`,
                  cursor: buttonsEnabled ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  fontSize: 16,
                  transition: "all 0.2s",
                  opacity: buttonsEnabled ? 1 : 0.6,
                }}
              >
                {React.createElement(IoHome as any, { size: 20, color: theme.text })}
                <span>{t("mainMenu")}</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
