import { geminiService } from './gemini';

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  accuracy: number;
  weakAreas: string[];
  strongAreas: string[];
}

class QuizService {
  async generateQuiz(topicName: string, domain: string, count: number = 5): Promise<QuizQuestion[]> {
    const prompt = `
Generate a strong knowledge-check quiz for the topic "${topicName}" in the domain of "${domain}".
Produce ${count} multiple-choice questions. 

Return ONLY a valid JSON array of objects, with NO markdown formatting, NO backticks. The array MUST follow this exact structure:
[
  {
    "id": "q1",
    "text": "What is the primary function of...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Option A is correct because..."
  }
]
`;

    try {
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      const model = geminiService['genAI'].getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonStr = this.extractJSON(response);
      const questions: QuizQuestion[] = JSON.parse(jsonStr);
      
      // Ensure IDs are unique
      return questions.map((q, idx) => ({ ...q, id: `q-${Date.now()}-${idx}` }));
    } catch (error) {
      console.error('Error generating quiz:', error);
      // Fallback
      return [
        {
          id: 'q1',
          text: `Sample question about ${topicName}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 0,
          explanation: `Basic concept of ${topicName}.`
        }
      ];
    }
  }

  evaluateQuiz(questions: QuizQuestion[], userAnswers: Record<string, number>): QuizResult {
    let score = 0;
    const weakAreas: string[] = [];
    const strongAreas: string[] = [];

    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        score++;
        strongAreas.push(q.text);
      } else {
        weakAreas.push(q.text);
      }
    });

    return {
      score,
      totalQuestions: questions.length,
      accuracy: Math.round((score / questions.length) * 100),
      weakAreas,
      strongAreas
    };
  }

  private extractJSON(text: string): string {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) return jsonMatch[1].trim();
    const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) return arrayMatch[0];
    return text.trim();
  }
}

export const quizService = new QuizService();
