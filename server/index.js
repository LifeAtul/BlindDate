require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));
app.use(express.json());

// ──────────────────────────────────────────
// In-memory store
// ──────────────────────────────────────────
const CATEGORIES = [
  "SaaS", "AI/ML", "E-Commerce", "FinTech", "HealthTech",
  "EdTech", "Social", "Developer Tools", "Marketplace", "Other"
];

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Moderate", 3: "Hard", 4: "Very Hard", 5: "Extremely Hard" };

let ideas = [
  {
    id: uuidv4(),
    title: "QuickHire AI",
    description: "AI-powered resume screening and candidate matching platform for small businesses that can't afford enterprise HR tools.",
    problemStatement: "Small businesses struggle to efficiently screen resumes and find the right candidates without expensive HR software.",
    category: "AI/ML",
    difficulty: 3,
    marketPotential: "High",
    upvotes: 24,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "FreshCart",
    description: "Hyperlocal grocery delivery connecting neighborhood stores with customers within 2km radius for 15-minute delivery.",
    problemStatement: "Local grocery stores lose customers to large delivery platforms that charge high commissions.",
    category: "E-Commerce",
    difficulty: 2,
    marketPotential: "Very High",
    upvotes: 18,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "StudyBuddy",
    description: "Peer-to-peer learning platform where students can find study partners based on courses, schedule, and learning style.",
    problemStatement: "Students often study alone and lack peer support, leading to lower motivation and understanding.",
    category: "EdTech",
    difficulty: 2,
    marketPotential: "Medium",
    upvotes: 12,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "SplitWise Pro",
    description: "Subscription expense splitter for roommates and couples that auto-detects recurring charges and suggests fair splits.",
    problemStatement: "Splitting recurring subscription costs among roommates or partners is tedious and often unfair.",
    category: "FinTech",
    difficulty: 2,
    marketPotential: "High",
    upvotes: 31,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "MediTrack",
    description: "Medication reminder and health tracking app for elderly patients with family dashboard for remote monitoring.",
    problemStatement: "Elderly patients often forget medications and families worry about their health status remotely.",
    category: "HealthTech",
    difficulty: 3,
    marketPotential: "Very High",
    upvotes: 27,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "DevFlow",
    description: "Visual workflow builder for CI/CD pipelines that generates GitHub Actions YAML from drag-and-drop interfaces.",
    problemStatement: "Writing CI/CD configuration files is complex and error-prone for many developers.",
    category: "Developer Tools",
    difficulty: 4,
    marketPotential: "Medium",
    upvotes: 15,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "LocalBuzz",
    description: "Community-driven social platform for neighborhood events, recommendations, and local business promotions.",
    problemStatement: "People feel disconnected from their local communities and miss out on nearby events and businesses.",
    category: "Social",
    difficulty: 3,
    marketPotential: "Medium",
    upvotes: 9,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: uuidv4(),
    title: "CloudMenu",
    description: "SaaS platform for restaurants to create digital menus with QR codes, real-time updates, and multi-language support.",
    problemStatement: "Restaurants need affordable, easy-to-update digital menus, especially post-pandemic.",
    category: "SaaS",
    difficulty: 1,
    marketPotential: "High",
    upvotes: 20,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

// ──────────────────────────────────────────
// Helper: compute popularity score
// ──────────────────────────────────────────
function getPopularityScore(idea) {
  const marketWeights = { Low: 1, Medium: 2, High: 3, "Very High": 4 };
  const mw = marketWeights[idea.marketPotential] || 1;
  return (idea.upvotes * 2) + (mw * 5) + ((6 - idea.difficulty) * 3);
}

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ideas: ideas.length });
});

// GET all ideas
app.get("/api/ideas", (_req, res) => {
  const enriched = ideas.map((idea) => ({
    ...idea,
    popularityScore: getPopularityScore(idea),
  }));
  res.json(enriched);
});

// GET stats
app.get("/api/stats", (_req, res) => {
  const total = ideas.length;
  const categoryCount = {};
  let difficultySum = 0;

  ideas.forEach((idea) => {
    categoryCount[idea.category] = (categoryCount[idea.category] || 0) + 1;
    difficultySum += idea.difficulty;
  });

  const mostCommonCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  res.json({
    total,
    mostCommonCategory,
    averageDifficulty: total > 0 ? Math.round((difficultySum / total) * 10) / 10 : 0,
    categoryBreakdown: categoryCount,
  });
});

// GET trending (sorted by popularity)
app.get("/api/trending", (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const sorted = [...ideas]
    .map((idea) => ({ ...idea, popularityScore: getPopularityScore(idea) }))
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
  res.json(sorted);
});

// POST new idea
app.post("/api/ideas", (req, res) => {
  const { title, description, problemStatement, category, difficulty, marketPotential } = req.body;

  // Validation
  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
  if (!description?.trim()) return res.status(400).json({ error: "Description is required" });
  if (!problemStatement?.trim()) return res.status(400).json({ error: "Problem statement is required" });
  if (!CATEGORIES.includes(category)) return res.status(400).json({ error: "Invalid category" });
  if (![1, 2, 3, 4, 5].includes(difficulty)) return res.status(400).json({ error: "Difficulty must be 1-5" });
  if (!["Low", "Medium", "High", "Very High"].includes(marketPotential)) return res.status(400).json({ error: "Invalid market potential" });

  // Duplicate check
  if (ideas.some((i) => i.title.toLowerCase() === title.trim().toLowerCase())) {
    return res.status(409).json({ error: "An idea with this title already exists" });
  }

  const newIdea = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    problemStatement: problemStatement.trim(),
    category,
    difficulty,
    marketPotential,
    upvotes: 0,
    createdAt: new Date().toISOString(),
  };

  ideas.unshift(newIdea);
  res.status(201).json({ ...newIdea, popularityScore: getPopularityScore(newIdea) });
});

// PATCH upvote
app.patch("/api/ideas/:id/upvote", (req, res) => {
  const idea = ideas.find((i) => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: "Idea not found" });
  idea.upvotes += 1;
  res.json({ ...idea, popularityScore: getPopularityScore(idea) });
});

// DELETE idea
app.delete("/api/ideas/:id", (req, res) => {
  const index = ideas.findIndex((i) => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Idea not found" });
  ideas.splice(index, 1);
  res.json({ success: true });
});

// ──────────────────────────────────────────
// Start
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ IdeaVault API running on http://localhost:${PORT}`);
  console.log(`  ${ideas.length} seed ideas loaded`);
});
