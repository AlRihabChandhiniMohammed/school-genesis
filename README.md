# School Genesis — AI-Powered Learning Platform

An intelligent school management and learning platform powered by **Google Gemma 2** AI. Built for teachers, students, and administrators.

## Features

### 🤖 AI-Powered (Gemma 2)
- **Quiz Generator** — Generate MCQ quizzes from any topic using Gemma 2
- **AI Chat Assistant** — Full-page chatbot for teachers (lesson planning) and students (doubt solving)
- **Smart Grouping** — Auto-group students by performance (Advanced/Average/Slow)
- **Performance Analytics** — AI-generated class insights and recommendations
- **Video Intelligence** — Auto-assign difficulty tags to YouTube educational videos

### 👨‍🏫 For Teachers
- Create and manage classes with student enrollment
- AI quiz generation from topics or pasted content
- Auto-generate student performance groups
- View class and individual analytics
- YouTube video recommendations by topic
- Inline quiz editing before publishing

### 👩‍🎓 For Students
- Take timed quizzes with auto-grading
- Personal AI tutor for doubt clearing (multi-language)
- AI-recommended educational videos
- Detailed performance analytics (charts + history)
- Assignment submission and feedback

### 🛡️ Security
- JWT authentication with HTTP-only cookies
- bcrypt password hashing (12 rounds)
- Role-based access control (Teacher/Student/Admin)
- Rate limiting on auth routes
- Helmet.js security headers
- Input validation on all endpoints

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Framer Motion, Recharts |
| Backend | Node.js, Express 5, REST API |
| Database | MongoDB 7 with Mongoose ODM |
| AI | Gemma 2 via Google AI Studio / Hugging Face |
| Auth | JWT (RS256) + HTTP-only cookies |
| Videos | YouTube Data API v3 |
| Deployment | Docker, Vercel (frontend), Render (backend) |

## Prerequisites

- Node.js 18+
- MongoDB 7 (local or Atlas)
- Docker (optional, for containerized deployment)
- **Gemma API**: Google AI Studio API key OR HuggingFace token

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd school-genesis

# Backend
cd backend
npm install
cp ../.env.example .env
# Edit .env with your settings

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `backend/.env` and configure:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/school-genesis
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
GEMMA_API_KEY=your-google-ai-studio-key     # For Gemma via Google
HF_TOKEN=your-huggingface-token              # Fallback AI provider
YOUTUBE_API_KEY=your-youtube-api-key         # For video search
FRONTEND_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## Docker Deployment

```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend (Nginx) on port 80

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | - | Register (teacher/student) |
| POST | `/api/auth/login` | - | Login |
| POST | `/api/auth/logout` | ✓ | Logout |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/classes` | ✓ | List classes |
| POST | `/api/classes` | Teacher | Create class |
| GET | `/api/classes/:id` | ✓ | Class details |
| POST | `/api/quizzes/generate` | Teacher | AI quiz generation |
| POST | `/api/quizzes` | Teacher | Create quiz |
| GET | `/api/quizzes` | ✓ | List quizzes |
| POST | `/api/quizzes/:id/submit` | Student | Submit quiz |
| GET | `/api/quizzes/:id/results` | ✓ | Quiz results |
| POST | `/api/ai/chat` | ✓ | AI chat |
| POST | `/api/ai/generate-quiz` | Teacher | Generate questions |
| GET | `/api/ai/videos/recommend` | ✓ | YouTube recommendations |
| GET | `/api/analytics/class/:id` | Teacher | Class analytics |
| GET | `/api/analytics/student/:id` | Student | Student analytics |
| POST | `/api/groups/auto-generate/:classId` | Teacher | Auto-group students |

## Folder Structure

```
school-genesis/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx, Login.jsx, Signup.jsx
│       │   ├── teacher/
│       │   │   ├── Dashboard.jsx, Classes.jsx, ClassDetail.jsx
│       │   │   ├── Quizzes.jsx, QuizGenerate.jsx
│       │   │   ├── Assignments.jsx, Groups.jsx
│       │   │   ├── Analytics.jsx, AIAssistant.jsx
│       │   └── student/
│       │       ├── Dashboard.jsx, Quizzes.jsx, TakeQuiz.jsx
│       │       ├── Results.jsx, Videos.jsx
│       │       ├── AITutor.jsx, Analytics.jsx
│       ├── components/
│       │   └── Sidebar.jsx
│       ├── context/AuthContext.jsx
│       ├── services/api.js
│       └── App.jsx
├── backend/
│   ├── routes/        # Express route files
│   ├── controllers/   # Route handlers
│   ├── models/        # Mongoose schemas
│   ├── middleware/     # Auth, validation
│   ├── services/
│   │   └── gemmaService.js   # All Gemma AI calls
│   └── server.js
├── docker/
│   └── nginx.conf
├── Dockerfile.frontend
├── Dockerfile.backend
├── docker-compose.yml
└── .env.example
```

## AI Configuration

The platform uses **Gemma 2** (9B) for all AI features:

**Option A — Google AI Studio** (Recommended)
1. Go to https://aistudio.google.com
2. Get API key (free tier available)
3. Set `GEMMA_API_KEY` in `.env`

**Option B — Hugging Face** (Fallback)
1. Get token at https://huggingface.co/settings/tokens
2. Set `HF_TOKEN` in `.env`

All AI calls go through `backend/services/gemmaService.js`. The service auto-falls back between providers.

## Deployment Guide

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Set root directory to `backend`
4. Build: `npm install`
5. Start: `node server.js`
6. Add environment variables

### Database → MongoDB Atlas
1. Create free cluster at https://atlas.mongodb.com
2. Get connection string
3. Set as `MONGO_URI` on Render

## License

MIT
