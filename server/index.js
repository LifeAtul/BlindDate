require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-hackathon";

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// ──────────────────────────────────────────
// Helper: compute popularity score
// ──────────────────────────────────────────
function getPopularityScore(idea, upvoteCount) {
  const marketWeights = { Low: 1, Medium: 2, High: 3, "Very High": 4 };
  const mw = marketWeights[idea.marketPotential] || 1;
  return (upvoteCount * 2) + (mw * 5) + ((6 - idea.difficulty) * 3);
}

// ──────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch(err) {
    res.status(500).json({ error: "Failed to load user" });
  }
});


// ──────────────────────────────────────────
// Idea Routes
// ──────────────────────────────────────────

// Helper to format ideas and check expiry
const formatIdea = (idea) => {
  const upvoteCount = idea._count?.upvotes || 0;
  return {
    ...idea,
    upvotes: upvoteCount,
    popularityScore: getPopularityScore(idea, upvoteCount),
    authorName: idea.author?.name
  };
};

app.get("/api/ideas", async (req, res) => {
  try {
    const { status = "ACTIVE", authorId } = req.query;
    
    // Auto-update expired items
    await prisma.idea.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { not: "ARCHIVED" }
      },
      data: { status: "ARCHIVED" }
    });

    const where = {};
    if (authorId) where.authorId = authorId;
    if (status !== "ALL") where.status = status;

    const ideas = await prisma.idea.findMany({
      where,
      include: { 
        _count: { select: { upvotes: true } },
        author: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(ideas.map(formatIdea));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});

// GET trending (sorted by absolute popularity score formula)
app.get("/api/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const ideas = await prisma.idea.findMany({
      where: { status: "ACTIVE" },
      include: {
        _count: { select: { upvotes: true } },
        author: { select: { name: true } }
      }
    });

    const formatted = ideas.map(formatIdea)
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending" });
  }
});

// GET stats
app.get("/api/stats", async (req, res) => {
  try {
    const ideas = await prisma.idea.findMany({ where: { status: "ACTIVE" } });
    
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
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// POST new idea (Protected)
app.post("/api/ideas", authenticateToken, async (req, res) => {
  try {
    const { title, description, problemStatement, category, difficulty, marketPotential, expiresInHours } = req.body;

    const existing = await prisma.idea.findUnique({ where: { title: title.trim() } });
    if (existing) return res.status(409).json({ error: "An idea with this title already exists" });

    let expiresAt = null;
    if (expiresInHours) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    const newIdea = await prisma.idea.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        problemStatement: problemStatement.trim(),
        category,
        difficulty: Number(difficulty),
        marketPotential,
        expiresAt,
        authorId: req.user.userId
      },
      include: {
        _count: { select: { upvotes: true } },
        author: { select: { name: true }}
      }
    });

    res.status(201).json(formatIdea(newIdea));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create idea" });
  }
});

// PUT update idea (Protected, Author only)
app.put("/api/ideas/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, problemStatement, category, difficulty, marketPotential, status } = req.body;
    
    const idea = await prisma.idea.findUnique({ where: { id: req.params.id } });
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    if (idea.authorId !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });

    const updated = await prisma.idea.update({
      where: { id: req.params.id },
      data: {
        title, description, problemStatement, category,
        difficulty: Number(difficulty), marketPotential, status
      },
      include: {
        _count: { select: { upvotes: true } },
        author: { select: { name: true }}
      }
    });

    res.json(formatIdea(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to update idea" });
  }
});

// DELETE idea (Protected, Author only)
app.delete("/api/ideas/:id", authenticateToken, async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({ where: { id: req.params.id } });
    if (!idea) return res.status(404).json({ error: "Idea not found" });
    if (idea.authorId !== req.user.userId) return res.status(403).json({ error: "Unauthorized" });

    await prisma.idea.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete idea" });
  }
});

// PATCH upvote (Protected)
app.patch("/api/ideas/:id/upvote", authenticateToken, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const userId = req.user.userId;

    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) return res.status(404).json({ error: "Idea not found" });

    const existingUpvote = await prisma.upvote.findUnique({
      where: { userId_ideaId: { userId, ideaId } }
    });

    if (existingUpvote) {
      await prisma.upvote.delete({ where: { id: existingUpvote.id } });
    } else {
      await prisma.upvote.create({ data: { userId, ideaId } });
    }

    // Return updated idea
    const updatedIdea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        _count: { select: { upvotes: true } },
        author: { select: { name: true }}
      }
    });

    res.json(formatIdea(updatedIdea));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upvote idea" });
  }
});

// POST view count (Public)
app.post("/api/ideas/:id/view", async (req, res) => {
  try {
    const updated = await prisma.idea.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
      include: {
        _count: { select: { upvotes: true } },
        author: { select: { name: true }}
      }
    });
    res.json(formatIdea(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to increment view count" });
  }
});

// ──────────────────────────────────────────
// Start
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✓ IdeaVault API running on http://localhost:${PORT}`);
});
