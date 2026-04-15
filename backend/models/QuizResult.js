const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [v => v.length > 0, 'Options must have at least one entry']
    },
    correctAnswer: {
        type: String,
        required: true
    },
    userAnswer: {
        type: String,
        required: true
    },
    topicName: {
        type: String,
        required: true
    }
}, { _id: false });

const QuizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roadmapId: {
        type: String,
        required: true,
    },
    moduleId: {
        type: String,
        required: true,
    },
    moduleName: {
        type: String,
        required: true,
    },
    questions: [QuestionSchema],
    score: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    weakTopics: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);
