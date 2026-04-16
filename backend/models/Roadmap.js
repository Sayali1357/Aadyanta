const mongoose = require('mongoose');

// ── Subtopic Schema ──────────────────────────────────────────────────
const SubtopicSchema = new mongoose.Schema({
    subtopic_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    order: {
        type: Number,
        default: 0,
    },
    key_concepts: [String],
    code_examples: [{
        language: String,
        title: String,
        code: String,
        explanation: String,
    }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
}, { _id: false });

// ── GFG-style Blog Content Schema ────────────────────────────────────
const ContentSchema = new mongoose.Schema({
    blog_title: String,
    blog_body: String, // Markdown-formatted tutorial content
    author: {
        type: String,
        default: 'Career Compass AI',
    },
    tags: [String],
    read_time_minutes: Number,
    last_updated: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

// ── YouTube Resource Schema ──────────────────────────────────────────
const YouTubeResourceSchema = new mongoose.Schema({
    playlist_title: {
        type: String,
        required: true,
    },
    playlist_url: {
        type: String,
        required: true,
    },
    channel_name: String,
    video_count: Number,
    total_duration: String, // e.g. "4h 30m"
    language: {
        type: String,
        enum: ['english', 'hindi', 'hinglish'],
        default: 'english',
    },
    is_free: {
        type: Boolean,
        default: true,
    },
    thumbnail_url: String,
}, { _id: false });

// ── Article Resource Schema ──────────────────────────────────────────
const ArticleResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    platform: String, // e.g. "GeeksforGeeks", "MDN", "W3Schools"
    type: {
        type: String,
        enum: ['tutorial', 'documentation', 'cheatsheet', 'blog'],
        default: 'tutorial',
    },
    read_time_minutes: Number,
    is_free: {
        type: Boolean,
        default: true,
    },
}, { _id: false });

// ── Practice Resource Schema ─────────────────────────────────────────
const PracticeResourceSchema = new mongoose.Schema({
    platform: String, // e.g. "LeetCode", "HackerRank", "Codeforces"
    url: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
    },
    problem_count: Number,
    problem_set: [String],
}, { _id: false });

// ── Topic Schema ─────────────────────────────────────────────────────
const TopicSchema = new mongoose.Schema({
    topic_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    order: {
        type: Number,
        default: 0,
    },
    estimated_hours: Number,
    learning_objectives: [String],

    // Subtopics breakdown
    subtopics: [SubtopicSchema],

    // GFG-style blog/article content
    content: ContentSchema,

    // YouTube playlists & videos
    youtube_resources: [YouTubeResourceSchema],

    // Written articles & documentation
    article_resources: [ArticleResourceSchema],

    // Practice platforms & problem sets
    practice_resources: [PracticeResourceSchema],

    // Assessment quiz config
    assessment_quiz: {
        questions: Number,
        passing_score: Number,
    },
}, { _id: false });

// ── Module Schema ────────────────────────────────────────────────────
const ModuleSchema = new mongoose.Schema({
    module_id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    order: {
        type: Number,
        default: 0,
    },
    estimated_hours: Number,
    prerequisite_modules: [String],
    topics: [TopicSchema],
}, { _id: false });

// ── Roadmap Schema (Top Level) ───────────────────────────────────────
const RoadmapSchema = new mongoose.Schema({
    /** Canonical slug for URLs / quiz (matches career_id), enforced unique in DB */
    roadmapId: {
        type: String,
        required: true,
        unique: true,
    },
    roadmap_id: {
        type: String,
        required: true,
        unique: true,
    },
    career_id: {
        type: String,
        required: true,
    },
    career_name: {
        type: String,
        required: true,
    },
    domain: {
        type: String,
        required: true,
        enum: ['technology', 'design', 'business', 'healthcare'],
    },
    target_duration_weeks: Number,
    difficulty_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    prerequisite_skills: [String],
    modules: [ModuleSchema],

    // Capstone projects
    capstone_projects: [{
        title: String,
        description: String,
        estimated_hours: Number,
        required_skills: [String],
        github_template: String,
    }],

    generated_at: {
        type: Date,
        default: Date.now,
    },
    last_updated: {
        type: Date,
        default: Date.now,
    },
    version: {
        type: Number,
        default: 1,
    },
});

// Indexes
RoadmapSchema.index({ career_id: 1 });
RoadmapSchema.index({ domain: 1 });

module.exports = mongoose.model('Roadmap', RoadmapSchema);
