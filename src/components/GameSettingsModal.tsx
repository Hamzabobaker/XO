// src/components/GameSettingsModal.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoTime,
  IoPeople,
  IoHardwareChip,
  IoInformationCircle,
  IoPlay,
} from "react-icons/io5";

type GameMode = "vsplayer" | "vsbot";
type Difficulty = "easy" | "normal" | "hard" | "impossible";
type Variant =
  | "classic"
  | "infinite"
  | "blitz"
  | "mega"
  | "swap"
  | "reverse";
type PlayerSymbol = "X" | "O";

interface BlitzSettings {
  timePerMove: number;
  onTimeout: "skip" | "random" | "lose";
}
interface MegaBoardSettings {
  boardSize: 4 | 5 | 6 | 7 | 8 | 9;
  winLength: number;
}
interface GameSettingsModalProps {
  visible: boolean;
  variant: Variant | null;
  variantTitle: string;
  variantDescription: string;
  availableDifficulties: string[];
  onClose: () => void;
  theme: any;
  t: (key: string) => string;
  blitzSettings: BlitzSettings;
  megaBoardSettings: MegaBoardSettings;
}

// ✅ PERSISTENT SETTINGS - stored outside component to remember between opens
let savedSettings = {
  // mode is NOT saved - always starts unselected
  symbol: "X" as PlayerSymbol,
  difficulty: "easy" as Difficulty, // ✅ Changed to "easy" as default
  botStarts: false,
  blitz: { timePerMove: 10, onTimeout: "lose" as "skip" | "random" | "lose" },
  mega: { boardSize: 5 as 4 | 5 | 6 | 7 | 8 | 9, winLength: 4 },
};

