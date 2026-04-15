import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, type Variants } from "framer-motion";
import {
  Flame,
  Trophy,
  Clock,
  BookOpen,
  ArrowLeft,
  Target,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RefreshCw,
  Database,
  Key,
  BarChart3,
  Activity,
  Brain,
  Shield,
  TrendingUp,
  Calendar,
  Award,
  Eye,
  Server,
  Cpu,
  Gauge,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { authService } from "@/services/authService";

// ── Types ────────────────────────────────────────────────────
interface MetadataDashboardData {
  account: {
    userId: string;
    username: string;
    email: string;
    joinedAt: string;
    career: {
      careerId: string;
      careerName: string;
      domain: string;
      fitScore: number;
    } | null;
  };
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalLearningPoints: number;
    progress: number;
    hoursInvested: number;
    topicsCompleted: number;
    totalRoadmapTopics: number;
    lastActive: string | null;
  };
  completedTopics: {
    topicId: string;
    topicName: string;
    completedAt: string;
    timeSpent: number;
    attentionScore: number | null;
    distractionCount: number;
    quizResult: {
      score: number;
      total_questions: number;
      accuracy: number;
      weak_areas: string[];
      strong_areas: string[];
    } | null;
  }[];
  recentActivity: {
    topic_name: string;
    action: string;
    completed_at: string;
  }[];
  comingNext: {
    topic_id: string;
    title: string;
    module_name: string;
    estimated_hours?: number;
  }[];
  gapTopics: {
    topic_id: string;
    title: string;
    reason: string;
    severity: string;
  }[];
  milestones: {
    name: string;
    description?: string;
    achieved_at: string;
    badge_icon?: string;
  }[];
  analytics: {
    avgTimePerTopic: number;
    totalTimeSpentMinutes: number;
    avgQuizScore: number;
    avgAttentionScore: number;
    quizPerformance: {
      topicName: string;
      score: number;
      total: number;
      accuracy: number;
      weakAreas: string[];
      strongAreas: string[];
    }[];
    attentionHistory: {
      topicName: string;
      score: number;
      distractions: number;
    }[];
    completionTimeline: { date: string; count: number }[];
    topicsWithQuiz: number;
    topicsWithAttention: number;
  };
}

interface ApiStats {
  cache: { _id: string; count: number; totalHits: number }[];
  keyUsage: {
    uptime: string;
    startedAt: string;
    keys: Record<
      string,
      {
        key: string;
        calls: number;
        estimatedInputTokens: number;
        estimatedOutputTokens: number;
        totalEstimatedTokens: number;
        cacheHits: number;
        cacheMisses: number;
        cacheEfficiency: string;
        errors: number;
        avgResponseTimeMs: number;
        lastUsed: string | null;
        estimatedCostUSD: number;
      }
    >;
  };
}

