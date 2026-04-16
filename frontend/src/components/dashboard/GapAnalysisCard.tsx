import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, AlertTriangle, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

const GapAnalysisCard = () => {
  const [data, setData] = useState<GapAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem('auth_token');
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

  if (loading) {
    return (
      <Card className="glass-card animate-pulse shadow-glow">
        <CardHeader>
          <Skeleton className="h-6 w-1/3 bg-primary/20" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full bg-secondary/50" />
        </CardContent>
      </Card>
    );
  }

  if (!data || (data.skillGaps.length === 0 && data.weakAcademicConcepts.length === 0)) {
    return (
      <Card className="glass-card shadow-glow overflow-hidden relative border-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="h-32 w-32 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" />
            AI Gap Analysis & Recommendations (Phase 7 & 9)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You are doing fantastic! Keep completing topics to generate AI-driven insights about your learning gaps.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card shadow-glow overflow-hidden relative animate-fade-in group hover:shadow-glow-cyan transition-all border-primary/30">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <BrainCircuit className="h-48 w-48 text-primary" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
          <BrainCircuit className="h-6 w-6" />
          AI Gap Analysis & Recommendations (Phase 7 & 9)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <p className="text-foreground/90 font-medium text-sm border-l-2 border-primary pl-3">{data.analysis}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary/40 p-4 rounded-xl border border-secondary">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg Attention</div>
            <div className={`text-2xl font-bold ${data.overallAttention < 60 ? 'text-warning' : 'text-success'}`}>{data.overallAttention}%</div>
          </div>
          <div className="bg-secondary/40 p-4 rounded-xl border border-secondary">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Quiz Average</div>
            <div className={`text-2xl font-bold ${data.averageQuizScore < 70 ? 'text-destructive' : 'text-primary'}`}>{data.averageQuizScore}%</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Detected Gaps */}
          <div className="space-y-4">
            {data.skillGaps.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl backdrop-blur-sm">
                <h4 className="text-destructive font-semibold text-sm flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4" /> Detected Skill Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.skillGaps.map((gap, idx) => (
                    <span key={idx} className="bg-destructive/20 text-destructive-foreground text-xs px-2.5 py-1 rounded-full border border-destructive/30">
                      {gap}
                    </span>
                  ))}
                  {data.weakAcademicConcepts.map((concept, idx) => (
                    <span key={`weak-${idx}`} className="bg-warning/20 text-warning text-xs px-2.5 py-1 rounded-full border border-warning/30">
                      {concept} (Concept)
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.missingCertifications.length > 0 && (
              <div className="bg-secondary/50 border border-border p-4 rounded-xl backdrop-blur-sm">
                <h4 className="text-foreground font-semibold text-sm flex items-center gap-2 mb-2">
                  Missing Certifications
                </h4>
                <ul className="text-muted-foreground text-sm space-y-1 list-disc pl-4">
                  {data.missingCertifications.map((cert, idx) => (
                    <li key={idx}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl backdrop-blur-sm">
            <h4 className="text-primary font-semibold text-sm flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4" /> Recommended Action Path
            </h4>
            
            <div className="space-y-3">
              {data.recommendations.courses.length > 0 && (
                <div>
                  <h5 className="text-xs text-primary/80 uppercase tracking-wider mb-1">Courses & Remedial</h5>
                  <ul className="text-foreground/90 text-sm space-y-1 list-disc pl-4">
                    {data.recommendations.courses.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
                </div>
              )}
              {data.recommendations.projectSuggestions.length > 0 && (
                <div>
                  <h5 className="text-xs text-primary/80 uppercase tracking-wider mb-1">Projects</h5>
                  <ul className="text-foreground/90 text-sm space-y-1 list-disc pl-4">
                    {data.recommendations.projectSuggestions.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
                </div>
              )}
              {data.recommendations.practiceTests.length > 0 && (
                <div>
                  <h5 className="text-xs text-primary/80 uppercase tracking-wider mb-1">Practice</h5>
                  <ul className="text-foreground/90 text-sm space-y-1 list-disc pl-4">
                    {data.recommendations.practiceTests.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GapAnalysisCard;
