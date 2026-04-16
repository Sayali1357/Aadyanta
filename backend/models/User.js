const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Display name (optional — email is the stable identifier; multiple users share the same roadmap by career_id)
    username: {
        type: String,
        trim: true,
        default: '',
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

    // References
    metadata_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Metadata',
    },
    active_roadmap_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
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

    // Account Status
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

// Update timestamp on save
UserSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('User', UserSchema);
