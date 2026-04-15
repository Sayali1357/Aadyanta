import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Premium Animated Glass Card for SaaS $50k+ UI Feel
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
      whileHover={disableHover ? {} : { y: -4, scale: 1.01, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 backdrop-blur-xl shadow-2xl group",
        className
      )}
      {...props}
    >
      {/* Dynamic Hover Glow Effect */}
      {!disableHover && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      
      {/* Subtle top inner highlight to give 3D edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
