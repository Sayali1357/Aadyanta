import { motion } from "framer-motion";
import avatarImg from "@/assets/avatar-focused.png";

interface AvatarSectionProps {
  state: "focused" | "distracted";
}

export function AvatarSection({ state }: AvatarSectionProps) {
  const isFocused = state === "focused";

  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 260,
          height: 260,
          background: isFocused
            ? "radial-gradient(circle, oklch(0.72 0.19 195 / 15%) 0%, transparent 70%)"
            : "radial-gradient(circle, oklch(0.45 0.05 260 / 10%) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: isFocused ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Avatar */}
      <motion.img
        src={avatarImg}
        alt="Your avatar"
        width={220}
        height={280}
        className="relative z-10 drop-shadow-2xl"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Status badge */}
      <motion.div
        className="glass-card mt-3 flex items-center gap-2 px-4 py-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: isFocused ? "var(--glow-emerald)" : "var(--glow-amber)",
            boxShadow: isFocused
              ? "0 0 8px var(--glow-emerald)"
              : "0 0 8px var(--glow-amber)",
          }}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {isFocused ? "Deep Focus Mode" : "Needs Recharge"}
        </span>
      </motion.div>
    </div>
  );
}
