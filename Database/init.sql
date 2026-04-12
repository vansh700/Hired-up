-- SkillFirst Hire - Database Initialization
-- Run: psql -U postgres -d skillfirst_hire -f init.sql
-- Or create the DB first: psql -U postgres -c "CREATE DATABASE skillfirst_hire;"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email        VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(20) NOT NULL CHECK (role IN ('RECRUITER', 'CANDIDATE')),
    full_name    VARCHAR(255),
    company_name VARCHAR(255),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── USER PROFILES (extended candidate info) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    about        TEXT,
    education    TEXT,
    experience   TEXT,
    github_url   TEXT,
    linkedin_url TEXT,
    phone        VARCHAR(30),
    skills       TEXT[],
    resume_path  VARCHAR(500), -- added
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── JOBS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    skills_required TEXT[],
    status       VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DRAFT')),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── ASSESSMENTS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    type       VARCHAR(50) CHECK (type IN ('MCQ', 'CODING', 'MIXED')),
    config     JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── QUESTIONS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    type          VARCHAR(50) NOT NULL CHECK (type IN ('MCQ_SINGLE', 'MCQ_MULTIPLE', 'CODING')),
    content       TEXT NOT NULL,
    options       JSONB,
    correct_answer JSONB,
    difficulty    VARCHAR(20) DEFAULT 'MEDIUM' CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    points        INTEGER DEFAULT 10,
    order_index   INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── TEST CASES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_cases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    input_data      TEXT,
    expected_output TEXT NOT NULL,
    is_hidden       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── CANDIDATE ASSESSMENTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_assessments (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    started_at    TIMESTAMPTZ DEFAULT NOW(),
    completed_at  TIMESTAMPTZ,
    status        VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
    raw_score     DECIMAL(10,2),
    weighted_score DECIMAL(10,2),
    UNIQUE(candidate_id, assessment_id, job_id)
);

-- ── ANSWERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS answers (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_assessment_id UUID NOT NULL REFERENCES candidate_assessments(id) ON DELETE CASCADE,
    question_id            UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    response               JSONB,
    is_correct             BOOLEAN,
    points_earned          DECIMAL(10,2),
    time_spent_seconds     INTEGER,
    ai_feedback            JSONB, -- added
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ── CERTIFICATES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform      VARCHAR(100) NOT NULL,
    credential_id VARCHAR(255),
    credential_url TEXT,
    file_path     VARCHAR(500),
    trust_score   INTEGER CHECK (trust_score >= 0 AND trust_score <= 100),
    status        VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'FAILED', 'UNVERIFIABLE')),
    metadata      JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── CREDIBILITY SCORES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credibility_scores (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    total_score  DECIMAL(5,2) NOT NULL,
    breakdown    JSONB NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- ── REFRESH TOKENS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      VARCHAR(500) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── CANDIDATE NOTES (Phase 1) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate_notes (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id       UUID REFERENCES jobs(id) ON DELETE SET NULL,
    note         TEXT NOT NULL,
    status       VARCHAR(50) DEFAULT 'REVIEW' CHECK (status IN ('SHORTLIST', 'REJECT', 'REVIEW', 'OFFERED')),
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── SKILL GAPS (Phase 1) ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_gaps (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    gap_data     JSONB NOT NULL, -- Matched, missing, partial
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter    ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_assessments_job   ON assessments(job_id);
CREATE INDEX IF NOT EXISTS idx_cand_assess_cand  ON candidate_assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cand_assess_job   ON candidate_assessments(job_id);
CREATE INDEX IF NOT EXISTS idx_certs_candidate   ON certificates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cred_candidate    ON credibility_scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