export default function GameSettingsModal({
  visible,
  variant,
  variantTitle,
  variantDescription,
  availableDifficulties,
  onClose,
  theme,
  t,
  blitzSettings: initialBlitzSettings,
  megaBoardSettings: initialMegaBoardSettings,
}: GameSettingsModalProps) {
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("normal");
  const [selectedSymbol, setSelectedSymbol] = useState<PlayerSymbol>("X");
  const [blitzSettings, setBlitzSettings] = useState<BlitzSettings>(initialBlitzSettings);
  const [megaBoardSettings, setMegaBoardSettings] = useState<MegaBoardSettings>(initialMegaBoardSettings);
  const [botStarts, setBotStarts] = useState(false);

  // ✅ Track if mode was JUST selected (for animation)
  const [modeJustSelected, setModeJustSelected] = useState(false);

useEffect(() => {
  if (visible && variant) {
    setSelectedMode(null); // ✅ Always reset mode to unselected
    setSelectedSymbol(savedSettings.symbol);
    setSelectedDifficulty(savedSettings.difficulty); // ✅ Use saved difficulty
    setBlitzSettings(savedSettings.blitz);
    // Sanitize saved mega settings to ensure winLength is valid for its boardSize
    const size = savedSettings.mega.boardSize as number;
    const minLength = size >= 7 ? 5 : 4;
    let maxLength = 6;
    if (size >= 8) maxLength = 8;
    else if (size >= 7) maxLength = 7;
    const allowed: number[] = [];
    for (let i = minLength; i <= Math.min(size, maxLength); i++) allowed.push(i);
    const sanitizedWin = allowed.includes(savedSettings.mega.winLength)
      ? savedSettings.mega.winLength
      : (minLength);
    setMegaBoardSettings({
      boardSize: savedSettings.mega.boardSize as MegaBoardSettings['boardSize'],
      winLength: sanitizedWin,
    });
    setBotStarts(savedSettings.botStarts);
    setModeJustSelected(false);
  }
}, [visible, variant]);

  const isComingSoon = variant === "swap" || variant === "reverse";
  const isMegaMode = variant === "mega";
  const isBlitzMode = variant === "blitz";
  const isBotAvailable = true;

  const difficultyOptions: Difficulty[] = (
    availableDifficulties && availableDifficulties.length > 0
      ? availableDifficulties
      : ["easy", "normal", "hard"]
  ) as Difficulty[];

  const isModeChosen = selectedMode !== null;

  const handleStartGame = () => {
    if (isComingSoon || !isModeChosen) return;

  savedSettings = {
  symbol: selectedSymbol, // ✅ Mode NOT saved
  difficulty: selectedDifficulty,
  botStarts,
  blitz: blitzSettings,
  mega: megaBoardSettings,
};

    const params = new URLSearchParams({
      mode: selectedMode as string,
      difficulty: selectedDifficulty,
      variant: variant ?? "classic",
      playerSymbol: selectedSymbol,
      botStarts: botStarts.toString(),
    });

    if (isBlitzMode) {
      params.append("timePerMove", blitzSettings.timePerMove.toString());
      params.append("onTimeout", blitzSettings.onTimeout);
    }

    if (isMegaMode) {
      params.append("boardSize", megaBoardSettings.boardSize.toString());
      params.append("winLength", megaBoardSettings.winLength.toString());
    }

    onClose();
    navigate(`/game?${params.toString()}`);
  };

  const getRecommendedWinLength = (size: number) => {
    if (size <= 6) return 4; // keep 4 for small boards
    // For 7×7 and above, prefer 5 as the recommended default
    return 5;
  };

  const getWinLengthOptions = (size: number) => {
    const options: number[] = [];
    const minLength = size >= 7 ? 5 : 4; // remove 4 for 7×7+
    let maxLength = 6;
    if (size >= 8) maxLength = 8; // add 8 option starting at 8×8
    else if (size >= 7) maxLength = 7;
    const upper = Math.min(size, maxLength);
    for (let i = minLength; i <= upper; i++) options.push(i);
    return options;
  };

  const handleBoardSizeChange = (size: 4 | 5 | 6 | 7 | 8 | 9) => {
    const recommended = getRecommendedWinLength(size);
    setMegaBoardSettings({
      boardSize: size,
      winLength: recommended,
    });
  };

  // ✅ FIXED: Only trigger animation when mode is selected
  const handleModeSelect = (mode: GameMode) => {
    const wasUnselected = selectedMode === null;
    setSelectedMode(mode);
    if (wasUnselected) {
      setModeJustSelected(true);
      setTimeout(() => setModeJustSelected(false), 600);
    }
  };

  // Calculate step numbers dynamically
  let currentStep = 1;
  const modeStep = currentStep++;
  const symbolStep = isModeChosen ? currentStep++ : 0;
  const botStartsStep = selectedMode === "vsbot" && isModeChosen ? currentStep++ : 0;
  const difficultyStep = selectedMode === "vsbot" && isBotAvailable ? currentStep++ : 0;
  const variantStep1 = isBlitzMode || isMegaMode ? currentStep++ : 0;
  const variantStep2 = isMegaMode ? currentStep++ : 0;

  // Reusable Components
  const StepBadge = ({ number }: { number: number }) => (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
        {number}
      </span>
    </div>
  );

  const EnhancedCard = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        backgroundColor: theme.background,
        border: `2px solid ${theme.border}`,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );

  const EnhancedModeButton = ({
    icon,
    label,
    sublabel,
    isSelected,
    onClick,
    theme,
    disabled = false,
  }: any) => (
    <motion.button
      whileHover={!disabled ? { y: -3, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: 20,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        border: `3px solid ${isSelected ? theme.primary : theme.border}`,
        background: isSelected
          ? `linear-gradient(135deg, ${theme.primary}18 0%, ${theme.primary}0a 100%)`
          : theme.surface,
        cursor: disabled ? "not-allowed" : "pointer",
        minHeight: 130,
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        boxShadow: isSelected
          ? `0 8px 24px ${theme.primary}25, 0 0 0 1px ${theme.primary}30 inset`
          : `0 2px 8px ${theme.shadow}`,
      }}
    >
      {/* ✅ ONLY show glow if selected AND animation is active */}
      {isSelected && modeJustSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: -2,
            background: `radial-gradient(circle at 50% 50%, ${theme.primary}18, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          background: isSelected
            ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`
            : `${theme.primary}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected ? `0 6px 16px ${theme.primary}35` : "none",
          transition: "all 0.25s",
        }}
      >
        {React.createElement(icon as any, { size: 26, color: isSelected ? "#FFFFFF" : theme.primary })}
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: isSelected ? 800 : 700,
            color: isSelected ? theme.primary : theme.text,
            marginBottom: 5,
            letterSpacing: "-0.2px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: theme.textSecondary,
            lineHeight: "16px",
            fontWeight: 500,
          }}
        >
          {sublabel}
        </div>
      </div>
    </motion.button>
  );

  const EnhancedChip = ({ label, isSelected, onClick, theme, color, disabled = false }: any) => (
    <motion.button
      whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: "16px 14px",
        borderRadius: 14,
        border: `3px solid ${isSelected ? (color || theme.primary) : theme.border}`,
        background: isSelected
          ? (color ? `${color}18` : `linear-gradient(135deg, ${theme.primary}18, ${theme.accent}0e)`)
          : theme.surface,
        color: isSelected ? (color || theme.primary) : theme.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: isSelected ? 800 : 600,
        fontSize: 15,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.5 : 1,
        boxShadow: isSelected 
          ? `0 4px 12px ${(color || theme.primary)}25, 0 0 0 1px ${(color || theme.primary)}20 inset`
          : `0 2px 6px ${theme.shadow}`,
        textAlign: 'center',
        letterSpacing: '-0.2px',
      }}
    >
      {label}
    </motion.button>
  );

  const InfoBox = ({ icon, text, theme }: any) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: `${theme.primary}10`,
        padding: 14,
        borderRadius: 12,
        marginTop: 14,
        border: `1.5px solid ${theme.primary}25`,
      }}
    >
      {React.createElement(icon as any, { size: 18, color: theme.primary, style: { flexShrink: 0, marginTop: 2 } })}
      <span style={{ fontSize: 12, color: theme.text, lineHeight: "18px", flex: 1 }}>
        {text}
      </span>
    </div>
  );

  const CardHeader = ({
    stepNumber,
    title,
  }: {
    stepNumber: number;
    title: string;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <StepBadge number={stepNumber} />
      <span style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>
        {title}
      </span>
    </div>
  );

  const winLengthOptions = getWinLengthOptions(megaBoardSettings.boardSize);

  return (
    <AnimatePresence mode="wait">
      {visible && variant && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.08 }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: theme.modalOverlay,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.surface,
              borderRadius: 28,
              border: `2px solid ${theme.cardBorder}`,
              boxShadow: `0 20px 60px ${theme.shadow}, 0 0 0 1px ${theme.border}`,
              width: "100%",
              maxWidth: 520,
              overflow: "hidden",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: 24,
                paddingBottom: 16,
                borderBottom: `2px solid ${theme.border}`,
                background: `linear-gradient(135deg, ${theme.primary}05 0%, transparent 100%)`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, marginRight: 12 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 700,
                    color: theme.text,
                    marginBottom: 4,
                  }}
                >
                  {variantTitle}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: theme.textSecondary,
                    lineHeight: "18px",
                  }}
                >
                  {variantDescription}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  borderRadius: 18,
                  backgroundColor: theme.surfaceVariant,
                  width: 36,
                  height: 36,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {React.createElement(IoClose as any, { size: 22, color: theme.text })}
              </button>
            </div>

            {/* Body - Scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 24,
                paddingBottom: 32,
              }}
            >
              {isComingSoon ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  {React.createElement(IoTime as any, { size: 64, color: theme.textSecondary })}
                  <h3
                    style={{
                      color: theme.text,
                      marginTop: 12,
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {t("comingSoon")}
                  </h3>
                  <p style={{ color: theme.textSecondary, fontSize: 14 }}>
                    {t("underDevelopment")}
                  </p>
                </div>
              ) : (
                <>
                  {/* STEP 1: Mode Selection */}
                  <EnhancedCard>
                    <CardHeader stepNumber={modeStep} title={t("mode")} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <EnhancedModeButton
                        icon={IoPeople}
                        label={t("vsplayer")}
                        sublabel={t("playTogether")}
                        isSelected={selectedMode === "vsplayer"}
                        onClick={() => handleModeSelect("vsplayer")}
                        theme={theme}
                      />
                      <EnhancedModeButton
                        icon={IoHardwareChip}
                        label={t("vsbot")}
                        sublabel={t("playAlone")}
                        isSelected={selectedMode === "vsbot"}
                        onClick={() => handleModeSelect("vsbot")}
                        theme={theme}
                        disabled={!isBotAvailable}
                      />
                    </div>
                  </EnhancedCard>

                  {/* ✅ ROLLING ANIMATION - Rest appears smoothly after mode selection */}
                  <AnimatePresence>
                    {isModeChosen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {/* Symbol Selection */}
                        <EnhancedCard>
                          <CardHeader
                            stepNumber={symbolStep}
                            title={selectedMode === "vsbot" ? t("playAs") : t("startingPlayer")}
                          />
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                            <EnhancedChip
                              label="X"
                              isSelected={selectedSymbol === "X"}
                              onClick={() => setSelectedSymbol("X")}
                              theme={theme}
                              color={theme.xColor}
                            />
                            <EnhancedChip
                              label="O"
                              isSelected={selectedSymbol === "O"}
                              onClick={() => setSelectedSymbol("O")}
                              theme={theme}
                              color={theme.oColor}
                            />
                          </div>
                        </EnhancedCard>

                        {/* Who Starts (VS Bot only) */}
                        {selectedMode === "vsbot" && (
                          <EnhancedCard>
                            <CardHeader stepNumber={botStartsStep} title={t("whoStarts")} />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                              <EnhancedChip
                                label={t("playerStarts")}
                                isSelected={botStarts === false}
                                onClick={() => setBotStarts(false)}
                                theme={theme}
                              />
                              <EnhancedChip
                                label={t("botStarts")}
                                isSelected={botStarts === true}
                                onClick={() => setBotStarts(true)}
                                theme={theme}
                              />
                            </div>
                          </EnhancedCard>
                        )}

                        {/* Difficulty */}
                        {selectedMode === "vsbot" && isBotAvailable && (
                          <EnhancedCard>
                            <CardHeader stepNumber={difficultyStep} title={t("difficulty")} />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                              {difficultyOptions.map((diff) => (
                                <EnhancedChip
                                  key={diff}
                                  label={t(diff)}
                                  isSelected={selectedDifficulty === diff}
                                  onClick={() => setSelectedDifficulty(diff as Difficulty)}
                                  theme={theme}
                                />
                              ))}
                            </div>
                          </EnhancedCard>
                        )}

                        {/* Blitz Settings */}
                        {isBlitzMode && (
                          <EnhancedCard>
                            <CardHeader stepNumber={variantStep1} title={t("timePerMove")} />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                              {[5, 10, 15, 20, 30].map((time) => (
                                <EnhancedChip
                                  key={time}
                                  label={`${time}${t("seconds")}`}
                                  isSelected={blitzSettings.timePerMove === time}
                                  onClick={() => setBlitzSettings({ ...blitzSettings, timePerMove: time })}
                                  theme={theme}
                                />
                              ))}
                            </div>
                            <InfoBox icon={IoInformationCircle} text={t("blitzTimeoutInfo")} theme={theme} />
                          </EnhancedCard>
                        )}

                        {/* Mega Board Settings */}
                        {isMegaMode && (
                          <>
                            <EnhancedCard>
                              <CardHeader stepNumber={variantStep1} title={t("boardSize")} />
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                                {([4, 5, 6, 7, 8, 9] as const).map((size) => (
                                  <EnhancedChip
                                    key={size}
                                    label={`${size}×${size}`}
                                    isSelected={megaBoardSettings.boardSize === size}
                                    onClick={() => handleBoardSizeChange(size)}
                                    theme={theme}
                                  />
                                ))}
                              </div>
                            </EnhancedCard>

                            <EnhancedCard>
                              <CardHeader stepNumber={variantStep2} title={t("customWinLength")} />
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                                {winLengthOptions.map((length) => (
                                  <EnhancedChip
                                    key={length}
                                    label={length.toString()}
                                    isSelected={megaBoardSettings.winLength === length}
                                    onClick={() => setMegaBoardSettings({ ...megaBoardSettings, winLength: length })}
                                    theme={theme}
                                  />
                                ))}
                              </div>
                              <p style={{ fontSize: 13, color: theme.textSecondary, marginTop: 12, textAlign: "center" }}>
                                {megaBoardSettings.winLength} {t("inARow")} {t("toWin")}
                              </p>
                            </EnhancedCard>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: 16,
                paddingTop: 10,
                paddingBottom: 18,
                borderTop: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                boxShadow: "0 -6px 16px rgba(0,0,0,0.06)",
              }}
            >
              <button
                onClick={handleStartGame}
                disabled={isComingSoon || !isModeChosen}
                style={{
                  width: "100%",
                  padding: 16,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
                  boxShadow: `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`,
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: isComingSoon || !isModeChosen ? "default" : "pointer",
                  opacity: isComingSoon || !isModeChosen ? 0.5 : 1,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isComingSoon && isModeChosen) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.22)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isComingSoon && isModeChosen) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primary}30, 0 2px 8px ${theme.shadow}`;
                  }
                }}
              >
                {React.createElement(IoPlay as any, { size: 20 })}
                {isComingSoon ? t("comingSoon") : t("startGame")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}