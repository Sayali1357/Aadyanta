const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },

    // College Information (Optional)
    collegeName: {
        type: String,
        trim: true,
    },
    graduationYear: {
        type: Number,
        min: 2024,
        max: 2030,
    },
    currentSemester: {
        type: Number,
        min: 1,
        max: 8,
    },

    // Career Selection (from assessment)
    selectedCareer: {
        careerId: String,
        careerName: String,
        domain: {
            type: String,
            enum: ['technology', 'design', 'business', 'healthcare'],
        },
        specialization: String,
        fitScore: Number,
        assessmentResults: {
            interestScore: Number,
            aptitudeScore: Number,
            personalityFit: Number,
            marketAlignment: Number,
        },
        selectedAt: Date,
    },

    // Learning Progress
    progress: {
        roadmapId: String,
        completedTopics: [{
            topicId: String,
            topicName: String,
            completedAt: Date,
            timeSpent: Number, // minutes
            resourcesUsed: [String],
            notesCount: Number,
            attentionScore: Number, // 0-100 indicating focus level
            distractionCount: Number, // Number of times user was distracted
            emotions: {
                focused: Number, // percentage
                bored: Number,
                confused: Number
            },
            quizResult: {
                score: Number,
                totalQuestions: Number,
                accuracy: Number,
                weakAreas: [String],
                strongAreas: [String]
            }
        }],
        totalHours: {
            type: Number,
            default: 0,
        },
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        lastActive: Date,
        milestones: [{
            name: String,
            description: String,
            achievedAt: Date,
            badgeIcon: String,
        }],
    },

    // Skills Portfolio
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
        },
        sourceTopic: String,
        verifiedBy: [String],
        addedAt: Date,
    }],

    // Learning Preferences
    learningProfile: {
        preferredContentTypes: [String], // ['video', 'article', 'practice']
        learningPace: {
            type: String,
            enum: ['slow', 'moderate', 'fast'],
            default: 'moderate',
        },
        dailyTimeCommitment: {
            type: Number, // hours
            default: 2,
        },
        preferredLanguage: {
            type: String,
            enum: ['english', 'hindi', 'hinglish'],
            default: 'hinglish',
        },
    },

    // Account Status
    emailVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for performance
UserSchema.index({ 'selectedCareer.careerId': 1 });
UserSchema.index({ 'selectedCareer.domain': 1 });
UserSchema.index({ 'progress.lastActive': -1 });
UserSchema.index({ collegeName: 1, graduationYear: 1 });

// Update timestamp on save
UserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to calculate completion percentage
UserSchema.methods.getCompletionPercentage = function () {
    if (!this.progress || !this.progress.roadmapId) return 0;

    // This will be calculated based on roadmap total topics
    const completed = this.progress.completedTopics?.length || 0;
    // TODO: Get total topics from roadmap
    const total = 50; // Placeholder

    return Math.round((completed / total) * 100);
};

// Method to update streak
UserSchema.methods.updateStreak = function () {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActive = this.progress?.lastActive
        ? new Date(this.progress.lastActive).setHours(0, 0, 0, 0)
        : 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!this.progress) {
        this.progress = {
            currentStreak: 1,
            longestStreak: 1,
            lastActive: new Date(),
            completedTopics: [],
            totalHours: 0,
        };
    } else if (lastActive === today) {
        // Same day, no change
    } else if (lastActive === today - oneDayMs) {
        // Consecutive day
        this.progress.currentStreak += 1;
        if (this.progress.currentStreak > this.progress.longestStreak) {
            this.progress.longestStreak = this.progress.currentStreak;
        }
        this.progress.lastActive = new Date();
    } else {
        // Streak broken
        this.progress.currentStreak = 1;
        this.progress.lastActive = new Date();
    }
};

module.exports = mongoose.model('User', UserSchema);
