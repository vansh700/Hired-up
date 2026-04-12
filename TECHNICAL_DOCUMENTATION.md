# Technical Documentation: AI-Driven Smart Hiring & Skill Validation Platform

This document provides a comprehensive technical breakdown of the platform, including its file structure, core modules, and data flow.

---

## 📂 Project Structure Overview

The project is divided into a **Backend** (Node.js/Express) and a **Frontend** (Vanilla HTML/JS/CSS).

### 🚀 Root Directory
- `backend/`: Core logic, API routes, and database models.
- `frontend/api/assets/`: All UI components and frontend logic.
- `ml-service/`: (Optional) AI/ML components for interview evaluation.
- `live-code/`: Logic specific to the real-time coding module.
- `Database/`: Seed scripts and database configurations.
- `master_run.ps1`: Script to start both frontend and backend.
- `seed_jobs_pro.js`: Advanced seeding for job data.

---

## 🛠 Backend Architecture (`/backend`)

The backend follows a standard MVC-like pattern (Models, Routes, Middleware).

### 1. Core Entry Point
- **[server.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/server.js)**: Configures Express, connects to MongoDB, and registers all API routes.

### 2. Models (`/backend/models`) - "Where Data Lives"
- **[User.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/models/User.js)**: Stores user credentials, roles (Candidate/Recruiter), and profile data (skills, GitHub, LeetCode).
- **[Job.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/models/Job.js)**: Stores job postings created by recruiters.
- **[Assessment.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/models/Assessment.js)**: Defines test structures, including coding questions and MCQ.
- **[Submission.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/models/Submission.js)**: Records candidate answers and scores.
- **[Certificate.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/models/Certificate.js)**: Metadata for issued skill certificates.

### 3. API Routes (`/backend/routes`) - "Where Logic Lives"
- **[auth.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/routes/auth.js)**:
  - `POST /auth/register`: User registration with role selection.
  - `POST /auth/login`: JWT-based authentication.
  - `GET /auth/me`: Fetches the logged-in user's profile.
  - `POST /auth/profile`: Updates profile details (about, experience, links).
- **[jobs.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/routes/jobs.js)**: 
  - Handles job creation, listing, and applicant tracking.
- **[assessments.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/routes/assessments.js)**:
  - `POST /generate/:jobId`: Uses AI to generate tailored coding and MCQ questions.
  - Stores **Test Cases** for coding problems inside the assessment object.
- **[scoring.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/routes/scoring.js)**:
  - Evaluates coding submissions against hidden test cases.
  - Calculates final scores and ranking metrics.

---

## 🎨 Frontend Architecture (`/frontend/api/assets`)

The frontend uses a Single Page Application (SPA) feel with dynamic DOM updates.

---

## 💻 Live Code Environment (`/live-code/livecode`)

The platform includes a dedicated real-time coding service used for live assessments.

- **[index.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/live-code/livecode/index.js)**: The main entry point for the live coding backend.
- **Compiler Logic**: Handles code execution (e.g., `debug_exec.js`) and manages temporary files (`temp.cpp`, `temp.exe`) for running candidate code against inputs.
- **Database Utilities**: Contains specialized scripts for managing the Atlas/MongoDB migration and syncing (`check_atlas.js`, `merge_atlas.js`).

---

### 1. Main Files
- **[index.html](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/index.html)**: Landing page and navigation hub.
- **[app.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/app.js)**: The multi-thousand line "brain" of the frontend. It manages:
  - Authentication state (Local Storage).
  - API calls using `fetch`.
  - UI state switching (showing/hiding sections).
- **[api_utils.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/api_utils.js)**: Helper functions for consistent API requests.

### 2. Feature Pages
- **[auth.html](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/auth.html)**: Handles Login and Signup UI.
- **[profile.html](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/profile.html)**: Displays candidate stats, GitHub heatmaps, and past test results.
- **[recruiter.html](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/recruiter.html)**: Dashboard for recruiters to post jobs and view candidate rankings.
- **[interview.html](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/interview.html)**: The coding environment where candidates take tests.

---

## 🔑 Key Technical Workflows

### 1. Profile & Login Flow
1. **Frontend**: `auth.html` collects data and calls `login()` in `app.js`.
2. **Backend**: `auth.js` verifies credentials using `User.js` model and returns a JWT token.
3. **Storage**: `app.js` saves the token in `localStorage`.
4. **Fetching Profile**: `profile.html` loads, calls `/auth/me`, and populates the UI.

### 2. Coding Problems & Test Cases
1. **AI Generation**: Recruiter clicks "Generate Assessment". Backend `assessments.js` calls `aiService.js`.
2. **Structure**: Each coding problem includes an array of `testCases` (Input/Expected Output).
3. **Execution**: When a candidate submits code, the backend ([take.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/routes/take.js) or [scoring.js](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/backend/routes/scoring.js)) runs the code against these test cases to calculate accuracy.

### 3. Recruiter Dashboard & Ranking
1. **Job Posting**: Recruiter creates a job via `post-job.html` -> `/routes/jobs.js`.
2. **Applicant Scoring**: Candidates take assessments. Their results are stored in `Submission.js`.
3. **Ranking**: The recruiter dashboard ([recruiter.html](file:///c:/Users/Vansh/Downloads/AI-Driven-Smart-Hiring-Skill-Validation-Platform-main%20%283%29/frontend/api/assets/recruiter.html)) fetches all submissions for a job and sorts them based on:
    - Assessment Score.
    - Credibility (LeetCode/GitHub activity).
    - Skill match.

---

## 📈 Data Interaction Summary

| Feature | Frontend File | Backend Route | Database Model |
| :--- | :--- | :--- | :--- |
| **Auth/Login** | `auth.html` | `/auth/login` | `User.js` |
| **User Profile** | `profile.html` | `/auth/me` | `User.js` |
| **Job Management** | `recruiter.html` | `/jobs` | `Job.js` |
| **Assessments** | `interview.html` | `/assessments` | `Assessment.js` |
| **Submissions** | `interview.html` | `/take/submit` | `Submission.js` |
| **Certificates** | `verify.html` | `/certificates` | `Certificate.js` |
| **Live Coding** | `interview.html` | `/livecode` logic | `Submission.js` |

---
*Documentation generated for Vansh by Antigravity AI.*
