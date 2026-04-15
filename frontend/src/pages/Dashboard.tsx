import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import GapAnalysisCard from "@/components/dashboard/GapAnalysisCard";
import ProgressRing from "@/components/roadmap/ProgressRing";
import { GlassCard } from "@/components/ui/glass-card";
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
} from "lucide-react";

const Dashboard = () => {
  // Mock user data
  const userData = {
    name: "Alex",
    career: "Data Scientist",
    streak: 7,
    points: 1250,
    hoursSpent: 24,
    topicsCompleted: 12,
    totalTopics: 45,
  };

  const progress = Math.round((userData.topicsCompleted / userData.totalTopics) * 100);

  const todaysTopic = {
    module: "Machine Learning Basics",
    topic: "Linear Regression",
    duration: "2 hours",
    resources: 4,
  };

  const recentActivity = [
    { topic: "Python for Data Science", completed: true, date: "Today" },
    { topic: "NumPy Fundamentals", completed: true, date: "Yesterday" },
    { topic: "Pandas Data Manipulation", completed: true, date: "2 days ago" },
    { topic: "Data Visualization with Matplotlib", completed: false, date: "In progress" },
  ];

  const upcomingTopics = [
    "Linear Regression",
    "Logistic Regression",
    "Decision Trees",
    "Random Forests",
  ];

  // Animation Variants for Container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

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
              Welcome back, <span className="gradient-text">{userData.name}!</span>
            </h1>
            <p className="text-muted-foreground">
              You're on track to become a {userData.career}. Keep up the great work!
            </p>
          </div>
          <Link to="/roadmap/data-scientist">
            <Button variant="hero" className="shadow-glow hover:shadow-glow-cyan relative overflow-hidden group">
              <span className="relative z-10 flex items-center">
                Continue Training
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <Link to="/life-simulation">
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 p-6 rounded-2xl flex items-center justify-between hover:from-blue-800/50 hover:to-indigo-800/50 transition-all shadow-glow-cyan group rounded-2xl cursor-pointer">
                 <div>
                   <h3 className="text-xl font-bold text-white mb-1">Life Simulation Dashboard</h3>
                   <p className="text-sm text-blue-200/70">Manage stats, energy, and career progression</p>
                 </div>
                 <div className="bg-blue-500/20 p-3 rounded-full border border-blue-500/50 group-hover:scale-110 transition-transform">
                   <Flame className="text-blue-400 w-6 h-6" />
                 </div>
              </motion.div>
            </Link>
            <Link to="/escape-room">
              <motion.div variants={itemVariants} className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 p-6 rounded-2xl flex items-center justify-between hover:from-red-800/50 hover:to-orange-800/50 transition-all shadow-[0_0_15px_rgba(255,0,0,0.3)] group cursor-pointer">
                 <div>
                   <h3 className="text-xl font-bold text-white mb-1">Escape Room Mode</h3>
                   <p className="text-sm text-red-200/70 text-left">Solve coding puzzles to survive & escape</p>
                 </div>
                 <div className="bg-red-500/20 p-3 rounded-full border border-red-500/50 group-hover:scale-110 transition-transform">
                   <Target className="text-red-400 w-6 h-6" />
                 </div>
              </motion.div>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Current Streak"
              value={`${userData.streak} days`}
              icon={Flame}
              variant="warning"
              trend={{ value: 40, positive: true }}
            />
            <StatsCard
              title="Total Points"
              value={userData.points.toLocaleString()}
              icon={Trophy}
              variant="primary"
            />
            <StatsCard
              title="Hours Invested"
              value={userData.hoursSpent}
              icon={Clock}
              variant="success"
            />
            <StatsCard
              title="Topics Completed"
              value={`${userData.topicsCompleted}/${userData.totalTopics}`}
              icon={BookOpen}
              variant="default"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Focus Card (Large Bento) */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <GlassCard className="h-full flex flex-col justify-center bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 shadow-glow">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">Today's Focus</h2>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-primary/80 font-medium tracking-wide mb-1 uppercase">{todaysTopic.module}</p>
                    <h3 className="text-3xl font-bold mb-4">{todaysTopic.topic}</h3>
                    <div className="flex items-center gap-5 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary/50 rounded-full border border-border/50">
                        <Clock className="h-4 w-4 text-accent" />
                        {todaysTopic.duration}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary/50 rounded-full border border-border/50">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {todaysTopic.resources} resources
                      </span>
                    </div>
                    <Link to="/topic/linear-regression">
                      <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold group rounded-full px-6">
                        <Play className="h-4 w-4 mr-2" />
                        Execute Module
                        <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                  <div className="hidden md:flex justify-center items-center relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <ProgressRing progress={progress} size={140} strokeWidth={8} showLabel={false} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Progress Overview (Small Bento) */}
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-4 text-foreground">Global Trajectory</h2>
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  <ProgressRing progress={progress} size={150} strokeWidth={10} showLabel={false} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">{progress}%</p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Complete</p>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-border/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. completion</span>
                    <span className="font-semibold text-primary">6 weeks</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Phase 7 Gap Analysis */}
          <motion.div variants={itemVariants}>
            <GapAnalysisCard />
          </motion.div>

          {/* Activity & Upcoming Bento Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Activity History
                </h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/30 cursor-default"
                    >
                      {activity.completed ? (
                        <div className="bg-success/10 rounded-full p-1 border border-success/20">
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full border-2 border-primary/50 flex-shrink-0 bg-primary/5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-foreground/90 group-hover:text-foreground transition-colors">{activity.topic}</p>
                        <p className="text-xs text-muted-foreground tracking-wide uppercase mt-0.5">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Upcoming Topics */}
            <motion.div variants={itemVariants}>
              <GlassCard className="h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Mission Queue
                </h2>
                <div className="space-y-3 flex-1">
                  {upcomingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/30 transition-colors group cursor-default"
                    >
                      <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors shadow-inner">
                        {index + 1}
                      </div>
                      <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">{topic}</span>
                    </div>
                  ))}
                </div>
                <Link to="/roadmap/data-scientist" className="block mt-6">
                  <Button variant="outline" className="w-full bg-secondary/20 hover:bg-secondary border-border/50 group rounded-xl">
                    Deploy Full Roadmap
                    <ArrowRight className="h-4 w-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
