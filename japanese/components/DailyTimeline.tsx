import { motion } from "framer-motion";
import { BookOpen, Code, Brain, Users } from "lucide-react";

const schedule = [
  { time: "09:00", label: "Learn DSA", icon: <BookOpen size={16} />, color: "var(--glow-cyan)" },
  { time: "11:00", label: "Solve Problems", icon: <Code size={16} />, color: "var(--glow-emerald)" },
  { time: "14:00", label: "Revision", icon: <Brain size={16} />, color: "var(--glow-amber)" },
  { time: "16:00", label: "Mock Interview", icon: <Users size={16} />, color: "var(--glow-rose)" },
];

export function DailyTimeline() {
  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Today's Quest
      </h3>
      <div className="space-y-1">
        {schedule.map((item, i) => (
          <motion.div
            key={i}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-accent/40"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
          >
            {/* Timeline line */}
            {i < schedule.length - 1 && (
              <div className="absolute left-[27px] top-[38px] h-[calc(100%-10px)] w-px bg-border" />
            )}
            {/* Dot */}
            <div
              className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `color-mix(in oklch, ${item.color} 15%, transparent)`,
                color: item.color,
              }}
            >
              {item.icon}
            </div>
            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
