import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { quizService, QuizQuestion } from '@/services/quizService';
import { Loader2, ArrowLeft, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

export default function Quiz() {
  const { roadmapId, moduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const moduleName = location.state?.moduleName || 'Module Quiz';
  const topics = location.state?.topics || [];

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const generateMutation = useMutation({
    mutationFn: () => quizService.generateQuiz(moduleName, topics),
    onSuccess: (data) => {
      setQuestions(data);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate quiz');
    }
  });

  const submitMutation = useMutation({
    mutationFn: (answersList: QuizQuestion[]) => quizService.submitQuiz({
      roadmapId: roadmapId || 'unknown',
      moduleId: moduleId || 'unknown',
      moduleName,
      answers: answersList,
    }),
    onSuccess: (data) => {
      navigate(`/quiz-result/${data.resultId}`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit quiz');
    }
  });

  useEffect(() => {
    // Automatically generate quiz on mount
    if (topics.length > 0 && generateMutation.isIdle) {
      generateMutation.mutate();
    }
  }, [topics, generateMutation]);

  const handleOptionSelect = (opt: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIdx]: opt }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }
    const submissionData = questions.map((q, idx) => ({
      ...q,
      userAnswer: answers[idx]
    }));
    submitMutation.mutate(submissionData);
  };

  if (!roadmapId || !moduleId || topics.length === 0) {
    return (
      <div className="min-h-screen py-12 text-center text-muted-foreground flex flex-col justify-center items-center">
        <p className="mb-4">Could not load module or topics. Navigate from roadmap to start the quiz.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  if (generateMutation.isPending) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-bold animate-pulse">Generating your quiz...</h2>
        <p className="text-muted-foreground mt-2">Gemini AI is crafting questions specifically for the {moduleName} topics...</p>
      </div>
    );
  }

  if (questions.length === 0 && generateMutation.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20 text-center max-w-md">
          <p className="font-semibold mb-2">Quiz generation failed</p>
          <p className="text-sm opacity-80 mb-4">
            {(generateMutation.error as any)?.message?.includes('Rate limit') || (generateMutation.error as any)?.message?.includes('rate limit')
              ? 'The AI service is rate-limited. Please wait 30 seconds and try again.'
              : (generateMutation.error as any)?.message || 'The AI service is temporarily unavailable. Please try again.'}
          </p>
          <Button onClick={() => generateMutation.mutate()} className="mt-2" variant="outline">
            Retry Generating Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const q = questions[currentQuestionIdx];
  const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-indigo-50/50 via-white to-sky-50/50">
      <div className="container max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Exit Quiz
          </Button>
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20 shadow-sm">
            <BrainCircuit className="h-4 w-4" /> {moduleName}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2 font-medium">
            <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border shadow-inner">
            <div 
              className="h-full bg-primary bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-card border shadow-lg rounded-2xl p-6 md:p-8 relative overflow-hidden ring-1 ring-border/50">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <h2 className="text-xl md:text-2xl font-semibold mb-6 flex gap-4 leading-relaxed">
            <span className="text-muted-foreground opacity-50 shrink-0">{currentQuestionIdx + 1}.</span>
            {q.question}
          </h2>

          <div className="space-y-3 mt-6">
            {q.options.map((opt, i) => {
              const isSelected = answers[currentQuestionIdx] === opt;
              return (
                <button
                  key={i}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 text-primary shadow-sm scale-[1.01]' 
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50 text-card-foreground'
                  }`}
                  onClick={() => handleOptionSelect(opt)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="font-medium text-sm md:text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIdx === 0 || submitMutation.isPending}
            className="px-6 shadow-sm hover:shadow-md transition-shadow"
          >
            Previous
          </Button>

          {currentQuestionIdx === questions.length - 1 ? (
            <Button 
              onClick={handleSubmit} 
              disabled={submitMutation.isPending}
              className="px-8 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Answers
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestionIdx]}
              className="px-8 shadow-md hover:shadow-lg transition-all"
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
