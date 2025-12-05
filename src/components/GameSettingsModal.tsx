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
  IoShuffle,
  IoPlaySkipForward,
  IoCloseCircle,
  IoPlay,
} from "react-icons/io5";
import { renderIcon } from "../utils/renderIcon";

type GameMode = "vsplayer" | "vsbot";
type Difficulty = "easy" | "normal" | "hard" | "impossible";
type Variant =
  | "classic"
  | "infinite"
  | "blitz"
  | "mega"
  | "doublemove"
  | "swap"
  | "reverse";

interface BlitzSettings {
  timePerMove: number;
  onTimeout: "skip" | "random" | "lose";
}
interface MegaBoardSettings {
  boardSize: 4 | 5 | 7 | 8 | 9;
  winLength: number;
}
interface DoubleMoveSettings {
  turnsUntilDouble: number;
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
  doubleMoveSettings: DoubleMoveSettings;
}

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
  doubleMoveSettings: initialDoubleMoveSettings,
}: GameSettingsModalProps) {
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("normal");
  const [blitzSettings, setBlitzSettings] = useState<BlitzSettings>(
    initialBlitzSettings
  );
  const [megaBoardSettings, setMegaBoardSettings] =
    useState<MegaBoardSettings>(initialMegaBoardSettings);
  const [doubleMoveSettings, setDoubleMoveSettings] =
    useState<DoubleMoveSettings>(initialDoubleMoveSettings);

  useEffect(() => {
    if (visible && variant) {
      setSelectedMode(null);
      setSelectedDifficulty(
        (availableDifficulties?.[0] as Difficulty) || "normal"
      );
      setBlitzSettings(initialBlitzSettings);
      setMegaBoardSettings(initialMegaBoardSettings);
      setDoubleMoveSettings(initialDoubleMoveSettings);
    }
  }, [
    visible,
    variant,
    availableDifficulties,
    initialBlitzSettings,
    initialMegaBoardSettings,
    initialDoubleMoveSettings,
  ]);

  const isComingSoon = variant === "swap" || variant === "reverse";
  const isMegaMode = variant === "mega";
  const isBlitzMode = variant === "blitz";
  const isDoubleMoveMode = variant === "doublemove";
  const isBotAvailable = !isMegaMode;
  

  const difficultyOptions: Difficulty[] = (
    availableDifficulties && availableDifficulties.length > 0
      ? availableDifficulties
      : ["easy", "normal", "hard"]
  ) as Difficulty[];

  const isModeChosen = selectedMode !== null;

  const handleStartGame = () => {
    if (isComingSoon || !isModeChosen) return;

    const params = new URLSearchParams({
      mode: selectedMode as string,
      difficulty: selectedDifficulty,
      variant: variant ?? "classic",
    });

    if (isBlitzMode) {
      params.append("timePerMove", blitzSettings.timePerMove.toString());
      params.append("onTimeout", blitzSettings.onTimeout);
    }

    if (isMegaMode) {
      params.append("boardSize", megaBoardSettings.boardSize.toString());
      params.append("winLength", megaBoardSettings.winLength.toString());
    }

    if (isDoubleMoveMode) {
      params.append(
        "turnsUntilDouble",
        doubleMoveSettings.turnsUntilDouble.toString()
      );
    }

    onClose();
    navigate(`/game?${params.toString()}`);
  };

  const getRecommendedWinLength = (size: number) => {
    if (size === 4) return 3;
    if (size === 5) return 4;
    if (size === 7) return 5;
    if (size === 8) return 5;
    return 5;
  };

  const getWinLengthOptions = (size: number) => {
    const options = [];
    for (let i = 3; i <= Math.min(size, 6); i++) {
      options.push(i);
    }
    return options;
  };

  const handleBoardSizeChange = (size: 4 | 5 | 7 | 8 | 9) => {
    const recommended = getRecommendedWinLength(size);
    setMegaBoardSettings({
      boardSize: size,
      winLength: recommended,
    });
  };

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

  const OptionCard = ({
    isSelected,
    onClick,
    icon,
    label,
    disabled = false,
  }: {
    isSelected: boolean;
    onClick: () => void;
    icon: any;
    label: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        border: `2px solid ${isSelected ? theme.primary : theme.border}`,
        backgroundColor: isSelected ? theme.primary : theme.surface,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
        minHeight: 72,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) =>
        !disabled &&
        !isSelected &&
        (e.currentTarget.style.borderColor = theme.primary)
      }
      onMouseLeave={(e) =>
        !disabled &&
        !isSelected &&
        (e.currentTarget.style.borderColor = theme.border)
      }
    >
      {/* Render the provided icon component (or fallback to renderIcon) */}
      {typeof icon === "function" ? (
        // icon is a React component (e.g. IoPeople)
        (React.createElement(icon, {
          size: 22,
          color: disabled ? theme.textSecondary : isSelected ? "#FFF" : theme.primary,
        }))
      ) : (
        // icon might be a name/string — use renderIcon helper
        renderIcon(icon, { size: 22, color: disabled ? theme.textSecondary : isSelected ? "#FFF" : theme.primary })
      )}
      <span
        style={{
          color: disabled
            ? theme.textSecondary
            : isSelected
            ? "#FFF"
            : theme.text,
          fontWeight: 600,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        {label}
      </span>
    </button>
  );

  const Chip = ({
    isSelected,
    onClick,
    label,
    disabled = false,
  }: {
    isSelected: boolean;
    onClick: () => void;
    label: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 20,
        border: `2px solid ${isSelected ? theme.primary : theme.border}`,
        backgroundColor: isSelected ? theme.primary : theme.surface,
        color: isSelected ? "#FFF" : theme.text,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
        fontWeight: isSelected ? 600 : 500,
        fontSize: 14,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.borderColor = theme.primary;
          e.currentTarget.style.backgroundColor = theme.primary + "15";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.borderColor = theme.border;
          e.currentTarget.style.backgroundColor = theme.surface;
        }
      }}
    >
      {label}
    </button>
  );

  const InfoBox = ({
    icon,
    text,
  }: {
    icon: any;
    text: string;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: theme.primary + "15",
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        border: `1px solid ${theme.primary}30`,
      }}
    >
      {renderIcon(icon, { size: 18, color: theme.primary, style: { flexShrink: 0 } })}
      <span style={{ fontSize: 13, color: theme.text, lineHeight: "18px" }}>
        {text}
      </span>
    </div>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      style={{
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
      }}
    >
      {children}
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
    <AnimatePresence>
      {visible && variant && (
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
            padding: 16,
            zIndex: 1000,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 8 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 20,
              width: "100%",
              maxWidth: 520,
              overflow: "hidden",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: 18,
                paddingBottom: 12,
                borderBottom: `1px solid ${theme.border}`,
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
                {renderIcon(IoClose, { size: 22, color: theme.text })}
              </button>
            </div>

            {/* Body - Scrollable */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                paddingBottom: 28,
              }}
            >
              {isComingSoon ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  {renderIcon(IoTime, { size: 64, color: theme.textSecondary })}
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
                  {/* Mode Selection */}
                  <Card>
                    <CardHeader stepNumber={1} title={t("mode")} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <OptionCard
                        isSelected={selectedMode === "vsplayer"}
                        onClick={() => setSelectedMode("vsplayer")}
                        icon={IoPeople}
                        label={t("vsplayer")}
                      />
                      <OptionCard
                        isSelected={selectedMode === "vsbot"}
                        onClick={() =>
                          isBotAvailable && setSelectedMode("vsbot")
                        }
                        icon={IoHardwareChip}
                        label={
                          isBotAvailable ? t("vsbot") : t("underDevelopment")
                        }
                        disabled={!isBotAvailable}
                      />
                    </div>
                    {selectedMode === "vsplayer" && (
                      <InfoBox
                        icon={IoInformationCircle}
                        text={t("passDevice")}
                      />
                    )}
                  </Card>

                  {/* Difficulty Selection */}
                  {selectedMode === "vsbot" && isBotAvailable && (
                    <Card>
                      <CardHeader stepNumber={2} title={t("difficulty")} />
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {difficultyOptions.map((diff) => (
                          <Chip
                            key={diff}
                            isSelected={selectedDifficulty === diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            label={t(diff)}
                            disabled={!isModeChosen}
                          />
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Blitz Settings */}
                  {isBlitzMode && (
                    <>
                      <Card>
                        <CardHeader
                          stepNumber={selectedMode === "vsbot" ? 3 : 2}
                          title={t("timePerMove")}
                        />
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          {[5, 10, 15, 20, 30].map((time) => (
                            <Chip
                              key={time}
                              isSelected={blitzSettings.timePerMove === time}
                              onClick={() =>
                                setBlitzSettings({
                                  ...blitzSettings,
                                  timePerMove: time,
                                })
                              }
                              label={`${time}${t("seconds")}`}
                              disabled={!isModeChosen}
                            />
                          ))}
                        </div>
                      </Card>

                      <Card>
                        <CardHeader
                          stepNumber={selectedMode === "vsbot" ? 4 : 3}
                          title={t("onTimeout")}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <OptionCard
                            isSelected={blitzSettings.onTimeout === "random"}
                            onClick={() =>
                              setBlitzSettings({
                                ...blitzSettings,
                                onTimeout: "random",
                              })
                            }
                            icon={IoShuffle}
                            label={t("randomMove")}
                            disabled={!isModeChosen}
                          />
                          <OptionCard
                            isSelected={blitzSettings.onTimeout === "skip"}
                            onClick={() =>
                              setBlitzSettings({
                                ...blitzSettings,
                                onTimeout: "skip",
                              })
                            }
                            icon={IoPlaySkipForward}
                            label={t("skipTurn")}
                            disabled={!isModeChosen}
                          />
                          <OptionCard
                            isSelected={blitzSettings.onTimeout === "lose"}
                            onClick={() =>
                              setBlitzSettings({
                                ...blitzSettings,
                                onTimeout: "lose",
                              })
                            }
                            icon={IoCloseCircle}
                            label={t("loseOnTimeout")}
                            disabled={!isModeChosen}
                          />
                        </div>
                      </Card>
                    </>
                  )}

                  {/* Mega Board Settings */}
                  {isMegaMode && (
                    <>
                      <Card>
                        <CardHeader
                          stepNumber={selectedMode === "vsbot" ? 3 : 2}
                          title={t("boardSize")}
                        />
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          {([4, 5, 7, 8, 9] as const).map((size) => (
                            <Chip
                              key={size}
                              isSelected={megaBoardSettings.boardSize === size}
                              onClick={() => handleBoardSizeChange(size)}
                              label={`${size}×${size}`}
                              disabled={!isModeChosen}
                            />
                          ))}
                        </div>
                      </Card>

                      <Card>
                        <CardHeader
                          stepNumber={selectedMode === "vsbot" ? 4 : 3}
                          title={t("customWinLength")}
                        />
                        <div
                          style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                        >
                          {winLengthOptions.map((length) => (
                            <Chip
                              key={length}
                              isSelected={megaBoardSettings.winLength === length}
                              onClick={() =>
                                setMegaBoardSettings({
                                  ...megaBoardSettings,
                                  winLength: length,
                                })
                              }
                              label={length.toString()}
                              disabled={!isModeChosen}
                            />
                          ))}
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: theme.textSecondary,
                            marginTop: 8,
                            textAlign: "center",
                          }}
                        >
                          {megaBoardSettings.winLength} {t("inARow")}{" "}
                          {t("toWin")}
                        </p>
                      </Card>
                    </>
                  )}

                  {/* Double Move Settings */}
                  {isDoubleMoveMode && (
                    <Card>
                      <CardHeader
                        stepNumber={selectedMode === "vsbot" ? 3 : 2}
                        title={t("doubleMoveTurns")}
                      />
                      <p
                        style={{
                          fontSize: 14,
                          color: theme.textSecondary,
                          marginBottom: 12,
                        }}
                      >
                        {t("doubleMoveDescription")}
                      </p>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {[3, 4, 5, 6].map((turns) => (
                          <Chip
                            key={turns}
                            isSelected={
                              doubleMoveSettings.turnsUntilDouble === turns
                            }
                            onClick={() =>
                              setDoubleMoveSettings({ turnsUntilDouble: turns })
                            }
                            label={`${turns} ${t("turns")}`}
                            disabled={!isModeChosen}
                          />
                        ))}
                      </div>
                      <InfoBox
                        icon={IoInformationCircle}
                        text={t("doubleMoveDescription")}
                      />
                    </Card>
                  )}
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
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: theme.primary,
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
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isComingSoon && isModeChosen) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(0,0,0,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isComingSoon && isModeChosen) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.15)";
                  }
                }}
              >
                {renderIcon(IoPlay, { size: 20 })}
                {isComingSoon ? t("comingSoon") : t("startGame")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}