import type { CareerRecommendation } from '@/types/career';

/**
 * Mirrors backend `seed/catalog/careers.js` — used when the API is unreachable
 * so assessment step 3 still shows only roles that have seeded roadmaps.
 */
export const FALLBACK_SEED_CAREERS: CareerRecommendation[] = [
  {
    id: 'backend_developer',
    name: 'Backend Developer',
    domain: 'technology',
    fitScore: {
      overall: 88,
      breakdown: { interest: 82, aptitude: 84, market: 92, learningStyle: 78 },
    },
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
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist',
    domain: 'technology',
    fitScore: {
      overall: 86,
      breakdown: { interest: 86, aptitude: 88, market: 88, learningStyle: 80 },
    },
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
  },
  {
    id: 'ui_ux_designer',
    name: 'UI/UX Designer',
    domain: 'design',
    fitScore: {
      overall: 85,
      breakdown: { interest: 88, aptitude: 78, market: 86, learningStyle: 90 },
    },
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
  },
  {
    id: 'product_manager',
    name: 'Product Manager',
    domain: 'business',
    fitScore: {
      overall: 87,
      breakdown: { interest: 82, aptitude: 80, market: 92, learningStyle: 74 },
    },
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
  },
];
