import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { quizService } from '@/services/quizService';
import { CheckCircle2, XCircle, ChevronLeft, Loader2, BookOpen, BrainCircuit, Target } from 'lucide-react';

export default function QuizResult() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['quizResult', quizId],
    queryFn: () => quizService.getResult(quizId as string),
    enabled: !!quizId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="min-h-screen py-12 text-center flex flex-col justify-center items-center">
        <p className="mb-4 text-destructive">Could not load quiz results.</p>
        <Button onClick={() => navigate('/dashboard')} variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);
  const isGoodScore = percentage >= 70;

  return (
    <div className="min-h-screen py-8 bg-gray-50/50">
      <div className="container max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ChevronLeft className="h-4 w-4" /> Go Back
        </Button>

        {/* Header Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg flex flex-col justify-center">
            <h1 className="text-2xl opacity-90 font-medium mb-1">Module Quiz Results</h1>
            <h2 className="text-4xl font-bold mb-4">{result.score} / {result.total} Correct</h2>
            <div className="flex gap-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${isGoodScore ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                {percentage}% Score
              </span>
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm">
                Module Assessment
              </span>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl p-6 border shadow-sm flex flex-col items-center justify-center text-center">
            <Target className={`h-12 w-12 mb-4 ${isGoodScore ? 'text-green-500' : 'text-amber-500'}`} />
            <h3 className="font-semibold text-lg">{isGoodScore ? 'Great Job!' : 'Keep Practicing'}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {isGoodScore ? 'You have a solid grasp of these topics.' : 'Review your weak areas to improve.'}
            </p>
          </div>
        </div>

        {/* Topics to Revise */}
        {result.weakTopics && result.weakTopics.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-destructive flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5" /> Topics to Revise
            </h3>
            <div className="flex flex-wrap gap-3">
              {result.weakTopics.map((topic, i) => (
                <span key={i} className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-destructive/80 border border-destructive/20 shadow-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Questions Breakdown */}
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" /> Detailed Review
        </h3>
        
        <div className="space-y-6">
          {result.questions.map((q, idx) => {
            const isCorrect = q.userAnswer === q.correctAnswer;
            
            return (
              <div key={idx} className={`bg-card rounded-xl p-6 border shadow-sm ${isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
                <div className="flex gap-4 items-start">
                  <div className="pt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-muted-foreground">Question {idx + 1}</span>
                      {q.topicName && (
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium">
                          {q.topicName}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-lg leading-relaxed mb-4 text-card-foreground">
                      {q.question}
                    </p>

                    <div className="grid gap-3">
                      {q.options.map((opt, oIdx) => {
                        const isUserAnswer = opt === q.userAnswer;
                        const isActualCorrect = opt === q.correctAnswer;
                        
                        let style = "bg-secondary/30 border-transparent text-muted-foreground";
                        if (isActualCorrect) {
                          style = "bg-green-50 border-green-200 text-green-800 font-medium";
                        } else if (isUserAnswer && !isActualCorrect) {
                          style = "bg-red-50 border-red-200 text-red-800 font-medium";
                        }

                        return (
                          <div key={oIdx} className={`p-3 rounded-lg border text-sm flex items-center justify-between ${style}`}>
                            <span>{opt}</span>
                            {isActualCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {isUserAnswer && !isActualCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
