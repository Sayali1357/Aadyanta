import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizQuestion, quizService } from '@/services/quizService';
import { Loader2, CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Local result type for this modal's evaluation
interface QuizEvalResult {
  score: number;
  totalQuestions: number;
  accuracy: number;
  weakAreas: string[];
  strongAreas: string[];
}

interface QuizModalProps {
  topicName: string;
  domain: string;
  onComplete: (result: QuizEvalResult) => void;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ topicName, domain, onComplete, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizEvalResult | null>(null);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setResult(null);

    try {
      // generateQuiz expects (moduleName, topics[])
      const topics = [{ id: topicName.toLowerCase().replace(/\s+/g, '_'), name: topicName }];
      const generated = await quizService.generateQuiz(topicName, topics);

      if (!generated || generated.length === 0) {
        throw new Error('No questions were generated. The AI service may be temporarily unavailable.');
      }

      // Validate that each question has the required fields
      const validQuestions = generated.filter(
        (q) => q.question && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer
      );

      if (validQuestions.length === 0) {
        throw new Error('Generated questions were malformed. Please try again.');
      }

      setQuestions(validQuestions);
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [topicName]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Evaluate locally
    let score = 0;
    const weakSet = new Set<string>();
    const strongSet = new Set<string>();

    questions.forEach((q, idx) => {
      const selectedIdx = answers[idx];
      const selectedOption = selectedIdx !== undefined ? q.options[selectedIdx] : '';
      if (selectedOption === q.correctAnswer) {
        score++;
        strongSet.add(q.topicName || topicName);
      } else {
        weakSet.add(q.topicName || topicName);
      }
    });

    // Remove from weak if also in strong
    strongSet.forEach(s => weakSet.delete(s));

    const evalResult: QuizEvalResult = {
      score,
      totalQuestions: questions.length,
      accuracy: questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
      weakAreas: Array.from(weakSet),
      strongAreas: Array.from(strongSet),
    };

    setResult(evalResult);
    setIsSubmitted(true);
  };

  const handleFinish = () => {
    if (result) onComplete(result);
  };

  // ── LOADING STATE ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg" style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium" style={{ color: '#A0A3B1' }}>
              Generating quiz for <span style={{ color: '#B69CFF' }}>{topicName}</span>...
            </p>
            <p className="text-sm" style={{ color: '#6B6F7A' }}>
              This may take a few seconds
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── ERROR STATE ───────────────────────────────────────────
  if (error || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg" style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="h-12 w-12" style={{ color: '#FF8A6C' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#EAEAF0' }}>
              Quiz Generation Failed
            </h3>
            <p className="text-sm text-center leading-relaxed" style={{ color: '#A0A3B1' }}>
              {error || 'Could not generate quiz questions for this topic.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={fetchQuiz}
                className="gap-2"
                style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff' }}
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
              <Button variant="ghost" onClick={onClose} style={{ color: '#6B6F7A' }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── RESULTS STATE ─────────────────────────────────────────
  if (isSubmitted && result) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl" style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-2xl" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text">
                {result.score} / {result.totalQuestions}
              </div>
              <p className="mt-1" style={{ color: '#6B6F7A' }}>Accuracy: {result.accuracy}%</p>
            </div>

            <Progress value={result.accuracy} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,138,108,0.06)', border: '1px solid rgba(255,138,108,0.15)' }}>
                <h4 className="font-semibold flex items-center gap-2 mb-2" style={{ color: '#FF8A6C' }}>
                  <AlertCircle className="h-4 w-4" /> Weak Areas to Review
                </h4>
                <ul className="text-sm space-y-1 list-disc pl-4" style={{ color: '#FFB199' }}>
                  {result.weakAreas.length > 0 ? (
                    result.weakAreas.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)
                  ) : (
                    <li>None! Perfect score!</li>
                  )}
                </ul>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(86,211,100,0.06)', border: '1px solid rgba(86,211,100,0.15)' }}>
                <h4 className="font-semibold flex items-center gap-2 mb-2" style={{ color: '#56D364' }}>
                  <CheckCircle2 className="h-4 w-4" /> Strong Concepts
                </h4>
                <ul className="text-sm space-y-1 list-disc pl-4" style={{ color: '#7ee787' }}>
                  {result.strongAreas.length > 0 ? (
                    result.strongAreas.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)
                  ) : (
                     <li>Need more practice.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <Button onClick={handleFinish} style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff' }}>
              Continue Learning
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ── QUIZ QUESTIONS STATE ──────────────────────────────────
  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl" style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.05)' }}>
        <CardHeader style={{ background: '#0D0E14', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#8B7CFF' }}>Knowledge Check</span>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(139,124,255,0.1)', color: '#B69CFF' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          {/* Progress bar for question navigation */}
          <div className="w-full h-1 rounded-full mt-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
                background: 'linear-gradient(90deg, #8B7CFF, #B69CFF)',
              }}
            />
          </div>
          <CardTitle className="text-xl leading-relaxed mt-3" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
            {currentQ?.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(currentIndex, idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  answers[currentIndex] === idx 
                    ? 'shadow-md' 
                    : 'hover:border-[rgba(139,124,255,0.3)]'
                }`}
                style={{
                  background: answers[currentIndex] === idx ? 'rgba(139,124,255,0.08)' : '#0D0E14',
                  borderColor: answers[currentIndex] === idx ? 'rgba(139,124,255,0.4)' : 'rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs`}
                    style={{
                      borderColor: answers[currentIndex] === idx ? '#8B7CFF' : 'rgba(255,255,255,0.15)',
                      background: answers[currentIndex] === idx ? '#8B7CFF' : 'transparent',
                      color: answers[currentIndex] === idx ? '#fff' : '#6B6F7A',
                    }}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span style={{ color: answers[currentIndex] === idx ? '#EAEAF0' : '#A0A3B1' }}>
                    {opt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4" style={{ background: '#0D0E14', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} style={{ color: '#6B6F7A' }}>Cancel</Button>
            
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}
                style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff' }}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={answers[currentIndex] === undefined}
                style={{ background: 'rgba(139,124,255,0.15)', color: '#B69CFF', border: '1px solid rgba(139,124,255,0.3)' }}>
                Next
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizModal;
