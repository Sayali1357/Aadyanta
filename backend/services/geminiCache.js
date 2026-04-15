const { GoogleGenerativeAI } = require('@google/generative-ai');
const Cache = require('../models/Cache');

class GeminiCacheService {
    constructor() {
        this.genAI = null; // initialized lazily on first use
    }

    /**
     * Get or initialize the Gemini client.
     * Called lazily so dotenv has already loaded by the time this runs.
     */
    _getClient() {
        if (this.genAI) return this.genAI;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in backend/.env');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        return this.genAI;
    }

    /**
     * Generate roadmap with caching - SAVES TOKENS!
     * Cache roadmaps by careerId to avoid regenerating for every user
     */
    async generateRoadmap(careerId, domain, careerName) {
        const cacheKey = `roadmap_${careerId}_v1`;

        try {
            // 1. Try to get from cache first
            let cached = await Cache.findOne({ cacheKey });

            if (cached) {
                console.log(`✅ Cache HIT for roadmap: ${careerId}`);
                await cached.incrementHit();
                return cached.data;
            }

            console.log(`⚠️ Cache MISS for roadmap: ${careerId}. Calling Gemini...`);

            // 2. Generate using Gemini (costs tokens)
            const model = this._getClient().getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
            });

            const prompt = `Generate a comprehensive learning roadmap for: ${careerName}
      
Domain: ${domain}
Career ID: ${careerId}

Create a structured learning path with:
- 4-5 modules
- Each module has 5-6 topics
- Each topic has learning objectives and estimated hours
- Include practical projects
- Focus on FREE resources
- Optimize for Indian job market

Return ONLY valid JSON in this format:
{
  "roadmapId": "${careerId}_roadmap",
  "careerId": "${careerId}",
  "domain": "${domain}",
  "targetDuration": 12,
  "modules": [
    {
      "moduleId": "module-1",
      "title": "Module Title",
      "topics": [
        {
          "topicId": "topic-1",
          "title": "Topic Title",
          "estimatedHours": 8,
          "learningObjectives": ["objective 1", "objective 2"]
        }
      ]
    }
  ]
}`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonData = this.extractJSON(response);
            const roadmap = JSON.parse(jsonData);

            // 3. Save to cache (expires in 30 days)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            await Cache.create({
                cacheKey,
                cacheType: 'roadmap',
                data: roadmap,
                metadata: {
                    careerId,
                    domain,
                    version: 1,
                },
                expiresAt,
            });

            console.log(`✅ Roadmap cached for ${careerId}`);
            return roadmap;

        } catch (error) {
            console.error('Roadmap generation error:', error);

            // Return fallback roadmap structure
            return {
                roadmapId: `${careerId}_roadmap`,
                careerId,
                domain,
                targetDuration: 12,
                modules: [],
                error: 'Failed to generate roadmap. Please try again.',
            };
        }
    }

    /**
     * Generate career recommendations (NOT cached - user-specific)
     */
    async recommendCareers(assessmentData) {
        const model = this._getClient().getGenerativeModel({
            model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
        });

        const prompt = `Analyze this career assessment and recommend 3-5 careers:

Interests: ${assessmentData.interests.join(', ')}
Skills: ${assessmentData.skills.join(', ')}
Education: ${assessmentData.education}
Goals: ${assessmentData.careerGoals}

Return ONLY valid JSON with career recommendations including fit scores.`;

        try {
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonData = this.extractJSON(response);
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Career recommendation error:', error);
            throw error;
        }
    }

    /**
     * Get topic resources with caching by topic name
     */
    async getTopicResources(topicName, domain) {
        const cacheKey = `resources_${topicName.toLowerCase().replace(/\s+/g, '_')}_${domain}`;

        try {
            // 1. Try cache first
            let cached = await Cache.findOne({ cacheKey });

            if (cached) {
                console.log(`✅ Cache HIT for resources: ${topicName}`);
                await cached.incrementHit();
                return cached.data;
            }

            console.log(`⚠️ Cache MISS for resources: ${topicName}`);

            // 2. Generate using Gemini
            const model = this._getClient().getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
            });

            const prompt = `Find FREE learning resources for: ${topicName}

Domain: ${domain}

Recommend 3-5 FREE resources:
- YouTube videos (prefer Indian instructors)
- Articles/tutorials
- Practice platforms
- GitHub repos

Return JSON format with resource list.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();
            const jsonData = this.extractJSON(response);
            const resources = JSON.parse(jsonData);

            // 3. Cache for 7 days
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await Cache.create({
                cacheKey,
                cacheType: 'topic_resources',
                data: resources,
                metadata: { domain },
                expiresAt,
            });

            return resources;

        } catch (error) {
            console.error('Topic resources error:', error);
            return { resources: [] };
        }
    }

    /**
     * Extract JSON from Gemini response
     */
    extractJSON(text) {
        // Strip markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) return jsonMatch[1].trim();

        // Match JSON object
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) return objectMatch[0];

        // Match JSON array
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) return arrayMatch[0];

        return text.trim();
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const stats = await Cache.aggregate([
            {
                $group: {
                    _id: '$cacheType',
                    count: { $sum: 1 },
                    totalHits: { $sum: '$hitCount' },
                },
            },
        ]);

        return stats;
    }

    async generateQuiz(moduleName, topics) {
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const fallbackModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
        const modelsToTry = [primaryModel, ...fallbackModels];

        const topicsList = topics.map(t => t.name).join(', ');
        const prompt = `You are a quiz generator. Generate exactly 5 multiple choice questions for the learning module: "${moduleName}".
