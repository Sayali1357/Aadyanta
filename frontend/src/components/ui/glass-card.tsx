import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Neural Interface Glass Card
// bg: #12141C | border: rgba(255,255,255,0.05) | radius: 14px
interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  className?: string;
  disableHover?: boolean;
}

export const GlassCard = ({ children, delay = 0, className, disableHover = false, ...props }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={disableHover ? {} : { y: -4, scale: 1.008, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-[14px] p-6 backdrop-blur-xl shadow-2xl group",
        className
      )}
      style={{
        background: '#12141C',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
      {...props}
    >
      {/* Hover Glow Effect — purple gradient */}
      {!disableHover && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(139,124,255,0.04), transparent, rgba(0,229,255,0.03))',
          }}
        />
      )}
      
      {/* Top edge highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
