import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import {
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Types ────────────────────────────────────────────────────
interface Flashcard {
  index: number;
  moduleId: string;
  moduleName: string;
  question: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

interface KaizenStatus {
  status: 'locked' | 'waiting' | 'ready' | 'complete';
  message?: string;
  progress?: number;
  nextReviewDate?: string;
  daysRemaining?: number;
  hoursRemaining?: number;
  currentDay?: number;
  modulesRemaining?: number;
  totalModules?: number;
  sessionsCompleted?: number;
  totalSessions?: number;
}

interface FlashcardsResponse {
  currentDay: number;
  totalModules: number;
  modulesInSession: number;
  flashcards: Flashcard[];
}

interface SubmitResponse {
  score: number;
  total: number;
  accuracy: number;
  isComplete: boolean;
  nextDay: number | null;
  nextReviewDate: string | null;
  modulesRemaining: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  KaizenRevision — Dashboard Section Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const KaizenRevision = () => {
  const queryClient = useQueryClient();

  // ── Local state ────────────────────────────────────────
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [sessionResult, setSessionResult] = useState<SubmitResponse | null>(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [loadingSession, setLoadingSession] = useState(false);

  // ── Fetch Kaizen status ────────────────────────────────
  const { data: status, isLoading: statusLoading } = useQuery<KaizenStatus>({
    queryKey: ['kaizenStatus'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/kaizen/status`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // ── Start session: fetch flashcards ────────────────────
  const startSession = useCallback(async () => {
    setLoadingSession(true);
    try {
      const res = await fetch(`${API_URL}/kaizen/flashcards`, { headers: getAuthHeaders() });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load flashcards');
      }
      const data: FlashcardsResponse = await res.json();
      setFlashcards(data.flashcards);
      setCurrentDay(data.currentDay);
      setActiveCardIndex(0);
      setExpandedCard(0); // auto-expand first card
      setAnswers({});
      setShowResult(false);
      setSessionResult(null);
      setIsSessionActive(true);
    } catch (err) {
      console.error('Kaizen start error:', err);
    } finally {
      setLoadingSession(false);
    }
  }, []);

  // ── Submit session ─────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async (answerPayload: any[]) => {
      const res = await fetch(`${API_URL}/kaizen/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answers: answerPayload }),
      });
      if (!res.ok) throw new Error('Submission failed');
      return res.json() as Promise<SubmitResponse>;
    },
    onSuccess: (data) => {
      setSessionResult(data);
      setShowResult(true);
      queryClient.invalidateQueries({ queryKey: ['kaizenStatus'] });
    },
  });

  // ── Handle answer selection ────────────────────────────
  const handleAnswer = (cardIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [cardIndex]: answer }));
    // Auto-advance to next card after delay
    setTimeout(() => {
      if (cardIndex < flashcards.length - 1) {
        setActiveCardIndex(cardIndex + 1);
        setExpandedCard(cardIndex + 1);
      } else {
        setExpandedCard(null);
      }
    }, 600);
  };

  // ── Submit all answers ─────────────────────────────────
  const handleSubmit = () => {
    const payload = flashcards.map((card, idx) => ({
      moduleId: card.moduleId,
      moduleName: card.moduleName,
      question: card.question.question,
      options: card.question.options,
      correctAnswer: card.question.correctAnswer,
      userAnswer: answers[idx] || '',
    }));
    submitMutation.mutate(payload);
  };

  // ── Reset session ──────────────────────────────────────
  const resetSession = () => {
    setIsSessionActive(false);
    setFlashcards([]);
    setShowResult(false);
    setSessionResult(null);
  };

  // ── Loading ────────────────────────────────────────────
  if (statusLoading) {
    return (
      <GlassCard disableHover className="animate-pulse">
        <div className="h-32 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  LOCKED STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!status || status.status === 'locked') {
    return (
      <GlassCard disableHover className="relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(107,111,122,0.15)', border: '1px solid rgba(107,111,122,0.2)' }}>
            <Lock className="h-5 w-5" style={{ color: '#6B6F7A' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#6B6F7A' }}>
              Kaizen Daily Revision
            </h2>
            <p className="text-xs" style={{ color: '#4a4d55' }}>Spaced repetition system</p>
          </div>
        </div>
        <div className="text-center py-6">
          <Lock className="h-10 w-10 mx-auto mb-3" style={{ color: '#4a4d55' }} />
          <p className="text-sm font-medium" style={{ color: '#6B6F7A' }}>
            Complete your roadmap to unlock Kaizen revision
          </p>
          {status?.progress !== undefined && (
            <div className="mt-4 max-w-xs mx-auto">
              <div className="flex justify-between text-xs mb-1" style={{ color: '#4a4d55' }}>
                <span>Progress</span>
                <span>{status.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${status.progress}%`, background: 'linear-gradient(90deg, #8B7CFF, #B69CFF)' }}
                />
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  COMPLETE STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status.status === 'complete') {
    return (
      <GlassCard disableHover style={{ borderColor: 'rgba(86,211,100,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(86,211,100,0.12)', border: '1px solid rgba(86,211,100,0.25)' }}>
            <Trophy className="h-5 w-5" style={{ color: '#56D364' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#56D364' }}>Kaizen Complete</h2>
            <p className="text-xs" style={{ color: '#6B6F7A' }}>All revision stages finished</p>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm" style={{ color: '#A0A3B1' }}>{status.message}</p>
          <p className="text-xs mt-2" style={{ color: '#6B6F7A' }}>{status.totalSessions} sessions completed</p>
        </div>
      </GlassCard>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  SESSION RESULT STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (showResult && sessionResult) {
    return (
      <GlassCard disableHover>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(139,124,255,0.12)', border: '1px solid rgba(139,124,255,0.25)' }}>
            <Sparkles className="h-5 w-5" style={{ color: '#8B7CFF' }} />
          </div>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>Session Complete</h2>
        </div>

        <div className="text-center mb-5">
          <div className="text-4xl font-bold mb-1" style={{
            background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {sessionResult.score} / {sessionResult.total}
          </div>
          <p className="text-sm" style={{ color: '#6B6F7A' }}>Accuracy: {sessionResult.accuracy}%</p>
        </div>

        {/* Answer breakdown */}
        <div className="space-y-2 mb-5 max-h-48 overflow-y-auto pr-1">
          {flashcards.map((card, idx) => {
            const userAns = answers[idx];
            const isCorrect = userAns === card.question.correctAnswer;
            return (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg text-sm"
                style={{
                  background: isCorrect ? 'rgba(86,211,100,0.06)' : 'rgba(255,138,108,0.06)',
                  border: `1px solid ${isCorrect ? 'rgba(86,211,100,0.15)' : 'rgba(255,138,108,0.15)'}`,
                }}>
                {isCorrect
                  ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#56D364' }} />
                  : <XCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#FF8A6C' }} />
                }
                <span className="truncate" style={{ color: isCorrect ? '#7ee787' : '#FFB199' }}>
                  {card.moduleName}
                </span>
              </div>
            );
          })}
        </div>

        {sessionResult.isComplete ? (
          <div className="text-center p-4 rounded-xl mb-4" style={{ background: 'rgba(86,211,100,0.06)', border: '1px solid rgba(86,211,100,0.15)' }}>
            <Trophy className="h-8 w-8 mx-auto mb-2" style={{ color: '#56D364' }} />
            <p className="text-sm font-semibold" style={{ color: '#56D364' }}>
              All Kaizen stages completed! 🎉
            </p>
          </div>
        ) : (
          <div className="text-center p-3 rounded-xl mb-4" style={{ background: 'rgba(139,124,255,0.06)', border: '1px solid rgba(139,124,255,0.12)' }}>
            <p className="text-xs" style={{ color: '#B69CFF' }}>
              Next session: Day {sessionResult.nextDay} • {sessionResult.modulesRemaining} module{sessionResult.modulesRemaining !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <Button
          onClick={resetSession}
          className="w-full rounded-xl text-sm"
          style={{ background: 'rgba(139,124,255,0.12)', color: '#B69CFF', border: '1px solid rgba(139,124,255,0.2)' }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-2" />
          Back to Dashboard
        </Button>
      </GlassCard>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ACTIVE SESSION: Flashcard interaction
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isSessionActive && flashcards.length > 0) {
    const allAnswered = Object.keys(answers).length >= flashcards.length;

    return (
      <GlassCard disableHover>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(139,124,255,0.12)', border: '1px solid rgba(139,124,255,0.2)' }}>
              <Layers className="h-4 w-4" style={{ color: '#8B7CFF' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
                Day {currentDay} Session
              </h2>
              <p className="text-[10px]" style={{ color: '#6B6F7A' }}>
                {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(139,124,255,0.1)', color: '#B69CFF' }}>
            {Object.keys(answers).length}/{flashcards.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(Object.keys(answers).length / flashcards.length) * 100}%`,
              background: 'linear-gradient(90deg, #8B7CFF, #B69CFF)',
            }}
          />
        </div>

        {/* Flashcards list */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {flashcards.map((card, idx) => {
            const isExpanded = expandedCard === idx;
            const isAnswered = answers[idx] !== undefined;
            const userAns = answers[idx];
            const isCorrect = isAnswered ? userAns === card.question.correctAnswer : null;
            const isCurrent = idx === activeCardIndex;

            return (
              <div key={idx} className="transition-all duration-300"
                style={{ opacity: 1, transform: 'translateY(0)' }}>

                {/* Card header — always visible */}
                <button
                  onClick={() => {
                    if (!isAnswered) {
                      setExpandedCard(isExpanded ? null : idx);
                      setActiveCardIndex(idx);
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: isAnswered
                      ? isCorrect ? 'rgba(86,211,100,0.05)' : 'rgba(255,138,108,0.05)'
                      : isCurrent ? 'rgba(139,124,255,0.06)' : '#0D0E14',
                    border: `1px solid ${
                      isAnswered
                        ? isCorrect ? 'rgba(86,211,100,0.15)' : 'rgba(255,138,108,0.15)'
                        : isCurrent ? 'rgba(139,124,255,0.2)' : 'rgba(255,255,255,0.04)'
                    }`,
                  }}
                >
                  {/* Number / status badge */}
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      background: isAnswered
                        ? isCorrect ? 'rgba(86,211,100,0.15)' : 'rgba(255,138,108,0.15)'
                        : 'rgba(139,124,255,0.12)',
                      color: isAnswered
                        ? isCorrect ? '#56D364' : '#FF8A6C'
                        : '#8B7CFF',
                    }}>
                    {isAnswered ? (isCorrect ? '✓' : '✗') : card.index}
                  </div>

                  <span className="flex-1 text-sm font-medium truncate"
                    style={{ color: isAnswered ? '#6B6F7A' : '#EAEAF0' }}>
                    {card.moduleName}
                  </span>

                  {!isAnswered && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 transition-transform duration-200"
                      style={{ color: '#6B6F7A', transform: isExpanded ? 'rotate(90deg)' : 'none' }} />
                  )}
                </button>

                {/* Expanded: question + options (CSS transition) */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: isExpanded && !isAnswered ? '400px' : '0px',
                    opacity: isExpanded && !isAnswered ? 1 : 0,
                  }}
                >
                  <div className="px-3 pb-3 pt-2 ml-10">
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: '#A0A3B1' }}>
                      {card.question.question}
                    </p>
                    <div className="space-y-2">
                      {card.question.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleAnswer(idx, opt)}
                          className="w-full text-left p-2.5 rounded-lg text-xs transition-all duration-150 hover:scale-[1.01]"
                          style={{
                            background: '#0D0E14',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#A0A3B1',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]"
                              style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#6B6F7A' }}>
                              {String.fromCharCode(65 + oIdx)}
                            </div>
                            <span className="flex-1">{opt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit bar */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {allAnswered ? (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)', color: '#fff' }}
            >
              {submitMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Submit Session
            </Button>
          ) : (
            <p className="text-center text-xs" style={{ color: '#6B6F7A' }}>
              Answer all flashcards to submit
            </p>
          )}
        </div>
      </GlassCard>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  WAITING STATE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status.status === 'waiting') {
    return (
      <GlassCard disableHover>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <Clock className="h-5 w-5" style={{ color: '#00E5FF' }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
              Kaizen Daily Revision
            </h2>
            <p className="text-xs" style={{ color: '#6B6F7A' }}>
              Day {status.currentDay} • {status.modulesRemaining} module{status.modulesRemaining !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="text-center py-6">
          <Clock className="h-10 w-10 mx-auto mb-3" style={{ color: '#00E5FF', opacity: 0.5 }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#A0A3B1' }}>
            {status.message}
          </p>
          <p className="text-xs" style={{ color: '#6B6F7A' }}>
            {status.sessionsCompleted} session{status.sessionsCompleted !== 1 ? 's' : ''} completed
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: status.totalModules || 4 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full transition-all duration-300" style={{
              background: i < (status.sessionsCompleted || 0)
                ? 'linear-gradient(135deg, #8B7CFF, #B69CFF)'
                : 'rgba(255,255,255,0.06)',
            }} />
          ))}
        </div>
      </GlassCard>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  READY STATE — Session available
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <GlassCard disableHover style={{ borderColor: 'rgba(139,124,255,0.15)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl animate-glow-pulse" style={{ background: 'rgba(139,124,255,0.12)', border: '1px solid rgba(139,124,255,0.3)' }}>
          <Sparkles className="h-5 w-5" style={{ color: '#8B7CFF' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Sora, Inter, sans-serif', color: '#EAEAF0' }}>
            Kaizen Daily Revision
          </h2>
          <p className="text-xs" style={{ color: '#6B6F7A' }}>
            Day {status.currentDay} • {status.modulesRemaining} flashcard{status.modulesRemaining !== 1 ? 's' : ''} ready
          </p>
        </div>
      </div>

      <p className="text-sm mb-5 leading-relaxed" style={{ color: '#A0A3B1' }}>
        Review your knowledge with spaced repetition flashcards. Each card tests one module concept.
      </p>

      <Button
        onClick={startSession}
        disabled={loadingSession}
        className="w-full rounded-xl text-sm font-semibold group"
        style={{
          background: 'linear-gradient(135deg, #8B7CFF, #B69CFF)',
          color: '#fff',
          boxShadow: '0 4px 20px -4px rgba(139,124,255,0.35)',
        }}
      >
        {loadingSession ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Layers className="h-4 w-4 mr-2" />
        )}
        Start Revision
        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>

      {/* Progress dots */}
      {(status.sessionsCompleted || 0) > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: status.totalModules || 4 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full transition-all duration-300" style={{
              background: i < (status.sessionsCompleted || 0)
                ? 'linear-gradient(135deg, #8B7CFF, #B69CFF)'
                : 'rgba(255,255,255,0.06)',
            }} />
          ))}
        </div>
      )}
    </GlassCard>
  );
};

export default KaizenRevision;
