# Seed Database with 4 Career Roadmaps

## Goal

Create a comprehensive seed script that populates the MongoDB database with **4 complete career roadmaps** that match what the career assessment recommends. After a user completes the assessment, only the relevant roles are shown; the user selects one, and the pre-seeded roadmap loads instantly (no Gemini generation needed).

## How the Current Flow Works

1. **Assessment Page** → User picks skills + goals → Backend calls Gemini → Returns 3-4 `CareerRecommendation` objects with `id`, `name`, `domain`, `fitScore`, etc.
2. **User selects a career** → `POST /api/user/assessment` saves `selectedCareer.careerId` on the User document
3. **`GET /api/roadmap/:careerId`** → If a Roadmap doc with `career_id === careerId` exists in DB, it returns it directly. Otherwise, it calls Gemini to generate one.

**The seed script pre-populates the Roadmap collection** so step 3 always finds a match — zero Gemini calls needed for roadmap content.

## 4 Career Paths to Seed

| # | Career ID | Career Name | Domain |
|---|-----------|-------------|--------|
| 1 | `full_stack_developer` | Full Stack Developer | technology |
| 2 | `data_scientist` | Data Scientist | technology |
| 3 | `ui_ux_designer` | UI/UX Designer | design |
| 4 | `cloud_devops_engineer` | Cloud & DevOps Engineer | technology |

## Roadmap Structure Per Career

Each roadmap follows the existing `Roadmap.js` schema exactly:

```
Roadmap
├── roadmap_id, career_id, career_name, domain
├── target_duration_weeks, difficulty_level
├── prerequisite_skills[]
├── modules[] (4-5 per roadmap)
│   ├── module_id, title, description, order
│   ├── estimated_hours
│   ├── prerequisite_modules[]
│   └── topics[] (4-6 per module)
│       ├── topic_id (unique), title, description, order
│       ├── estimated_hours, learning_objectives[]
│       ├── subtopics[] (2-3 per topic)
│       │   ├── subtopic_id (unique), title, description
│       │   ├── order, key_concepts[], difficulty
│       │   └── code_examples[] (where applicable)
│       ├── content (GFG-style blog)
│       │   ├── blog_title, blog_body (Markdown)
│       │   ├── author, tags[], read_time_minutes
│       ├── youtube_resources[]
│       │   ├── playlist_title, playlist_url (real URLs)
│       │   ├── channel_name, language, is_free
│       ├── article_resources[]
│       │   ├── title, url (real GFG/MDN/W3Schools URLs)
│       │   ├── platform, type, is_free
│       └── practice_resources[] (where applicable)
├── capstone_projects[]
```

> [!IMPORTANT]
> Each `topic_id` and `subtopic_id` will be globally unique strings (e.g., `fsd_mod1_top1`, `fsd_mod1_top1_sub1`) so the frontend can navigate to `/topic/:topicId` without collisions.

## Proposed Changes

### Backend

#### [NEW] [seedRoadmaps.js](file:///d:/yo/Aadyanta/backend/seedRoadmaps.js)

A standalone Node.js script that:
1. Connects to MongoDB using the same `MONGODB_URI` from `.env`
2. Deletes any existing roadmaps with the 4 career IDs (idempotent re-runs)
3. Inserts 4 complete roadmap documents with:
   - **~20 topics per roadmap** (4-5 modules × 4-5 topics)
   - **~50 subtopics per roadmap** (2-3 per topic)
   - **Real YouTube playlist URLs** (freeCodeCamp, Traversy Media, Corey Schafer, CodeWithHarry, etc.)
   - **Real article URLs** from GeeksforGeeks, MDN, W3Schools, DigitalOcean
   - **Rich Markdown blog content** per topic (GFG-style tutorials with headings, code blocks, key points)
   - Practice resource links (LeetCode, HackerRank) for tech careers
4. Logs success/failure and disconnects

**Content Quality**: Each topic's blog_body will contain **500-800 word Markdown tutorials** with:
- Introduction to the concept
- Key points / How it works
- Code examples (where applicable)  
- Best practices
- Summary

