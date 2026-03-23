# 🧠 BurnoutRadar
### Healthcare Worker Burnout Detection & Wellbeing Intelligence Platform

> *Built for the Vibe-a-thon Hackathon · HealthTech Theme*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-burnout--radar--zeta.vercel.app-brightgreen?style=for-the-badge)](https://burnout-radar-zeta.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20Sonnet-orange?style=for-the-badge)](https://anthropic.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

---

## 🚨 The Problem

Healthcare workers face extreme burnout — yet hospitals have **no early warning system** to detect it before it becomes critical.

- 🏥 **1 in 3 nurses** experience burnout symptoms
- 😞 Burnout leads to **medical errors, absenteeism, and resignation**
- 🔕 Workers rarely speak up — there's **no safe, low-friction channel**
- 📊 By the time managers notice, it's **already too late**

---

## 💡 The Solution

**BurnoutRadar** is a web-based wellbeing intelligence platform that:

- Collects **daily micro check-ins** from healthcare staff (10 seconds, 3 questions)
- Calculates a **burnout risk score** per worker using mood, energy, and workload data
- Uses **Claude AI** to generate personalized insights and alerts
- Gives **hospital admins** a real-time dashboard to act before burnout becomes critical
- Gives **staff members** a private, personal wellbeing view with AI-powered support

---

## ✨ Features

### 🔐 Smart Login System
- Separate **Admin login** and **Staff login** on the same page
- Staff members select their own name from a visual grid — no username needed
- Each staff member gets a **completely different UI** after login

---

### 🖤 Admin Dashboard (Command Centre)
| Feature | Description |
|---|---|
| 📊 Overview | Institution-wide burnout score, high/medium/low risk counts |
| 🗺 Department Heatmap | Color-coded risk view across all 6 departments |
| 👥 All Workers Table | Filterable table with score bars, trend indicators, risk badges |
| ⚡ Active Alerts | Prioritised alerts requiring immediate admin action |
| 🤖 AI Insights | On-demand Claude AI analysis per worker and department |
| 📋 Worker Detail Panel | Click any worker → side panel with 7-day trend chart + AI analysis + recommended actions |

---

### 🌿 Staff Wellbeing App (Personal Companion)
| Feature | Description |
|---|---|
| 🏠 Home | Personalised greeting, current score ring, weekly sparkline, quick check-in nudge |
| ✅ Daily Check-in | Emoji-based 3-question form + optional free text → real Claude AI personal response |
| 💙 My Wellbeing | Score ring, weekly trend chart, radar overview, AI weekly summary |
| 📞 Resources | iCall helpline, breathing exercises, wellbeing officer contact |
| 🔥 Streak Tracker | Encourages daily check-in consistency |

---

### 🤖 Live AI Generation (Claude API)
Every AI button makes a **real API call** to Claude Sonnet — nothing is hardcoded:

- **Check-in response** — Claude reads the worker's actual emoji selections and free-text note and responds personally
- **Worker analysis** — Claude analyses 7-day score history and generates a clinical insight with a recommended action
- **Department summary** — Claude analyses all department scores and identifies the most urgent concern
- **Weekly summary** — Claude generates a personalised weekly pattern analysis for each staff member

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| AI | Anthropic Claude Sonnet API |
| API Proxy | Vercel Serverless Functions |
| Styling | Pure CSS (no UI library) |
| Fonts | Syne + DM Sans + DM Serif Display |
| Hosting | Vercel |
| Version Control | GitHub |

---

## 🏗 Architecture

```
Browser (React App)
        │
        │  POST /api/claude
        ▼
Vercel Serverless Function (api/claude.js)
        │
        │  POST with API Key (hidden from browser)
        ▼
Anthropic Claude API
        │
        │  AI Response
        ▼
Back to Browser → Displayed to user
```

> The API key is **never exposed to the browser** — it lives safely in Vercel's environment variables.

---

## 📁 Project Structure

```
burnout-radar/
├── api/
│   └── claude.js          # Vercel serverless proxy (hides API key)
├── src/
│   ├── App.jsx            # Full application (login + admin + staff)
│   └── main.jsx           # React entry point
├── index.html             # HTML shell
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Local Setup
```bash
# Clone the repo
git clone https://github.com/programerz30/burnout-radar.git
cd burnout-radar

# Install dependencies
npm install

# Create a .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Start development server
npm run dev
```

Open `http://localhost:5173`

### Deploy to Vercel
1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Click Deploy

---

## 🔑 Demo Credentials

| Role | Password |
|---|---|
| Admin | `admin123` |
| Any Staff Member | `staff123` |

### Staff Members in Demo
| Name | Department | Role |
|---|---|---|
| Priya Menon | ICU | Senior Nurse |
| Arjun Nair | Emergency | Resident Doctor |
| Meera Pillai | Pediatrics | Staff Nurse |
| Rohit Das | Emergency | Paramedic |
| Sunita Rao | Surgery | Head Surgeon |
| Kiran Iyer | Radiology | Radiologist |
| Divya Thomas | Oncology | Staff Nurse |
| Anil Kumar | ICU | Intensivist |

---

## 🎯 How It Works

```
Staff checks in daily          Admin sees live dashboard
(10 seconds, 3 questions)  →   with risk scores + AI alerts
        │                               │
        ▼                               ▼
Claude AI generates            Claude AI generates
personal response              clinical insights per worker
        │                               │
        ▼                               ▼
Staff feels heard              Admin can intervene early
and supported                  before burnout is critical
```

---

## 🏆 Why BurnoutRadar Wins

| Problem | Our Solution |
|---|---|
| No existing tool for early detection | AI-powered trend analysis catches decline before it's critical |
| Workers don't speak up | 10-second anonymous check-in removes friction |
| Admins have no visibility | Real-time dashboard with color-coded risk levels |
| Generic tools not built for healthcare | Purpose-built for hospital workflows and departments |
| Enterprise tools too expensive for SMEs | Lightweight, deployable for free on Vercel |

---

## 🔮 Future Roadmap

- [ ] Supabase backend for persistent real check-in data
- [ ] Email/SMS alerts for critical risk workers
- [ ] Shift pattern integration to correlate burnout with rosters
- [ ] Anonymous peer support chat
- [ ] Mobile app (React Native)
- [ ] Hospital HR system integration
- [ ] Multi-hospital support

---

## 👥 Team

Built with ❤️ at **Vibe-a-thon** Hackathon

---

## 📄 License

MIT License — free to use, modify and distribute.

---

> *"A nurse named Priya has been silently struggling for 2 weeks. Her hospital had no idea — until BurnoutRadar flagged her."*
