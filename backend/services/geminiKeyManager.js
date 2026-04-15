const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * GeminiKeyManager — Distributes 3 API keys across AI features.
 * 
 * Key Assignment:
 *   KEY 1 (GEMINI_API_KEY_ROADMAP)    → Roadmap generation + Topic resources + Career recommendations
 *   KEY 2 (GEMINI_API_KEY_QUIZ)       → Quiz generation
 *   KEY 3 (GEMINI_API_KEY_INTERVIEW)  → Interview chat + Feedback generation
 * 
 * Falls back to GEMINI_API_KEY if feature-specific keys aren't set.
 * Tracks token usage per key for monitoring & dashboard.
 */
class GeminiKeyManager {
    constructor() {
        this._clients = {};   // { feature: GoogleGenerativeAI }
        this._usage = {};     // { feature: { calls, tokens, lastUsed, ... } }
        this._startedAt = new Date();
    }

    /**
     * Get a Gemini client for a specific feature.
     * @param {'roadmap'|'quiz'|'interview'} feature
     * @returns {GoogleGenerativeAI}
     */
    getClient(feature = 'roadmap') {
        if (this._clients[feature]) return this._clients[feature];

        const keyMap = {
            roadmap:   process.env.GEMINI_API_KEY_ROADMAP,
            quiz:      process.env.GEMINI_API_KEY_QUIZ,
            interview: process.env.GEMINI_API_KEY_INTERVIEW,
        };

        // Feature-specific key → generic fallback → Google key fallback
        const apiKey = keyMap[feature]
            || process.env.GEMINI_API_KEY
            || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            throw new Error(
                `No Gemini API key found for feature "${feature}". ` +
                `Set GEMINI_API_KEY_${feature.toUpperCase()} or GEMINI_API_KEY in backend/.env`
            );
        }

        this._clients[feature] = new GoogleGenerativeAI(apiKey);
        this._usage[feature] = {
            calls: 0,
            estimatedInputTokens: 0,
            estimatedOutputTokens: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            lastUsed: null,
            key: this._maskKey(apiKey),
            avgResponseTimeMs: 0,
            _totalResponseTimeMs: 0,
        };

        console.log(`🔑 Gemini key initialized for [${feature}]: ${this._maskKey(apiKey)}`);
        return this._clients[feature];
    }

    /**
     * Get a generative model for a specific feature with token tracking.
     * @param {'roadmap'|'quiz'|'interview'} feature
     * @param {string} [modelOverride] — override the default model
     * @returns {GenerativeModel}
     */
    getModel(feature = 'roadmap', modelOverride = null) {
        const client = this.getClient(feature);
        const modelName = modelOverride || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

        // Track usage
        if (this._usage[feature]) {
            this._usage[feature].calls += 1;
            this._usage[feature].lastUsed = new Date();
        }

        return client.getGenerativeModel({ model: modelName });
    }

    /**
     * Track token estimation for a prompt/response pair.
     * Call after each successful Gemini call.
     * @param {'roadmap'|'quiz'|'interview'} feature
     * @param {string} prompt — the input prompt
     * @param {string} response — the output response
     * @param {number} responseTimeMs — time taken for the API call
     */
    trackTokens(feature, prompt, response, responseTimeMs = 0) {
        if (!this._usage[feature]) return;

        // Rough estimation: ~4 chars per token (GPT/Gemini average)
        const inputTokens = Math.ceil((prompt || '').length / 4);
        const outputTokens = Math.ceil((response || '').length / 4);

        this._usage[feature].estimatedInputTokens += inputTokens;
        this._usage[feature].estimatedOutputTokens += outputTokens;

        if (responseTimeMs > 0) {
            this._usage[feature]._totalResponseTimeMs += responseTimeMs;
            this._usage[feature].avgResponseTimeMs = Math.round(
                this._usage[feature]._totalResponseTimeMs / this._usage[feature].calls
            );
        }
    }

    /**
     * Track a cache hit (saves tokens).
     */
    trackCacheHit(feature) {
        if (this._usage[feature]) {
            this._usage[feature].cacheHits += 1;
        }
    }

    /**
     * Track a cache miss (required API call).
     */
    trackCacheMiss(feature) {
        if (this._usage[feature]) {
            this._usage[feature].cacheMisses += 1;
        }
    }

    /**
     * Track an error on a feature key.
     */
    trackError(feature) {
        if (this._usage[feature]) {
            this._usage[feature].errors += 1;
        }
    }

    /**
     * Get usage statistics for all keys.
     */
    getUsageStats() {
        const stats = {};
        for (const [feature, usage] of Object.entries(this._usage)) {
            const totalTokens = usage.estimatedInputTokens + usage.estimatedOutputTokens;
            const cacheEfficiency = (usage.cacheHits + usage.cacheMisses) > 0
                ? Math.round((usage.cacheHits / (usage.cacheHits + usage.cacheMisses)) * 100)
                : 0;

            stats[feature] = {
                key: usage.key,
                calls: usage.calls,
                estimatedInputTokens: usage.estimatedInputTokens,
                estimatedOutputTokens: usage.estimatedOutputTokens,
                totalEstimatedTokens: totalTokens,
                cacheHits: usage.cacheHits,
                cacheMisses: usage.cacheMisses,
                cacheEfficiency: `${cacheEfficiency}%`,
                errors: usage.errors,
                avgResponseTimeMs: usage.avgResponseTimeMs,
                lastUsed: usage.lastUsed,
                // Gemini 2.5 Flash pricing: $0.15/1M input, $0.60/1M output
                estimatedCostUSD: +(
                    (usage.estimatedInputTokens * 0.00000015) +
                    (usage.estimatedOutputTokens * 0.0000006)
                ).toFixed(6),
            };
        }

        return {
            uptime: this._getUptime(),
            startedAt: this._startedAt,
            keys: stats,
        };
    }

    /**
     * Mask API key for logging (show first 8 + last 4 chars).
     */
    _maskKey(key) {
        if (!key || key.length < 16) return '****';
        return key.slice(0, 8) + '...' + key.slice(-4);
    }

    /**
     * Get uptime string.
     */
    _getUptime() {
        const ms = Date.now() - this._startedAt.getTime();
        const secs = Math.floor(ms / 1000);
        const mins = Math.floor(secs / 60);
        const hrs = Math.floor(mins / 60);
        if (hrs > 0) return `${hrs}h ${mins % 60}m`;
        if (mins > 0) return `${mins}m ${secs % 60}s`;
        return `${secs}s`;
    }
}

// Singleton
module.exports = new GeminiKeyManager();
