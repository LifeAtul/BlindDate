const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = {
  async getIdeas() {
    const res = await fetch(`${API_BASE}/ideas`);
    if (!res.ok) throw new Error("Failed to fetch ideas");
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  async getTrending(limit = 5) {
    const res = await fetch(`${API_BASE}/trending?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch trending");
    return res.json();
  },

  async addIdea(data: {
    title: string;
    description: string;
    problemStatement: string;
    category: string;
    difficulty: number;
    marketPotential: string;
  }) {
    const res = await fetch(`${API_BASE}/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error };
    return { success: true, idea: json };
  },

  async upvoteIdea(id: string) {
    const res = await fetch(`${API_BASE}/ideas/${id}/upvote`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to upvote");
    return res.json();
  },

  async deleteIdea(id: string) {
    const res = await fetch(`${API_BASE}/ideas/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
  },
};
