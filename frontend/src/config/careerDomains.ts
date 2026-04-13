import { CareerDomainConfig } from '@/types/career';

// Career Domain Configurations
export const CAREER_DOMAINS: CareerDomainConfig[] = [
    {
        domain: 'technology',
        careers: [
            'backend_developer',
            'frontend_developer',
            'fullstack_developer',
            'data_scientist',
            'ml_engineer',
            'devops_engineer',
            'mobile_developer',
        ],
        resourceEcosystem: {
            learning: {
                primary: [
                    { platform: 'geeksforgeeks', weight: 0.9, contentTypes: ['article', 'practice'] },
                    { platform: 'youtube', weight: 0.8, contentTypes: ['video'] },
                    { platform: 'coursera', weight: 0.7, contentTypes: ['course'] },
                    { platform: 'udemy', weight: 0.6, contentTypes: ['course'] },
                ],
                documentation: [
                    { platform: 'mdn_web_docs', languages: ['javascript', 'html', 'css'] },
                    { platform: 'python_docs', languages: ['python'] },
                    { platform: 'oracle_java_docs', languages: ['java'] },
                ],
            },
            practice: [
                { platform: 'leetcode', topics: ['dsa', 'algorithms'], difficulty: ['easy', 'medium', 'hard'] },
                { platform: 'hackerrank', topics: ['dsa', 'sql', 'python'], difficulty: ['easy', 'medium', 'hard'] },
                { platform: 'codechef', topics: ['competitive_programming'], difficulty: ['beginner', 'intermediate', 'advanced'] },
            ],
            projects: [
                { platform: 'github', type: 'templates' },
                { platform: 'replit', type: 'interactive_ide' },
            ],
            community: [
                { platform: 'stackoverflow', priority: 1 },
                { platform: 'reddit_learnprogramming', priority: 2 },
                { platform: 'dev_to', priority: 3 },
            ],
            certifications: [
                { provider: 'google_cloud', careers: ['backend_developer', 'devops_engineer'] },
                { provider: 'aws', careers: ['backend_developer', 'devops_engineer'] },
                { provider: 'meta_frontend', careers: ['frontend_developer'] },
            ],
        },
        contentPreferences: {
            videoInstructors: ['CodeWithHarry', 'Apna College', 'FreeCodeCamp'],
            preferredLanguage: 'hinglish',
            contentFormat: 'hands_on',
        },
    },
    {
        domain: 'design',
        careers: [
            'ui_ux_designer',
            'graphic_designer',
            'product_designer',
            'motion_graphics',
            'game_designer',
        ],
        resourceEcosystem: {
            learning: {
                primary: [
                    { platform: 'youtube', weight: 0.9, contentTypes: ['video', 'tutorial'] },
                    { platform: 'skillshare', weight: 0.7, contentTypes: ['course'] },
                    { platform: 'coursera', weight: 0.6, contentTypes: ['course'] },
                ],
            },
            practice: [
                { platform: 'daily_ui', topics: ['daily_challenges'], difficulty: ['beginner', 'intermediate'] },
                { platform: 'frontend_mentor', topics: ['frontend_challenges'], difficulty: ['beginner', 'intermediate', 'advanced'] },
            ],
            projects: [
                { platform: 'figma_community', type: 'templates' },
                { platform: 'behance', type: 'portfolio_showcase' },
                { platform: 'dribbble', type: 'ui_shots' },
            ],
            community: [
                { platform: 'designer_hangout', priority: 1 },
                { platform: 'reddit_design', priority: 2 },
            ],
            certifications: [
                { provider: 'google_ux_design', careers: ['ui_ux_designer', 'product_designer'] },
                { provider: 'adobe_certified', careers: ['graphic_designer'] },
            ],
        },
        contentPreferences: {
            preferredLanguage: 'english',
            contentFormat: 'visual_tutorial',
        },
    },
    {
        domain: 'business',
        careers: [
            'business_analyst',
            'product_manager',
            'management_consultant',
            'digital_marketer',
            'sales_professional',
        ],
        resourceEcosystem: {
            learning: {
                primary: [
                    { platform: 'coursera', weight: 0.9, contentTypes: ['course'] },
                    { platform: 'linkedin_learning', weight: 0.8, contentTypes: ['course'] },
                    { platform: 'youtube', weight: 0.7, contentTypes: ['video'] },
                    { platform: 'harvard_business_review', weight: 0.6, contentTypes: ['article', 'case_study'] },
                ],
            },
            practice: [
                { platform: 'case_interview_prep', topics: ['case_studies'], difficulty: ['beginner', 'intermediate', 'advanced'] },
                { platform: 'product_school', topics: ['pm_challenges'], difficulty: ['beginner', 'intermediate'] },
            ],
            community: [
                { platform: 'product_school_community', priority: 1 },
                { platform: 'reddit_consulting', priority: 2 },
            ],
            certifications: [
                { provider: 'google_analytics', careers: ['digital_marketer'] },
                { provider: 'pmp', careers: ['product_manager'] },
                { provider: 'csm', careers: ['product_manager'] },
            ],
        },
        contentPreferences: {
            preferredLanguage: 'english',
            contentFormat: 'case_study_based',
        },
    },
    {
        domain: 'healthcare',
        careers: [
            'healthcare_analyst',
            'medical_coder',
            'pharma_specialist',
            'health_informatics',
        ],
        resourceEcosystem: {
            learning: {
                primary: [
                    { platform: 'coursera', weight: 0.9, contentTypes: ['course'] },
                    { platform: 'khan_academy', weight: 0.8, contentTypes: ['video'] },
                    { platform: 'youtube', weight: 0.7, contentTypes: ['video'] },
                    { platform: 'medscape', weight: 0.6, contentTypes: ['article'] },
                ],
            },
            community: [
                { platform: 'student_doctor_network', priority: 1 },
            ],
            certifications: [
                { provider: 'aapc', careers: ['medical_coder'] },
                { provider: 'ahima', careers: ['medical_coder'] },
            ],
        },
        contentPreferences: {
            preferredLanguage: 'english',
            contentFormat: 'structured_learning',
        },
    },
];

