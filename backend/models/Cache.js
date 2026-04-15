const mongoose = require('mongoose');

// Cache Schema - Store Gemini API responses to reduce token usage
const CacheSchema = new mongoose.Schema({
    cacheKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    cacheType: {
        type: String,
        required: true,
        enum: ['roadmap', 'career_recommendation', 'topic_resources'],
        index: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    metadata: {
        domain: String,
        careerId: String,
        version: {
            type: Number,
            default: 1,
        },
    },
    hitCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
    expiresAt: {
        type: Date,
    },
});

// TTL index - automatically delete expired cache entries
CacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for efficient lookups
CacheSchema.index({ cacheType: 1, 'metadata.careerId': 1 });
CacheSchema.index({ cacheType: 1, 'metadata.domain': 1 });

// Method to increment hit count
CacheSchema.methods.incrementHit = function () {
    this.hitCount += 1;
    return this.save();
};

module.exports = mongoose.model('Cache', CacheSchema);