Topics covered: ${topicsList}

You MUST respond with ONLY a valid JSON object. No explanation, no markdown, no code blocks. Just raw JSON.
The JSON must follow this exact structure:
{"questions":[{"question":"What is X?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":"Option A","topicName":"${topics[0]?.name || moduleName}"}]}

Generate 5 questions now:`;

        let lastError;
        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 Trying model: ${modelName}`);
                const model = this._getClient().getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = result.response.text().trim();

                // Try direct parse first
                try {
                    const direct = JSON.parse(response);
                    if (direct && direct.questions && Array.isArray(direct.questions)) {
                        console.log(`✅ Quiz generated with ${modelName}`);
                        return direct.questions;
                    }
                    if (Array.isArray(direct)) return direct;
                } catch (_) { /* not clean JSON, try extraction */ }

                const jsonData = this.extractJSON(response);
                const parsed = JSON.parse(jsonData);
                if (Array.isArray(parsed)) return parsed;
                if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
                    console.log(`✅ Quiz generated with ${modelName}`);
                    return parsed.questions;
                }
            } catch (error) {
                lastError = error;
                const status = error.status || error.statusCode;
                if (status === 429) {
                    // Extract retryDelay from error if available, default 20s
                    const retryMatch = error.message?.match(/"retryDelay":"(\d+)s"/);
                    const waitSec = retryMatch ? parseInt(retryMatch[1]) + 2 : 22;
                    console.warn(`⏳ Rate limit on ${modelName} (429). Waiting ${waitSec}s before next model...`);
                    await new Promise(r => setTimeout(r, waitSec * 1000));
                    continue;
                }
                if (status === 503) {
                    console.warn(`⚠️ Model ${modelName} overloaded (503), trying next...`);
                    continue;
                }
                console.error(`Quiz generation error with ${modelName}:`, error.message);
                break;
            }
        }

        console.error('All models failed. Last error:', lastError?.message);
        // Give a clear message based on error type
        const lastStatus = lastError?.status || lastError?.statusCode;
        if (lastStatus === 429) {
            throw new Error('Rate limit reached. Please wait 30 seconds and try again.');
        }
        throw new Error('Quiz generation failed. Please try again in a moment.');
    }
} 

module.exports = new GeminiCacheService();
