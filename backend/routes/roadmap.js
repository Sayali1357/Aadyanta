const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const Metadata = require('../models/Metadata');
const geminiCache = require('../services/geminiCache');
const mongoose = require('mongoose');

// GET or CREATE Roadmap for User's Career with Authorization Check
router.get('/:careerId', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { careerId } = req.params;

        // 1. Get user to check authorization
        const user = await User.findById(req.userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. AUTHORIZATION: Check if user has selected this career
        if (!user.selectedCareer || user.selectedCareer.careerId !== careerId) {
            await session.abortTransaction();
            return res.status(403).json({
                message: 'Access denied. Complete career assessment first or select this career.',
                requiresAssessment: !user.selectedCareer,
            });
        }

        // 3. Try to find existing roadmap in database (using new field name)
        let roadmap = await Roadmap.findOne({ career_id: careerId }).session(session);

        if (roadmap) {
            console.log(`✅ Roadmap found in DB for: ${careerId}`);

            // Update user's active_roadmap_id if not set
            if (!user.active_roadmap_id) {
                user.active_roadmap_id = roadmap._id;
                await user.save({ session });
            }

            // Update metadata coming_next if empty
            let metadata = await Metadata.findOne({ user_id: req.userId }).session(session);
            if (metadata && metadata.coming_next.length === 0) {
                const completedIds = metadata.completed_topics.map(t => t.topic_id);
                const nextTopics = [];

                for (const mod of (roadmap.modules || [])) {
                    for (const topic of (mod.topics || [])) {
                        if (!completedIds.includes(topic.topic_id)) {
                            nextTopics.push({
                                topic_id: topic.topic_id,
                                title: topic.title,
                                module_name: mod.title,
                                estimated_hours: topic.estimated_hours,
                            });
                            if (nextTopics.length >= 3) break;
                        }
                    }
                    if (nextTopics.length >= 3) break;
                }

                metadata.coming_next = nextTopics;
                await metadata.save({ session });
            }

            await session.commitTransaction();
            return res.json(roadmap);
        }

        // 4. Roadmap doesn't exist — generate with Gemini (with caching)
        console.log(`⚠️ Roadmap NOT in DB. Generating for: ${careerId}`);

        const roadmapData = await geminiCache.generateRoadmap(
            careerId,
            user.selectedCareer.domain,
            user.selectedCareer.careerName
        );

        // 5. Save to database (use new field names)
        roadmap = new Roadmap({
            ...roadmapData,
            // Map old field names to new ones if Gemini returns old format
            roadmap_id: roadmapData.roadmap_id || roadmapData.roadmapId || `${careerId}_roadmap`,
            career_id: roadmapData.career_id || roadmapData.careerId || careerId,
            career_name: roadmapData.career_name || roadmapData.careerName || user.selectedCareer.careerName,
            target_duration_weeks: roadmapData.target_duration_weeks || roadmapData.targetDuration,
            difficulty_level: roadmapData.difficulty_level || roadmapData.difficultyLevel || 'beginner',
            generated_at: new Date(),
            last_updated: new Date(),
        });

        await roadmap.save({ session });

        // 6. Update user's active_roadmap_id
        user.active_roadmap_id = roadmap._id;
        await user.save({ session });

        // 7. Update metadata coming_next with first 3 topics
        let metadata = await Metadata.findOne({ user_id: req.userId }).session(session);
        if (metadata) {
            const nextTopics = [];
            for (const mod of (roadmap.modules || [])) {
                for (const topic of (mod.topics || [])) {
                    nextTopics.push({
                        topic_id: topic.topic_id || topic.topicId,
                        title: topic.title,
                        module_name: mod.title,
                        estimated_hours: topic.estimated_hours || topic.estimatedHours,
                    });
                    if (nextTopics.length >= 3) break;
                }
                if (nextTopics.length >= 3) break;
            }
            metadata.coming_next = nextTopics;
            await metadata.save({ session });
        }

        await session.commitTransaction();

        res.json(roadmap);
    } catch (error) {
        await session.abortTransaction();
        console.error('Get roadmap error:', error);
        res.status(500).json({
            message: 'Failed to load roadmap',
            error: error.message,
        });
    } finally {
        session.endSession();
    }
});

module.exports = router;