// Get domain configuration by domain name
export const getDomainConfig = (domain: string): CareerDomainConfig | undefined => {
    return CAREER_DOMAINS.find((d) => d.domain === domain);
};

// Get domain platforms for resource fetching
export const getDomainPlatforms = (domain: string): string[] => {
    const config = getDomainConfig(domain);
    if (!config) return [];

    const platforms = config.resourceEcosystem.learning.primary.map((p) => p.platform);
    return Array.from(new Set(platforms));
};

// Get career domain by career ID
export const getCareerDomain = (careerId: string): string | undefined => {
    for (const domain of CAREER_DOMAINS) {
        if (domain.careers.includes(careerId)) {
            return domain.domain;
        }
    }
    return undefined;
};

// Domain display configurations
export const DOMAIN_DISPLAY = {
    technology: {
        name: 'Technology & Software',
        icon: '💻',
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Build apps, analyze data, solve problems with code',
        sampleCareers: ['Backend Developer', 'Data Scientist', 'DevOps Engineer'],
    },
    design: {
        name: 'Design & Creative',
        icon: '🎨',
        gradient: 'from-purple-500 to-pink-500',
        description: 'Create beautiful interfaces and visual experiences',
        sampleCareers: ['UI/UX Designer', 'Graphic Designer', 'Product Designer'],
    },
    business: {
        name: 'Business & Management',
        icon: '📊',
        gradient: 'from-green-500 to-teal-500',
        description: 'Drive strategy, analyze markets, manage products',
        sampleCareers: ['Product Manager', 'Business Analyst', 'Consultant'],
    },
    healthcare: {
        name: 'Healthcare & Medical',
        icon: '⚕️',
        gradient: 'from-red-500 to-orange-500',
        description: 'Improve healthcare through data and analysis',
        sampleCareers: ['Healthcare Analyst', 'Medical Coder', 'Pharma Specialist'],
    },
};
