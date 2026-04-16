const { gfg, PLAYLISTS } = require('./helpers');

function blog(title, body, tags, minutes) {
    return {
        blog_title: title,
        blog_body: body,
        author: 'Career Compass Seed',
        tags,
        read_time_minutes: minutes,
    };
}

function article(title, path, platform, type = 'tutorial', minutes = 8) {
    return {
        title,
        url: gfg(path),
        platform,
        type,
        read_time_minutes: minutes,
        is_free: true,
    };
}

function sub(id, title, concepts, difficulty = 'medium') {
    const order = id.endsWith('_s2') ? 2 : 1;
    return {
        subtopic_id: id,
        title,
        description: `Core ideas for ${title.toLowerCase()}.`,
        order,
        key_concepts: concepts,
        difficulty,
    };
}

function topicBundle(prefix, m, t, title, desc, hours, objectives, subtopics, content, playlists, articles) {
    return {
        topic_id: `${prefix}_m${m}_t${t}`,
        title,
        description: desc,
        order: t,
        estimated_hours: hours,
        learning_objectives: objectives,
        subtopics,
        content,
        youtube_resources: playlists,
        article_resources: articles,
        assessment_quiz: { questions: 5, passing_score: 60 },
    };
}

function buildBackendDeveloper() {
    const p = 'bd';
    const modules = [
        {
            module_id: `${p}_mod_1`,
            title: 'Web foundations & HTTP',
            description: 'How the web works, HTTP semantics, and API thinking.',
            order: 1,
            estimated_hours: 28,
            prerequisite_modules: [],
            topics: [
                topicBundle(
                    p,
                    1,
                    1,
                    'Internet, DNS & HTTP essentials',
                    'Request/response lifecycle, status codes, headers, cookies at a practical level.',
                    8,
                    ['Trace a URL in the browser', 'Choose correct HTTP verbs', 'Explain idempotency basics'],
                    [
                        sub(`${p}_m1_t1_s1`, 'DNS resolution & TCP handshake', ['DNS', 'TCP', 'TLS'], 'easy'),
                        sub(`${p}_m1_t1_s2`, 'HTTP methods & safe/idempotent methods', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 'medium'),
                    ],
                    blog(
                        'HTTP Methods and Idempotency — A Backend View',
                        `# Introduction\nClients and servers communicate with **HTTP**. Interviews often probe whether you know which methods are *safe* and *idempotent*.\n\n## Safe vs Idempotent\n- **Safe**: does not change server state (GET, HEAD, OPTIONS).\n- **Idempotent**: repeating the request has the same effect as once (PUT, DELETE — and GET).\n\n## When to use POST vs PUT\nUse **POST** to create when the server assigns IDs. Use **PUT** when the client defines the resource identifier.\n\n## Practice\nWrite a small table of your API endpoints with method, path, and idempotency notes — interviewers love this discipline.\n`,
                        ['HTTP', 'REST', 'Interview'],
                        12
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('REST API Introduction', 'rest-api-introduction/', 'GeeksforGeeks', 'tutorial', 10),
                        article('HTTP status codes', 'http-status-codes/', 'GeeksforGeeks', 'documentation', 8),
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    2,
                    'REST API design & JSON contracts',
                    'Resources, pagination, errors, versioning, and consistent JSON shapes.',
                    10,
                    ['Design CRUD for a resource', 'Return helpful error payloads', 'Version APIs sensibly'],
                    [
                        sub(`${p}_m1_t2_s1`, 'Pagination: offset vs cursor', ['limit', 'cursor', 'performance'], 'medium'),
                        sub(`${p}_m1_t2_s2`, 'Error model: codes + machine-readable types', ['problem+json', 'trace id'], 'medium'),
                    ],
                    blog(
                        'Designing JSON APIs That Frontend Teams Love',
                        `# Consistent envelopes\nWhether you wrap data or return raw JSON, **be consistent**.\n\n## Errors\nReturn a stable shape:\n\`\`\`json\n{ "error": { "code": "AUTH_001", "message": "...", "hint": "..." } }\n\`\`\`\n\n## Pagination\nPrefer **cursor** pagination for large feeds; use offset only when datasets are tiny.\n`,
                        ['REST', 'JSON', 'API'],
                        11
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('REST API design constraints', 'rest-api-introduction/', 'GeeksforGeeks', 'tutorial', 9),
                        { title: 'MDN: An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', platform: 'MDN', type: 'documentation', read_time_minutes: 12, is_free: true },
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    3,
                    'Relational data modelling & SQL joins',
                    'Normalize sensibly, indexes at a high level, and read execution plans later.',
                    10,
                    ['Model 1:N and N:M relations', 'Write multi-table joins', 'Explain index trade-offs'],
                    [
                        sub(`${p}_m1_t3_s1`, 'Keys, constraints & migrations mindset', ['PK', 'FK', 'UNIQUE'], 'easy'),
                        sub(`${p}_m1_t3_s2`, 'Joins: inner, left, and when they lie', ['JOIN', 'NULL'], 'medium'),
                    ],
                    blog(
                        'SQL Joins Without the Fear',
                        `# Mental model\nThink in **sets**: each table is a set of rows; joins are intersections and unions with rules.\n\n## INNER vs LEFT\n- **INNER**: only matching pairs.\n- **LEFT**: preserve all rows from the left; missing right side becomes NULL — watch for fan-out.\n\n## Interview tip\nExplain *one* query you wrote that fixed an N+1 issue — Indian product companies value this story.\n`,
                        ['SQL', 'PostgreSQL', 'MySQL'],
                        14
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('SQL Join types', 'sql-join-set-1-inner-join-left-join-right-join-full-join/', 'GeeksforGeeks', 'tutorial', 12),
                        article('Database normalization', 'introduction-of-database-normalization/', 'GeeksforGeeks', 'tutorial', 10),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_2`,
            title: 'Node.js, Express & persistence',
            description: 'Build services with Express, connect to SQL/NoSQL, and structure projects.',
            order: 2,
            estimated_hours: 36,
            prerequisite_modules: [`${p}_mod_1`],
            topics: [
                topicBundle(
                    p,
                    2,
                    1,
                    'Node event loop & async patterns',
                    'Callbacks, promises, async/await, and backpressure intuition.',
                    10,
                    ['Explain the event loop at a high level', 'Convert callback code to async/await', 'Handle errors in async routes'],
                    [
                        sub(`${p}_m2_t1_s1`, 'Call stack, microtasks, macrotasks', ['queue', 'promises'], 'medium'),
                        sub(`${p}_m2_t1_s2`, 'Practical error handling in Express', ['try/catch', 'next(err)'], 'medium'),
                    ],
                    blog(
                        'Async/Await in Express Routes',
                        `# Pattern\nWrap handlers to catch promise rejections or use an **async wrapper** utility.\n\n## Pitfall\nForgetting to forward errors to \`next(err)\` breaks centralized error middleware.\n\n## Snippet idea\n\`\`\`js\nexport const asyncHandler = (fn) => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);\n\`\`\`\n`,
                        ['Node.js', 'Express', 'Async'],
                        10
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('Node.js event loop', 'event-loop-in-javascript/', 'GeeksforGeeks', 'tutorial', 11),
                        { title: 'MDN: Promises', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise', platform: 'MDN', type: 'documentation', read_time_minutes: 15, is_free: true },
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    2,
                    'Express middleware, routing & validation',
                    'Routers, middleware chains, request validation, and security headers.',
                    12,
                    ['Structure routes by domain', 'Validate input at the boundary', 'Set baseline security middleware'],
                    [
                        sub(`${p}_m2_t2_s1`, 'Middleware execution order', ['order', 'next()'], 'easy'),
                        sub(`${p}_m2_t2_s2`, 'Schema validation (e.g. Zod/Joi concepts)', ['schema', '422'], 'medium'),
                    ],
                    blog(
                        'Validation at the Boundary',
                        `# Rule\nNever trust the client — validate **shape and constraints** before business logic.\n\n## Status code\nReturn **422 Unprocessable Entity** for semantic validation errors when your API uses that convention.\n`,
                        ['Express', 'Validation', 'Security'],
                        9
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('Express.js middleware', 'middleware/', 'GeeksforGeeks', 'tutorial', 8),
                        article('Introduction to Express.js', 'introduction-to-express-module/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    3,
                    'MongoDB with Mongoose / SQL client patterns',
                    'Documents vs relations, Mongoose schemas, transactions overview.',
                    14,
                    ['Model nested documents', 'Use transactions when money is involved', 'Avoid unbounded arrays'],
                    [
                        sub(`${p}_m2_t3_s1`, 'Schema design for users & orders', ['embedding', 'referencing'], 'medium'),
                        sub(`${p}_m2_t3_s2`, 'Indexes for common queries', ['compound index', 'selectivity'], 'hard'),
                    ],
                    blog(
                        'MongoDB Modelling: Embed vs Reference',
                        `# Embed when\nData is read together, bounded in size, and updated as a unit.\n\n# Reference when\nDocuments grow without bound or are shared across aggregates.\n\n## India context\nPayment and ledger flows often need **ACID** — know when to reach for SQL or multi-doc transactions.\n`,
                        ['MongoDB', 'Mongoose', 'Schema'],
                        13
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('Mongoose ODM', 'mongoose/', 'GeeksforGeeks', 'tutorial', 10),
                        article('MongoDB indexes', 'mongodb-indexes/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_3`,
            title: 'Auth, security & reliability',
            description: 'Sessions vs JWT, OAuth basics, hashing, rate limits, and observability.',
            order: 3,
            estimated_hours: 32,
            prerequisite_modules: [`${p}_mod_2`],
            topics: [
                topicBundle(
                    p,
                    3,
                    1,
                    'Authentication patterns: session vs JWT',
                    'Cookies, JWT claims, refresh rotation, and threat basics.',
                    11,
                    ['Compare session and JWT trade-offs', 'Describe refresh token rotation', 'List common auth mistakes'],
                    [
                        sub(`${p}_m3_t1_s1`, 'JWT structure: header, payload, signature', ['JWT', 'HS256', 'RS256'], 'medium'),
                        sub(`${p}_m3_t1_s2`, 'CSRF vs XSS in cookie flows', ['SameSite', 'HttpOnly'], 'hard'),
                    ],
                    blog(
                        'JWT Cheat Sheet for Interviews',
                        `# Claims\nKnow **iss**, **sub**, **exp**, **aud**.\n\n# Storage\nFor SPAs, prefer **HTTP-only cookies** for refresh tokens where possible; avoid localStorage for long-lived secrets.\n`,
                        ['JWT', 'OAuth', 'Security'],
                        10
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('JWT authentication', 'jwt-authentication/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Password hashing', 'password-hashing-with-salt/', 'GeeksforGeeks', 'tutorial', 7),
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    2,
                    'Hardening APIs: rate limits, CORS, Helmet',
                    'Baseline hardening checklist for Express services.',
                    9,
                    ['Configure CORS correctly', 'Add security headers', 'Throttle brute-force endpoints'],
                    [
                        sub(`${p}_m3_t2_s1`, 'CORS preflight cases', ['OPTIONS', 'allowed origins'], 'medium'),
                        sub(`${p}_m3_t2_s2`, 'Rate limiting strategies', ['sliding window', 'token bucket'], 'medium'),
                    ],
                    blog(
                        'Production Hardening Checklist',
                        `# Minimums\n- **Helmet** for headers\n- **Rate limit** login\n- **Structured logs** with request ids\n\n## Observability\nReturn \`X-Request-Id\` and log it end-to-end.\n`,
                        ['Security', 'CORS', 'Ops'],
                        8
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('CORS', 'cross-origin-resource-sharing-cors/', 'GeeksforGeeks', 'tutorial', 8),
                        { title: 'OWASP API Security Top 10 overview', url: 'https://owasp.org/www-project-api-security/', platform: 'OWASP', type: 'documentation', read_time_minutes: 20, is_free: true },
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    3,
                    'Testing APIs & contract checks',
                    'Integration tests, supertest patterns, and basic load testing mindset.',
                    12,
                    ['Write integration tests for critical routes', 'Mock external services', 'Interpret p95 latency'],
                    [
                        sub(`${p}_m3_t3_s1`, 'Test pyramid for services', ['unit', 'integration', 'e2e'], 'easy'),
                        sub(`${p}_m3_t3_s2`, 'Supertest flow with Express app export', ['supertest', 'jest'], 'medium'),
                    ],
                    blog(
                        'Integration Tests That Catch Real Bugs',
                        `# Focus\nTest **real HTTP** behaviour: status codes, headers, and JSON shapes.\n\n# Data\nUse a disposable test database or transactions that roll back.\n`,
                        ['Testing', 'Jest', 'Quality'],
                        11
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('Software testing basics', 'software-testing-basics/', 'GeeksforGeeks', 'tutorial', 10),
                        article('Types of software testing', 'types-software-testing/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_4`,
            title: 'Shipping to production',
            description: 'Containers, CI/CD, 12-factor basics, and cloud-managed databases.',
            order: 4,
            estimated_hours: 28,
            prerequisite_modules: [`${p}_mod_3`],
            topics: [
                topicBundle(
                    p,
                    4,
                    1,
                    'Docker for Node services',
                    'Images, multi-stage builds, health checks.',
                    10,
                    ['Write a Dockerfile for an Express app', 'Explain image layers', 'Define container healthchecks'],
                    [
                        sub(`${p}_m4_t1_s1`, 'Multi-stage builds to shrink images', ['builder', 'distroless'], 'medium'),
                        sub(`${p}_m4_t1_s2`, 'Environment configuration via env vars', ['12-factor', 'secrets'], 'medium'),
                    ],
                    blog(
                        'Dockerfile for Node — Smaller and Safer',
                        `# Multi-stage\nInstall dev deps in builder; copy only production artefacts to runtime image.\n\n# Non-root user\nRun the process as a non-root user in the final stage.\n`,
                        ['Docker', 'DevOps', 'Node.js'],
                        10
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('Docker fundamentals', 'docker-tutorial/', 'GeeksforGeeks', 'tutorial', 12),
                        article('Introduction to Docker', 'introduction-to-docker/', 'GeeksforGeeks', 'tutorial', 10),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    2,
                    'CI/CD: tests, lint, deploy',
                    'GitHub Actions (or similar), gated deploys, migrations.',
                    10,
                    ['Sketch a CI pipeline', 'Run migrations safely', 'Rollback strategy'],
                    [
                        sub(`${p}_m4_t2_s1`, 'CI steps: install, lint, test, build', ['workflow', 'cache'], 'easy'),
                        sub(`${p}_m4_t2_s2`, 'Blue/green vs rolling deploys', ['availability', 'risk'], 'medium'),
                    ],
                    blog(
                        'CI Pipelines You Can Explain in Interviews',
                        `# Stages\n1) Install deps\n2) Static checks\n3) Tests\n4) Build artefact\n5) Deploy with approvals\n\n## DB migrations\nRun migrations **before** traffic shifts; keep backwards compatible changes.\n`,
                        ['CI/CD', 'GitHub Actions', 'Release'],
                        9
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        article('Continuous integration', 'continuous-integration/', 'GeeksforGeeks', 'tutorial', 8),
                        article('DevOps lifecycle', 'devops-lifecycle/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    3,
                    'Observability: logs, metrics, traces',
                    'Structured logging, RED metrics, tracing hooks.',
                    8,
                    ['Define SLIs for an API', 'Add correlation IDs', 'Interpret error budgets conceptually'],
                    [
                        sub(`${p}_m4_t3_s1`, 'Structured JSON logs', ['pino', 'winston'], 'easy'),
                        sub(`${p}_m4_t3_s2`, 'Golden signals for services', ['latency', 'traffic', 'errors', 'saturation'], 'medium'),
                    ],
                    blog(
                        'Logs Your On-call Will Thank You For',
                        `# Fields\nInclude **service**, **environment**, **requestId**, **userId(hash)**.\n\n# Metrics\nTrack request duration histograms and error rates per route.\n`,
                        ['Observability', 'SRE', 'Logs'],
                        8
                    ),
                    [PLAYLISTS.nodeNetNinja],
                    [
                        { title: 'OpenTelemetry concepts', url: 'https://opentelemetry.io/docs/concepts/', platform: 'OpenTelemetry', type: 'documentation', read_time_minutes: 15, is_free: true },
                        article('Introduction to logging', 'logging-in-python/', 'GeeksforGeeks', 'tutorial', 6),
                    ]
                ),
            ],
        },
    ];

    return {
        roadmapId: 'backend_developer',
        roadmap_id: 'backend_developer_roadmap',
        career_id: 'backend_developer',
        career_name: 'Backend Developer',
        domain: 'technology',
        target_duration_weeks: 14,
        difficulty_level: 'beginner',
        prerequisite_skills: ['Basic programming', 'Command line basics', 'Git fundamentals'],
        modules,
        capstone_projects: [
            {
                title: 'Production-grade Task API',
                description: 'Express + Postgres/Mongo with auth, pagination, tests, Docker, and CI.',
                estimated_hours: 36,
                required_skills: ['REST', 'SQL/Mongo', 'JWT', 'Docker'],
                github_template: '',
            },
        ],
        version: 1,
    };
}

function buildDataScientist() {
    const p = 'ds';
    const modules = [
        {
            module_id: `${p}_mod_1`,
            title: 'Python & data tooling',
            description: 'Python for data work, NumPy/Pandas mental models, and environments.',
            order: 1,
            estimated_hours: 30,
            prerequisite_modules: [],
            topics: [
                topicBundle(
                    p,
                    1,
                    1,
                    'Python for data: syntax to idioms',
                    'Functions, comprehensions, modules, and typing basics for readable notebooks.',
                    10,
                    ['Write clean functions for transforms', 'Use virtual environments', 'Profile slow cells'],
                    [
                        sub(`${p}_m1_t1_s1`, 'Iterators, generators, and memory', ['yield', 'lazy'], 'medium'),
                        sub(`${p}_m1_t1_s2`, 'Vectorisation mindset', ['NumPy', 'broadcasting'], 'medium'),
                    ],
                    blog(
                        'Vectorised Thinking with NumPy',
                        `# Why\nLoops in Python can be slow; **vectorised** operations push work to C.\n\n# Broadcasting\nLearn the rules — most interview puzzles come from misunderstanding shapes.\n`,
                        ['Python', 'NumPy', 'Pandas'],
                        12
                    ),
                    [PLAYLISTS.pythonCorey, PLAYLISTS.mlSentdex],
                    [
                        article('Python for data science', 'data-science-for-python/', 'GeeksforGeeks', 'tutorial', 10),
                        article('Pandas DataFrame', 'python-pandas-dataframe/', 'GeeksforGeeks', 'tutorial', 11),
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    2,
                    'Pandas for wrangling',
                    'Filtering, groupby, joins, missing data, and time series basics.',
                    12,
                    ['Perform split-apply-combine', 'Reshape with melt/pivot', 'Handle time zones carefully'],
                    [
                        sub(`${p}_m1_t2_s1`, 'GroupBy mechanics', ['aggregation', 'transform', 'filter'], 'medium'),
                        sub(`${p}_m1_t2_s2`, 'Missingness: MCAR/MAR/MNAR intuition', ['impute', 'bias'], 'hard'),
                    ],
                    blog(
                        'GroupBy Without the Headaches',
                        `# Split-apply-combine\nThink **SQL** grouped queries but in pandas.\n\n# Pitfall\nChained indexing — prefer \`.loc\` with explicit labels.\n`,
                        ['Pandas', 'EDA', 'Data'],
                        11
                    ),
                    [PLAYLISTS.pythonCorey],
                    [
                        article('Exploratory data analysis', 'what-is-exploratory-data-analysis/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Handling missing values', 'python-pandas-handling-missing-values/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    3,
                    'SQL for analytics',
                    'Complex joins, window functions intuition, and query readability.',
                    8,
                    ['Translate business questions to SQL', 'Use windows for rankings', 'Debug slow queries at a high level'],
                    [
                        sub(`${p}_m1_t3_s1`, 'Window functions: rank vs row_number', ['PARTITION BY', 'ORDER BY'], 'hard'),
                        sub(`${p}_m1_t3_s2`, 'CTEs for readable queries', ['WITH', 'readability'], 'medium'),
                    ],
                    blog(
                        'SQL Windows for Metrics',
                        `# Pattern\n\`ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY ts DESC)\` for latest row per user.\n\n## Practice\nSolve 5 medium problems on any SQL practice site — consistency beats cramming.\n`,
                        ['SQL', 'Analytics', 'Windows'],
                        13
                    ),
                    [PLAYLISTS.pythonCorey],
                    [
                        article('SQL introduction', 'sql-tutorial/', 'GeeksforGeeks', 'tutorial', 10),
                        article('Window functions in SQL', 'sql-window-functions/', 'GeeksforGeeks', 'tutorial', 11),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_2`,
            title: 'Statistics & experimentation',
            description: 'Distributions, inference basics, and A/B testing literacy.',
            order: 2,
            estimated_hours: 26,
            prerequisite_modules: [`${p}_mod_1`],
            topics: [
                topicBundle(
                    p,
                    2,
                    1,
                    'Descriptive stats & distributions',
                    'Mean vs median, variance, common distributions, and outliers.',
                    9,
                    ['Choose robust statistics', 'Interpret skew', 'Communicate uncertainty'],
                    [
                        sub(`${p}_m2_t1_s1`, 'Normal approximation caveats', ['CLT', 'sample size'], 'medium'),
                        sub(`${p}_m2_t1_s2`, 'Outliers: detect vs explain', ['IQR', 'domain'], 'medium'),
                    ],
                    blog(
                        'When the Mean Lies',
                        `# Rule\nAlways plot first — **histograms** and **boxplots** reveal multi-modality and skew.\n\n# Robustness\nPrefer median and IQR when distributions are heavy-tailed.\n`,
                        ['Statistics', 'EDA', 'Distributions'],
                        10
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Probability basics', 'probability-in-maths/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Standard deviation', 'standard-deviation/', 'GeeksforGeeks', 'tutorial', 7),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    2,
                    'Hypothesis tests & p-values (practical)',
                    'What p-values are — and are not — plus multiple comparisons.',
                    8,
                    ['Frame null/alternative hypotheses', 'Explain alpha and power conceptually', 'Guard against peeking'],
                    [
                        sub(`${p}_m2_t2_s1`, 'Type I vs Type II errors', ['alpha', 'beta'], 'medium'),
                        sub(`${p}_m2_t2_s2`, 'Multiple testing problem', ['Bonferroni', 'FDR'], 'hard'),
                    ],
                    blog(
                        'A/B Tests in Plain Language',
                        `# Steps\n1) Hypothesis\n2) Design (unit of randomization)\n3) Power & sample size (conceptual)\n4) Run & analyze\n5) Monitor guardrails\n\n## India context\nMobile networks and UPI flows add variance — stratify when needed.\n`,
                        ['A/B testing', 'Experimentation', 'Metrics'],
                        12
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Hypothesis testing', 'hypothesis-testing/', 'GeeksforGeeks', 'tutorial', 10),
                        article('p-value in statistics', 'p-value/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    3,
                    'Feature thinking for models',
                    'Leakage, encoding categoricals, scaling, and baseline models.',
                    9,
                    ['Detect label leakage', 'Encode high-cardinality categories safely', 'Beat a dumb baseline first'],
                    [
                        sub(`${p}_m2_t3_s1`, 'Train vs validation leakage', ['time splits', 'group splits'], 'hard'),
                        sub(`${p}_m2_t3_s2`, 'One-hot vs target encoding intuition', ['high cardinality'], 'medium'),
                    ],
                    blog(
                        'Leakage: The Silent Killer',
                        `# Golden rule\nAnything not available at prediction time must not enter training features.\n\n## Time series\nAlways **respect time order** in splits.\n`,
                        ['ML', 'Features', 'Leakage'],
                        11
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Feature engineering', 'feature-engineering/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Encoding categorical data', 'encoding-categorical-data/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_3`,
            title: 'Machine learning core',
            description: 'Supervised learning, metrics, and model selection.',
            order: 3,
            estimated_hours: 34,
            prerequisite_modules: [`${p}_mod_2`],
            topics: [
                topicBundle(
                    p,
                    3,
                    1,
                    'Linear models & regularization',
                    'OLS intuition, ridge/lasso, and interpretability.',
                    10,
                    ['Explain coefficients with caveats', 'Choose L1 vs L2', 'Diagnose multicollinearity'],
                    [
                        sub(`${p}_m3_t1_s1`, 'Bias-variance tradeoff', ['underfit', 'overfit'], 'medium'),
                        sub(`${p}_m3_t1_s2`, 'Regularization paths', ['lambda', 'sparsity'], 'medium'),
                    ],
                    blog(
                        'Ridge vs Lasso in Interviews',
                        `# L2 (Ridge)\nShrinks coefficients smoothly — good when many weak features.\n\n# L1 (Lasso)\nDrives some coefficients to **zero** — automatic feature selection when sparse.\n`,
                        ['Regression', 'Regularization', 'ML'],
                        10
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Linear regression', 'linear-regression-python-implementation/', 'GeeksforGeeks', 'tutorial', 11),
                        article('Overfitting in machine learning', 'overfitting-in-machine-learning/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    2,
                    'Tree models & ensembles',
                    'Decision trees, random forests, gradient boosting intuition.',
                    12,
                    ['Explain bagging vs boosting', 'Tune depth and learning rate conceptually', 'Handle imbalanced targets'],
                    [
                        sub(`${p}_m3_t2_s1`, 'Gini vs entropy splits', ['impurity', 'greedy'], 'medium'),
                        sub(`${p}_m3_t2_s2`, 'Boosting error reduction idea', ['residuals', 'sequential'], 'hard'),
                    ],
                    blog(
                        'Random Forest vs Gradient Boosting',
                        `# Bagging\nParallel trees on bootstraps — reduces variance.\n\n# Boosting\nSequential trees correcting residuals — powerful but needs careful tuning.\n`,
                        ['Ensembles', 'XGBoost', 'ML'],
                        11
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Decision tree', 'decision-tree/', 'GeeksforGeeks', 'tutorial', 10),
                        article('Random forest', 'random-forest/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    3,
                    'Classification metrics beyond accuracy',
                    'Precision/recall, ROC-AUC, calibration, and imbalanced data.',
                    12,
                    ['Choose metrics for business costs', 'Explain threshold selection', 'Use PR curves when imbalance is extreme'],
                    [
                        sub(`${p}_m3_t3_s1`, 'Confusion matrix deep dive', ['TP', 'FP', 'FN', 'TN'], 'easy'),
                        sub(`${p}_m3_t3_s2`, 'Cost-sensitive learning intuition', ['class weights', 'threshold'], 'medium'),
                    ],
                    blog(
                        'Accuracy Is Not Enough',
                        `# Fraud & churn\nFalse negatives and false positives have **different costs** — bake that into metric choice.\n\n# PR-AUC\nOften better than ROC-AUC under heavy imbalance.\n`,
                        ['Metrics', 'Classification', 'Imbalance'],
                        12
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Confusion matrix', 'confusion-matrix-machine-learning/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Precision and recall', 'precision-and-recall-metrics/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_4`,
            title: 'Delivery & communication',
            description: 'Notebooks to production mindset, storytelling, and ethics.',
            order: 4,
            estimated_hours: 24,
            prerequisite_modules: [`${p}_mod_3`],
            topics: [
                topicBundle(
                    p,
                    4,
                    1,
                    'Reproducible notebooks & packaging',
                    'Seeds, environment files, and turning notebooks into modules.',
                    8,
                    ['Freeze dependencies', 'Refactor core logic out of notebooks', 'Document assumptions'],
                    [
                        sub(`${p}_m4_t1_s1`, 'Random seeds everywhere', ['numpy', 'sklearn'], 'easy'),
                        sub(`${p}_m4_t1_s2`, 'Config vs code', ['YAML', 'env'], 'medium'),
                    ],
                    blog(
                        'From Notebook to Repo',
                        `# Structure\n\`src/\`, \`notebooks/\`, \`tests/\` — keep **I/O at the edges**.\n\n# Reproducibility\nPin versions; store a **data snapshot** hash when feasible.\n`,
                        ['MLOps', 'Python', 'Reproducibility'],
                        9
                    ),
                    [PLAYLISTS.pythonCorey],
                    [
                        article('Virtual environment in Python', 'python-virtual-environment/', 'GeeksforGeeks', 'tutorial', 8),
                        article('Introduction to Git', 'introduction-to-git/', 'GeeksforGeeks', 'tutorial', 10),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    2,
                    'Storytelling with charts',
                    'Choose chart types, reduce chartjunk, and annotate insights.',
                    7,
                    ['Match chart to question', 'Highlight the decision', 'Avoid dual axes abuse'],
                    [
                        sub(`${p}_m4_t2_s1`, 'Bar vs line vs scatter', ['scales', 'zero baseline'], 'easy'),
                        sub(`${p}_m4_t2_s2`, 'Small multiples vs overcrowding', ['facets'], 'medium'),
                    ],
                    blog(
                        'Slides That PMs Actually Read',
                        `# Rule\nOne insight per slide; **title is the takeaway**.\n\n# Ethics\nAvoid misleading axes — especially with engagement metrics.\n`,
                        ['Visualization', 'Communication', 'EDA'],
                        8
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Data visualization', 'data-visualization-with-python/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Matplotlib tutorial', 'matplotlib-tutorial/', 'GeeksforGeeks', 'tutorial', 10),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    3,
                    'Fairness & privacy basics',
                    'PII handling, consent, and bias awareness.',
                    9,
                    ['List PII fields in a dataset', 'Understand differential privacy at a headline level', 'Document model limitations'],
                    [
                        sub(`${p}_m4_t3_s1`, 'Consent & purpose limitation', ['GDPR', 'DPDP'], 'medium'),
                        sub(`${p}_m4_t3_s2`, 'Proxy variables & bias', ['protected attributes', 'disparate impact'], 'hard'),
                    ],
                    blog(
                        'Ethics Checklist Before Ship',
                        `# Questions\n- Who is harmed if wrong?\n- Is the data collected **fairly**?\n- Can users **opt out**?\n\n## India\nFollow evolving **DPDP** norms in production systems.\n`,
                        ['Ethics', 'Privacy', 'Responsible AI'],
                        10
                    ),
                    [PLAYLISTS.mlSentdex],
                    [
                        article('Bias in AI', 'bias-in-ai/', 'GeeksforGeeks', 'tutorial', 8),
                        { title: 'NIST AI Risk Management', url: 'https://www.nist.gov/itl/ai-risk-management-framework', platform: 'NIST', type: 'documentation', read_time_minutes: 14, is_free: true },
                    ]
                ),
            ],
        },
    ];

    return {
        roadmapId: 'data_scientist',
        roadmap_id: 'data_scientist_roadmap',
        career_id: 'data_scientist',
        career_name: 'Data Scientist',
        domain: 'technology',
        target_duration_weeks: 14,
        difficulty_level: 'beginner',
        prerequisite_skills: ['Basic Python', 'School-level math', 'Logical reasoning'],
        modules,
        capstone_projects: [
            {
                title: 'End-to-end churn analysis',
                description: 'EDA + baseline model + calibrated metrics + stakeholder deck.',
                estimated_hours: 32,
                required_skills: ['Pandas', 'Sklearn', 'SQL', 'Metrics'],
                github_template: '',
            },
        ],
        version: 1,
    };
}

function buildUiUxDesigner() {
    const p = 'ux';
    const modules = [
        {
            module_id: `${p}_mod_1`,
            title: 'Foundations of user-centred design',
            description: 'Problems before pixels — research basics and usability heuristics.',
            order: 1,
            estimated_hours: 26,
            prerequisite_modules: [],
            topics: [
                topicBundle(
                    p,
                    1,
                    1,
                    'Design thinking & problem framing',
                    'Empathize, define, ideate — with crisp problem statements.',
                    8,
                    ['Write HMW statements', 'Separate problem from solution', 'Pick a measurable outcome'],
                    [
                        sub(`${p}_m1_t1_s1`, 'Jobs-to-be-done intro', ['JTBD', 'outcomes'], 'medium'),
                        sub(`${p}_m1_t1_s2`, 'Stakeholder mapping', ['influence', 'info needs'], 'easy'),
                    ],
                    blog(
                        'How Might We… Without the Fluff',
                        `# HMW format\n**How might we** <user> **so that** <measurable outcome>?\n\n# Trap\nJumping to UI before validating the problem — common in hackathons and college projects.\n`,
                        ['Design thinking', 'UX', 'Research'],
                        10
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('UI vs UX', 'difference-between-ui-and-ux/', 'GeeksforGeeks', 'blog', 7),
                        article('Design thinking process', 'design-thinking-process/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    2,
                    'User research methods',
                    'Interviews, surveys, and contextual inquiry basics.',
                    9,
                    ['Draft a non-leading interview script', 'Synthesize notes into themes', 'Know what surveys cannot do'],
                    [
                        sub(`${p}_m1_t2_s1`, 'Open vs closed questions', ['bias', 'probing'], 'medium'),
                        sub(`${p}_m1_t2_s2`, 'Affinity mapping', ['themes', 'prioritization'], 'easy'),
                    ],
                    blog(
                        'Interview Questions That Reveal Reality',
                        `# Tips\nAsk about **last time** they did the task; avoid hypotheticals.\n\n# Synthesis\nAffinity mapping is not alphabet sorting — cluster by meaning.\n`,
                        ['Research', 'Interviews', 'UX'],
                        11
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Software requirement specification', 'software-requirement-specification/', 'GeeksforGeeks', 'tutorial', 10),
                        { title: 'NN/g: User Interviews 101', url: 'https://www.nngroup.com/articles/user-interviews/', platform: 'Nielsen Norman Group', type: 'blog', read_time_minutes: 12, is_free: true },
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    3,
                    'Heuristic evaluation & usability',
                    'Nielsen heuristics applied to real flows.',
                    9,
                    ['Run a heuristic pass', 'Prioritize findings by severity', 'Pair with usability tests'],
                    [
                        sub(`${p}_m1_t3_s1`, 'Severity ratings', ['blocker', 'major', 'minor'], 'medium'),
                        sub(`${p}_m1_t3_s2`, 'Recognition vs recall in UI', ['Nielsen', 'memory'], 'medium'),
                    ],
                    blog(
                        'Heuristic Review in 45 Minutes',
                        `# Steps\n1) Happy path\n2) Edge states (empty, error, loading)\n3) Accessibility spot-check\n\n## Output\nTable: issue, heuristic, severity, evidence screenshot.\n`,
                        ['Usability', 'Heuristics', 'UX'],
                        9
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Software usability', 'usability-testing/', 'GeeksforGeeks', 'tutorial', 8),
                        { title: 'Nielsen heuristics', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/', platform: 'Nielsen Norman Group', type: 'blog', read_time_minutes: 15, is_free: true },
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_2`,
            title: 'Information architecture & flows',
            description: 'Navigation models, sitemaps, and task flows.',
            order: 2,
            estimated_hours: 24,
            prerequisite_modules: [`${p}_mod_1`],
            topics: [
                topicBundle(
                    p,
                    2,
                    1,
                    'Sitemaps & navigation depth',
                    'Breadth vs depth, mental models, and mobile constraints.',
                    8,
                    ['Sketch IA for a small product', 'Reduce taps for top tasks', 'Document nav decisions'],
                    [
                        sub(`${p}_m2_t1_s1`, 'Primary vs secondary nav', ['information scent'], 'easy'),
                        sub(`${p}_m2_t1_s2`, 'Search vs browse', ['findability'], 'medium'),
                    ],
                    blog(
                        'Information Architecture in One Page',
                        `# Deliverables\n- Sitemap\n- Key user flows\n- Nomen audit (same words as users)\n\n## India\nUPI-heavy flows need **error recovery** states around OTP and bank linking.\n`,
                        ['IA', 'Navigation', 'UX'],
                        10
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Software design patterns', 'software-design-patterns/', 'GeeksforGeeks', 'tutorial', 12),
                        article('MVC design pattern', 'mvc-design-pattern/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    2,
                    'User flows & edge states',
                    'Happy path, deviations, and empty states.',
                    9,
                    ['Draw a flow for onboarding', 'Add loading and failure', 'Annotate decisions'],
                    [
                        sub(`${p}_m2_t2_s1`, 'Decision diamonds & branches', ['logic', 'states'], 'easy'),
                        sub(`${p}_m2_t2_s2`, 'Skeleton screens vs spinners', ['perceived performance'], 'medium'),
                    ],
                    blog(
                        'Flows Engineers Can Build From',
                        `# Annotation\nNumber steps; reference screen IDs; call out **data dependencies**.\n\n# Edge cases\nOffline, permissions denied, partial success.\n`,
                        ['User flows', 'Wireframes', 'Handoff'],
                        9
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('UML diagrams', 'unified-modeling-language-uml-introduction/', 'GeeksforGeeks', 'tutorial', 11),
                        article('State diagram', 'state-diagram/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    3,
                    'Wireframing fidelity',
                    'Low-fi to mid-fi, content-first layout, and grids.',
                    7,
                    ['Choose fidelity for the question', 'Use a consistent grid', 'Annotate interactions'],
                    [
                        sub(`${p}_m2_t3_s1`, '8pt spacing systems', ['spacing', 'rhythm'], 'easy'),
                        sub(`${p}_m2_t3_s2`, 'Content hierarchy without color', ['typography scale'], 'medium'),
                    ],
                    blog(
                        'Low-Fi First, Pixels Later',
                        `# Why\nSpeed of iteration beats polish in discovery.\n\n# Checklist\nHeadings, primary action, secondary actions, helper text.\n`,
                        ['Wireframes', 'Layout', 'UX'],
                        8
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Typography in UI', 'typography-in-design/', 'GeeksforGeeks', 'tutorial', 7),
                        { title: 'Layout grids for responsive design', url: 'https://www.smashingmagazine.com/2017/12/building-better-ui-designs-layout-grids/', platform: 'Smashing Magazine', type: 'blog', read_time_minutes: 14, is_free: true },
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_3`,
            title: 'Visual design & systems in Figma',
            description: 'Components, variants, auto-layout, and accessible colour.',
            order: 3,
            estimated_hours: 32,
            prerequisite_modules: [`${p}_mod_2`],
            topics: [
                topicBundle(
                    p,
                    3,
                    1,
                    'Figma fundamentals: frames & auto-layout',
                    'Constraints, responsive behaviour, and tidy handoff.',
                    10,
                    ['Build a responsive card with auto-layout', 'Use components for reuse', 'Name layers for devs'],
                    [
                        sub(`${p}_m3_t1_s1`, 'Auto-layout direction & padding', ['flex', 'gap'], 'easy'),
                        sub(`${p}_m3_t1_s2`, 'Constraints for mixed breakpoints', ['pinning', 'scale'], 'medium'),
                    ],
                    blog(
                        'Auto-Layout Like You Mean It',
                        `# Tips\nUse **gap** instead of manual spacers; prefer frames over groups.\n\n# Handoff\nMark export settings and note interaction behaviour in dev mode comments.\n`,
                        ['Figma', 'UI', 'Components'],
                        10
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        { title: 'Figma Learn: Auto layout', url: 'https://help.figma.com/hc/en-us/articles/57314829518295-Guide-to-auto-layout', platform: 'Figma', type: 'documentation', read_time_minutes: 12, is_free: true },
                        article('Color theory', 'introduction-to-color-wheel/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    2,
                    'Design tokens & variants',
                    'Colour styles, text styles, and component properties.',
                    11,
                    ['Create a minimal token set', 'Use variants for states', 'Document usage'],
                    [
                        sub(`${p}_m3_t2_s1`, 'Semantic vs primitive tokens', ['color-role', 'theme'], 'medium'),
                        sub(`${p}_m3_t2_s2`, 'Boolean vs enum properties', ['variants', 'props'], 'medium'),
                    ],
                    blog(
                        'Tokens Save Teams',
                        `# Why\nSingle source of truth for **colour & type** reduces drift between Android/iOS/Web.\n\n# Start small\nPrimary, surface, text, border, danger — extend later.\n`,
                        ['Design systems', 'Figma', 'Tokens'],
                        11
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Software design strategies', 'software-design-strategies/', 'GeeksforGeeks', 'tutorial', 9),
                        { title: 'W3C: Understanding WCAG', url: 'https://www.w3.org/WAI/WCAG21/Understanding/', platform: 'W3C', type: 'documentation', read_time_minutes: 18, is_free: true },
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    3,
                    'Accessibility in everyday UI',
                    'Contrast, focus order, touch targets, motion preferences.',
                    11,
                    ['Check contrast ratios', 'Design visible focus', 'Respect reduced motion'],
                    [
                        sub(`${p}_m3_t3_s1`, 'WCAG contrast for text', ['AA', 'AAA'], 'medium'),
                        sub(`${p}_m3_t3_s2`, 'Keyboard flows', ['tab order', 'shortcuts'], 'medium'),
                    ],
                    blog(
                        'Accessibility Is a Requirement',
                        `# Checklist\n- 4.5:1 for normal text\n- Visible focus rings\n- 44×44dp touch targets\n\n## India\nLow-end devices and bright sunlight — test outdoors.\n`,
                        ['A11y', 'WCAG', 'UI'],
                        10
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Accessibility guidelines', 'accessibility-guidelines/', 'GeeksforGeeks', 'tutorial', 8),
                        { title: 'MDN: Accessibility', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility', platform: 'MDN', type: 'documentation', read_time_minutes: 15, is_free: true },
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_4`,
            title: 'Portfolio & collaboration',
            description: 'Case studies, critique, and working with engineering.',
            order: 4,
            estimated_hours: 22,
            prerequisite_modules: [`${p}_mod_3`],
            topics: [
                topicBundle(
                    p,
                    4,
                    1,
                    'Case study storytelling',
                    'STAR for design: context, constraints, process, outcome, learnings.',
                    7,
                    ['Write a case study with honest constraints', 'Show before/after metrics', 'Credit teammates'],
                    [
                        sub(`${p}_m4_t1_s1`, 'Outcome vs output', ['metrics', 'impact'], 'medium'),
                        sub(`${p}_m4_t1_s2`, 'Handling failed experiments', ['learning', 'integrity'], 'easy'),
                    ],
                    blog(
                        'Case Studies That Get Callbacks',
                        `# Structure\nProblem → Users → Constraints → Exploration → Decision → Validation → Results → Learnings\n\n# Proof\nScreenshots, quotes, and **numbers** whenever possible.\n`,
                        ['Portfolio', 'Storytelling', 'Career'],
                        9
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('STAR method', 'star-method/', 'GeeksforGeeks', 'tutorial', 6),
                        article('Resume writing', 'resume-writing-for-freshers/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    2,
                    'Critique & feedback',
                    'Giving and receiving design feedback without ego.',
                    7,
                    ['Use critique formats', 'Separate taste from usability', 'Turn feedback into tickets'],
                    [
                        sub(`${p}_m4_t2_s1`, 'I like / I wish / What if', ['critique', 'psych safety'], 'easy'),
                        sub(`${p}_m4_t2_s2`, 'Design QA before release', ['checklist', 'regression'], 'medium'),
                    ],
                    blog(
                        'Critique That Improves the Work',
                        `# Rule\nCritique the **design**, not the designer.\n\n# Format\nObservation → impact → suggestion → question.\n`,
                        ['Collaboration', 'Critique', 'Teams'],
                        8
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Software engineering ethics', 'ethics-in-software-engineering/', 'GeeksforGeeks', 'tutorial', 7),
                        article('Agile software development', 'agile-software-development/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    3,
                    'Handoff to engineering',
                    'Specs, edge cases, and annotation discipline.',
                    8,
                    ['Write acceptance criteria', 'List interaction states', 'Align on analytics events'],
                    [
                        sub(`${p}_m4_t3_s1`, 'Acceptance criteria in Gherkin style', ['Given', 'When', 'Then'], 'medium'),
                        sub(`${p}_m4_t3_s2`, 'Analytics event naming', ['snake_case', 'consistency'], 'easy'),
                    ],
                    blog(
                        'Specs Devs Actually Use',
                        `# Include\nEmpty, loading, error, success, partial success, permissions.\n\n# Analytics\nEvent name + properties for funnel debugging.\n`,
                        ['Handoff', 'PM-Design-Eng', 'Specs'],
                        9
                    ),
                    [PLAYLISTS.figmaDesignCourse],
                    [
                        article('Software development life cycle', 'software-development-life-cycle/', 'GeeksforGeeks', 'tutorial', 10),
                        article('SRS document', 'software-requirement-specification/', 'GeeksforGeeks', 'tutorial', 11),
                    ]
                ),
            ],
        },
    ];

    return {
        roadmapId: 'ui_ux_designer',
        roadmap_id: 'ui_ux_designer_roadmap',
        career_id: 'ui_ux_designer',
        career_name: 'UI/UX Designer',
        domain: 'design',
        target_duration_weeks: 12,
        difficulty_level: 'beginner',
        prerequisite_skills: ['Empathy', 'Basic computer literacy', 'Willingness to iterate'],
        modules,
        capstone_projects: [
            {
                title: 'Redesign a real flow end-to-end',
                description: 'Research → IA → mid-fi → prototype → usability test → case study.',
                estimated_hours: 28,
                required_skills: ['Figma', 'Research', 'Storytelling'],
                github_template: '',
            },
        ],
        version: 1,
    };
}

function buildProductManager() {
    const p = 'pm';
    const modules = [
        {
            module_id: `${p}_mod_1`,
            title: 'Product craft foundations',
            description: 'Outcomes, customers, and strategy vocabulary.',
            order: 1,
            estimated_hours: 24,
            prerequisite_modules: [],
            topics: [
                topicBundle(
                    p,
                    1,
                    1,
                    'Problems, personas, and JTBD',
                    'From vague ideas to testable problem statements.',
                    8,
                    ['Write personas grounded in data', 'Translate JTBD to metrics', 'Avoid solution bias'],
                    [
                        sub(`${p}_m1_t1_s1`, 'Persona vs proto-persona', ['evidence', 'assumptions'], 'medium'),
                        sub(`${p}_m1_t1_s2`, 'Jobs as progress', ['switching', 'forces'], 'medium'),
                    ],
                    blog(
                        'Jobs To Be Done Without the Buzzwords',
                        `# Template\nWhen **<situation>**, I want **<motivation>**, so I can **<outcome>**.\n\n# Trap\nBuilding for the loudest customer — triangulate with usage data.\n`,
                        ['JTBD', 'Strategy', 'PM'],
                        10
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Software project management', 'software-project-management/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Agile vs waterfall', 'agile-vs-waterfall/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    2,
                    'Market & competitive scans',
                    'Positioning, differentiation, and ethical copying of ideas.',
                    8,
                    ['Summarize a market in one page', 'Map competitors on axes', 'Find whitespace'],
                    [
                        sub(`${p}_m1_t2_s1`, 'Porter five forces (lite)', ['substitutes', 'buyers'], 'medium'),
                        sub(`${p}_m1_t2_s2`, 'Switching costs in India', ['UPI', 'network effects'], 'medium'),
                    ],
                    blog(
                        'Competitive Analysis in an Afternoon',
                        `# Output\nFeature matrix + **pricing** + distribution + moat notes.\n\n## India\nAccount for **regulatory** shifts (RBI, DPIIT) in fintech and edtech.\n`,
                        ['Market', 'Strategy', 'PM'],
                        11
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('SWOT analysis', 'swot-analysis/', 'GeeksforGeeks', 'tutorial', 7),
                        article('Business model', 'business-model/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    1,
                    3,
                    'Vision, mission, and north stars',
                    'Connect narrative to measurable north-star metrics.',
                    8,
                    ['Draft a crisp product vision', 'Choose a north star with guardrails', 'Align teams'],
                    [
                        sub(`${p}_m1_t3_s1`, 'Input vs output vs outcome metrics', ['leading', 'lagging'], 'medium'),
                        sub(`${p}_m1_t3_s2`, 'Goodhart’s law awareness', ['gaming', 'guardrails'], 'hard'),
                    ],
                    blog(
                        'North Star + Guardrails',
                        `# North star\nOne **outcome** metric that captures value.\n\n# Guardrails\nQuality, trust & safety, monetisation health — never trade blindly.\n`,
                        ['Metrics', 'Vision', 'PM'],
                        9
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('KPI vs OKR', 'kpi-vs-okr/', 'GeeksforGeeks', 'tutorial', 7),
                        article('Goal setting', 'goal-setting/', 'GeeksforGeeks', 'tutorial', 6),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_2`,
            title: 'Discovery & validation',
            description: 'Interviews, opportunity sizing, and experiments.',
            order: 2,
            estimated_hours: 28,
            prerequisite_modules: [`${p}_mod_1`],
            topics: [
                topicBundle(
                    p,
                    2,
                    1,
                    'Discovery interviews for PMs',
                    'Hypothesis-led conversations with sales/support signals.',
                    9,
                    ['Plan a discovery sprint', 'Pair with design/research', 'Synthesize into bets'],
                    [
                        sub(`${p}_m2_t1_s1`, 'Opportunity Solution Tree (lite)', ['outcomes', 'solutions'], 'medium'),
                        sub(`${p}_m2_t1_s2`, 'Sales call listening', ['objections', 'language'], 'easy'),
                    ],
                    blog(
                        'Discovery: Bets, Not Features',
                        `# Frame\nWe believe **<customer>** has **<problem>** measurable by **<signal>**.\n\n# Validate\nTalk to users; corroborate with **usage** and **support** tickets.\n`,
                        ['Discovery', 'PM', 'Research'],
                        10
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Software prototyping', 'software-prototyping/', 'GeeksforGeeks', 'tutorial', 8),
                        article('Feasibility study', 'feasibility-study/', 'GeeksforGeeks', 'tutorial', 7),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    2,
                    'Opportunity sizing & RICE',
                    'Rough sizing to compare bets fairly.',
                    9,
                    ['Estimate reach with transparent assumptions', 'Use RICE with team calibration', 'Document uncertainty'],
                    [
                        sub(`${p}_m2_t2_s1`, 'Confidence scores', ['ranges', 't-shirt'], 'medium'),
                        sub(`${p}_m2_t2_s2`, 'Cost of delay', ['time-critical', 'risk'], 'hard'),
                    ],
                    blog(
                        'RICE Without False Precision',
                        `# Inputs\nReach, Impact, Confidence, Effort — **ranges** beat fake decimals.\n\n# Culture\nReward learning from wrong estimates.\n`,
                        ['Prioritisation', 'RICE', 'PM'],
                        9
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Project estimation techniques', 'software-project-estimation/', 'GeeksforGeeks', 'tutorial', 9),
                        article('Risk management', 'risk-management/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    2,
                    3,
                    'Experiment design basics',
                    'Unit of randomization, guardrails, and ethics.',
                    10,
                    ['Define success & guardrail metrics', 'Avoid peeking bias', 'Know when not to experiment'],
                    [
                        sub(`${p}_m2_t3_s1`, 'Novelty & learning effects', ['first week bump'], 'medium'),
                        sub(`${p}_m2_t3_s2`, 'Ethical experiments', ['consent', 'exclusion'], 'hard'),
                    ],
                    blog(
                        'Experiments PMs Respect',
                        `# Preconditions\nStable infra, event tracking, and **sample size** sanity.\n\n# Guardrails\nLatency, errors, refunds — watch for harm.\n`,
                        ['Experimentation', 'A/B', 'PM'],
                        11
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Software testing', 'software-testing-basics/', 'GeeksforGeeks', 'tutorial', 8),
                        article('Black box testing', 'black-box-testing/', 'GeeksforGeeks', 'tutorial', 7),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_3`,
            title: 'Execution & delivery',
            description: 'Roadmaps, agile ceremonies, and cross-functional leadership.',
            order: 3,
            estimated_hours: 30,
            prerequisite_modules: [`${p}_mod_2`],
            topics: [
                topicBundle(
                    p,
                    3,
                    1,
                    'Roadmapping: themes & outcomes',
                    'Now/next/later and communicating trade-offs.',
                    10,
                    ['Build a theme-based roadmap', 'Separate roadmap from backlog', 'Align exec narrative'],
                    [
                        sub(`${p}_m3_t1_s1`, 'Outcome roadmaps vs Gantt fantasies', ['commit', 'vision'], 'medium'),
                        sub(`${p}_m3_t1_s2`, 'Capacity & dependencies', ['teams', 'platform'], 'medium'),
                    ],
                    blog(
                        'Roadmaps Are Promises With Context',
                        `# Themes\nGroup work by **customer outcome**, not org chart.\n\n# Cadence\nReview quarterly; adjust when learning is fast.\n`,
                        ['Roadmap', 'Agile', 'PM'],
                        10
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Gantt chart', 'gantt-chart/', 'GeeksforGeeks', 'tutorial', 7),
                        article('PERT chart', 'pert-chart/', 'GeeksforGeeks', 'tutorial', 8),
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    2,
                    'Agile ceremonies that work',
                    'Stand-ups, refinement, retros — tuned for remote India teams.',
                    10,
                    ['Facilitate a retro that surfaces systemic issues', 'Keep stand-ups async-friendly', 'Timebox refinement'],
                    [
                        sub(`${p}_m3_t2_s1`, 'Definition of Ready/Done', ['shared', 'quality'], 'medium'),
                        sub(`${p}_m3_t2_s2`, 'WIP limits & flow', ['kanban', 'bottlenecks'], 'medium'),
                    ],
                    blog(
                        'Stand-ups: Signals, Not Status',
                        `# Questions\n1) What blocked flow yesterday?\n2) What will unblock today?\n3) Risks to milestone?\n\n## Remote\nWritten daily updates + weekly deep sync.\n`,
                        ['Agile', 'Scrum', 'Remote'],
                        9
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Scrum methodology', 'scrum-software-development/', 'GeeksforGeeks', 'tutorial', 10),
                        article('Kanban methodology', 'kanban-software-development/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    3,
                    3,
                    'Stakeholder management',
                    'Exec updates, engineering partnership, and saying no.',
                    10,
                    ['Tailor updates by audience', 'Negotiate scope with data', 'Protect the team from thrash'],
                    [
                        sub(`${p}_m3_t3_s1`, 'RACI lite', ['responsible', 'accountable'], 'easy'),
                        sub(`${p}_m3_t3_s2`, 'Escalation paths', ['incident', 'policy'], 'medium'),
                    ],
                    blog(
                        'No Without Burning Bridges',
                        `# Frame\n**Goal** → **options** → **trade-offs** → **recommendation**.\n\n# Trust\nUnder-promise, over-deliver on communication cadence.\n`,
                        ['Leadership', 'Communication', 'PM'],
                        8
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Leadership skills', 'leadership-skills/', 'GeeksforGeeks', 'tutorial', 7),
                        article('Conflict resolution', 'conflict-resolution/', 'GeeksforGeeks', 'tutorial', 6),
                    ]
                ),
            ],
        },
        {
            module_id: `${p}_mod_4`,
            title: 'Analytics & launch',
            description: 'Funnels, SQL for PMs, and go-to-market coordination.',
            order: 4,
            estimated_hours: 26,
            prerequisite_modules: [`${p}_mod_3`],
            topics: [
                topicBundle(
                    p,
                    4,
                    1,
                    'Funnels & cohorts',
                    'Activation, retention, and segmentation.',
                    9,
                    ['Define activation for your product', 'Read cohort charts', 'Pair qual with quant'],
                    [
                        sub(`${p}_m4_t1_s1`, 'Cohort vs calendar retention', ['noise', 'seasonality'], 'medium'),
                        sub(`${p}_m4_t1_s2`, 'Leading indicators of churn', ['usage', 'support'], 'medium'),
                    ],
                    blog(
                        'Funnels Tell Stories',
                        `# Steps\nMap the **happy path**; measure drop-offs; add qual on the biggest hole.\n\n## India\nConsider **network variability** on mobile when judging session length.\n`,
                        ['Analytics', 'Growth', 'PM'],
                        10
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Data analytics', 'data-analytics/', 'GeeksforGeeks', 'tutorial', 8),
                        article('Big data introduction', 'introduction-to-big-data/', 'GeeksforGeeks', 'tutorial', 9),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    2,
                    'SQL for PMs (read-mostly)',
                    'Joins, filters, and reproducible queries.',
                    9,
                    ['Write a query for weekly active users', 'Debug metric disagreements', 'Work with analysts'],
                    [
                        sub(`${p}_m4_t2_s1`, 'Metric definitions as code', ['single source of truth'], 'medium'),
                        sub(`${p}_m4_t2_s2`, 'Sampling pitfalls', ['bias', 'variance'], 'hard'),
                    ],
                    blog(
                        'PM SQL: Read Before You Write',
                        `# Skills\nFilter, join, group, time windows.\n\n# Culture\nWhen metrics disagree, **open the query** together.\n`,
                        ['SQL', 'Analytics', 'PM'],
                        9
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('SQL introduction', 'sql-tutorial/', 'GeeksforGeeks', 'tutorial', 10),
                        article('Database management system', 'dbms/', 'GeeksforGeeks', 'tutorial', 11),
                    ]
                ),
                topicBundle(
                    p,
                    4,
                    3,
                    'Launches & incident communication',
                    'GTM checklist, rollback criteria, and customer messaging.',
                    8,
                    ['Run a launch checklist', 'Define rollback triggers', 'Coordinate support macros'],
                    [
                        sub(`${p}_m4_t3_s1`, 'Canary releases', ['risk', 'blast radius'], 'medium'),
                        sub(`${p}_m4_t3_s2`, 'Status page discipline', ['transparency', 'trust'], 'easy'),
                    ],
                    blog(
                        'Launch Day: Calm Is a Feature',
                        `# Checklist\nMonitoring, support readiness, comms, rollback owner.\n\n# Post-mortem\nBlameless — focus on systems.\n`,
                        ['Launch', 'GTM', 'Ops'],
                        8
                    ),
                    [PLAYLISTS.pmExponent],
                    [
                        article('Software deployment', 'software-deployment/', 'GeeksforGeeks', 'tutorial', 8),
                        article('Software maintenance', 'software-maintenance/', 'GeeksforGeeks', 'tutorial', 7),
                    ]
                ),
            ],
        },
    ];

    return {
        roadmapId: 'product_manager',
        roadmap_id: 'product_manager_roadmap',
        career_id: 'product_manager',
        career_name: 'Product Manager',
        domain: 'business',
        target_duration_weeks: 12,
        difficulty_level: 'beginner',
        prerequisite_skills: ['Clear communication', 'Structured thinking', 'Basic numeracy'],
        modules,
        capstone_projects: [
            {
                title: 'PRD + roadmap slice for a real app you use',
                description: 'Problem, goals, metrics, risks, milestones, and stakeholder plan.',
                estimated_hours: 24,
                required_skills: ['Writing', 'Analytics', 'Prioritisation'],
                github_template: '',
            },
        ],
        version: 1,
    };
}

function getSeedRoadmapDocuments() {
    return [
        buildBackendDeveloper(),
        buildDataScientist(),
        buildUiUxDesigner(),
        buildProductManager(),
    ];
}

module.exports = {
    getSeedRoadmapDocuments,
    buildBackendDeveloper,
    buildDataScientist,
    buildUiUxDesigner,
    buildProductManager,
};