// ── Animated Number Counter ──────────────────────────────────
const AnimatedNumber = ({ value, duration = 1200 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
};

// ── Mini Progress Bar ────────────────────────────────────────
const MiniBar = ({ value, max, color = "primary" }: { value: number; max: number; color?: string }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorMap: Record<string, string> = {
    primary: "from-blue-500 to-cyan-400",
    success: "from-emerald-500 to-teal-400",
    warning: "from-amber-500 to-orange-400",
    danger: "from-red-500 to-pink-400",
    purple: "from-purple-500 to-violet-400",
  };
  return (
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.primary}`}
      />
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────
const MetadataDashboard = () => {
  const [data, setData] = useState<MetadataDashboardData | null>(null);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = authService.getToken();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [metaRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/user/metadata-dashboard`, { headers }),
        fetch(`${API_URL}/user/api-stats`, { headers }),
      ]);

      if (!metaRes.ok) throw new Error("Failed to load metadata dashboard");
      const metaData = await metaRes.json();
      setData(metaData);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setApiStats(statsData);
      }
    } catch (err: any) {
      console.error("MetadataDashboard fetch error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────
  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // ── Animation Variants ──────────────────────────────────────
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // ── LOADING ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen py-8 pt-12 text-foreground relative z-10">
        <div className="container max-w-7xl">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-3" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ───────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen py-8 pt-12 text-foreground relative z-10 flex items-center justify-center">
        <GlassCard className="max-w-md text-center p-8">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to Load</h2>
          <p className="text-muted-foreground mb-6">{error || "Please try again."}</p>
          <Button onClick={fetchData} variant="outline" className="shadow-glow">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  // ── Derived ─────────────────────────────────────────────────
  const { account, stats, completedTopics, recentActivity, comingNext, gapTopics, milestones, analytics } = data;
  const keyEntries = apiStats?.keyUsage?.keys ? Object.entries(apiStats.keyUsage.keys) : [];
  const totalApiCalls = keyEntries.reduce((s, [, v]) => s + v.calls, 0);
  const totalTokens = keyEntries.reduce((s, [, v]) => s + v.totalEstimatedTokens, 0);
  const totalCost = keyEntries.reduce((s, [, v]) => s + v.estimatedCostUSD, 0);

  const featureLabels: Record<string, string> = {
    roadmap: "Roadmap & Resources",
    quiz: "Quiz Generation",
    interview: "Interview AI",
  };
  const featureColors: Record<string, string> = {
    roadmap: "from-blue-500 to-cyan-400",
    quiz: "from-purple-500 to-violet-400",
    interview: "from-emerald-500 to-teal-400",
  };
  const featureIcons: Record<string, typeof Key> = {
    roadmap: Target,
    quiz: Brain,
    interview: Activity,
  };

  return (
    <div className="min-h-screen py-8 pt-12 text-foreground relative z-10">
      <div className="container max-w-7xl relative">
        {/* ── Header ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2.5 rounded-xl border border-blue-500/30">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Metadata</span> Intelligence
              </h1>
            </div>
            <p className="text-muted-foreground">
              Complete analytics for <span className="text-foreground font-medium">{account.username}</span>'s learning metadata collection
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchData} variant="outline" className="bg-secondary/20 hover:bg-secondary border-border/50 group rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" />
              Refresh
            </Button>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6">
          {/* ── Account Info Banner ────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex flex-wrap items-center gap-6">
                <div className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 w-16 h-16 rounded-2xl border border-blue-500/40 flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                  {account.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">{account.username}</h2>
                  <p className="text-blue-200/70 text-sm">{account.email}</p>
                  <p className="text-xs text-blue-300/50 mt-1">Joined {formatDate(account.joinedAt)}</p>
                </div>
                {account.career && (
                  <div className="text-right">
                    <p className="text-sm text-blue-200/80 font-medium">{account.career.careerName}</p>
                    <p className="text-xs text-blue-300/50">
                      {account.career.domain} • Fit: {account.career.fitScore}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Core Stats Grid ────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Topics Done", value: stats.topicsCompleted, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", sub: `of ${stats.totalRoadmapTopics} total` },
              { title: "Learning Pts", value: stats.totalLearningPoints, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", sub: `${stats.progress}% complete` },
              { title: "Current Streak", value: stats.currentStreak, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", sub: `Best: ${stats.longestStreak} days` },
              { title: "Hours Invested", value: stats.hoursInvested, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", sub: formatTimeAgo(stats.lastActive) },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <div className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stat.bg}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold tracking-tight">
                        <AnimatedNumber value={stat.value} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Analytics Summary Row ─────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/15 p-2 rounded-xl border border-purple-500/25">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Quiz Analytics</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Avg Score</span>
                      <span className="font-semibold text-purple-400">{analytics.avgQuizScore}%</span>
                    </div>
                    <MiniBar value={analytics.avgQuizScore} max={100} color="purple" />
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                    <span className="text-muted-foreground">Quizzes Taken</span>
                    <span className="font-medium">{analytics.topicsWithQuiz}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-500/15 p-2 rounded-xl border border-cyan-500/25">
                    <Eye className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Attention Score</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Avg Attention</span>
                      <span className="font-semibold text-cyan-400">{analytics.avgAttentionScore}%</span>
                    </div>
                    <MiniBar value={analytics.avgAttentionScore} max={100} color="primary" />
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                    <span className="text-muted-foreground">Sessions Tracked</span>
                    <span className="font-medium">{analytics.topicsWithAttention}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <GlassCard className="h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/15 p-2 rounded-xl border border-emerald-500/25">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">Time Analytics</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Time</span>
                    <span className="font-semibold text-emerald-400">{analytics.totalTimeSpentMinutes}m</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                    <span className="text-muted-foreground">Avg/Topic</span>
                    <span className="font-medium">{analytics.avgTimePerTopic}m</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/20">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{stats.progress}%</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* ── API Key Usage & Token Optimization ─────────── */}
          {apiStats && keyEntries.length > 0 && (
            <motion.div variants={itemVariants}>
              <GlassCard disableHover>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-2.5 rounded-xl border border-amber-500/30">
                    <Key className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">API Key Management — 3-Key Architecture</h2>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {apiStats.keyUsage.uptime} • Total Calls: {totalApiCalls} • Est. Tokens: {totalTokens.toLocaleString()} • Cost: ${totalCost.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {keyEntries.map(([feature, usage]) => {
                    const FeatureIcon = featureIcons[feature] || Key;
                    return (
                      <div
                        key={feature}
                        className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60" style={{
                          backgroundImage: `linear-gradient(to right, ${feature === 'roadmap' ? '#3b82f6, #06b6d4' : feature === 'quiz' ? '#8b5cf6, #a78bfa' : '#10b981, #14b8a6'})`
                        }} />

                        <div className="flex items-center gap-2 mb-3">
                          <FeatureIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-semibold text-sm">{featureLabels[feature] || feature}</h4>
                        </div>

                        <p className="text-[10px] text-muted-foreground/70 font-mono mb-3 truncate">
                          🔑 {usage.key}
                        </p>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">API Calls</span>
                            <span className="font-semibold">{usage.calls}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Input Tokens</span>
                            <span className="font-mono text-blue-400">{usage.estimatedInputTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Output Tokens</span>
                            <span className="font-mono text-cyan-400">{usage.estimatedOutputTokens.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-white/5">
                            <span className="text-muted-foreground">Cache Efficiency</span>
                            <span className={`font-semibold ${parseInt(usage.cacheEfficiency) >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {usage.cacheEfficiency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Response</span>
                            <span className="font-mono">{usage.avgResponseTimeMs}ms</span>
                          </div>
                          {usage.errors > 0 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Errors</span>
                              <span className="text-red-400 font-semibold">{usage.errors}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-white/5">
                            <span className="text-muted-foreground">Est. Cost</span>
                            <span className="font-mono text-emerald-400">${usage.estimatedCostUSD.toFixed(6)}</span>
                          </div>
                        </div>

                        {/* Token Distribution Bar */}
                        <div className="mt-3">
                          <MiniBar
                            value={usage.totalEstimatedTokens}
                            max={Math.max(totalTokens, 1)}
                            color={feature === 'roadmap' ? 'primary' : feature === 'quiz' ? 'purple' : 'success'}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cache Stats */}
                {apiStats.cache && apiStats.cache.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-border/20">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      DB Cache Statistics
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      {apiStats.cache.map((entry) => (
                        <div key={entry._id} className="bg-white/[0.03] px-4 py-2.5 rounded-xl border border-white/[0.06] text-sm">
                          <span className="text-muted-foreground">{entry._id || "unknown"}: </span>
                          <span className="font-semibold text-foreground">{entry.count} entries</span>
                          <span className="text-muted-foreground"> • </span>
                          <span className="text-cyan-400">{entry.totalHits} hits</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* ── Completed Topics + Gap Topics Row ──────────── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Completed Topics */}
            <motion.div variants={itemVariants}>
              <GlassCard disableHover className="h-full">
                <button
                  onClick={() => toggleSection("completed")}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Completed Topics
                    <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-semibold ml-1">
                      {completedTopics.length}
                    </span>
                  </h2>
                  {expandedSection === "completed" ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {completedTopics.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {(expandedSection === "completed" ? completedTopics : completedTopics.slice(0, 5)).map((topic, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm text-foreground/90 truncate flex-1">{topic.topicName}</p>
                          <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                            {formatDate(topic.completedAt)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] mt-1.5">
                          {topic.timeSpent != null && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/15">
                              {topic.timeSpent}m spent
                            </span>
                          )}
                          {topic.attentionScore != null && (
                            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md border border-cyan-500/15">
                              Attn: {topic.attentionScore}%
                            </span>
                          )}
                          {topic.quizResult && (
                            <span className={`px-2 py-0.5 rounded-md border ${
                              (topic.quizResult.score / topic.quizResult.total_questions) >= 0.6
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                                : 'bg-red-500/10 text-red-400 border-red-500/15'
                            }`}>
                              Quiz: {topic.quizResult.score}/{topic.quizResult.total_questions}
                            </span>
                          )}
                          {topic.distractionCount > 0 && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/15">
                              {topic.distractionCount} distractions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {!expandedSection && completedTopics.length > 5 && (
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        +{completedTopics.length - 5} more — click header to expand
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground text-sm">No completed topics yet</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>

            {/* Gap Topics + Milestones */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
              {/* Gap Topics */}
              <GlassCard disableHover className="flex-1">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Gap Topics
                  {gapTopics.length > 0 && (
                    <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-semibold ml-1">
                      {gapTopics.length}
                    </span>
                  )}
                </h2>
                {gapTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {gapTopics.map((gap, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border ${
                          gap.severity === "high"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : gap.severity === "medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        <p className="font-semibold">{gap.title}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">
                          {gap.reason.replace(/_/g, " ")} • {gap.severity}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">No skill gaps detected 🎉</p>
                )}
              </GlassCard>

              {/* Milestones */}
              <GlassCard disableHover className="flex-1">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Milestones
                  {milestones.length > 0 && (
                    <span className="text-xs bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded-full font-semibold ml-1">
                      {milestones.length}
                    </span>
                  )}
                </h2>
                {milestones.length > 0 ? (
                  <div className="space-y-2">
                    {milestones.map((ms, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                        <div className="text-xl">{ms.badge_icon || "🏆"}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ms.name}</p>
                          {ms.description && <p className="text-[10px] text-muted-foreground mt-0.5">{ms.description}</p>}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{formatDate(ms.achieved_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">Complete topics to earn achievements ✨</p>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Recent Activity + Coming Next ─────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <GlassCard disableHover className="h-full">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Recent Activity Queue
                  <span className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{recentActivity.length}/10</span>
                </h2>
                {recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                        <div className="bg-emerald-500/10 rounded-full p-1 border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{activity.topic_name}</p>
                          <p className="text-[10px] text-muted-foreground">{activity.action} • {formatTimeAgo(activity.completed_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                )}
              </GlassCard>
            </motion.div>

            {/* Coming Next */}
            <motion.div variants={itemVariants}>
              <GlassCard disableHover className="h-full">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  Coming Next
                  <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">{comingNext.length}</span>
                </h2>
                {comingNext.length > 0 ? (
                  <div className="space-y-2">
                    {comingNext.map((topic, i) => (
                      <Link
                        key={i}
                        to={`/topic/${topic.topic_id}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{topic.title}</p>
                          <p className="text-[10px] text-muted-foreground">{topic.module_name}</p>
                        </div>
                        {topic.estimated_hours && (
                          <span className="text-xs text-muted-foreground">{topic.estimated_hours}h</span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Load roadmap to populate queue</p>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* ── Completion Timeline ────────────────────────── */}
          {analytics.completionTimeline.length > 0 && (
            <motion.div variants={itemVariants}>
              <GlassCard disableHover>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Completion Timeline
                </h2>
                <div className="flex items-end gap-1.5 h-24">
                  {analytics.completionTimeline.slice(-30).map((entry, i) => {
                    const maxCount = Math.max(...analytics.completionTimeline.map((e) => e.count), 1);
                    const height = (entry.count / maxCount) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end group relative" title={`${entry.date}: ${entry.count} topics`}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border/50 px-2 py-1 rounded-md text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                          {entry.date}: {entry.count}
                        </div>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(height, 8)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.03 }}
                          className="w-full rounded-t-sm bg-gradient-to-t from-purple-500/60 to-violet-400/40 hover:from-purple-400 hover:to-violet-300 transition-colors cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>{analytics.completionTimeline[0]?.date}</span>
                  <span>{analytics.completionTimeline[analytics.completionTimeline.length - 1]?.date}</span>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── Raw Collection Schema Info ─────────────────── */}
          <motion.div variants={itemVariants}>
            <GlassCard disableHover>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-500/15 p-2 rounded-xl border border-indigo-500/25">
                  <Cpu className="h-5 w-5 text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold">Collection Schema</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-xs">
                {[
                  { name: "users", fields: "username, email, password, selectedCareer, metadata_id, active_roadmap_id", icon: Shield },
                  { name: "metadatas", fields: "user_id, streaks, points, progress, hours, completed_topics[], recent_activity[], coming_next[], gap_topics[], milestones[]", icon: Database },
                  { name: "roadmaps", fields: "roadmap_id, career_id, career_name, domain, modules[{topics[{subtopics[], content, youtube, articles}]}]", icon: Target },
                ].map((col) => (
                  <div key={col.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                      <col.icon className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-semibold text-indigo-300 font-mono">{col.name}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed break-words">{col.fields}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MetadataDashboard;
