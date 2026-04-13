import { geminiService } from './gemini';
import { Resource } from '@/types/career';

interface TopicContent {
    id: string;
    name: string;
    module: string;
    domain: string;
    duration: string;
    objectives: string[];
    youtubePlaylist?: {
        playlistId: string;
        title: string;
    };
    resources: Resource[];
}

class TopicService {
    /**
     * Generate topic-specific content using Gemini AI
     */
    async generateTopicContent(
        topicId: string,
        topicName: string,
        domain: string,
        moduleName: string = 'Learning Module'
    ): Promise<TopicContent> {
        const prompt = `
Generate comprehensive learning content for the topic: "${topicName}"

Domain: ${domain}
Module: ${moduleName}

Please provide:

1. Estimated Duration: Total hours needed to complete this topic (e.g., "8 hours", "12 hours")

2. Learning Objectives: 4-6 specific, measurable learning objectives for this topic

3. YouTube Playlist Recommendation:
   - Find the MOST POPULAR and HIGHEST QUALITY YouTube playlist for "${topicName}"
   - Prefer playlists from well-known educators (CodeWithHarry for Hindi tech content, freeCodeCamp, Traversy Media, etc.)
   - Provide the actual YouTube playlist ID (the part after "?list=" in the URL)
   - Provide a descriptive title for the playlist

4. Additional Resources: Recommend 3-4 FREE resources from these platforms based on domain:
   - For technology: GeeksforGeeks, FreeCodeCamp, LeetCode, W3Schools
   - For design: Behance, Dribbble, Figma Community  
   - For business: Coursera (free audit), Harvard Business Review
   - For healthcare: Khan Academy, Coursera

Return ONLY valid JSON in this exact format:
{
  "duration": "8 hours",
  "objectives": [
    "Learn fundamental concepts of ${topicName}",
    "Understand practical applications",
    "Build hands-on projects",
    "Master key techniques"
  ],
  "youtubePlaylist": {
    "playlistId": "PLu0W_9lII9ajyk081To1Cbt2eI5913SsL",
    "title": "${topicName} Complete Course in Hindi"
  },
  "resources": [
    {
      "type": "article",
      "platform": "geeksforgeeks",
      "title": "${topicName} Tutorial - Complete Guide",
      "url": "https://www.geeksforgeeks.org/...",
      "isFree": true,
      "duration": "45 min",
      "instructor": "GeeksforGeeks",
      "certification": false,
      "language": "english",
      "priority": 5
    }
  ]
}

IMPORTANT: 
- Make sure the YouTube playlist ID is REAL and relevant to "${topicName}"
- Provide actual URLs for resources
- Ensure all resources are FREE
- Focus on quality, beginner-friendly content
`;

        try {
            const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
            const model = geminiService['genAI'].getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            const jsonData = this.extractJSON(response);
            const parsed = JSON.parse(jsonData);

            const topicContent: TopicContent = {
                id: topicId,
                name: topicName,
                module: moduleName,
                domain,
                duration: parsed.duration || '8 hours',
                objectives: parsed.objectives || [],
                youtubePlaylist: parsed.youtubePlaylist,
                resources: parsed.resources || [],
            };

            return topicContent;
        } catch (error) {
            console.error('Error generating topic content:', error);

            // Fallback to default content if Gemini fails
            return this.getFallbackContent(topicId, topicName, domain, moduleName);
        }
    }

    /**
     * Get popular YouTube playlists for common topics
     */
    getPopularPlaylist(topicName: string): { playlistId: string; title: string } | undefined {
        const topicLower = topicName.toLowerCase();

        // Curated playlist database for common topics
        const playlists: Record<string, { playlistId: string; title: string }> = {
            // Programming Languages
            'javascript': {
                playlistId: 'PLu0W_9lII9ajyk081To1Cbt2eI5913SsL',
                title: 'JavaScript Tutorial for Beginners in Hindi - CodeWithHarry',
            },
            'python': {
                playlistId: 'PLu0W_9lII9agwh1XjRt242xIpHhPT2llg',
                title: 'Python Tutorial for Beginners in Hindi - CodeWithHarry',
            },
            'java': {
                playlistId: 'PLu0W_9lII9agS67Uits0UnJyrYiXhDS6q',
                title: 'Java Tutorial for Beginners in Hindi - CodeWithHarry',
            },
            'react': {
                playlistId: 'PLu0W_9lII9agx66oZnT6IyhcMIbUMNMdt',
                title: 'React JS Tutorial in Hindi - CodeWithHarry',
            },

            // Data & ML
            'data analysis': {
                playlistId: 'PLeo1K3hjS3uuASpe-1LjfG5f14Bnozjwy',
                title: 'Data Analysis with Python - Complete Course',
            },
            'machine learning': {
                playlistId: 'PLeo1K3hjS3uvCeTYTeyfe0-rN5r8zn9rw',
                title: 'Machine Learning Tutorial - Python',
            },
            'sql': {
                playlistId: 'PLu0W_9lII9ah7DDtYtflgwMwpT3xmjXY9',
                title: 'SQL Tutorial in Hindi - CodeWithHarry',
            },

            // Web Development
            'html': {
                playlistId: 'PLu0W_9lII9agiCUZYRsvtGTXdxkzPyItg',
                title: 'HTML Tutorial for Beginners in Hindi - CodeWithHarry',
            },
            'css': {
                playlistId: 'PLu0W_9lII9agiCUZYRsvtGTXdxkzPyItg',
                title: 'CSS Tutorial for Beginners in Hindi - CodeWithHarry',
            },

            // Design
            'ui ux design': {
                playlistId: 'PLDyQo7g0_nsVHmyZtVGA3kEYQlXJ1UiF4',
                title: 'UI/UX Design Full Course',
            },
            'figma': {
                playlistId: 'PLvnhLz53SMQag89tZOJGIaJcx2y7uxlZB',
                title: 'Figma Tutorial for Beginners',
            },
        };

        // Try exact match
        if (playlists[topicLower]) {
            return playlists[topicLower];
        }

        // Try partial match
        for (const [key, value] of Object.entries(playlists)) {
            if (topicLower.includes(key) || key.includes(topicLower)) {
                return value;
            }
        }

        return undefined;
    }

    /**
     * Fallback content when Gemini is not available
     */
    private getFallbackContent(
        topicId: string,
        topicName: string,
        domain: string,
        moduleName: string
    ): TopicContent {
        const playlist = this.getPopularPlaylist(topicName);

        return {
            id: topicId,
            name: topicName,
            module: moduleName,
            domain,
            duration: '8 hours',
            objectives: [
                `Understand the fundamentals of ${topicName}`,
                `Learn key concepts and best practices`,
                `Build practical projects and examples`,
                `Apply ${topicName} in real-world scenarios`,
            ],
            youtubePlaylist: playlist,
            resources: [
                {
                    type: 'article' as const,
                    platform: domain === 'technology' ? 'geeksforgeeks' : 'medium',
                    title: `${topicName} - Complete Tutorial`,
                    url: `https://www.google.com/search?q=${encodeURIComponent(topicName + ' tutorial')}`,
                    isFree: true,
                    duration: '45 min',
                    instructor: 'Community',
                    certification: false,
                    language: 'english',
                    priority: 4,
                },
            ],
        };
    }

    /**
     * Extract JSON from Gemini response
     */
    private extractJSON(text: string): string {
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            return jsonMatch[1].trim();
        }

        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) return objectMatch[0];

        return text.trim();
    }
}

export const topicService = new TopicService();
