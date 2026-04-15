// Career Domain Types
export type CareerDomain = 'technology' | 'design' | 'business' | 'healthcare';

export interface DomainPlatform {
  platform: string;
  weight: number;
  contentTypes: string[];
}

export interface CareerDomainConfig {
  domain: CareerDomain;
  careers: string[];
  resourceEcosystem: {
    learning: {
      primary: DomainPlatform[];
      documentation?: { platform: string; languages?: string[] }[];
    };
    practice?: { platform: string; topics: string[]; difficulty: string[] }[];
    projects?: { platform: string; type: string }[];
    community: { platform: string; priority: number }[];
    certifications: { provider: string; careers?: string[] }[];
  };
  contentPreferences: {
    videoInstructors?: string[];
    preferredLanguage: string;
    contentFormat: string;
  };
}

export interface Resource {
  type: 'video' | 'course' | 'article' | 'notes' | 'interactive' | 'practice';
  platform: string;
  title: string;
  url: string;
  isFree: boolean;
  duration?: string;
  instructor?: string;
  rating?: number;
  language?: string;
  certification: boolean;
  thumbnail?: string;
  priority: number;
}

// ── New Schema Types (3-Collection Architecture) ───────────

// Subtopic (embedded in Topic)
export interface Subtopic {
  subtopic_id: string;
  title: string;
  description?: string;
  order: number;
  key_concepts: string[];
  code_examples?: {
    language: string;
    title: string;
    code: string;
    explanation: string;
  }[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// GFG-style Blog Content
export interface TopicContent {
  blog_title: string;
  blog_body: string; // Markdown formatted
  author: string;
  tags: string[];
  read_time_minutes: number;
  last_updated?: Date;
}

// YouTube Resource
export interface YouTubeResource {
  playlist_title: string;
  playlist_url: string;
  channel_name?: string;
  video_count?: number;
  total_duration?: string;
  language: 'english' | 'hindi' | 'hinglish';
  is_free: boolean;
  thumbnail_url?: string;
}

// Article Resource
export interface ArticleResource {
  title: string;
  url: string;
  platform?: string;
  type: 'tutorial' | 'documentation' | 'cheatsheet' | 'blog';
  read_time_minutes?: number;
  is_free: boolean;
}

// Topic (embedded in Module)
export interface Topic {
  topic_id: string;
  title: string;
  description?: string;
  order: number;
  estimated_hours: number;
  learning_objectives: string[];
  subtopics: Subtopic[];
  content?: TopicContent;
  youtube_resources: YouTubeResource[];
  article_resources: ArticleResource[];
  practice_resources?: {
    platform: string;
    url?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    problem_count?: number;
    problem_set: string[];
  }[];
  assessment_quiz?: {
    questions: number;
    passing_score: number;
  };

  // Legacy compat fields (used by Roadmap page mock data)
  topicId?: string;
  learningObjectives?: string[];
  estimatedHours?: number;
  resources?: Resource[];
}

// Module (embedded in Roadmap)
export interface Module {
  module_id: string;
  title: string;
  description?: string;
  order: number;
  estimated_hours: number;
  prerequisite_modules?: string[];
  topics: Topic[];

  // Legacy compat fields
  moduleId?: string;
  estimatedHours?: number;
}

// Roadmap (top-level collection)
export interface Roadmap {
  _id?: string;
  roadmap_id: string;
  career_id: string;
  career_name: string;
  domain: CareerDomain;
  target_duration_weeks: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prerequisite_skills?: string[];
  modules: Module[];
  capstone_projects?: {
    title: string;
    description: string;
    estimated_hours: number;
    required_skills: string[];
    github_template?: string;
  }[];
  generated_at: Date;
  last_updated: Date;
  version: number;

  // Legacy compat fields
  roadmapId?: string;
  careerId?: string;
  targetDuration?: number;
}

// Metadata (separate collection — learning progress & stats)
export interface UserMetadata {
  _id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_learning_points: number;
  progress: number; // 0-100%
  hours_invested: number;
  topics_completed: number;
  completed_topics: {
    topic_id: string;
    topic_name?: string;
    completed_at: Date;
    time_spent?: number;
    attention_score?: number;
    distraction_count?: number;
    quiz_result?: {
      score: number;
      total_questions: number;
      accuracy: number;
      weak_areas: string[];
      strong_areas: string[];
    };
  }[];
  recent_activity: {
    topic_name: string;
    action: string;
    completed_at: Date;
  }[];
  coming_next: {
    topic_id: string;
    title: string;
    module_name: string;
    estimated_hours?: number;
  }[];
  gap_topics: {
    topic_id: string;
    title: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  milestones: {
    name: string;
    description?: string;
    achieved_at: Date;
    badge_icon?: string;
  }[];
  last_active?: Date;
}

// User (lean auth-only collection)
export interface UserProfile {
  _id?: string;
  username: string;
  email: string;
  password?: string; // never returned by API
  metadata_id?: string;
  active_roadmap_id?: string;
  selectedCareer?: {
    careerId: string;
    careerName: string;
    domain: CareerDomain;
    specialization?: string;
    fitScore?: number;
    assessmentResults?: {
      interestScore: number;
      aptitudeScore: number;
      personalityFit: number;
      marketAlignment: number;
    };
    selectedAt: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Backward compat: API returns 'name' as alias of 'username'
  name?: string;
  // Profile endpoint includes metadata
  metadata?: UserMetadata;
}

export interface AssessmentData {
  education: string;
  interests: string[];
  aptitudeScores: {
    logical: number;
    creative: number;
    analytical: number;
    communication: number;
  };
  skills: string[];
  goals: string;
  learningStyle: string;
  dailyHours: number;
}

export interface CareerRecommendation {
  id: string;
  name: string;
  domain: CareerDomain;
  fitScore: {
    overall: number;
    breakdown: {
      interest: number;
      aptitude: number;
      market: number;
      learningStyle: number;
    };
  };
  description: string;
  requiredSkills: string[];
  marketOutlook: {
    demand: string;
    salaryRange: {
      entry: string;
      mid: string;
      senior: string;
    };
    topCompanies: string[];
    growthPotential: string;
  };
  dayInLife: string;
  specializations: string[];
}
