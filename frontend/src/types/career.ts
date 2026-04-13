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

export interface Topic {
  topicId: string;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedHours: number;
  resources: Resource[];
  practiceResources?: {
    platform: string;
    difficulty: string;
    problemSet: string[];
  }[];
  assessmentQuiz?: {
    questions: number;
    passingScore: number;
  };
}

export interface Module {
  moduleId: string;
  title: string;
  description: string;
  estimatedHours: number;
  prerequisiteModules?: string[];
  topics: Topic[];
}

export interface Roadmap {
  roadmapId: string;
  careerId: string;
  domain: CareerDomain;
  targetDuration: number; // weeks
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  prerequisiteSkills: string[];
  modules: Module[];
  capstoneProjects?: {
    title: string;
    description: string;
    estimatedHours: number;
    requiredSkills: string[];
    githubTemplate?: string;
  }[];
  generatedAt: Date;
  lastUpdated: Date;
  version: number;
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

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  selectedCareer?: {
    careerId: string;
    careerName: string;
    domain: CareerDomain;
    specialization: string;
    fitScore: number;
    assessmentResults: {
      interestScore: number;
      aptitudeScore: number;
      personalityFit: number;
      marketAlignment: number;
    };
    selectedAt: Date;
  };
  progress?: {
    roadmapId: string;
    completedTopics: {
      topicId: string;
      completedAt: Date;
      timeSpent: number;
      resourcesUsed: string[];
    }[];
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
    lastActive: Date;
    milestones: {
      name: string;
      achievedAt: Date;
      badgeUrl: string;
    }[];
  };
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    sourceTopic: string;
    verifiedBy: string[];
    addedAt: Date;
  }[];
  learningProfile: {
    preferredContentTypes: string[];
    learningPace: 'slow' | 'moderate' | 'fast';
    dailyTimeCommitment: number;
    preferredLanguage: 'english' | 'hindi' | 'hinglish';
  };
  createdAt: Date;
  updatedAt: Date;
}
