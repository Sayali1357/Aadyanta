import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CareerCard from '@/components/career/CareerCard';
import { ArrowLeft, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/gemini';
import { CareerRecommendation, AssessmentData } from '@/types/career';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

const educationLevels = [
  { value: 'high-school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate (Pursuing)' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'post-graduate', label: 'Post Graduate' },
  { value: 'self-taught', label: 'Self-Taught' },
];

const interestOptions = [
  'Technology & Programming',
  'Data & Analytics',
  'Design & Creativity',
  'Business & Management',
  'Marketing & Sales',
  'Healthcare & Medicine',
  'Finance & Banking',
  'Education & Training',
  'Research & Science',
  'Media & Content Creation',
];

// Dynamic skills based on interests
const skillsByInterest: Record<string, string[]> = {
  'Technology & Programming': ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'Git', 'SQL'],
  'Data & Analytics': ['Python', 'SQL', 'Excel', 'Tableau', 'Machine Learning', 'Statistics', 'Data Visualization'],
  'Design & Creativity': ['Figma', 'Adobe Photoshop', 'Illustrator', 'UI/UX Design', 'Typography', 'Color Theory'],
  'Business & Management': ['Leadership', 'Project Management', 'Strategic Planning', 'Communication', 'Excel', 'Business Analysis'],
  'Marketing & Sales': ['Digital Marketing', 'SEO', 'Content Writing', 'Social Media', 'Communication', 'Analytics'],
  'Healthcare & Medicine': ['Medical Terminology', 'Patient Care', 'Clinical Skills', 'Anatomy', 'Pharmacology'],
  'Finance & Banking': ['Financial Analysis', 'Excel', 'Accounting', 'Risk Management', 'Investment Analysis'],
  'Education & Training': ['Teaching', 'Curriculum Development', 'Communication', 'Presentation Skills', 'Patience'],
  'Research & Science': ['Research Methods', 'Data Analysis', 'Critical Thinking', 'Lab Skills', 'Statistics'],
  'Media & Content Creation': ['Video Editing', 'Writing', 'Photography', 'Adobe Premiere', 'Storytelling'],
};

const Assessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [careers, setCareers] = useState<CareerRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    education: '',
    interests: [] as string[],
    skills: [] as string[],
    goals: '',
    learningPace: 'moderate' as 'slow' | 'moderate' | 'fast',
    dailyTimeCommitment: 2,
    preferredLanguage: 'hinglish' as 'english' | 'hindi' | 'hinglish',
  });

  const totalSteps = 3;

  // Get relevant skills based on selected interests
  const getRelevantSkills = (): string[] => {
    if (formData.interests.length === 0) {
      return ['Communication', 'Problem Solving', 'Leadership', 'Creativity', 'Teamwork'];
    }

    const skills = new Set<string>();
    formData.interests.forEach((interest) => {
      const interestSkills = skillsByInterest[interest] || [];
      interestSkills.forEach((skill) => skills.add(skill));
    });

    return Array.from(skills);
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
      skills: [], // Reset skills when interests change
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create assessment data
      const assessmentData: AssessmentData = {
        interests: formData.interests,
        skills: formData.skills,
        education: formData.education,
        goals: formData.goals,
        learningStyle: formData.learningPace,
        dailyHours: formData.dailyTimeCommitment,
        // Provide default aptitude scores (since we don't collect them via quiz)
        aptitudeScores: {
          logical: 70,
          creative: 70,
          analytical: 70,
          communication: 70,
        },
      };

      // Get AI recommendations
      const recommendations = await geminiService.recommendCareers(assessmentData);

      if (!recommendations || recommendations.length === 0) {
        throw new Error('No career recommendations received');
      }

      setCareers(recommendations);
      setStep(3);

      toast({
        title: 'Analysis Complete!',
        description: `Found ${recommendations.length} career matches for you.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCareerSelect = (careerId: string) => {
    setSelectedCareer(careerId);
  };

  const handleConfirmCareer = async () => {
    if (!selectedCareer || !user) return;

    const selected = careers.find((c) => c.id === selectedCareer);
    if (!selected) return;

    try {
      // Save assessment to backend
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
        title: 'Career Selected!',
        description: `Your personalized ${selected.name} roadmap is ready.`,
      });

      navigate(`/roadmap/${selectedCareer}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your selection. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.education && formData.interests.length > 0;
      case 2:
        return formData.skills.length > 0 && formData.goals.trim().length > 10;
      default:
        return true;
    }
  };

  const relevantSkills = getRelevantSkills();

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-3xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Career Assessment</h1>
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && step === 2 && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Something went wrong</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Education & Interests */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Tell us about yourself</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>What's your current education level?</Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, education: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>What areas interest you? (Select at least 1)</Label>
                <p className="text-xs text-muted-foreground">
                  💡 Select based on what you enjoy - this helps us show relevant skills in the next step
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <div
                      key={interest}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.interests.includes(interest)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => handleInterestToggle(interest)}
                    >
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <span className="text-sm">{interest}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Skills & Goals */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-semibond mb-6">Skills & Career Goals</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>What skills do you already have?</Label>
                <p className="text-xs text-muted-foreground">
                  {formData.interests.length > 0
                    ? `Based on your interests (${formData.interests.join(', ')}), here are relevant skills:`
                    : 'Select your interests first to see relevant skills'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {relevantSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.skills.includes(skill)
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">
                  What are your career goals? What do you want to achieve?
                </Label>
                <Textarea
                  id="goals"
                  placeholder="E.g., I want to transition into tech, earn a good salary, work at a top company, build my own startup..."
                  value={formData.goals}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, goals: e.target.value }))
                  }
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  The more detail you provide, the better our AI can recommend careers for you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                AI Analysis Complete!
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Personalized Career Matches</h2>
              <p className="text-muted-foreground">
                Based on your profile, here are the best career matches recommended by AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {careers.map((career) => (
                <div
                  key={career.id}
                  onClick={() => handleCareerSelect(career.id)}
                  className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${selectedCareer === career.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <h3 className="text-lg font-semibold mb-2">{career.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{career.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{career.fitScore.overall}%</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                      {career.domain}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedCareer && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center animate-scale-in">
                <p className="text-sm text-muted-foreground mb-3">
                  You've selected{' '}
                  <strong className="text-foreground">
                    {careers.find((c) => c.id === selectedCareer)?.name}
                  </strong>
                </p>
                <Button variant="hero" size="lg" onClick={handleConfirmCareer}>
                  View Learning Roadmap
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 3 && (
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step === 2 ? (
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI is Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assessment;
