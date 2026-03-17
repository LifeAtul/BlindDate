import { Idea, IdeaStats, IdeaFilters, Category } from "./types";

const STORAGE_KEY = "startup-ideas";

// Seed data for demo
const SEED_IDEAS: Idea[] = [
  {
    id: "seed-1",
    title: "QuickHire AI",
    description: "AI-powered resume screening and candidate matching platform for small businesses that can't afford enterprise HR tools.",
    problemStatement: "Small businesses waste 40+ hours per hire manually screening resumes and conducting initial interviews.",
    category: "AI/ML",
    difficulty: 4,
    marketPotential: "Very High",
    upvotes: 24,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "seed-2",
    title: "FreshCart",
    description: "Hyperlocal grocery delivery connecting neighborhood stores with customers within 2km radius for 15-minute delivery.",
    problemStatement: "Local grocery stores are losing customers to large delivery apps despite having fresher products and lower prices.",
    category: "E-Commerce",
    difficulty: 3,
    marketPotential: "High",
    upvotes: 18,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "seed-3",
    title: "StudyBuddy",
    description: "Peer-to-peer learning platform where students can find study partners based on courses, schedule, and learning style.",
    problemStatement: "Students study alone and struggle to find compatible study groups, leading to lower academic performance.",
    category: "EdTech",
    difficulty: 2,
    marketPotential: "Medium",
    upvotes: 12,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "seed-4",
    title: "SplitWise Pro",
    description: "Subscription expense splitter for roommates and couples that auto-detects recurring charges and suggests fair splits.",
    problemStatement: "Shared subscriptions cause conflicts when one person pays and others forget to reimburse.",
    category: "FinTech",
    difficulty: 2,
    marketPotential: "High",
    upvotes: 31,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "seed-5",
    title: "MediTrack",
    description: "Medication reminder and health tracking app for elderly patients with family dashboard for remote monitoring.",
    problemStatement: "Elderly patients often miss medications or take wrong doses, leading to hospital readmissions.",
    category: "HealthTech",
    difficulty: 3,
    marketPotential: "Very High",
    upvotes: 27,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "seed-6",
    title: "DevFlow",
    description: "Visual workflow builder for CI/CD pipelines that generates GitHub Actions YAML from drag-and-drop interfaces.",
    problemStatement: "Developers waste time writing and debugging YAML configs for CI/CD instead of focusing on code.",
    category: "Developer Tools",
    difficulty: 4,
    marketPotential: "High",
    upvotes: 15,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "seed-7",
    title: "LocalBuzz",
    description: "Community-driven social platform for neighborhood events, recommendations, and local business promotions.",
    problemStatement: "People don't know what's happening in their own neighborhood and miss local events and deals.",
    category: "Social",
    difficulty: 2,
    marketPotential: "Medium",
    upvotes: 9,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "seed-8",
    title: "CloudMenu",
    description: "SaaS platform for restaurants to create digital menus with QR codes, real-time updates, and multi-language support.",
    problemStatement: "Restaurants still use expensive printed menus that can't be updated quickly for out-of-stock items or specials.",
    category: "SaaS",
    difficulty: 1,
    marketPotential: "High",
    upvotes: 20,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getIdeas(): Idea[] {
  if (typeof window === "undefined") return SEED_IDEAS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_IDEAS));
    return SEED_IDEAS;
  }
  return JSON.parse(stored);
}

export function saveIdeas(ideas: Idea[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
}

export function addIdea(idea: Omit<Idea, "id" | "upvotes" | "createdAt">): { success: boolean; error?: string; idea?: Idea } {
  const ideas = getIdeas();

  // Validation
  if (!idea.title.trim()) return { success: false, error: "Title is required" };
  if (!idea.description.trim()) return { success: false, error: "Description is required" };
  if (!idea.problemStatement.trim()) return { success: false, error: "Problem statement is required" };
  if (!idea.category) return { success: false, error: "Category is required" };

  // Check duplicate
  const duplicate = ideas.find((i) => i.title.toLowerCase().trim() === idea.title.toLowerCase().trim());
  if (duplicate) return { success: false, error: "An idea with this title already exists" };

  const newIdea: Idea = {
    ...idea,
    id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    upvotes: 0,
    createdAt: new Date().toISOString(),
  };

  ideas.unshift(newIdea);
  saveIdeas(ideas);
  return { success: true, idea: newIdea };
}

export function upvoteIdea(id: string): Idea[] {
  const ideas = getIdeas();
  const idx = ideas.findIndex((i) => i.id === id);
  if (idx !== -1) {
    ideas[idx].upvotes += 1;
    saveIdeas(ideas);
  }
  return ideas;
}

export function deleteIdea(id: string): Idea[] {
  const ideas = getIdeas().filter((i) => i.id !== id);
  saveIdeas(ideas);
  return ideas;
}

export function filterIdeas(ideas: Idea[], filters: IdeaFilters): Idea[] {
  return ideas.filter((idea) => {
    if (filters.category && filters.category !== "All" && idea.category !== filters.category) return false;
    if (filters.difficulty && filters.difficulty !== "All" && idea.difficulty !== Number(filters.difficulty)) return false;
    if (filters.marketPotential && filters.marketPotential !== "All" && idea.marketPotential !== filters.marketPotential) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        idea.title.toLowerCase().includes(q) ||
        idea.description.toLowerCase().includes(q) ||
        idea.problemStatement.toLowerCase().includes(q) ||
        idea.category.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

export function getStats(ideas: Idea[]): IdeaStats {
  if (ideas.length === 0) {
    return { total: 0, mostCommonCategory: "N/A", averageDifficulty: 0, categoryBreakdown: {} };
  }

  const categoryBreakdown: Record<string, number> = {};
  let totalDifficulty = 0;

  ideas.forEach((idea) => {
    categoryBreakdown[idea.category] = (categoryBreakdown[idea.category] || 0) + 1;
    totalDifficulty += idea.difficulty;
  });

  const mostCommonCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0][0];

  return {
    total: ideas.length,
    mostCommonCategory,
    averageDifficulty: Math.round((totalDifficulty / ideas.length) * 10) / 10,
    categoryBreakdown,
  };
}

export function getTrendingIdeas(ideas: Idea[]): Idea[] {
  return [...ideas].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
}
