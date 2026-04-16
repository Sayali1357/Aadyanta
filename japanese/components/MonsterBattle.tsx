import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Swords, Zap, Shield, Heart, Skull } from "lucide-react";
import avatarImg from "@/assets/avatar-focused.png";
import monsterRecursion from "@/assets/monster-recursion.png";
import monsterStack from "@/assets/monster-stack.png";
import monsterGraph from "@/assets/monster-graph.png";

interface Monster {
  name: string;
  topic: string;
  image: string;
  maxHp: number;
  attack: number;
}

const monsters: Monster[] = [
  { name: "Recursion Wraith", topic: "Recursion", image: monsterRecursion, maxHp: 100, attack: 15 },
  { name: "Stack Beast", topic: "Stacks & Queues", image: monsterStack, maxHp: 80, attack: 20 },
  { name: "Graph Phantom", topic: "Graph Theory", image: monsterGraph, maxHp: 120, attack: 12 },
];

const PLAYER_MAX_HP = 100;
const PLAYER_ATTACK = 25;

type BattleResult = "fighting" | "won" | "lost";

interface MonsterBattleProps {
  isOpen: boolean;
  onClose: () => void;
  monsterIndex?: number;
}

export function MonsterBattle({ isOpen, onClose, monsterIndex = 0 }: MonsterBattleProps) {
  const monster = monsters[monsterIndex % monsters.length];
  const [monsterHp, setMonsterHp] = useState(monster.maxHp);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [monsterShaking, setMonsterShaking] = useState(false);
  const [monsterBursting, setMonsterBursting] = useState(false);
  const [playerShaking, setPlayerShaking] = useState(false);
  const [playerHurt, setPlayerHurt] = useState(false);
  const [monsterAttacking, setMonsterAttacking] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult>("fighting");
  const [turnText, setTurnText] = useState("");
  const [comboCount, setComboCount] = useState(0);

  useEffect(() => {
    setMonsterHp(monster.maxHp);
    setPlayerHp(PLAYER_MAX_HP);
    setMonsterShaking(false);
    setMonsterBursting(false);
    setPlayerShaking(false);
    setPlayerHurt(false);
    setMonsterAttacking(false);
    setPlayerAttacking(false);
    setBattleResult("fighting");
    setTurnText("");
    setComboCount(0);
  }, [monsterIndex, monster.maxHp, isOpen]);

  const triggerMonsterAttack = useCallback((damage: number) => {
    setTimeout(() => {
      setMonsterAttacking(true);
      setTurnText(`${monster.name} strikes back!`);
      setTimeout(() => {
        setMonsterAttacking(false);
        setPlayerShaking(true);
        setPlayerHurt(true);
        setPlayerHp((prev) => {
          const next = Math.max(prev - damage, 0);
          if (next === 0) {
            setTimeout(() => setBattleResult("lost"), 600);
          }
          return next;
        });
        setTimeout(() => {
          setPlayerShaking(false);
          setPlayerHurt(false);
        }, 600);
      }, 400);
    }, 500);
  }, [monster.name]);

  const handleAttack = (correct: boolean) => {
    if (battleResult !== "fighting") return;

    if (correct) {
      // Player attacks monster
      setPlayerAttacking(true);
      setTurnText("⚔️ Critical hit!");
      setComboCount((prev) => prev + 1);
      const bonus = Math.min(comboCount * 3, 15);
      const totalDamage = PLAYER_ATTACK + bonus;

      setTimeout(() => {
        setPlayerAttacking(false);
        setMonsterBursting(true);
        setMonsterShaking(true);
        setMonsterHp((prev) => {
          const next = Math.max(prev - totalDamage, 0);
          if (next === 0) {
            setTimeout(() => setBattleResult("won"), 600);
          }
          return next;
        });

        setTimeout(() => {
          setMonsterBursting(false);
          setMonsterShaking(false);
          // Monster retaliates with weaker attack on correct answer
          if (monsterHp - totalDamage > 0) {
            triggerMonsterAttack(Math.floor(monster.attack * 0.4));
          }
        }, 500);
      }, 300);
    } else {
      // Wrong answer — monster attacks with full force
      setComboCount(0);
      setTurnText(`💥 Wrong! ${monster.name} attacks!`);
      setMonsterAttacking(true);

      setTimeout(() => {
        setMonsterAttacking(false);
        setPlayerShaking(true);
        setPlayerHurt(true);
        setPlayerHp((prev) => {
          const next = Math.max(prev - monster.attack, 0);
          if (next === 0) {
            setTimeout(() => setBattleResult("lost"), 600);
          }
          return next;
        });

        setTimeout(() => {
          setPlayerShaking(false);
          setPlayerHurt(false);
        }, 600);
      }, 400);
    }
  };

  const monsterHpPct = (monsterHp / monster.maxHp) * 100;
  const playerHpPct = (playerHp / PLAYER_MAX_HP) * 100;

  const hpColor = (pct: number) =>
    pct > 50 ? "var(--glow-emerald)" : pct > 25 ? "var(--glow-amber)" : "var(--glow-rose)";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundColor: "oklch(0.05 0.02 260 / 90%)",
              backdropFilter: "blur(16px)",
            }}
            onClick={onClose}
          />

          {/* Battle arena */}
          <motion.div
            className="glass-card relative z-10 w-full max-w-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between border-b px-6 py-3" style={{ borderColor: "var(--glass-border)" }}>
              <div className="flex items-center gap-2">
                <Swords size={16} style={{ color: "var(--glow-cyan)" }} />
                <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Battle — {monster.topic}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Turn announcement */}
            <AnimatePresence mode="wait">
              {turnText && (
                <motion.div
                  key={turnText}
                  className="py-2 text-center text-sm font-bold"
                  style={{ color: "var(--glow-amber)" }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {turnText}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Battle stage */}
            <div className="relative px-6 py-4">
              {/* Arena background glow */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: "radial-gradient(ellipse at center bottom, oklch(0.72 0.19 195 / 30%) 0%, transparent 70%)",
                }}
              />

              {/* VS layout: Player vs Monster */}
              <div className="relative flex items-center justify-between gap-4">
                {/* Player side */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  {/* Player HP */}
                  <div className="w-full">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Heart size={12} /> You
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {playerHp}/{PLAYER_MAX_HP}
                      </span>
                    </div>
                    <div className="progress-track h-2.5">
                      <motion.div
                        className="progress-fill h-full"
                        style={{ backgroundColor: hpColor(playerHpPct) }}
                        animate={{ width: `${playerHpPct}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                  </div>

                  {/* Player avatar */}
                  <div className="relative">
                    {/* Hurt flash overlay */}
                    {playerHurt && (
                      <motion.div
                        className="absolute inset-0 z-20 rounded-2xl"
                        style={{
                          background: "radial-gradient(circle, oklch(0.60 0.22 25 / 50%) 0%, transparent 70%)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 0.7, 0] }}
                        transition={{ duration: 0.6 }}
                      />
                    )}

                    {/* Attack slash effect from player */}
                    {playerAttacking && (
                      <motion.div
                        className="absolute -right-8 top-1/2 z-30"
                        initial={{ opacity: 0, x: 0, scale: 0.5 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          x: [0, 30, 60, 100],
                          scale: [0.5, 1.2, 1, 0.5],
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <Swords size={28} style={{ color: "var(--glow-cyan)" }} />
                      </motion.div>
                    )}

                    <motion.img
                      src={avatarImg}
                      alt="Your avatar"
                      className="relative z-10 h-36 w-auto drop-shadow-2xl"
                      style={{
                        filter: playerHurt
                          ? "brightness(1.3) saturate(0.5)"
                          : battleResult === "lost"
                            ? "brightness(0.4) grayscale(0.8)"
                            : "brightness(1)",
                      }}
                      animate={
                        playerShaking
                          ? {
                              x: [0, -8, 10, -6, 8, -3, 0],
                              rotate: [0, -3, 3, -2, 2, 0],
                            }
                          : playerAttacking
                            ? { x: [0, 15, 25, 0], rotate: [0, 2, -1, 0] }
                            : battleResult === "lost"
                              ? { y: [0, 5], rotate: [0, -8], opacity: [1, 0.6] }
                              : { y: [0, -4, 0] }
                      }
                      transition={
                        playerShaking
                          ? { duration: 0.5 }
                          : playerAttacking
                            ? { duration: 0.3 }
                            : battleResult === "lost"
                              ? { duration: 1 }
                              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }
                    />

                    {/* Combo indicator */}
                    {comboCount > 1 && battleResult === "fighting" && (
                      <motion.div
                        className="absolute -top-2 -right-2 z-30 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: "var(--glow-amber)",
                          color: "var(--background)",
                          boxShadow: "0 0 12px var(--glow-amber)",
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        key={comboCount}
                      >
                        x{comboCount}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* VS separator */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-black"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.72 0.19 195 / 20%), oklch(0.60 0.22 25 / 20%))",
                      border: "1px solid var(--glass-border)",
                      color: "var(--foreground)",
                      fontFamily: "var(--font-display)",
                    }}
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    VS
                  </motion.div>
                </div>

                {/* Monster side */}
                <div className="flex flex-col items-center gap-3 flex-1">
                  {/* Monster HP */}
                  <div className="w-full">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Skull size={12} /> {monster.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {monsterHp}/{monster.maxHp}
                      </span>
                    </div>
                    <div className="progress-track h-2.5">
                      <motion.div
                        className="progress-fill h-full"
                        style={{ backgroundColor: hpColor(monsterHpPct) }}
                        animate={{ width: `${monsterHpPct}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                  </div>

                  {/* Monster sprite */}
                  <div className="relative">
                    {/* Hit burst effect */}
                    {monsterBursting && (
                      <motion.div
                        className="absolute inset-0 z-20 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, oklch(0.90 0.15 195 / 60%) 0%, transparent 70%)",
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.8, 2.5] }}
                        transition={{ duration: 0.5 }}
                      />
                    )}

                    {/* Monster attack slash going left */}
                    {monsterAttacking && (
                      <motion.div
                        className="absolute -left-8 top-1/2 z-30"
                        initial={{ opacity: 0, x: 0, scale: 0.5 }}
                        animate={{
                          opacity: [0, 1, 1, 0],
                          x: [0, -30, -60, -100],
                          scale: [0.5, 1.2, 1, 0.5],
                          rotate: [0, -20, -40, -60],
                        }}
                        transition={{ duration: 0.4 }}
                      >
                        <Zap size={28} style={{ color: "var(--glow-rose)" }} />
                      </motion.div>
                    )}

                    <motion.img
                      src={monster.image}
                      alt={monster.name}
                      className="relative z-10 h-36 w-auto drop-shadow-2xl"
                      style={{
                        filter:
                          battleResult === "won"
                            ? "brightness(0.3) grayscale(1)"
                            : monsterBursting
                              ? "brightness(1.5) contrast(1.2)"
                              : "brightness(1)",
                      }}
                      animate={
                        monsterShaking
                          ? {
                              x: [0, 8, -10, 6, -8, 3, 0],
                              rotate: [0, 3, -3, 2, -2, 0],
                            }
                          : monsterAttacking
                            ? { x: [0, -15, -25, 0], rotate: [0, -3, 2, 0], scale: [1, 1.1, 1.15, 1] }
                            : battleResult === "won"
                              ? { y: [0, 10], rotate: [0, 12], opacity: [1, 0.3], scale: [1, 0.85] }
                              : { y: [0, -5, 0], scale: [1, 1.02, 1] }
                      }
                      transition={
                        monsterShaking
                          ? { duration: 0.5 }
                          : monsterAttacking
                            ? { duration: 0.35, ease: "easeOut" }
                            : battleResult === "won"
                              ? { duration: 1.2 }
                              : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }
                    />

                    {/* Damage numbers float up on monster hit */}
                    {monsterBursting && (
                      <motion.span
                        className="absolute -top-4 left-1/2 z-30 font-bold text-lg"
                        style={{
                          color: "var(--glow-cyan)",
                          fontFamily: "var(--font-display)",
                          textShadow: "0 0 10px var(--glow-cyan)",
                        }}
                        initial={{ opacity: 0, y: 0, x: "-50%" }}
                        animate={{ opacity: [0, 1, 1, 0], y: [0, -20, -35, -50] }}
                        transition={{ duration: 0.8 }}
                      >
                        -{PLAYER_ATTACK + Math.min(comboCount * 3, 15)}
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Battle result overlay */}
            <AnimatePresence>
              {battleResult !== "fighting" && (
                <motion.div
                  className="mx-6 mb-4 rounded-xl p-4 text-center"
                  style={{
                    backgroundColor:
                      battleResult === "won"
                        ? "oklch(0.70 0.17 155 / 15%)"
                        : "oklch(0.60 0.22 25 / 15%)",
                    border: `1px solid ${battleResult === "won" ? "oklch(0.70 0.17 155 / 30%)" : "oklch(0.60 0.22 25 / 30%)"}`,
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <motion.div
                    className="mb-1 text-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {battleResult === "won" ? "🏆" : "💀"}
                  </motion.div>
                  <p
                    className="text-base font-bold"
                    style={{
                      color: battleResult === "won" ? "var(--glow-emerald)" : "var(--glow-rose)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {battleResult === "won"
                      ? "Monster Defeated! Topic Mastered!"
                      : `You were defeated by ${monster.name}...`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {battleResult === "won"
                      ? `+${150 + comboCount * 10} XP earned`
                      : "Study up and try again!"}
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-3 rounded-xl px-6 py-2 text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      backgroundColor:
                        battleResult === "won"
                          ? "oklch(0.70 0.17 155 / 20%)"
                          : "oklch(0.60 0.22 25 / 20%)",
                      color: battleResult === "won" ? "var(--glow-emerald)" : "var(--glow-rose)",
                      border: `1px solid ${battleResult === "won" ? "oklch(0.70 0.17 155 / 40%)" : "oklch(0.60 0.22 25 / 40%)"}`,
                    }}
                  >
                    {battleResult === "won" ? "Claim Reward" : "Try Again"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            {battleResult === "fighting" && (
              <div className="flex gap-3 px-6 pb-5">
                <motion.button
                  onClick={() => handleAttack(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "oklch(0.72 0.19 195 / 15%)",
                    color: "var(--glow-cyan)",
                    border: "1px solid oklch(0.72 0.19 195 / 30%)",
                  }}
                  whileHover={{ scale: 1.03, backgroundColor: "oklch(0.72 0.19 195 / 25%)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Swords size={16} /> Correct Answer
                </motion.button>
                <motion.button
                  onClick={() => handleAttack(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: "oklch(0.60 0.22 25 / 15%)",
                    color: "var(--glow-rose)",
                    border: "1px solid oklch(0.60 0.22 25 / 30%)",
                  }}
                  whileHover={{ scale: 1.03, backgroundColor: "oklch(0.60 0.22 25 / 25%)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap size={16} /> Wrong Answer
                </motion.button>
              </div>
            )}

            {/* Shield hint */}
            {battleResult === "fighting" && comboCount > 0 && (
              <motion.div
                className="flex items-center justify-center gap-1 pb-4 text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Shield size={12} style={{ color: "var(--glow-amber)" }} />
                Combo streak reduces monster retaliation damage
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
