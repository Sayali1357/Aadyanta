import { motion } from "framer-motion";
import { GlassCard } from "./GlassCard";

interface StatCardProps {
  label: string;
  value: number;
  maxValue: number;
  icon: React.ReactNode;
  colorVar: string;
  delay?: number;
  type?: "bar" | "battery" | "numeric";
  prefix?: string;
}

export function StatCard({ label, value, maxValue, icon, colorVar, delay = 0, type = "bar", prefix }: StatCardProps) {
  const pct = Math.min((value / maxValue) * 100, 100);

  return (
    <GlassCard delay={delay} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        {type === "numeric" && (
          <span className="font-mono text-lg font-semibold text-foreground">
            {prefix}{value.toLocaleString()}
          </span>
        )}
        {type !== "numeric" && (
          <span className="font-mono text-xs text-muted-foreground">{value}/{maxValue}</span>
        )}
      </div>

      {type === "bar" && (
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            style={{ backgroundColor: `var(--${colorVar})` }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>
      )}

      {type === "battery" && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => {
            const filled = i < Math.ceil(pct / 20);
            return (
              <motion.div
                key={i}
                className="h-6 flex-1 rounded-sm"
                style={{
                  backgroundColor: filled ? `var(--${colorVar})` : "var(--muted)",
                  opacity: filled ? 1 : 0.3,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.2 + i * 0.08 }}
              />
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
