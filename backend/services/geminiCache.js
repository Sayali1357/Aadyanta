const keyManager = require('./geminiKeyManager');
const Cache = require('../models/Cache');

/**
 * GeminiCacheService — Token-optimized AI service with:
 *   - Multi-key rotation via GeminiKeyManager
 *   - Aggressive DB caching (30-day roadmaps, 7-day resources)
 *   - In-memory request dedup (prevents parallel dupes)
 *   - Compact prompts (reduced token input)
 *   - Per-call token tracking for dashboard analytics
 */
class GeminiCacheService {
    constructor() {
        // In-memory dedup: prevent duplicate in-flight requests
        this._inflightRequests = new Map();
    }

    // ─── TOKEN OPTIMIZATION: Request deduplication ────────────────
    /**
     * Ensures only ONE Gemini call per cacheKey runs at a time.
     * If a duplicate request comes in while one is in-flight,
     * it waits for the first to finish and returns the same result.
     */
    async _dedup(cacheKey, generatorFn) {
        if (this._inflightRequests.has(cacheKey)) {
            console.log(`⏳ Dedup: waiting for in-flight request [${cacheKey}]`);
            return this._inflightRequests.get(cacheKey);
        }

        const promise = generatorFn();
        this._inflightRequests.set(cacheKey, promise);

        try {
            const result = await promise;
            return result;
        } finally {
            this._inflightRequests.delete(cacheKey);
        }
    }

    // ─── TOKEN-TRACKED GEMINI CALL ────────────────────────────────
    /**
     * Wrapper that calls Gemini and tracks tokens + response time.
     * @param {'roadmap'|'quiz'|'interview'} feature
     * @param {string} prompt
     * @param {string} [modelOverride]
     * @returns {{ text: string, responseTimeMs: number }}
     */
    async _trackedGenerate(feature, prompt, modelOverride = null) {
        const startTime = Date.now();
        try {
            const model = keyManager.getModel(feature, modelOverride);
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const responseTimeMs = Date.now() - startTime;

            // Track tokens on the key manager
            keyManager.trackTokens(feature, prompt, text, responseTimeMs);

            return { text, responseTimeMs };
        } catch (error) {
            keyManager.trackError(feature);
            throw error;
        }
    }

