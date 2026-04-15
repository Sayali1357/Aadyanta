import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import GapAnalysisCard from "@/components/dashboard/GapAnalysisCard";
import ProgressRing from "@/components/roadmap/ProgressRing";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, type Variants } from "framer-motion";
import {
  Flame,
  Trophy,
  Clock,
  BookOpen,
  ArrowRight,
  Target,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
} from "lucide-react";
import { authService } from "@/services/authService";

// Dashboard data shape from /api/user/dashboard
interface DashboardData {
  user: {
    name: string;
    email: string;
    joinedAt: string;
  };
  career: {
    name: string;
    domain: string;
    fitScore: number;
    selectedAt: string;
  } | null;
  progress: {
    completedTopics: number;
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
    completionPercentage: number;
    lastActive: string | null;
    totalLearningPoints: number;
  };
  upcomingTopics: {
    topic_id: string;
    title: string;
    module_name: string;
    estimated_hours?: number;
  }[];
  recentActivity: {
    type: string;
    topicName: string;
    completedAt: string;
    action?: string;
  }[];
  gapTopics: {
    topic_id: string;
    title: string;
    reason: string;
    severity: string;
  }[];
  achievements: {
    name: string;
    description?: string;
    achieved_at: string;
    badge_icon?: string;
  }[];
}

const Dashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${API_URL}/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to load dashboard');
      const data = await res.json();
      setDashboard(data);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ── Helpers ──────────────────────────────────────────────
  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // ── LOADING SKELETON ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen py-8 pt-12 text-foreground relative z-10">
        <div className="container max-w-6xl relative">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-10">
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-10 w-72 mb-2" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-12 w-44" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="lg:col-span-2 h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────
  if (error || !dashboard) {
    return (
      <div className="min-h-screen py-8 pt-12 text-foreground relative z-10 flex items-center justify-center">
        <GlassCard className="max-w-md text-center p-8">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground mb-6">{error || 'Please try again.'}</p>
          <Button onClick={fetchDashboard} variant="hero" className="shadow-glow">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  // ── Derived values from real data ─────────────────────────
  const {
    user,
    career,
    progress,
    upcomingTopics,
    recentActivity,
    gapTopics,
  } = dashboard;

  const progressPercent = progress.completionPercentage || 0;
  const careerName = career?.name || 'your career';
  const careerId = career ? career.name.toLowerCase().replace(/\s+/g, '-') : 'assessment';
  const todaysTopic = upcomingTopics.length > 0 ? upcomingTopics[0] : null;

  return (
    <div className="min-h-screen py-8 pt-12 text-foreground relative z-10">
      <div className="container max-w-6xl relative">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold tracking-widest uppercase mb-3 backdrop-blur-md">
              Operations Center
            </div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{user.name}!</span>
            </h1>
            <p className="text-muted-foreground">
              {career
                ? `You're on track to become a ${careerName}. Keep up the great work!`
                : 'Complete your career assessment to unlock your personalized roadmap.'}
            </p>
          </div>
          <Link to={career ? `/roadmap/${careerId}` : '/assessment'}>
            <Button variant="hero" className="shadow-glow hover:shadow-glow-cyan relative overflow-hidden group">
              <span className="relative z-10 flex items-center">
                {career ? 'Continue Training' : 'Start Assessment'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
        </motion.div>

        {/* Dynamic Bento Box Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Gamified Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <Link to="/life-simulation">
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#1a1040]/40 to-[#12141C]/40 border border-[rgba(139,124,255,0.3)] p-6 rounded-2xl flex items-center justify-between hover:from-[#1a1040]/50 hover:to-[#201040]/50 transition-all shadow-glow-cyan group cursor-pointer h-full">
                 <div>
                   <h3 className="text-xl font-bold text-white mb-1">Life Simulation</h3>
                   <p className="text-sm text-[#B69CFF]/70">Manage stats &amp; career progression</p>
                 </div>
                 <div className="bg-[rgba(139,124,255,0.2)] p-3 rounded-full border border-[rgba(139,124,255,0.5)] group-hover:scale-110 transition-transform">
                   <Flame className="text-[#8B7CFF] w-6 h-6" />
                 </div>
              </motion.div>
            </Link>
            <Link to="/escape-room">
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 p-6 rounded-2xl flex items-center justify-between hover:from-red-800/50 hover:to-orange-800/50 transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)] group cursor-pointer h-full">
                 <div>
                   <h3 className="text-xl font-bold text-white mb-1">Escape Room</h3>
                   <p className="text-sm text-red-200/70 text-left">Solve coding puzzles to survive</p>
                 </div>
                 <div className="bg-red-500/20 p-3 rounded-full border border-red-500/50 group-hover:scale-110 transition-transform">
                   <Target className="text-red-400 w-6 h-6" />
                 </div>
              </motion.div>
            </Link>
            <Link to="/metadata-dashboard">
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-teal-900/40 to-purple-900/40 border border-teal-500/30 p-6 rounded-2xl flex items-center justify-between hover:from-teal-800/50 hover:to-purple-800/50 transition-all shadow-[0_0_15px_rgba(0,200,200,0.2)] group cursor-pointer h-full">
                 <div>
                   <h3 className="text-xl font-bold text-white mb-1">Metadata Intel</h3>
                   <p className="text-sm text-teal-200/70">Analytics, tokens &amp; API keys</p>
                 </div>
                 <div className="bg-teal-500/20 p-3 rounded-full border border-teal-500/50 group-hover:scale-110 transition-transform">
                   <BookOpen className="text-teal-400 w-6 h-6" />
                 </div>
              </motion.div>
            </Link>
          </div>

          {/* Stats Row — REAL DATA from Metadata collection */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Current Streak"
              value={`${progress.currentStreak} days`}
              icon={Flame}
              variant="warning"
              trend={progress.currentStreak > 0 ? { value: Math.round((progress.currentStreak / Math.max(progress.longestStreak, 1)) * 100), positive: true } : undefined}
            />
            <StatsCard
              title="Learning Points"
              value={progress.totalLearningPoints.toLocaleString()}
              icon={Trophy}
              variant="primary"
            />
            <StatsCard
              title="Hours Invested"
              value={progress.totalHours}
              icon={Clock}
              variant="success"
            />
            <StatsCard
              title="Topics Completed"
              value={progress.completedTopics}
              icon={BookOpen}
              variant="default"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Focus Card — from coming_next */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <GlassCard className="h-full flex flex-col justify-center bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 shadow-glow">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Today's Focus</h2>
                </div>

                {todaysTopic ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-primary/80 font-medium tracking-wide mb-1 uppercase">{todaysTopic.module_name}</p>
                      <h3 className="text-3xl font-bold mb-4">{todaysTopic.title}</h3>
                      <div className="flex items-center gap-5 text-sm text-muted-foreground mb-6">
                        {todaysTopic.estimated_hours && (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary/50 rounded-full border border-border/50">
                            <Clock className="h-4 w-4 text-accent" />
                            {todaysTopic.estimated_hours}h
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary/50 rounded-full border border-border/50">
                          <Zap className="h-4 w-4 text-warning" />
                          +100 LP
                        </span>
                      </div>
                      <Link to={`/topic/${todaysTopic.topic_id}`}>
                        <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold group rounded-full px-6">
                          <Play className="h-4 w-4 mr-2" />
                          Execute Module
                          <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                    <div className="hidden md:flex justify-center items-center relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                      <ProgressRing progress={progressPercent} size={140} strokeWidth={8} showLabel={false} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      {career ? 'Load your roadmap to see upcoming topics.' : 'Complete career assessment first.'}
                    </p>
                    <Link to={career ? `/roadmap/${careerId}` : '/assessment'}>
                      <Button variant="outline">
                        {career ? 'Open Roadmap' : 'Take Assessment'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Progress Overview */}
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Global Trajectory</h2>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <ProgressRing progress={progressPercent} size={150} strokeWidth={10} showLabel={false} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{progressPercent}%</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Complete</p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-border/20 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Best streak</span>
                    <span className="font-semibold text-warning">{progress.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last active</span>
                    <span className="font-semibold text-primary">{formatTimeAgo(progress.lastActive)}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Gap Topics Alert */}
          {gapTopics.length > 0 && (
            <motion.div variants={itemVariants}>
              <GlassCard className="border-warning/30 bg-gradient-to-r from-warning/5 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-warning/20 p-2 rounded-xl border border-warning/30">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Skill Gaps Detected</h2>
                  <span className="ml-auto text-xs bg-warning/20 text-warning px-2 py-1 rounded-full font-semibold">
                    {gapTopics.length} areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {gapTopics.map((gap, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                        gap.severity === 'high'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : gap.severity === 'medium'
                          ? 'bg-warning/10 text-warning border-warning/30'
                          : 'bg-[rgba(139,124,255,0.1)] text-[#8B7CFF] border-[rgba(139,124,255,0.3)]'
                      }`}
                    >
                      {gap.title}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Phase 7 Gap Analysis */}
          <motion.div variants={itemVariants}>
            <GapAnalysisCard />
          </motion.div>

          {/* Activity & Upcoming Bento Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity — from metadata.recent_activity */}
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Activity History
                </h2>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/30 cursor-default"
                      >
                        <div className="bg-success/10 rounded-full p-1 border border-success/20">
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-foreground/90 group-hover:text-foreground transition-colors">{activity.topicName}</p>
                          <p className="text-xs text-muted-foreground tracking-wide uppercase mt-0.5">{formatTimeAgo(activity.completedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No activity yet. Start learning to see your history!</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Upcoming Topics — from metadata.coming_next */}
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Mission Queue
                </h2>
                {upcomingTopics.length > 0 ? (
                  <div className="space-y-3 flex-1">
                    {upcomingTopics.map((topic, index) => (
                      <Link
                        key={index}
                        to={`/topic/${topic.topic_id}`}
                        className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/30 transition-colors group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors shadow-inner">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors block truncate">{topic.title}</span>
                          <span className="text-xs text-muted-foreground">{topic.module_name}</span>
                        </div>
                        {topic.estimated_hours && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">{topic.estimated_hours}h</span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                    <Target className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                      {career ? 'Open your roadmap to populate the queue.' : 'Complete assessment to see upcoming topics.'}
                    </p>
                  </div>
                )}
                {career && (
                  <Link to={`/roadmap/${careerId}`} className="block mt-6">
                    <Button variant="outline" className="w-full bg-secondary/20 hover:bg-secondary border-border/50 group rounded-xl">
                      Deploy Full Roadmap
                      <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
