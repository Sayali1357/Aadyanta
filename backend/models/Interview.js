const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    mode: {
        type: String, // 'audio' or 'text'
        required: true,
    },
    technicalScore: {
        type: Number,
        required: true,
    },
    communicationScore: {
        type: Number,
        required: true,
    },
    finalAssessment: {
        type: String,
    },
    categoryScores: [{
        name: String,
        score: Number,
        comment: String
    }],
    completedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Interview', InterviewSchema);
