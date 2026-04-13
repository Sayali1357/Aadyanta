import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssessmentData, CareerRecommendation, Roadmap, Resource, Topic } from '@/types/career';
import { getDomainPlatforms } from '@/config/careerDomains';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    // Get model name from environment or use default
    this.modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Enhanced career recommendation with detailed scoring
   */
  async recommendCareers(userData: AssessmentData): Promise<CareerRecommendation[]> {
    const prompt = `
You are a career counselor for Indian students. Analyze this profile and recommend 3-5 careers.

User Profile:
- Education: ${userData.education}
- Interests: ${userData.interests.join(', ')}
- Aptitude Scores: Logical(${userData.aptitudeScores.logical}), Creative(${userData.aptitudeScores.creative}), Analytical(${userData.aptitudeScores.analytical}), Communication(${userData.aptitudeScores.communication})
- Skills: ${userData.skills.join(', ')}
- Goals: ${userData.goals}
- Learning Style: ${userData.learningStyle}
- Time Commitment: ${userData.dailyHours} hours/day

For each career, provide:
1. Career ID (snake_case, e.g., "backend_developer")
2. Career Name
3. Domain (technology/design/business/healthcare)
4. Fit Score (0-100) with breakdown:
   - Interest Alignment (0-100)
   - Aptitude Match (0-100)
   - Market Demand (0-100)
   - Learning Style Match (0-100)
5. Brief description (2-3 sentences)
6. Top 5 required skills
7. Indian job market outlook:
   - Current demand level (Low/Medium/High/Very High)
   - Average salary range (entry/mid/senior in ₹)
   - Top 5 hiring companies in India
   - Growth potential (next 5 years)
8. Day-in-the-life scenario (3-4 sentences)
9. Recommended specializations (2-3)

Return ONLY valid JSON matching this schema:
{
  "careers": [
    {
      "id": "backend_developer",
      "name": "Backend Developer",
      "domain": "technology",
      "fitScore": {
        "overall": 85,
        "breakdown": {
          "interest": 90,
          "aptitude": 85,
          "market": 90,
          "learningStyle": 75
        }
      },
      "description": "Build server-side logic and APIs...",
      "requiredSkills": ["Java", "SQL", "Spring Boot", "REST APIs", "Git"],
      "marketOutlook": {
        "demand": "Very High",
        "salaryRange": {
          "entry": "₹3-6L",
          "mid": "₹8-15L",
          "senior": "₹20-35L"
        },
        "topCompanies": ["TCS", "Infosys", "Flipkart", "Amazon", "Google"],
        "growthPotential": "25% growth expected over next 5 years"
      },
      "dayInLife": "Start day reviewing code, attend stand-up meeting, develop new API endpoints...",
      "specializations": ["Java Spring Boot", "Node.js", "Python Django"]
    }
  ]
}
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonData = this.extractJSON(response);
      const parsed = JSON.parse(jsonData);
      return parsed.careers as CareerRecommendation[];
    } catch (error) {
      console.error('Error recommending careers:', error);
      throw error;
    }
  }

  /**
   * Generate domain-aware roadmap
   */
  async generateRoadmap(
    careerName: string,
    domain: string,
    specialization: string,
    userLevel: string = 'beginner',
    targetWeeks: number = 12
  ): Promise<Roadmap> {
    const domainPlatforms = getDomainPlatforms(domain);

    const prompt = `
Generate a comprehensive ${targetWeeks}-week learning roadmap for: ${careerName}

Domain: ${domain}
User Level: ${userLevel}
Specialization: ${specialization}

Requirements:
1. Create 3-4 modules (progressive difficulty)
2. Each module has 4-6 topics
3. Each topic includes:
   - Clear learning objectives (3-5 points)
   - Estimated hours (realistic)
   - Prerequisites (if any)
   - Key concepts to master

4. Focus on FREE resources from these platforms:
   ${domainPlatforms.map((p) => `- ${p}`).join('\n   ')}

5. Include practical projects (1 per module)
6. Add skill assessments (quiz format)
7. Ensure Indian context (local job market relevance)

Structure the roadmap to be:
- Beginner-friendly but comprehensive
- Focused on job-ready skills
- Portfolio-building oriented
- Community-supported

Return ONLY valid JSON matching this schema:
{
  "modules": [
    {
      "moduleId": "module_1",
      "title": "Module Title",
      "description": "Brief description",
      "estimatedHours": 30,
      "topics": [
        {
          "topicId": "topic_1_1",
          "title": "Topic Title",
          "description": "Brief description",
          "learningObjectives": ["Learn X", "Understand Y", "Build Z"],
          "estimatedHours": 6,
          "resources": [],
          "practiceResources": [],
          "assessmentQuiz": {
            "questions": 10,
            "passingScore": 70
          }
        }
      ]
    }
  ],
  "capstoneProjects": [
    {
      "title": "Project Title",
      "description": "Build a full-featured...",
      "estimatedHours": 20,
      "requiredSkills": ["Skill1", "Skill2"],
      "githubTemplate": "https://github.com/..."
    }
  ]
}
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonData = this.extractJSON(response);
      const parsed = JSON.parse(jsonData);

      // Construct full roadmap object
      const roadmap: Roadmap = {
        roadmapId: `${careerName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        careerId: careerName.toLowerCase().replace(/\s+/g, '_'),
        domain: domain as any,
        targetDuration: targetWeeks,
        difficultyLevel: userLevel as any,
        prerequisiteSkills: [],
        modules: parsed.modules,
        capstoneProjects: parsed.capstoneProjects,
        generatedAt: new Date(),
        lastUpdated: new Date(),
        version: 1,
      };

      return roadmap;
    } catch (error) {
      console.error('Error generating roadmap:', error);
      throw error;
    }
  }

  /**
   * Fetch domain-specific resources for a topic
   */
  async fetchResourcesForTopic(
    topicTitle: string,
    domain: string,
    learningObjectives: string[]
  ): Promise<Resource[]> {
    const platforms = getDomainPlatforms(domain);

    const prompt = `
Find the best FREE learning resources for: "${topicTitle}"

Domain: ${domain}
Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Recommend resources from these platforms: ${platforms.join(', ')}

For each resource, provide:
- Type (video/course/article/practice/interactive)
- Platform name
- Title
- URL (actual URL if known, or use format "https://youtube.com/results?search_query=[topic]")
- Estimated duration
- Instructor/Creator name (for videos/courses)
- Language (English/Hindi/Hinglish)

Requirements:
1. Prioritize Indian creators/instructors
2. Mix of theoretical and practical content
3. Ensure all are FREE (audit mode for paid courses)
4. Recent content (prefer last 2 years)
5. Include at least:
   - 2 video tutorials
   - 1-2 articles/written guides
   - 1 practice/hands-on resource
   - Official documentation link (if applicable)

Return ONLY valid JSON array:
[
  {
    "type": "video",
    "platform": "youtube",
    "title": "Complete JavaScript Tutorial for Beginners",
    "url": "https://youtube.com/...",
    "duration": "5h 30m",
    "instructor": "CodeWithHarry",
    "language": "Hinglish",
    "isFree": true,
    "certification": false,
    "priority": 5
  }
]
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const jsonData = this.extractJSON(response);
      const resources = JSON.parse(jsonData) as Resource[];

      return resources;
    } catch (error) {
      console.error('Error fetching resources:', error);
      return [];
    }
  }

  /**
   * Extract JSON from Gemini response (handles markdown code blocks)
   */
  private extractJSON(text: string): string {
    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }

    // Try to find JSON object/array in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    const arrayMatch = text.match(/\[[\s\S]*\]/);

    if (objectMatch) return objectMatch[0];
    if (arrayMatch) return arrayMatch[0];

    return text.trim();
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
