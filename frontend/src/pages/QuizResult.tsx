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
    <div className="min-h-screen py-8">
      <div className="container max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2" style={{ color: '#A0A3B1' }}>
          <ChevronLeft className="h-4 w-4" /> Go Back
        </Button>

        {/* Header Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 rounded-[14px] p-8 text-white shadow-lg flex flex-col justify-center"
            style={{ background: 'linear-gradient(135deg, #8B7CFF, #6B5CE7)', boxShadow: '0 0 30px -8px rgba(139,124,255,0.4)' }}>
            <h1 className="text-2xl opacity-90 font-medium mb-1" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>Module Quiz Results</h1>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>{result.score} / {result.total} Correct</h2>
            <div className="flex gap-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${isGoodScore ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                {percentage}% Score
              </span>
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm">
                Module Assessment
              </span>
            </div>
          </div>
          
          <div className="rounded-[14px] p-6 shadow-sm flex flex-col items-center justify-center text-center"
            style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Target className={`h-12 w-12 mb-4 ${isGoodScore ? 'text-green-500' : 'text-amber-500'}`} />
            <h3 className="font-semibold text-lg" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
              {isGoodScore ? 'Great Job!' : 'Keep Practicing'}
            </h3>
            <p className="text-sm mt-2" style={{ color: '#6B6F7A' }}>
              {isGoodScore ? 'You have a solid grasp of these topics.' : 'Review your weak areas to improve.'}
            </p>
          </div>
        </div>

        {/* Topics to Revise */}
        {result.weakTopics && result.weakTopics.length > 0 && (
          <div className="rounded-[14px] p-6 mb-8"
            style={{ background: 'rgba(255,138,108,0.05)', border: '1px solid rgba(255,138,108,0.15)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"
                style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#FF8A6C' }}>
                <BookOpen className="h-5 w-5" /> Topics to Revise
              </h3>
              <Button
                size="sm"
                className="gap-2 rounded-full"
                style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff', border: 'none' }}
                onClick={() => navigate('/dashboard')}
              >
                <Target className="h-4 w-4" />
                Go to Roadmap
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {result.weakTopics.map((topic, i) => (
                <span key={i} className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: '#12141C', color: '#FFB199', border: '1px solid rgba(255,138,108,0.2)' }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Questions Breakdown */}
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"
          style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
          <BrainCircuit className="h-6 w-6" style={{ color: '#8B7CFF' }} /> Detailed Review
        </h3>
        
        <div className="space-y-6">
          {result.questions.map((q, idx) => {
            const isCorrect = q.userAnswer === q.correctAnswer;
            
            return (
              <div key={idx} className="rounded-[14px] p-6"
                style={{
                  background: '#12141C',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: `4px solid ${isCorrect ? '#56D364' : '#FF8A6C'}`,
                }}>
                <div className="flex gap-4 items-start">
                  <div className="pt-1">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6" style={{ color: '#FF8A6C' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#6B6F7A' }}>Question {idx + 1}</span>
                      {q.topicName && (
                        <span className="text-xs px-2 py-0.5 rounded font-medium"
                          style={{ background: 'rgba(139,124,255,0.1)', color: '#B69CFF' }}>
                          {q.topicName}
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-lg leading-relaxed mb-4" style={{ color: '#EAEAF0' }}>
                      {q.question}
                    </p>

                    <div className="grid gap-3">
                      {q.options.map((opt, oIdx) => {
                        const isUserAnswer = opt === q.userAnswer;
                        const isActualCorrect = opt === q.correctAnswer;
                        
                        let bg = '#0D0E14';
                        let border = 'rgba(255,255,255,0.05)';
                        let color = '#6B6F7A';
                        if (isActualCorrect) {
                          bg = 'rgba(86,211,100,0.08)';
                          border = 'rgba(86,211,100,0.2)';
                          color = '#56D364';
                        } else if (isUserAnswer && !isActualCorrect) {
                          bg = 'rgba(255,138,108,0.08)';
                          border = 'rgba(255,138,108,0.2)';
                          color = '#FF8A6C';
                        }

                        return (
                          <div key={oIdx} className="p-3 rounded-lg text-sm flex items-center justify-between"
                            style={{ background: bg, border: `1px solid ${border}`, color }}>
                            <span>{opt}</span>
                            {isActualCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {isUserAnswer && !isActualCorrect && <XCircle className="h-4 w-4" style={{ color: '#FF8A6C' }} />}
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
