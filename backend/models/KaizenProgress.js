const mongoose = require('mongoose');

// ── Session History: tracks each Kaizen revision session ────────
const SessionAnswerSchema = new mongoose.Schema({
    moduleId: { type: String, required: true },
    moduleName: { type: String, required: true },
    question: { type: String, required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
}, { _id: false });

const SessionHistorySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    modulesReviewed: { type: Number, required: true },
    answers: [SessionAnswerSchema],
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
}, { _id: false });

// ── Main KaizenProgress Schema ──────────────────────────────────
const KaizenProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roadmapId: {
        type: String,
        required: true,
    },
    // Current day in the spaced repetition sequence (starts at 1)
    currentDay: {
        type: Number,
        default: 1,
    },
    // Total modules in the roadmap (set on first unlock)
    totalModules: {
        type: Number,
        required: true,
    },
    // How many modules remain for the NEXT session
    modulesRemaining: {
        type: Number,
        required: true,
    },
    // When the next review session is available
    nextReviewDate: {
        type: Date,
        default: Date.now,
    },
    // Whether the Kaizen sequence is fully completed
    isComplete: {
        type: Boolean,
        default: false,
    },
    // Session history — one entry per completed session
    history: [SessionHistorySchema],

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound unique: one kaizen record per user per roadmap
KaizenProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

module.exports = mongoose.model('KaizenProgress', KaizenProgressSchema);
