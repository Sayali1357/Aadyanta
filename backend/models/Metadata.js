const mongoose = require('mongoose');

const MetadataSchema = new mongoose.Schema({
    // One-to-one reference to User
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },

    // Streak Tracking
    current_streak: {
        type: Number,
        default: 0,
    },
    longest_streak: {
        type: Number,
        default: 0,
    },

    // Gamification
    total_learning_points: {
        type: Number,
        default: 0,
    },

    // Overall Progress (0-100%)
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },

    // Time Investment
    hours_invested: {
        type: Number,
        default: 0,
    },

    // Topic Tracking
    topics_completed: {
        type: Number,
        default: 0,
    },

    // Array of completed topic unique IDs
    completed_topics: [{
        topic_id: {
            type: String,
            required: true,
        },
        topic_name: String,
        completed_at: {
            type: Date,
            default: Date.now,
        },
        time_spent: Number, // minutes
        attention_score: Number, // 0-100
        distraction_count: Number,
        quiz_result: {
            score: Number,
            total_questions: Number,
            accuracy: Number,
            weak_areas: [String],
            strong_areas: [String],
        },
    }],

    // Recent Activity — Queue of last 10 activities (newest first)
    recent_activity: [{
        topic_name: {
            type: String,
            required: true,
        },
        action: {
            type: String,
            default: 'completed',
        },
        completed_at: {
            type: Date,
            default: Date.now,
        },
    }],

    // Coming Next — Upcoming 3 topics from the active roadmap
    coming_next: [{
        topic_id: String,
        title: String,
        module_name: String,
        estimated_hours: Number,
    }],

    // Gap Topics — Weak areas from quiz evaluation needing revision
    gap_topics: [{
        topic_id: String,
        title: String,
        module_id: String,
        module_name: String,
        reason: {
            type: String,
            default: 'low_quiz_score',
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        quiz_score: Number,       // score when this gap was identified
        quiz_total: Number,       // total questions in that quiz
        fail_count: {             // how many times user got this wrong
            type: Number,
            default: 1,
        },
        added_at: {
            type: Date,
            default: Date.now,
        },
        last_failed_at: {
            type: Date,
            default: Date.now,
        },
    }],

    // Milestones / Achievements
    milestones: [{
        name: String,
        description: String,
        achieved_at: {
            type: Date,
            default: Date.now,
        },
        badge_icon: String,
    }],

    // Last active session
    last_active: {
        type: Date,
    },
});

// Indexes for performance
MetadataSchema.index({ last_active: -1 });

/**
 * Update the streak based on last_active timestamp.
 * Call this method whenever the user engages in a learning activity.
 */
MetadataSchema.methods.updateStreak = function () {
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActive = this.last_active
        ? new Date(this.last_active).setHours(0, 0, 0, 0)
        : 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (lastActive === today) {
        // Same day — no streak change
        return;
    } else if (lastActive === today - oneDayMs) {
        // Consecutive day — increment streak
        this.current_streak += 1;
        if (this.current_streak > this.longest_streak) {
            this.longest_streak = this.current_streak;
        }
    } else {
        // Streak broken — reset to 1
        this.current_streak = 1;
    }

    this.last_active = new Date();
};

/**
 * Add an entry to recent_activity queue (max 10 items, FIFO).
 */
MetadataSchema.methods.pushRecentActivity = function (topicName, action = 'completed') {
    this.recent_activity.unshift({
        topic_name: topicName,
        action,
        completed_at: new Date(),
    });

    // Cap at 10 entries
    if (this.recent_activity.length > 10) {
        this.recent_activity = this.recent_activity.slice(0, 10);
    }
};

/**
 * Award learning points for an action.
 * Points logic:
 *   - Topic completed: 100 pts
 *   - Quiz passed:      50 pts
 *   - Streak bonus:     10 pts * streak_length
 */
MetadataSchema.methods.awardPoints = function (action) {
    const pointsMap = {
        topic_completed: 100,
        quiz_passed: 50,
        streak_bonus: 10 * this.current_streak,
    };

    this.total_learning_points += (pointsMap[action] || 0);
};

module.exports = mongoose.model('Metadata', MetadataSchema);