    // ─── ROADMAP GENERATION (KEY 1: roadmap) ─────────────────────
    async generateRoadmap(careerId, domain, careerName) {
        const cacheKey = `roadmap_${careerId}_v2`;

        try {
            // 1. DB cache check
            let cached = await Cache.findOne({ cacheKey });
            if (cached) {
                console.log(`✅ Cache HIT for roadmap: ${careerId}`);
                await cached.incrementHit();
                keyManager.trackCacheHit('roadmap');
                return cached.data;
            }

            console.log(`⚠️ Cache MISS for roadmap: ${careerId}. Calling Gemini (KEY: roadmap)...`);
            keyManager.trackCacheMiss('roadmap');

            // 2. Dedup + generate
            return await this._dedup(cacheKey, async () => {
                // TOKEN OPTIMIZATION: Compact prompt — removed verbose instructions,
                // used terse format, implicit JSON from example structure
                const prompt = `Generate a ${domain} learning roadmap for "${careerName}" (ID: ${careerId}).

Rules: 4-5 modules, 4-6 topics each, 2-3 subtopics each. Include blog content (markdown), YouTube playlists, articles (GFG/MDN/W3S). FREE resources only. Indian job market focus.

Return ONLY JSON:
{"roadmap_id":"${careerId}_roadmap","career_id":"${careerId}","career_name":"${careerName}","domain":"${domain}","target_duration_weeks":12,"difficulty_level":"beginner","modules":[{"module_id":"mod_x","title":"...","description":"...","order":1,"estimated_hours":20,"topics":[{"topic_id":"top_x","title":"...","description":"...","order":1,"estimated_hours":8,"learning_objectives":["..."],"subtopics":[{"subtopic_id":"sub_x","title":"...","description":"...","order":1,"key_concepts":["..."],"difficulty":"easy"}],"content":{"blog_title":"...","blog_body":"# Markdown tutorial...","tags":["..."],"read_time_minutes":10},"youtube_resources":[{"playlist_title":"...","playlist_url":"https://youtube.com/playlist?list=...","channel_name":"...","language":"english","is_free":true}],"article_resources":[{"title":"...","url":"https://...","platform":"GeeksforGeeks","type":"tutorial","is_free":true}]}]}]}`;

                const { text } = await this._trackedGenerate('roadmap', prompt);
                const jsonData = this.extractJSON(text);
                const roadmap = JSON.parse(jsonData);

                // 3. Cache for 30 days
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);

                await Cache.create({
                    cacheKey,
                    cacheType: 'roadmap',
                    data: roadmap,
                    metadata: { careerId, domain, version: 2 },
                    expiresAt,
                });

                console.log(`✅ Roadmap cached for ${careerId}`);
                return roadmap;
            });

        } catch (error) {
            console.error('Roadmap generation error:', error);
            return {
                roadmap_id: `${careerId}_roadmap`,
                career_id: careerId,
                career_name: careerName,
                domain,
                target_duration_weeks: 12,
                difficulty_level: 'beginner',
                modules: [],
                error: 'Failed to generate roadmap. Please try again.',
            };
        }
    }

    // ─── CAREER RECOMMENDATIONS (KEY 1: roadmap) ─────────────────
    async recommendCareers(assessmentData) {
        // TOKEN OPTIMIZATION: Compact prompt
        const prompt = `Recommend 3-5 careers based on: Interests=[${assessmentData.interests}], Skills=[${assessmentData.skills}], Education=${assessmentData.education}, Goals=${assessmentData.careerGoals}. Return JSON with careerId, name, domain, fitScore (0-100), description.`;

        try {
            const { text } = await this._trackedGenerate('roadmap', prompt);
            return JSON.parse(this.extractJSON(text));
        } catch (error) {
            console.error('Career recommendation error:', error);
            throw error;
        }
    }

    // ─── TOPIC RESOURCES (KEY 1: roadmap) ────────────────────────
    async getTopicResources(topicName, domain) {
        const cacheKey = `resources_${topicName.toLowerCase().replace(/\s+/g, '_')}_${domain}`;

        try {
            let cached = await Cache.findOne({ cacheKey });
            if (cached) {
                console.log(`✅ Cache HIT for resources: ${topicName}`);
                await cached.incrementHit();
                keyManager.trackCacheHit('roadmap');
                return cached.data;
            }

            keyManager.trackCacheMiss('roadmap');

            return await this._dedup(cacheKey, async () => {
                // TOKEN OPTIMIZATION: Terse prompt
                const prompt = `3-5 FREE ${domain} resources for "${topicName}": YouTube (prefer Indian creators), articles, practice sites. Return JSON array: [{type,platform,title,url,isFree:true,language}]`;

                const { text } = await this._trackedGenerate('roadmap', prompt);
                const resources = JSON.parse(this.extractJSON(text));

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
            });

        } catch (error) {
            console.error('Topic resources error:', error);
            return { resources: [] };
        }
    }

    // ─── QUIZ GENERATION (KEY 2: quiz) ───────────────────────────
    async generateQuiz(moduleName, topics) {
        const fallbackModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const modelsToTry = [primaryModel, ...fallbackModels];

        const topicsList = topics.map(t => t.name).join(', ');

        // TOKEN OPTIMIZATION: ~40% fewer input tokens vs original prompt
        const prompt = `Generate 5 MCQs for module "${moduleName}" covering: ${topicsList}.
Return ONLY raw JSON (no markdown): {"questions":[{"question":"...","options":["A","B","C","D"],"correctAnswer":"A","topicName":"${topics[0]?.name || moduleName}"}]}`;

        let lastError;
        for (const modelName of modelsToTry) {
            try {
                console.log(`🤖 [quiz key] Trying model: ${modelName}`);
                const { text: response } = await this._trackedGenerate('quiz', prompt, modelName);
                const trimmed = response.trim();

                // Try direct parse
                try {
                    const direct = JSON.parse(trimmed);
                    if (direct?.questions && Array.isArray(direct.questions)) {
                        console.log(`✅ Quiz generated with ${modelName}`);
                        return direct.questions;
                    }
                    if (Array.isArray(direct)) return direct;
                } catch (_) { /* try extraction */ }

                const parsed = JSON.parse(this.extractJSON(trimmed));
                if (Array.isArray(parsed)) return parsed;
                if (parsed?.questions && Array.isArray(parsed.questions)) {
                    console.log(`✅ Quiz generated with ${modelName}`);
                    return parsed.questions;
                }
            } catch (error) {
                lastError = error;
                const status = error.status || error.statusCode;
                if (status === 429) {
                    const retryMatch = error.message?.match(/"retryDelay":"(\d+)s"/);
                    const waitSec = retryMatch ? parseInt(retryMatch[1]) + 2 : 22;
                    console.warn(`⏳ Rate limit on ${modelName} (429). Waiting ${waitSec}s...`);
                    await new Promise(r => setTimeout(r, waitSec * 1000));
                    continue;
                }
                if (status === 503) {
                    console.warn(`⚠️ Model ${modelName} overloaded (503), trying next...`);
                    continue;
                }
                console.error(`Quiz error with ${modelName}:`, error.message);
                break;
            }
        }

        console.error('All quiz models failed:', lastError?.message);
        const lastStatus = lastError?.status || lastError?.statusCode;
        if (lastStatus === 429) {
            throw new Error('Rate limit reached. Wait 30 seconds and try again.');
        }
        throw new Error('Quiz generation failed. Try again in a moment.');
    }

    // ─── UTILITIES ───────────────────────────────────────────────

    /** Extract JSON from Gemini response (strips markdown wrappers) */
    extractJSON(text) {
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) return jsonMatch[1].trim();

        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) return objectMatch[0];

        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) return arrayMatch[0];

        return text.trim();
    }

    /** Get cache + key usage statistics */
    async getCacheStats() {
        const cacheStats = await Cache.aggregate([
            { $group: { _id: '$cacheType', count: { $sum: 1 }, totalHits: { $sum: '$hitCount' } } },
        ]);

        return {
            cache: cacheStats,
            keyUsage: keyManager.getUsageStats(),
        };
    }
}

module.exports = new GeminiCacheService();
