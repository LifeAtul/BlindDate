"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Idea, IdeaFilters, IdeaStats, getPopularityScore,
} from "@/lib/types";
import {
  filterIdeas, getStats, getTrendingIdeas,
} from "@/lib/store";
import { api } from "@/lib/api";
import Header from "@/components/Header";
import StatsPanel from "@/components/StatsPanel";
import FilterBar from "@/components/FilterBar";
import IdeaCard from "@/components/IdeaCard";
import SubmitIdeaDialog from "@/components/SubmitIdeaDialog";
import TrendingSection from "@/components/TrendingSection";

export default function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState<IdeaFilters>({
    category: "All",
    difficulty: "All",
    marketPotential: "All",
    search: "",
  });
  const [showSubmit, setShowSubmit] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [useApi, setUseApi] = useState(false);

  // Load ideas — try API first, fall back to localStorage
  useEffect(() => {
    async function load() {
      try {
        const data = await api.getIdeas();
        setIdeas(data);
        setUseApi(true);
      } catch {
        // API unavailable — use localStorage
        const { getIdeas } = await import("@/lib/store");
        setIdeas(getIdeas());
        setUseApi(false);
      }
      setMounted(true);
    }
    load();
  }, []);

  const filteredIdeas = useMemo(() => filterIdeas(ideas, filters), [ideas, filters]);
  const stats = useMemo(() => getStats(ideas), [ideas]);
  const trending = useMemo(() => getTrendingIdeas(ideas), [ideas]);

  const handleSubmit = useCallback(async (data: Omit<Idea, "id" | "upvotes" | "createdAt">) => {
    if (useApi) {
      const result = await api.addIdea(data);
      if (result.success) {
        const refreshed = await api.getIdeas();
        setIdeas(refreshed);
        setShowSubmit(false);
      }
      return result;
    } else {
      const { addIdea, getIdeas } = await import("@/lib/store");
      const result = addIdea(data);
      if (result.success) {
        setIdeas(getIdeas());
        setShowSubmit(false);
      }
      return result;
    }
  }, [useApi]);

  const handleUpvote = useCallback(async (id: string) => {
    if (useApi) {
      await api.upvoteIdea(id);
      const refreshed = await api.getIdeas();
      setIdeas(refreshed);
    } else {
      const { upvoteIdea } = await import("@/lib/store");
      setIdeas(upvoteIdea(id));
    }
  }, [useApi]);

  const handleDelete = useCallback(async (id: string) => {
    if (useApi) {
      await api.deleteIdea(id);
      const refreshed = await api.getIdeas();
      setIdeas(refreshed);
    } else {
      const { deleteIdea } = await import("@/lib/store");
      setIdeas(deleteIdea(id));
    }
  }, [useApi]);

  const handleFilterChange = useCallback((key: keyof IdeaFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ category: "All", difficulty: "All", marketPotential: "All", search: "" });
  }, []);

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>
      <Header
        onNewIdea={() => setShowSubmit(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">

        {/* ===== DASHBOARD SECTION ===== */}
        {activeSection === "dashboard" && (
          <>
            <StatsPanel stats={stats} />

            {trending.length > 0 && (
              <TrendingSection ideas={trending} onUpvote={handleUpvote} />
            )}

            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
              resultCount={filteredIdeas.length}
            />

            {filteredIdeas.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                  {ideas.length === 0 ? "No ideas yet" : "No ideas match your filters"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {ideas.length === 0 ? "Submit your first startup idea to get started." : "Try adjusting your search or filter criteria."}
                </p>
                {ideas.length === 0 && (
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="mt-3 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
                  >
                    Submit an Idea
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIdeas.map((idea, index) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onUpvote={handleUpvote}
                    onDelete={handleDelete}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== TRENDING SECTION ===== */}
        {activeSection === "trending" && (
          <section className="mt-6">
            <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              Trending & Popular Ideas
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Ideas ranked by popularity score — based on upvotes, market potential, and difficulty.
            </p>

            {ideas.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>No ideas submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {[...ideas]
                  .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
                  .map((idea, i) => {
                    const popularity = getPopularityScore(idea);
                    return (
                      <div
                        key={idea.id}
                        className="leaderboard-row flex items-center gap-4 rounded-xl border p-4 animate-slide-up"
                        style={{
                          background: "var(--bg-elevated)",
                          borderColor: i === 0 ? "var(--accent)" : "var(--border)",
                          animationDelay: `${i * 40}ms`,
                        }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            background: i === 0 ? "var(--accent)" : "var(--bg-secondary)",
                            color: i === 0 ? "var(--bg-primary)" : "var(--text-muted)",
                          }}
                        >
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold truncate tracking-tight" style={{ color: "var(--text-primary)" }}>{idea.title}</h3>
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                              {idea.category}
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{idea.description}</p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-base font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{popularity}</p>
                            <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Score</p>
                          </div>
                          <button
                            onClick={() => handleUpvote(idea.id)}
                            className="upvote-btn flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-full"
                            style={{ color: "var(--accent)" }}
                          >
                            <ChevronUpIcon />
                            <span className="text-xs font-bold">{idea.upvotes}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        )}

        {/* ===== STATISTICS SECTION ===== */}
        {activeSection === "stats" && (
          <section className="mt-6">
            <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              Statistics & Insights
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Overview of all submitted startup ideas and their metrics.
            </p>

            <StatsPanel stats={stats} />

            {ideas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="stat-card rounded-xl border p-4" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-bold mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>Difficulty Distribution</h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((d) => {
                      const count = ideas.filter((i) => i.difficulty === d).length;
                      const pct = ideas.length > 0 ? (count / ideas.length) * 100 : 0;
                      const labels = ["", "Easy", "Moderate", "Hard", "Very Hard", "Extremely Hard"];
                      return (
                        <div key={d} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-24" style={{ color: "var(--text-secondary)" }}>{d} · {labels[d]}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                            <div className="chart-bar h-full rounded-full" style={{ width: `${pct}%`, background: "var(--accent)" }} />
                          </div>
                          <span className="text-xs font-bold w-6 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="stat-card rounded-xl border p-4" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                  <h3 className="text-sm font-bold mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>Market Potential Distribution</h3>
                  <div className="space-y-2">
                    {["Low", "Medium", "High", "Very High"].map((mp) => {
                      const count = ideas.filter((i) => i.marketPotential === mp).length;
                      const pct = ideas.length > 0 ? (count / ideas.length) * 100 : 0;
                      return (
                        <div key={mp} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-24" style={{ color: "var(--text-secondary)" }}>{mp}</span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                            <div className="chart-bar h-full rounded-full" style={{ width: `${pct}%`, background: "var(--success)" }} />
                          </div>
                          <span className="text-xs font-bold w-6 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== ABOUT SECTION ===== */}
        {activeSection === "about" && (
          <section className="mt-6 max-w-2xl">
            <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              About IdeaVault
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              A platform for submitting, exploring, and validating startup ideas.
            </p>

            <div className="space-y-4">
              <div className="stat-card rounded-xl border p-4" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>How It Works</h3>
                <ul className="space-y-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>1.</span> Submit your startup idea with a title, description, and problem statement.</li>
                  <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>2.</span> Choose a category, rate the difficulty (1–5), and set the market potential.</li>
                  <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>3.</span> Browse all ideas on the dashboard — filter by category, difficulty or market.</li>
                  <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>4.</span> Upvote ideas you like. Popular ideas appear in the Trending section.</li>
                  <li className="flex gap-2"><span style={{ color: "var(--accent)" }}>5.</span> Check the Statistics tab for insights on submitted ideas.</li>
                </ul>
              </div>

              <div className="stat-card rounded-xl border p-4" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Features</h3>
                <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Idea Submission</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Card Dashboard</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Search & Filtering</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Statistics Panel</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Input Validation</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Dark Mode</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Upvoting System</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Trending Section</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> Popularity Score</div>
                  <div className="flex items-center gap-1.5"><span style={{ color: "var(--success)" }}>●</span> REST API Backend</div>
                </div>
              </div>

              <div className="stat-card rounded-xl border p-4" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {["Next.js 15", "TypeScript", "Tailwind CSS", "Express.js", "Node.js", "REST API"].map((tech) => (
                    <span key={tech} className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {showSubmit && (
        <SubmitIdeaDialog
          onSubmit={handleSubmit}
          onClose={() => setShowSubmit(false)}
        />
      )}
    </div>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
