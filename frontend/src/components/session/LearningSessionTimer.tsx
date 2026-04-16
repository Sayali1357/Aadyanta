import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Pause,
  Play,
  RotateCcw,
  Coffee,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";

// ── Constants ───────────────────────────────────────────
const SESSION_DURATION = 45 * 60; // 45 minutes in seconds
const BREAK_DURATION = 15 * 60;   // 15 minutes in seconds

type SessionPhase = "idle" | "running" | "paused" | "break";

const LearningSessionTimer = () => {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(BREAK_DURATION);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Cleanup on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Main session countdown ────────────────────────────
  useEffect(() => {
    if (phase === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setPhase("break");
            setBreakSecondsLeft(BREAK_DURATION);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase]);

  // ── Break countdown ───────────────────────────────────
  useEffect(() => {
    let breakInterval: ReturnType<typeof setInterval> | null = null;
    if (phase === "break") {
      breakInterval = setInterval(() => {
        setBreakSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(breakInterval!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (breakInterval) clearInterval(breakInterval);
    };
  }, [phase]);

  // ── Actions ───────────────────────────────────────────
  const startSession = useCallback(() => {
    setSecondsLeft(SESSION_DURATION);
    setPhase("running");
    setIsDismissed(false);
    setIsMinimized(false);
  }, []);

  const pauseSession = useCallback(() => setPhase("paused"), []);
  const resumeSession = useCallback(() => setPhase("running"), []);

  const resetSession = useCallback(() => {
    setPhase("idle");
    setSecondsLeft(SESSION_DURATION);
    setBreakSecondsLeft(BREAK_DURATION);
  }, []);

  const dismissCard = useCallback(() => {
    setIsDismissed(true);
    resetSession();
  }, [resetSession]);

  // ── Formatting ────────────────────────────────────────
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ── Progress percentage (for SVG ring) ────────────────
  const progressPercent =
    phase === "break"
      ? ((BREAK_DURATION - breakSecondsLeft) / BREAK_DURATION) * 100
      : ((SESSION_DURATION - secondsLeft) / SESSION_DURATION) * 100;

  // ── Urgency state (< 5 min) ──────────────────────────
  const isUrgent = phase === "running" && secondsLeft <= 300;

  if (isDismissed) return null;

  // ── SVG circular progress ────────────────────────────
  const ringSize = isMinimized ? 36 : 72;
  const strokeWidth = isMinimized ? 3 : 4;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const ringColor =
    phase === "break"
      ? "#00E5FF"
      : isUrgent
      ? "#FF6B6B"
      : "#8B7CFF";

  const ringTrackColor =
    phase === "break"
      ? "rgba(0,229,255,0.12)"
      : isUrgent
      ? "rgba(255,107,107,0.12)"
      : "rgba(139,124,255,0.12)";

  return (
    <AnimatePresence>
      <motion.div
        id="learning-session-timer"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="fixed bottom-6 right-6 z-[9999]"
        style={{ pointerEvents: "auto" }}
      >
        {/* ── Minimized Pill ─────────────────────────────── */}
        {isMinimized && phase !== "idle" ? (
          <motion.button
            key="minimized"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer border transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(18,20,28,0.95)",
              borderColor: phase === "break" ? "rgba(0,229,255,0.3)" : isUrgent ? "rgba(255,107,107,0.3)" : "rgba(139,124,255,0.25)",
              boxShadow: phase === "break"
                ? "0 0 24px -6px rgba(0,229,255,0.35)"
                : isUrgent
                ? "0 0 24px -6px rgba(255,107,107,0.35)"
                : "0 0 24px -6px rgba(139,124,255,0.3)",
            }}
          >
            {/* Small ring */}
            <svg width={ringSize} height={ringSize} className="flex-shrink-0">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={ringTrackColor}
                strokeWidth={strokeWidth}
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: "center",
                  transition: "stroke-dashoffset 1s ease-out",
                }}
              />
            </svg>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: ringColor }}
            >
              {phase === "break"
                ? formatTime(breakSecondsLeft)
                : formatTime(secondsLeft)}
            </span>
            <Maximize2 className="w-3.5 h-3.5 text-[#6B6F7A] ml-1" />
          </motion.button>
        ) : (
          /* ── Full Card ──────────────────────────────────── */
          <motion.div
            key="expanded"
            layout
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "#12141C",
              border: `1px solid ${
                phase === "break"
                  ? "rgba(0,229,255,0.2)"
                  : isUrgent
                  ? "rgba(255,107,107,0.2)"
                  : "rgba(139,124,255,0.15)"
              }`,
              boxShadow:
                phase === "break"
                  ? "0 8px 40px -10px rgba(0,229,255,0.3), 0 0 60px -20px rgba(0,229,255,0.15)"
                  : isUrgent
                  ? "0 8px 40px -10px rgba(255,107,107,0.3), 0 0 60px -20px rgba(255,107,107,0.15)"
                  : "0 8px 40px -10px rgba(139,124,255,0.3), 0 0 60px -20px rgba(139,124,255,0.15)",
              width: 280,
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Top edge highlight */}
            <div
              className="absolute inset-x-0 top-0 h-px pointer-events-none"
              style={{
                background: `linear-gradient(to right, transparent, ${
                  phase === "break"
                    ? "rgba(0,229,255,0.15)"
                    : isUrgent
                    ? "rgba(255,107,107,0.15)"
                    : "rgba(139,124,255,0.12)"
                }, transparent)`,
              }}
            />

            {/* Ambient background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  phase === "break"
                    ? "radial-gradient(circle at 50% 30%, rgba(0,229,255,0.06), transparent 70%)"
                    : isUrgent
                    ? "radial-gradient(circle at 50% 30%, rgba(255,107,107,0.06), transparent 70%)"
                    : "radial-gradient(circle at 50% 30%, rgba(139,124,255,0.05), transparent 70%)",
              }}
            />

            {/* ── Header Row ─────────────────────────────── */}
            <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                {phase === "break" ? (
                  <Coffee className="w-3.5 h-3.5" style={{ color: "#00E5FF" }} />
                ) : (
                  <Timer
                    className="w-3.5 h-3.5"
                    style={{
                      color: isUrgent ? "#FF6B6B" : "#8B7CFF",
                    }}
                  />
                )}
                <span
                  className="text-[11px] font-semibold tracking-widest uppercase"
                  style={{
                    color:
                      phase === "break"
                        ? "#00E5FF"
                        : isUrgent
                        ? "#FF6B6B"
                        : "#8B7CFF",
                  }}
                >
                  {phase === "break"
                    ? "Break Time"
                    : phase === "idle"
                    ? "Study Session"
                    : "Session Active"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {phase !== "idle" && (
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-md hover:bg-white/5 transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-[#6B6F7A]" />
                  </button>
                )}
                <button
                  onClick={dismissCard}
                  className="p-1 rounded-md hover:bg-white/5 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5 text-[#6B6F7A]" />
                </button>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────── */}
            <div className="relative z-10 px-4 pb-4 pt-2">
              <AnimatePresence mode="wait">
                {/* ── IDLE STATE ──────────────────────────── */}
                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Idle ring */}
                    <div className="relative mb-3">
                      <svg width={ringSize} height={ringSize}>
                        <circle
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={radius}
                          fill="none"
                          stroke={ringTrackColor}
                          strokeWidth={strokeWidth}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold tabular-nums text-[#EAEAF0]">
                          45:00
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B6F7A] mb-4 leading-relaxed">
                      Start a focused 45-minute learning session
                    </p>
                    <button
                      onClick={startSession}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #8B7CFF, #B69CFF)",
                        color: "#fff",
                        boxShadow: "0 4px 20px -4px rgba(139,124,255,0.4)",
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Start Session
                    </button>
                  </motion.div>
                )}

                {/* ── RUNNING / PAUSED STATE ──────────────── */}
                {(phase === "running" || phase === "paused") && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    {/* Progress ring + time */}
                    <div className="relative mb-3">
                      <svg width={ringSize} height={ringSize}>
                        <circle
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={radius}
                          fill="none"
                          stroke={ringTrackColor}
                          strokeWidth={strokeWidth}
                        />
                        <circle
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={radius}
                          fill="none"
                          stroke={ringColor}
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "center",
                            transition: "stroke-dashoffset 1s ease-out",
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-lg font-bold tabular-nums"
                          style={{
                            color: isUrgent ? "#FF6B6B" : "#EAEAF0",
                          }}
                        >
                          {formatTime(secondsLeft)}
                        </span>
                      </div>
                    </div>

                    {/* Status label */}
                    <p className="text-xs text-[#6B6F7A] mb-3">
                      {phase === "paused"
                        ? "Session paused"
                        : isUrgent
                        ? "Almost there — keep going!"
                        : "Stay focused, you've got this!"}
                    </p>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-2 w-full">
                      {phase === "running" ? (
                        <button
                          onClick={pauseSession}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: "rgba(139,124,255,0.12)",
                            color: "#B69CFF",
                            border: "1px solid rgba(139,124,255,0.2)",
                          }}
                        >
                          <Pause className="w-3.5 h-3.5" />
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={resumeSession}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: "linear-gradient(135deg, #8B7CFF, #B69CFF)",
                            color: "#fff",
                            boxShadow: "0 4px 16px -4px rgba(139,124,255,0.35)",
                          }}
                        >
                          <Play className="w-3.5 h-3.5" />
                          Resume
                        </button>
                      )}
                      <button
                        onClick={resetSession}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          color: "#6B6F7A",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── BREAK STATE ────────────────────────── */}
                {phase === "break" && (
                  <motion.div
                    key="break"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Break ring */}
                    <div className="relative mb-3">
                      <motion.div
                        animate={{
                          boxShadow: [
                            "0 0 20px -5px rgba(0,229,255,0.15)",
                            "0 0 40px -5px rgba(0,229,255,0.3)",
                            "0 0 20px -5px rgba(0,229,255,0.15)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="rounded-full"
                      >
                        <svg width={ringSize} height={ringSize}>
                          <circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            fill="none"
                            stroke={ringTrackColor}
                            strokeWidth={strokeWidth}
                          />
                          <circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            fill="none"
                            stroke={ringColor}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{
                              transform: "rotate(-90deg)",
                              transformOrigin: "center",
                              transition: "stroke-dashoffset 1s ease-out",
                            }}
                          />
                        </svg>
                      </motion.div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Coffee className="w-5 h-5" style={{ color: "#00E5FF" }} />
                      </div>
                    </div>

                    <h3
                      className="text-sm font-bold mb-1"
                      style={{ color: "#00E5FF" }}
                    >
                      Time for a break
                    </h3>
                    <p className="text-xs text-[#6B6F7A] mb-1 leading-relaxed">
                      Take a 15-minute break.
                    </p>
                    <p className="text-xs text-[#6B6F7A] mb-1 leading-relaxed">
                      See you later.
                    </p>
                    <p
                      className="text-lg font-bold tabular-nums mb-3"
                      style={{ color: "#00E5FF" }}
                    >
                      {formatTime(breakSecondsLeft)}
                    </p>

                    <button
                      onClick={startSession}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: "linear-gradient(135deg, #00B8D4, #00E5FF)",
                        color: "#0B0C10",
                        boxShadow: "0 4px 20px -4px rgba(0,229,255,0.35)",
                      }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Start New Session
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Subtle bottom progress bar ─────────────── */}
            {(phase === "running" || phase === "paused") && (
              <div className="absolute bottom-0 inset-x-0 h-[2px]">
                <div
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${progressPercent}%`,
                    background: isUrgent
                      ? "linear-gradient(90deg, #FF6B6B, #FF8A6C)"
                      : "linear-gradient(90deg, #8B7CFF, #B69CFF)",
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LearningSessionTimer;
