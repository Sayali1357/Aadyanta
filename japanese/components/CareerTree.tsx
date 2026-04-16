import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface CareerNode {
  id: string;
  label: string;
  unlocked: boolean;
  x: number;
  y: number;
}

interface CareerEdge {
  from: string;
  to: string;
}

const nodes: CareerNode[] = [
  { id: "fundamentals", label: "CS Fundamentals", unlocked: true, x: 60, y: 50 },
  { id: "frontend", label: "Frontend Dev", unlocked: true, x: 200, y: 20 },
  { id: "backend", label: "Backend Dev", unlocked: true, x: 200, y: 80 },
  { id: "swe", label: "Software Engineer", unlocked: false, x: 370, y: 20 },
  { id: "data", label: "Data Scientist", unlocked: false, x: 370, y: 50 },
  { id: "ai", label: "AI Engineer", unlocked: false, x: 370, y: 80 },
];

const edges: CareerEdge[] = [
  { from: "fundamentals", to: "frontend" },
  { from: "fundamentals", to: "backend" },
  { from: "frontend", to: "swe" },
  { from: "backend", to: "swe" },
  { from: "backend", to: "data" },
  { from: "backend", to: "ai" },
];

function getNodePos(id: string) {
  const n = nodes.find((n) => n.id === id);
  return n ? { x: n.x, y: n.y } : { x: 0, y: 0 };
}

export function CareerTree() {
  return (
    <motion.div
      className="glass-card relative overflow-hidden p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Career Path
      </h3>
      <svg viewBox="0 0 470 100" className="w-full" style={{ minHeight: 120 }}>
        {/* Edges */}
        {edges.map((e, i) => {
          const from = getNodePos(e.from);
          const to = getNodePos(e.to);
          return (
            <motion.line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="oklch(0.40 0.03 260 / 40%)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={14}
              fill={node.unlocked ? "oklch(0.72 0.19 195 / 20%)" : "oklch(0.20 0.015 260)"}
              stroke={node.unlocked ? "oklch(0.72 0.19 195)" : "oklch(0.35 0.02 260)"}
              strokeWidth={1.5}
              style={node.unlocked ? { filter: "drop-shadow(0 0 6px oklch(0.72 0.19 195 / 40%))" } : {}}
            />
            {!node.unlocked && (
              <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="10" fill="oklch(0.50 0.02 260)">
                🔒
              </text>
            )}
            {node.unlocked && (
              <circle cx={node.x} cy={node.y} r={4} fill="oklch(0.72 0.19 195)" />
            )}
            <text
              x={node.x}
              y={node.y + 28}
              textAnchor="middle"
              fontSize="8"
              fill={node.unlocked ? "oklch(0.85 0.01 260)" : "oklch(0.45 0.02 260)"}
              fontFamily="var(--font-body)"
            >
              {node.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </motion.div>
  );
}
