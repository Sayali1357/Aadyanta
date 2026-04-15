import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizQuestion, QuizResult, quizService } from '@/services/quizService';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface QuizModalProps {
  topicName: string;
  domain: string;
  onComplete: (result: QuizResult) => void;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ topicName, domain, onComplete, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const generated = await quizService.generateQuiz(topicName, domain, 5);
      setQuestions(generated);
      setLoading(false);
    };
    fetchQuiz();
  }, [topicName, domain]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
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
    const evalResult = quizService.evaluateQuiz(questions, answers);
    setResult(evalResult);
    setIsSubmitted(true);
    // Optionally call onComplete right away or after a user clicks "Done"
  };

  const handleFinish = () => {
    if (result) onComplete(result);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-white">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium text-slate-700">Generating personalized quiz for {topicName}...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white border-slate-200">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {result.score} / {result.totalQuestions}
              </div>
              <p className="text-muted-foreground mt-1">Accuracy: {result.accuracy}%</p>
            </div>

            <Progress value={result.accuracy} className="h-2" indicatorclassName={result.accuracy > 70 ? 'bg-green-500' : 'bg-yellow-500'} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4" /> Weak Areas to Review
                </h4>
                <ul className="text-sm text-red-600 space-y-1 list-disc pl-4">
                  {result.weakAreas.length > 0 ? (
                    result.weakAreas.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)
                  ) : (
                    <li>None! Perfect score!</li>
                  )}
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4" /> Strong Concepts
                </h4>
                <ul className="text-sm text-green-600 space-y-1 list-disc pl-4">
                  {result.strongAreas.length > 0 ? (
                    result.strongAreas.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)
                  ) : (
                     <li>Need more practice.</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={handleFinish} className="bg-blue-600 hover:bg-blue-700">Continue Learning</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Phase 6 Knowledge Check</span>
            <span className="text-sm font-medium bg-slate-200 px-3 py-1 rounded-full text-slate-700">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <CardTitle className="text-xl leading-relaxed">{currentQ?.text}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {currentQ?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(currentQ.id, idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  answers[currentQ.id] === idx 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                    answers[currentQ.id] === idx ? 'border-primary bg-primary text-white' : 'border-slate-300 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={answers[currentQ.id] === idx ? 'font-medium text-primary' : 'text-slate-700'}>
                    {opt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-slate-50 border-t p-4">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} className="text-slate-500">Cancel</Button>
            
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="bg-primary hover:bg-primary/90">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={answers[currentQ?.id] === undefined}>
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
