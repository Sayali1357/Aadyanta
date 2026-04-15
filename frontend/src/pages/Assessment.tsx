import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  Target,
  Rocket,
  Trophy,
  Zap,
  TrendingUp,
  BriefcaseBusiness,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CareerRecommendation, AssessmentData } from '@/types/career';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// ── Skill Categories ─────────────────────────────────────────
const skillCategories: Record<string, string[]> = {
  'Programming Languages': [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  ],
  'Web Development': [
    'HTML/CSS', 'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
  ],
  'Data & AI': [
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Analysis', 'SQL', 'Pandas', 'TensorFlow',
    'PyTorch', 'Tableau', 'Power BI', 'Statistics',
  ],
  'Cloud & DevOps': [
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'Git', 'Jenkins',
  ],
  'Design & Creative': [
    'Figma', 'Adobe Photoshop', 'Illustrator', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Typography',
  ],
  'Business & Soft Skills': [
    'Project Management', 'Leadership', 'Communication', 'Strategic Planning', 'Business Analysis',
    'Digital Marketing', 'SEO', 'Content Writing', 'Agile/Scrum',
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS (Swift)', 'Android (Kotlin)', 'Ionic',
  ],
  'Databases': [
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Cassandra', 'Elasticsearch',
  ],
};

const allSkills = Object.values(skillCategories).flat();

