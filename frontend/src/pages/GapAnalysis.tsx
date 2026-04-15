import React, { useEffect, useState } from 'react';
import { BrainCircuit, AlertTriangle, Lightbulb, BookOpen, FileText, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface GapAnalysisData {
  skillGaps: string[];
  missingCertifications: string[];
  requiredProjects: string[];
  weakAcademicConcepts: string[];
  recommendations: {
    courses: string[];
    practiceTests: string[];
    projectSuggestions: string[];
    certifications: string[];
  };
  overallAttention: number;
  averageQuizScore: number;
  analysis: string;
}

const GapAnalysis = () => {
  const [data, setData] = useState<GapAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/user/gap-analysis`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch gap analysis', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 container max-w-6xl">
         <div className="animate-pulse space-y-8">
            <div className="h-12 bg-primary/20 rounded-md w-1/3 mb-10"></div>
            <div className="h-64 bg-secondary/30 rounded-2xl w-full"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-64 bg-secondary/30 rounded-2xl w-full"></div>
              <div className="h-64 bg-secondary/30 rounded-2xl w-full"></div>
            </div>
         </div>
      </div>
    );
  }

  if (!data || (data.skillGaps.length === 0 && data.weakAcademicConcepts.length === 0)) {
    return (
      <div className="min-h-screen py-12 container max-w-5xl flex items-center justify-center">
        <GlassCard className="text-center p-12 max-w-lg">
          <BrainCircuit className="h-24 w-24 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold mb-4">No Gaps Detected Yet</h2>
          <p className="text-muted-foreground mb-8">
            Keep learning! Once you complete more topics, videos, and quizzes, the AI will build a personalized gap analysis to optimize your personalized career roadmap.
          </p>
          <Button variant="hero" onClick={() => window.history.back()}>
            Return to Dashboard
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
           <div className="inline-flex items-center px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold tracking-wider uppercase mb-4 backdrop-blur-md gap-2">
             <BrainCircuit className="h-4 w-4" /> AI Diagnostics
           </div>
           <h1 className="text-4xl font-bold mb-4">Gap Analysis & Recommendations</h1>
           <p className="text-muted-foreground text-lg max-w-3xl">
             Our AI engine actively monitors your quiz performance, attention levels, and academic concepts to identify hidden skill gaps. We automatically re-route your roadmap bridging those weaknesses so you're always career-ready.
           </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-12 gap-8"
        >
          {/* Top Level Analysis */}
          <motion.div variants={itemVariants} className="lg:col-span-12">
            <GlassCard className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
              <div className="absolute right-0 top-0 opacity-5 p-8 pointer-events-none">
                <BrainCircuit className="h-64 w-64 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Diagnostic Summary</h3>
              <p className="text-lg text-foreground/90 border-l-4 border-primary pl-4 py-1 leading-relaxed">
                {data.analysis}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <div className="bg-background/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Cognitive Focus</div>
                  <div className={`text-3xl font-bold ${data.overallAttention < 60 ? 'text-warning' : 'text-success'}`}>{data.overallAttention}%</div>
                </div>
                <div className="bg-background/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Quiz Average</div>
                  <div className={`text-3xl font-bold ${data.averageQuizScore < 70 ? 'text-destructive' : 'text-primary'}`}>{data.averageQuizScore}%</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Left Column: Deficiencies */}
          <motion.div variants={itemVariants} className="lg:col-span-6 space-y-8">
            <GlassCard className="h-full">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                 <AlertTriangle className="h-5 w-5 text-destructive" /> Needs Improvement
               </h3>
               
               <div className="space-y-6">
                 <div>
                   <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Identified Skill Gaps</h4>
                   <div className="flex flex-wrap gap-2">
                     {data.skillGaps.map((gap, i) => (
                       <span key={i} className="px-3 py-1.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                         {gap}
                       </span>
                     ))}
                   </div>
                 </div>

                 {data.weakAcademicConcepts.length > 0 && (
                   <div>
                     <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Academic Weaknesses</h4>
                     <div className="flex flex-wrap gap-2">
                       {data.weakAcademicConcepts.map((concept, i) => (
                         <span key={i} className="px-3 py-1.5 bg-warning/10 border border-warning/20 text-warning text-sm rounded-lg">
                           {concept}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            </GlassCard>
          </motion.div>

          {/* Right Column: Recommendations */}
          <motion.div variants={itemVariants} className="lg:col-span-6 space-y-8">
            <GlassCard className="h-full bg-primary/5">
               <h3 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-border/50 pb-4 text-primary">
                 <Lightbulb className="h-5 w-5" /> Remediation Plan
               </h3>
               
               <div className="space-y-6">
                 {data.recommendations.courses.length > 0 && (
                   <div>
                     <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <BookOpen className="h-4 w-4" /> Recommended Courses
                     </h4>
                     <ul className="space-y-2">
                       {data.recommendations.courses.map((course, i) => (
                         <li key={i} className="flex items-start gap-2 text-foreground/90 bg-background/50 p-2.5 rounded-lg border border-border/30">
                           <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                           <span className="text-sm leading-relaxed">{course}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {data.recommendations.projectSuggestions.length > 0 && (
                   <div>
                     <h4 className="text-sm font-semibold text-accent/80 uppercase tracking-wider mb-3 flex items-center gap-2">
                       <Briefcase className="h-4 w-4" /> Project Prescriptions
                     </h4>
                     <ul className="space-y-2">
                       {data.recommendations.projectSuggestions.map((proj, i) => (
                         <li key={i} className="flex items-start gap-2 text-foreground/90 bg-background/50 p-2.5 rounded-lg border border-border/30">
                           <ArrowRight className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                           <span className="text-sm leading-relaxed">{proj}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
            </GlassCard>
          </motion.div>

          {/* Bottom Spanning Row: Certifications & Practice */}
          <motion.div variants={itemVariants} className="lg:col-span-12">
            <GlassCard>
               <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-success" /> Missing Certifications
                    </h3>
                    {data.missingCertifications.length > 0 ? (
                      <ul className="space-y-3">
                        {data.missingCertifications.concat(data.recommendations.certifications).map((cert, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm bg-secondary/30 p-3 rounded-xl border border-secondary">
                            <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                               <FileText className="h-4 w-4 text-success" />
                            </div>
                            {cert}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">You are currently fully certified for this tier.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-primary" /> Required Practice Tests
                    </h3>
                    {data.recommendations.practiceTests.length > 0 ? (
                      <ul className="space-y-3">
                        {data.recommendations.practiceTests.map((test, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm bg-secondary/30 p-3 rounded-xl border border-secondary">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                               <BrainCircuit className="h-4 w-4 text-primary" />
                            </div>
                            {test}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No critical practice tests required at this moment.</p>
                    )}
                  </div>
               </div>
            </GlassCard>
            
            <div className="mt-8 flex justify-end">
              <Button variant="hero" className="px-8 shadow-glow-cyan text-lg py-6 rounded-2xl group">
                 Update Career Roadmap 
                 <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default GapAnalysis;