### Roadmap Details

---

#### 1. Full Stack Developer (16 weeks, beginner)

| Module | Topics |
|--------|--------|
| **Module 1: Web Fundamentals** | HTML5 Essentials, CSS3 & Responsive Design, JavaScript Fundamentals, DOM Manipulation & Events |
| **Module 2: Frontend Frameworks** | React Fundamentals, React Hooks & State, React Router & Navigation, Connecting APIs |
| **Module 3: Backend Development** | Node.js & Express Basics, RESTful API Design, Authentication & JWT, Database Design with MongoDB |
| **Module 4: Full Stack Integration** | Full Stack Architecture, Deployment & CI/CD, Testing & Debugging, Performance Optimization |
| **Module 5: Capstone & Career Prep** | Portfolio Project, Interview Preparation, Open Source Contribution, Freelancing & Career Launch |

---

#### 2. Data Scientist (20 weeks, beginner)

| Module | Topics |
|--------|--------|
| **Module 1: Python & Math Foundations** | Python for Data Science, NumPy & Linear Algebra, Statistics & Probability, Pandas & Data Wrangling |
| **Module 2: Data Visualization & EDA** | Matplotlib & Seaborn, Exploratory Data Analysis, Feature Engineering, Data Cleaning Techniques |
| **Module 3: Machine Learning** | Supervised Learning, Unsupervised Learning, Model Evaluation & Tuning, Ensemble Methods |
| **Module 4: Deep Learning & NLP** | Neural Networks with TensorFlow, CNNs for Computer Vision, NLP & Text Processing, Transformers & LLMs |
| **Module 5: MLOps & Deployment** | ML Pipeline Design, Model Deployment with Flask, Cloud ML Services, Capstone: End-to-End ML Project |

---

#### 3. UI/UX Designer (14 weeks, beginner)

| Module | Topics |
|--------|--------|
| **Module 1: Design Fundamentals** | Design Thinking Process, Color Theory & Typography, Layout & Composition, Visual Hierarchy |
| **Module 2: UX Research & Strategy** | User Research Methods, Personas & User Journeys, Information Architecture, Usability Testing |
| **Module 3: UI Design Tools** | Figma Fundamentals, Component Libraries & Design Systems, Prototyping & Interactions, Responsive Design Principles |
| **Module 4: Advanced UX/UI** | Accessibility (a11y), Motion Design & Micro-interactions, Design Handoff & Collaboration, Portfolio & Case Studies |

---

#### 4. Cloud & DevOps Engineer (18 weeks, beginner)

| Module | Topics |
|--------|--------|
| **Module 1: Linux & Networking** | Linux Command Line, Shell Scripting, Networking Fundamentals, DNS & HTTP Deep Dive |
| **Module 2: Version Control & CI/CD** | Git Advanced Workflows, GitHub Actions, Jenkins Pipelines, Artifact Management |
| **Module 3: Containers & Orchestration** | Docker Fundamentals, Docker Compose, Kubernetes Architecture, Helm & K8s Deployment |
| **Module 4: Cloud Platforms** | AWS Core Services, Infrastructure as Code (Terraform), Cloud Security & IAM, Serverless Computing |
| **Module 5: Monitoring & SRE** | Prometheus & Grafana, Log Management (ELK Stack), Incident Response & SRE, Chaos Engineering |

---

## Verification Plan

### Automated Tests
```bash
# Run the seed script
cd d:\yo\Aadyanta\backend
node seedRoadmaps.js

# Verify: start backend and query roadmaps
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
const Roadmap = require('./models/Roadmap');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const count = await Roadmap.countDocuments();
  const ids = await Roadmap.find({}, 'career_id career_name').lean();
  console.log('Total roadmaps:', count);
  ids.forEach(r => console.log(r.career_id, '-', r.career_name));
  process.exit(0);
});
"
```

### Manual Verification
- Register a new user → Complete assessment → Verify 4 career cards appear → Select one → Verify roadmap loads from seeded data with all topics, subtopics, blog content, YouTube links, and article links.