// ── Component ────────────────────────────────────────────────
const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    skills: [] as string[],
    goals: '',
  });

  const totalSteps = 3;

  // Filter skills based on search
  const filteredCategories = useMemo(() => {
    if (!skillSearch.trim()) return skillCategories;
    const search = skillSearch.toLowerCase();
    const result: Record<string, string[]> = {};
    for (const [cat, skills] of Object.entries(skillCategories)) {
      const matched = skills.filter(s => s.toLowerCase().includes(search));
      if (matched.length > 0) result[cat] = matched;
    }
    return result;
  }, [skillSearch]);

  // Toggle skill
  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  // Get AI recommendations
  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      // Use backend route instead of client-side Gemini (token optimization: uses KEY 1)
      const res = await fetch(`${API_URL}/user/career-recommend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: formData.skills,
          goals: formData.goals,
        }),
      });

      if (!res.ok) {
        // Fallback: use frontend gemini service
        const { geminiService } = await import('@/services/gemini');
        const assessmentData: AssessmentData = {
          interests: formData.skills.slice(0, 5),
          skills: formData.skills,
          education: 'undergraduate',
          goals: formData.goals,
          learningStyle: 'moderate',
          dailyHours: 2,
          aptitudeScores: { logical: 70, creative: 70, analytical: 70, communication: 70 },
        };

        const recommendations = await geminiService.recommendCareers(assessmentData);
        setCareers(recommendations.slice(0, 4));
      } else {
        const data = await res.json();
        setCareers((data.careers || data).slice(0, 4));
      }

      setStep(3);
      toast({
        title: 'Analysis Complete!',
        description: `Found career matches for you based on your skills.`,
      });
    } catch (err) {
      // Fallback to frontend gemini
      try {
        const { geminiService } = await import('@/services/gemini');
        const assessmentData: AssessmentData = {
          interests: formData.skills.slice(0, 5),
          skills: formData.skills,
          education: 'undergraduate',
          goals: formData.goals,
          learningStyle: 'moderate',
          dailyHours: 2,
          aptitudeScores: { logical: 70, creative: 70, analytical: 70, communication: 70 },
        };

        const recommendations = await geminiService.recommendCareers(assessmentData);
        setCareers(recommendations.slice(0, 4));
        setStep(3);
        toast({
          title: 'Analysis Complete!',
          description: `Found career matches for you.`,
        });
      } catch (fallbackErr) {
        const errorMessage = fallbackErr instanceof Error ? fallbackErr.message : 'Something went wrong';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Select a role and generate roadmap
  const handleGenerateRoadmap = async () => {
    if (!selectedCareer || !user) return;

    const selected = careers.find(c => c.id === selectedCareer);
    if (!selected) return;

    setIsSaving(true);
    try {
      // Save assessment + initialize metadata in backend
      await authService.saveCareerAssessment({
        selectedCareer: {
          careerId: selected.id,
          careerName: selected.name,
          domain: selected.domain,
          specialization: selected.specializations?.[0] || '',
          fitScore: selected.fitScore.overall,
          assessmentResults: {
            interestScore: selected.fitScore.breakdown.interest,
            aptitudeScore: selected.fitScore.breakdown.aptitude,
            personalityFit: selected.fitScore.breakdown.learningStyle,
            marketAlignment: selected.fitScore.breakdown.market,
          },
        },
        assessmentData: formData,
      });

      await refreshProfile();

      toast({
        title: '🚀 Roadmap is being generated!',
        description: `Your ${selected.name} learning path is ready.`,
      });

      navigate(`/roadmap/${selectedCareer}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your selection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.skills.length >= 2;
      case 2:
        return formData.goals.trim().length >= 10;
      default:
        return true;
    }
  };

  // Animation variants
  const pageVariants: Variants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.3 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
    }),
  };

  // Fit score to color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 60) return 'from-blue-500 to-cyan-400';
    if (score >= 40) return 'from-amber-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  return (
    <div className="min-h-screen py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="container max-w-4xl relative z-10">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="gradient-text">Career Assessment</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {step === 1 && 'Select the skills you already have'}
                {step === 2 && 'Define your career goal'}
                {step === 3 && 'AI-powered career recommendations'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    s < step
                      ? 'bg-primary text-white border-primary'
                      : s === step
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border/50 text-muted-foreground'
                  }`}>
                    {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-8 h-0.5 rounded-full transition-colors ${
                      s < step ? 'bg-primary' : 'bg-border/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Skills Selection ─────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <GlassCard disableHover className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500/15 p-2 rounded-xl border border-blue-500/25">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold">What skills do you already have?</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Select at least 2 skills you're familiar with. These help AI match you with the best career paths.
                </p>

                {/* Selected Skills Badges */}
                {formData.skills.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <motion.button
                        key={skill}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => toggleSkill(skill)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-400 text-white flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        {skill}
                        <span className="text-white/80">×</span>
                      </motion.button>
                    ))}
                    <span className="self-center text-xs text-muted-foreground ml-1">
                      {formData.skills.length} selected
                    </span>
                  </div>
                )}

                {/* Search */}
                <div className="relative mb-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/30 border border-border/40 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeCategory === null
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
                    }`}
                  >
                    All
                  </button>
                  {Object.keys(filteredCategories).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeCategory === cat
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-secondary/30 text-muted-foreground border border-transparent hover:bg-secondary/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Skills Grid */}
                <div className="max-h-[400px] overflow-y-auto pr-1 space-y-5">
                  {Object.entries(filteredCategories)
                    .filter(([cat]) => !activeCategory || cat === activeCategory)
                    .map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                formData.skills.includes(skill)
                                  ? 'bg-primary/15 text-primary border-primary/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]'
                                  : 'bg-secondary/20 text-foreground/70 border-border/30 hover:border-primary/30 hover:bg-secondary/40'
                              }`}
                            >
                              {formData.skills.includes(skill) && (
                                <CheckCircle2 className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
                              )}
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── STEP 2: Career Goals ─────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <GlassCard disableHover>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-500/15 p-2 rounded-xl border border-purple-500/25">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Define Your Career Goal</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Tell us what you want to achieve. The AI will use your skills and goals to find the best career matches.
                </p>

                {/* Skills Context */}
                <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/15">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
                    Your Selected Skills ({formData.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Career Goal Textarea */}
                <div className="space-y-3">
                  <Label htmlFor="goals" className="text-sm font-medium">
                    What do you want to achieve with these skills?
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="E.g., I want to become a full-stack developer and work at a product company. I'm interested in building web applications and want to earn a good salary in India..."
                    value={formData.goals}
                    onChange={e => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    rows={5}
                    className="resize-none bg-secondary/20 border-border/40 focus:border-primary/50 rounded-xl text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 The more specific you are, the better AI can recommend career paths. Mention your dream role, salary expectations, or companies you admire.
                  </p>
                </div>

                {/* Quick goal suggestions */}
                <div className="mt-5">
                  <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Build web applications at a top tech company',
                      'Become a data scientist and work with AI/ML',
                      'Start my own tech startup',
                      'Get a high-paying remote job in India',
                      'Transition into cloud computing & DevOps',
                    ].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => setFormData(prev => ({ ...prev, goals: suggestion }))}
                        className="px-3 py-1.5 rounded-lg text-xs bg-secondary/30 text-muted-foreground border border-border/30 hover:bg-secondary/50 hover:text-foreground transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── STEP 3: AI Recommendations ────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4 border border-emerald-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Analysis Complete
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Your Career Matches</h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                  Based on your <span className="text-foreground font-medium">{formData.skills.length} skills</span> and career
                  goals, here are your top matches with eligibility percentages.
                </p>
              </div>

              {/* 4 Career Cards */}
              <div className="grid md:grid-cols-2 gap-5 mb-8">
                {careers.map((career, index) => {
                  const score = career.fitScore?.overall ?? (career as any).fitScore ?? 0;
                  const isSelected = selectedCareer === career.id;

                  return (
                    <motion.div
                      key={career.id}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      onClick={() => setSelectedCareer(career.id)}
                      className={`relative cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 overflow-hidden group ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-glow'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Top highlight */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-60" style={{
                        backgroundImage: `linear-gradient(to right, ${score >= 80 ? '#10b981, #14b8a6' : score >= 60 ? '#3b82f6, #06b6d4' : '#f59e0b, #f97316'})`
                      }} />

                      {/* Selected indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 bg-primary rounded-full p-1"
                        >
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </motion.div>
                      )}

                      {/* Eligibility Score Circle */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative flex-shrink-0">
                          <svg className="w-16 h-16 -rotate-90">
                            <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(220 40% 14%)" strokeWidth="4" />
                            <motion.circle
                              cx="32" cy="32" r="26" fill="none"
                              stroke="url(#scoreGrad)"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 26}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - score / 100) }}
                              transition={{ duration: 1.2, delay: index * 0.15, ease: 'easeOut' }}
                            />
                            <defs>
                              <linearGradient id="scoreGrad">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}%</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{career.name}</h3>
                          <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary/50 text-muted-foreground uppercase tracking-wider">
                            {career.domain}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{career.description}</p>

                      {/* Required Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(career.requiredSkills || []).slice(0, 4).map(skill => (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              formData.skills.includes(skill)
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-secondary/30 text-muted-foreground border-border/20'
                            }`}
                          >
                            {formData.skills.includes(skill) && '✓ '}{skill}
                          </span>
                        ))}
                      </div>

                      {/* Market Info */}
                      {career.marketOutlook && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-white/[0.06]">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                            {career.marketOutlook.demand}
                          </span>
                          <span className="flex items-center gap-1">
                            <BriefcaseBusiness className="h-3 w-3 text-blue-400" />
                            {career.marketOutlook.salaryRange?.entry || '₹3-6L'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Generate Roadmap CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {selectedCareer ? (
                  <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/5 via-transparent to-cyan-500/5 p-6 text-center">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <p className="text-sm text-muted-foreground mb-1">
                      You've selected
                    </p>
                    <p className="text-lg font-bold text-foreground mb-4">
                      {careers.find(c => c.id === selectedCareer)?.name}
                      <span className="text-primary ml-2">
                        ({careers.find(c => c.id === selectedCareer)?.fitScore?.overall ?? 0}% match)
                      </span>
                    </p>
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={handleGenerateRoadmap}
                      disabled={isSaving}
                      className="shadow-glow hover:shadow-glow-cyan relative overflow-hidden group px-8"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Generating Roadmap...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5 mr-2" />
                          Generate My Roadmap
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/30 bg-secondary/10 p-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      👆 Select a career above to generate your personalized roadmap
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between mt-8"
          >
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step === 2 ? (
              <Button
                variant="hero"
                onClick={handleGetRecommendations}
                disabled={!canProceed() || isLoading}
                className="shadow-glow rounded-xl px-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    AI is Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="rounded-xl"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Back to step 2 from step 3 */}
        {step === 3 && (
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => setStep(2)} className="text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Goals
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
