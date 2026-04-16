/**
 * Canonical career catalog: only these roles are returned after assessment
 * and each has a matching seeded roadmap in MongoDB (run npm run seed).
 */

const SEED_CAREERS = [
    {
        id: 'backend_developer',
        name: 'Backend Developer',
        domain: 'technology',
        description:
            'Design and implement APIs, services, and data layers that power web and mobile products — with a focus on reliability and Indian product-company interviews.',
        requiredSkills: ['REST APIs', 'SQL', 'Node.js or Java', 'Git', 'Authentication'],
        marketOutlook: {
            demand: 'Very High',
            salaryRange: { entry: '₹4–8 LPA', mid: '₹10–18 LPA', senior: '₹22–40 LPA' },
            topCompanies: ['Razorpay', 'Flipkart', 'Zomato', 'Meesho', 'Microsoft India'],
            growthPotential: 'Strong demand for API and microservices experience across fintech and e-commerce.',
        },
        dayInLife:
            'Stand-ups, review API contracts with frontend/mobile, implement endpoints and migrations, debug production issues, and pair on performance or security fixes.',
        specializations: ['Node.js microservices', 'Java Spring Boot', 'API design', 'PostgreSQL'],
        baseFit: { interest: 78, aptitude: 80, market: 92, learningStyle: 75 },
        keywords: [
            'node',
            'nodejs',
            'express',
            'java',
            'spring',
            'python',
            'django',
            'flask',
            'api',
            'rest',
            'graphql',
            'sql',
            'postgresql',
            'mysql',
            'mongodb',
            'redis',
            'backend',
            'server',
            'authentication',
            'jwt',
            'microservices',
        ],
    },
    {
        id: 'data_scientist',
        name: 'Data Scientist',
        domain: 'technology',
        description:
            'Turn data into decisions using statistics, Python, and ML — aligned with analytics roles in Indian IT services and product companies.',
        requiredSkills: ['Python', 'SQL', 'Statistics', 'Pandas', 'ML fundamentals'],
        marketOutlook: {
            demand: 'High',
            salaryRange: { entry: '₹5–9 LPA', mid: '₹12–20 LPA', senior: '₹24–45 LPA' },
            topCompanies: ['Fractal', 'Mu Sigma', 'Flipkart', 'Paytm', 'Amazon India'],
            growthPotential: 'Growing need for applied ML in risk, growth, and personalisation teams.',
        },
        dayInLife:
            'Clean and explore datasets, run experiments, build dashboards or models, and present insights to product and business stakeholders.',
        specializations: ['Forecasting', 'NLP', 'Computer vision', 'MLOps basics'],
        baseFit: { interest: 82, aptitude: 84, market: 88, learningStyle: 78 },
        keywords: [
            'python',
            'pandas',
            'numpy',
            'sql',
            'statistics',
            'machine learning',
            'ml',
            'deep learning',
            'data analysis',
            'tableau',
            'power bi',
            'tensorflow',
            'pytorch',
            'nlp',
            'excel',
            'data',
            'analytics',
        ],
    },
    {
        id: 'ui_ux_designer',
        name: 'UI/UX Designer',
        domain: 'design',
        description:
            'Research user needs, craft flows and interfaces in Figma, and validate designs — tuned for startups and IT design studios in India.',
        requiredSkills: ['Figma', 'User research', 'Wireframes', 'Prototyping', 'Design systems'],
        marketOutlook: {
            demand: 'High',
            salaryRange: { entry: '₹4–7 LPA', mid: '₹9–16 LPA', senior: '₹18–32 LPA' },
            topCompanies: ['Razorpay', 'CRED', 'Swiggy', 'PhonePe', 'TCS Interactive'],
            growthPotential: 'Product maturity is driving demand for research-backed UX and systems thinking.',
        },
        dayInLife:
            'Interviews and usability tests, mapping journeys, iterating hi-fi screens, and handing off specs to engineering.',
        specializations: ['Design systems', 'B2B SaaS', 'Mobile UX', 'Accessibility'],
        baseFit: { interest: 85, aptitude: 76, market: 86, learningStyle: 88 },
        keywords: [
            'figma',
            'ui',
            'ux',
            'wireframe',
            'prototype',
            'design',
            'photoshop',
            'illustrator',
            'typography',
            'user research',
            'usability',
            'creative',
        ],
    },
    {
        id: 'product_manager',
        name: 'Product Manager',
        domain: 'business',
        description:
            'Discover problems worth solving, align stakeholders, and ship outcomes — common path from engineering, analytics, or consulting backgrounds in India.',
        requiredSkills: ['Prioritisation', 'Analytics', 'Communication', 'Agile', 'User empathy'],
        marketOutlook: {
            demand: 'High',
            salaryRange: { entry: '₹6–12 LPA', mid: '₹15–28 LPA', senior: '₹30–55 LPA' },
            topCompanies: ['Google', 'Microsoft', 'Flipkart', 'Udaan', 'Groww'],
            growthPotential: 'PM hiring remains strong where product orgs are maturing beyond feature factories.',
        },
        dayInLife:
            'Synthesis from data and users, roadmap trade-offs with engineering and design, stakeholder updates, and launch reviews.',
        specializations: ['B2B SaaS', 'Fintech', 'Growth', 'Platform PM'],
        baseFit: { interest: 80, aptitude: 78, market: 90, learningStyle: 72 },
        keywords: [
            'product',
            'roadmap',
            'agile',
            'scrum',
            'stakeholder',
            'leadership',
            'strategy',
            'business',
            'prioritization',
            'analytics',
            'mba',
            'consulting',
            'communication',
        ],
    },
];

