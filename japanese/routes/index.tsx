import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Brain, Zap, Battery, DollarSign, Swords } from "lucide-react";
import { AvatarSection } from "@/components/AvatarSection";
import { StatCard } from "@/components/StatCard";
import { CareerTree } from "@/components/CareerTree";
import { DailyTimeline } from "@/components/DailyTimeline";
import { MonsterBattle } from "@/components/MonsterBattle";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "LifeCode — Gamified Learning Dashboard" },
      { name: "description", content: "Master your tech career through gamified learning with real-time progress tracking." },
    ],
  }),
});

function Dashboard() {
  const [battleOpen, setBattleOpen] = useState(false);
  const [monsterIdx, setMonsterIdx] = useState(0);

  const openBattle = (idx: number) => {
    setMonsterIdx(idx);
    setBattleOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <motion.header
        className="glass-card mx-4 mt-4 flex items-center justify-between rounded-2xl px-6 py-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "oklch(0.72 0.19 195 / 15%)" }}>
            <Flame size={18} style={{ color: "var(--glow-cyan)" }} />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            LifeCode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "oklch(0.72 0.19 195 / 10%)", color: "var(--glow-cyan)" }}>
            Level 12
          </span>
          <span className="font-mono text-xs text-muted-foreground">Day 47 streak 🔥</span>
        </div>
      </motion.header>

      {/* Main grid */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left: Avatar + Stats */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            <AvatarSection state="focused" />

            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Skills" value={72} maxValue={100} icon={<Flame size={16} />} colorVar="stat-skills" delay={0.1} />
              <StatCard label="Knowledge" value={58} maxValue={100} icon={<Brain size={16} />} colorVar="stat-knowledge" delay={0.15} />
              <StatCard label="Energy" value={4} maxValue={5} icon={<Battery size={16} />} colorVar="stat-energy" delay={0.2} type="battery" />
              <StatCard label="Stress" value={32} maxValue={100} icon={<Zap size={16} />} colorVar="stat-stress-low" delay={0.25} />
            </div>

            <StatCard label="Money" value={2450} maxValue={10000} icon={<DollarSign size={16} />} colorVar="glow-amber" delay={0.3} type="numeric" prefix="$" />
          </div>

          {/* Center: Career + Timeline */}
          <div className="flex flex-col gap-5 lg:col-span-5">
            <CareerTree />
            <DailyTimeline />
          </div>

          {/* Right: Monster encounters */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Mistake Monsters
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Recursion Wraith", topic: "Recursion", idx: 0, glow: "glow-cyan" },
                  { name: "Stack Beast", topic: "Stacks", idx: 1, glow: "glow-amber" },
                  { name: "Graph Phantom", topic: "Graphs", idx: 2, glow: "glow-emerald" },
                ].map((m) => (
                  <motion.button
                    key={m.idx}
                    onClick={() => openBattle(m.idx)}
                    className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:bg-accent/40"
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `var(--${m.glow})`, opacity: 0.15 }}
                    >
                      <Swords size={16} style={{ color: `var(--${m.glow})` }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.topic}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* XP Summary */}
            <motion.div
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Today's XP
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                  340
                </span>
                <span className="text-sm text-muted-foreground">/ 500 XP</span>
              </div>
              <div className="progress-track mt-3">
                <motion.div
                  className="progress-fill"
                  style={{ background: "linear-gradient(90deg, var(--glow-cyan), var(--glow-emerald))" }}
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1.5, delay: 0.9, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <MonsterBattle isOpen={battleOpen} onClose={() => setBattleOpen(false)} monsterIndex={monsterIdx} />
    </div>
  );
}
