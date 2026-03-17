const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error("Not logged in");
    return res.json();
  },

  // Ideas
  async getIdeas(status: string = "ACTIVE") {
    const res = await fetch(`${API_BASE}/ideas?status=${status}`);
    if (!res.ok) throw new Error("Failed to fetch ideas");
    return res.json();
  },
  
  async getMyIdeas(userId: string) {
    const res = await fetch(`${API_BASE}/ideas?status=ALL&authorId=${userId}`);
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
    expiresInHours?: number;
  }) {
    const res = await fetch(`${API_BASE}/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error };
    return { success: true, idea: json };
  },

  async updateIdea(id: string, data: any) {
    const res = await fetch(`${API_BASE}/ideas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error };
    return { success: true, idea: json };
  },

  async upvoteIdea(id: string) {
    const res = await fetch(`${API_BASE}/ideas/${id}/upvote`, { 
      method: "PATCH",
      headers: { ...getAuthHeader() } 
    });
    if (!res.ok) throw new Error("Failed to upvote");
    return res.json();
  },

  async deleteIdea(id: string) {
    const res = await fetch(`${API_BASE}/ideas/${id}`, { 
      method: "DELETE",
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
  },

  async recordView(id: string) {
    const res = await fetch(`${API_BASE}/ideas/${id}/view`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to record view");
    return res.json();
  }
};
