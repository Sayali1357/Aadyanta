const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  topicName: string;
  userAnswer?: string;
}

export interface QuizSubmitPayload {
  roadmapId: string;
  moduleId: string;
  moduleName: string;
  answers: QuizQuestion[];
}

export interface QuizSubmitResponse {
  message: string;
  resultId: string;
  score: number;
  total: number;
  weakTopics: string[];
}

export interface QuizResultResponse {
  _id: string;
  moduleName: string;
  score: number;
  total: number;
  weakTopics: string[];
  questions: QuizQuestion[];
  createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token'); // matches authService tokenKey
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

class QuizService {
  async generateQuiz(moduleName: string, topics: { id: string; name: string }[]): Promise<QuizQuestion[]> {
    const res = await fetch(`${API_URL}/quiz/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ moduleName, topics }),
    });
    const data = await handleResponse<{ questions: QuizQuestion[] }>(res);
    return data.questions;
  }

  async submitQuiz(payload: QuizSubmitPayload): Promise<QuizSubmitResponse> {
    const res = await fetch(`${API_URL}/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<QuizSubmitResponse>(res);
  }

  async getResult(quizId: string): Promise<QuizResultResponse> {
    const res = await fetch(`${API_URL}/quiz/result/${quizId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<QuizResultResponse>(res);
  }
}

export const quizService = new QuizService();