function tokenize(text) {
    if (!text) return [];
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9+#\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function scoreAgainstKeywords(skills, goals, interests, keywords) {
    const bag = new Set([
        ...tokenize(goals),
        ...skills.map((s) => s.toLowerCase()),
        ...(interests || []).map((s) => s.toLowerCase()),
    ]);
    let hits = 0;
    for (const kw of keywords) {
        const k = kw.toLowerCase();
        if ([...bag].some((t) => t.includes(k) || k.includes(t))) hits += 1;
        for (const s of skills) {
            if (s.toLowerCase().includes(k)) hits += 2;
        }
        if (goals && goals.toLowerCase().includes(k)) hits += 2;
    }
    return hits;
}

/**
 * Returns 4 seed careers as full recommendation objects, sorted by match to skills/goals.
 * @param {{ skills?: string[], interests?: string[], careerGoals?: string }} assessmentData
 */
function getRankedSeedCareers(assessmentData = {}) {
    const skills = assessmentData.skills || [];
    const interests = assessmentData.interests || [];
    const goals = assessmentData.careerGoals || '';

    const scored = SEED_CAREERS.map((c) => {
        const raw = scoreAgainstKeywords(skills, goals, interests, c.keywords);
        const bump = Math.min(18, raw * 2);
        const overall = Math.min(97, 58 + bump);

        const b = c.baseFit;
        const breakdown = {
            interest: Math.min(98, b.interest + Math.min(12, raw)),
            aptitude: Math.min(98, b.aptitude + Math.min(10, Math.floor(raw / 2))),
            market: Math.min(98, b.market + Math.min(5, raw % 4)),
            learningStyle: Math.min(98, b.learningStyle + Math.min(8, raw % 3)),
        };

        return {
            id: c.id,
            name: c.name,
            domain: c.domain,
            fitScore: {
                overall,
                breakdown,
            },
            description: c.description,
            requiredSkills: c.requiredSkills,
            marketOutlook: c.marketOutlook,
            dayInLife: c.dayInLife,
            specializations: c.specializations,
        };
    });

    scored.sort((a, b) => b.fitScore.overall - a.fitScore.overall);
    return scored;
}

const SEED_CAREER_IDS = SEED_CAREERS.map((c) => c.id);

module.exports = {
    SEED_CAREERS,
    SEED_CAREER_IDS,
    getRankedSeedCareers,
};
