/**
 * Seed MongoDB with curated roadmaps (see backend/seed/roadmaps/seedRoadmaps.js).
 * Run: npm run seed --workspace=backend  (from repo root)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Roadmap = require('../models/Roadmap');
const { getSeedRoadmapDocuments } = require('../seed/roadmaps/seedRoadmaps');

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('Missing MONGODB_URI in backend/.env');
        process.exit(1);
    }

    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected. Seeding roadmaps…');

    // Backfill roadmapId for legacy docs (avoids unique index { roadmapId: null } collisions)
    await Roadmap.collection.updateMany(
        { $or: [{ roadmapId: null }, { roadmapId: { $exists: false } }] },
        [{ $set: { roadmapId: '$career_id' } }]
    );

    const docs = getSeedRoadmapDocuments();
    const now = new Date();

    for (const doc of docs) {
        await Roadmap.findOneAndUpdate(
            { career_id: doc.career_id },
            {
                $set: {
                    ...doc,
                    generated_at: now,
                    last_updated: now,
                },
            },
            { upsert: true, new: true }
        );
        console.log(`✔ ${doc.career_id} — ${doc.modules.length} modules`);
    }

    await mongoose.disconnect();
    console.log('Done.');
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
