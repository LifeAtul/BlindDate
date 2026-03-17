export interface Idea {
  id: string;
  title: string;
  description: string;
  problemStatement: string;
  category: Category;
  difficulty: DifficultyLevel;
  marketPotential: MarketPotential;
  upvotes: number;
  createdAt: string;
}

export type Category =
  | "SaaS"
  | "E-Commerce"
  | "FinTech"
  | "HealthTech"
  | "EdTech"
  | "AI/ML"
  | "Social"
  | "Marketplace"
  | "Developer Tools"
  | "Other";

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type MarketPotential = "Low" | "Medium" | "High" | "Very High";

export const CATEGORIES: Category[] = [
  "SaaS", "E-Commerce", "FinTech", "HealthTech", "EdTech",
  "AI/ML", "Social", "Marketplace", "Developer Tools", "Other",
];

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: "Easy",
  2: "Moderate",
  3: "Hard",
  4: "Very Hard",
  5: "Extremely Hard",
};

export const MARKET_POTENTIALS: MarketPotential[] = ["Low", "Medium", "High", "Very High"];

export interface IdeaFilters {
  category: string;
  difficulty: string;
  marketPotential: string;
  search: string;
}

export interface IdeaStats {
  total: number;
  mostCommonCategory: string;
  averageDifficulty: number;
  categoryBreakdown: Record<string, number>;
}

// Popularity score: combines upvotes + market potential weight + inverse difficulty
const MARKET_WEIGHT: Record<MarketPotential, number> = {
  "Low": 1,
  "Medium": 2,
  "High": 3,
  "Very High": 4,
};

export function getPopularityScore(idea: Idea): number {
  const upvoteScore = idea.upvotes * 2;
  const marketScore = MARKET_WEIGHT[idea.marketPotential] * 5;
  const difficultyBonus = (6 - idea.difficulty) * 3; // easier ideas score slightly higher
  return upvoteScore + marketScore + difficultyBonus;
}
