# Startup Idea Validator Dashboard — IdeaVault

A web application where users can submit startup ideas, browse them on a card-based dashboard, and explore them using filters, search, and statistics.

Built for the **Blind Date Hackathon — Round 1**.

---

## Features

### Core Features (Functional Requirements)
| # | Feature | Status |
|---|---------|--------|
| 1 | **Idea Submission** — Title, description, problem statement, category | ✅ |
| 2 | **Difficulty Score** — Scale 1 (Easy) to 5 (Extremely Hard) | ✅ |
| 3 | **Market Potential Rating** — Low, Medium, High, Very High | ✅ |
| 4 | **Card Dashboard** — Cards show title, category, difficulty, market potential, description | ✅ |
| 5 | **Idea Filtering** — Filter by category, difficulty level, market potential | ✅ |
| 6 | **Search Functionality** — Keyword search across titles and descriptions | ✅ |
| 7 | **Statistics Panel** — Total ideas, most common category, average difficulty | ✅ |
| 8 | **Input Validation** — Prevents empty submissions and duplicate titles | ✅ |

### Bonus Features
| Feature | Status |
|---------|--------|
| **Idea Upvoting System** — Upvote ideas, popular ones rise in trending | ✅ |
| **Trending Ideas Section** — Top ideas ranked by popularity score | ✅ |
| **Animated Card Transitions** — Smooth slide-up animations on cards | ✅ |
| **Dark Mode Toggle** — Switch between light and dark themes | ✅ |
| **Popularity Score** — Calculated from upvotes + market potential + difficulty | ✅ |

### Extra Features
- **Navigation Bar** — Tabbed navigation: Dashboard, Trending, Statistics, About
- **Category Breakdown Chart** — Visual bar chart of ideas per category
- **Difficulty & Market Distribution** — Side-by-side distribution charts on Statistics page
- **Trending Leaderboard** — Ranked list view with scores on dedicated Trending page
- **About Page** — How-it-works guide, feature list, and tech stack display
- **Idea Deletion** — Remove ideas from the dashboard
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Persistent Storage** — Ideas saved in localStorage across sessions

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| React 19 | UI rendering |
| Lucide React | Icons |
| localStorage | Client-side data persistence |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd BlindDate

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
BlindDate/
├── app/
│   ├── layout.tsx          # Root layout with dark mode support
│   ├── page.tsx            # Main app with 4 sections (Dashboard, Trending, Stats, About)
│   └── globals.css         # Global styles + CSS variables + animations
├── components/
│   ├── Header.tsx          # App header with navbar, theme toggle, submit button
│   ├── StatsPanel.tsx      # Statistics cards + category breakdown chart
│   ├── FilterBar.tsx       # Search input + category/difficulty/market filters
│   ├── IdeaCard.tsx        # Idea card with tags, popularity score bar, upvote
│   ├── SubmitIdeaDialog.tsx # Modal form for submitting new ideas
│   └── TrendingSection.tsx # Horizontal scroll of trending ideas
├── lib/
│   ├── types.ts            # TypeScript types, constants, popularity score formula
│   └── store.ts            # localStorage CRUD, filtering, stats, seed data
├── README.md
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## How It Was Built

1. **Scaffolded** Next.js 15 project with TypeScript and Tailwind CSS
2. **Designed** a clean, professional UI inspired by corporate design systems (Meta, Samsung)
3. **Implemented** localStorage-based data layer with seed data for demo
4. **Built** modular React components for each UI section
5. **Added** all 8 functional requirements and all 5 bonus features
6. **Tested** submission flow, filtering, search, statistics, upvoting, and dark mode

---

## Popularity Score Formula

```
Score = (upvotes × 2) + (market_weight × 5) + ((6 − difficulty) × 3)

Market weights: Low=1, Medium=2, High=3, Very High=4
```

Higher upvotes, higher market potential, and lower difficulty → higher popularity score.

---

## Verification Checklist

- [x] Users can submit startup ideas
- [x] Ideas appear correctly on the dashboard
- [x] Idea cards show the correct information (title, category, difficulty, market, description)
- [x] Filters work properly (category, difficulty, market potential)
- [x] Search functionality works (keyword search)
- [x] Statistics update correctly when new ideas are added
- [x] README file explains how the project was built

---

## Team

Built during the Blind Date Hackathon by a team of two developers.

## License

MIT
