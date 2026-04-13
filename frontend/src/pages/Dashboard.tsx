import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import ProgressRing from "@/components/roadmap/ProgressRing";
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

  return (
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, <span className="gradient-text">{userData.name}!</span>
            </h1>
            <p className="text-muted-foreground">
              You're on track to become a {userData.career}. Keep up the great work!
            </p>
          </div>
          <Link to="/roadmap/data-scientist">
            <Button variant="hero">
              Continue Learning
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          {/* Today's Focus Card */}
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="gradient-primary p-2 rounded-lg">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Today's Focus</h2>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{todaysTopic.module}</p>
                <h3 className="text-2xl font-bold mb-4">{todaysTopic.topic}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {todaysTopic.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {todaysTopic.resources} resources
                  </span>
                </div>
                <Link to="/topic/linear-regression">
                  <Button variant="hero" className="group">
                    <Play className="h-4 w-4" />
                    Start Learning
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
              <div className="hidden md:block">
                <ProgressRing progress={progress} size={120} strokeWidth={8} />
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
            <div className="flex items-center justify-center mb-6">
              <ProgressRing progress={progress} size={140} strokeWidth={10} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{progress}%</p>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. completion</span>
                <span className="font-medium">6 weeks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity & Upcoming */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity */}
          <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  {activity.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-primary flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.topic}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Topics */}
          <div className="bg-card rounded-2xl border border-border p-6 animate-fade-in">
            <h2 className="text-lg font-semibold mb-4">Coming Up Next</h2>
            <div className="space-y-3">
              {upcomingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{topic}</span>
                </div>
              ))}
            </div>
            <Link to="/roadmap/data-scientist" className="block mt-4">
              <Button variant="outline" className="w-full">
                View Full Roadmap
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
