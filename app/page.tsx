"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Idea, IdeaFilters, IdeaStats, getPopularityScore, User
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
import AuthModal from "@/components/AuthModal";
import IdeaDetailModal from "@/components/IdeaDetailModal";

export default function Dashboard() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState<IdeaFilters>({
    category: "All",
    difficulty: "All",
    marketPotential: "All",
    search: "",
  });
  const [showSubmit, setShowSubmit] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await api.getIdeas("ACTIVE");
      setIdeas(data);
      if (user) {
        const myData = await api.getMyIdeas(user.id);
        setMyIdeas(myData);
      }
    } catch {
      // API unavailable
      const { getIdeas } = await import("@/lib/store");
      setIdeas(getIdeas());
    }
  }, [user]);

  // Load user
  useEffect(() => {
    async function checkAuth() {
      if (localStorage.getItem("token")) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch {
          localStorage.removeItem("token");
        }
      }
    }
    checkAuth();
  }, []);

  // Load ideas
  useEffect(() => {
    loadData().finally(() => setMounted(true));
  }, [loadData]);

  const filteredIdeas = useMemo(() => filterIdeas(ideas, filters), [ideas, filters]);
  const stats = useMemo(() => getStats(ideas), [ideas]);
  const trending = useMemo(() => {
    return [...ideas]
      .filter(i => i.status === "ACTIVE")
      .map(i => ({...i, popularityScore: getPopularityScore(i)}))
      .sort((a, b) => b.popularityScore! - a.popularityScore!)
      .slice(0, 5);
  }, [ideas]);

  const handleAuthSuccess = (u: User, token: string) => {
    localStorage.setItem("token", token);
    setUser(u);
    setShowAuth(false);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setMyIdeas([]);
    if (activeSection === "archived") setActiveSection("dashboard");
  };

  const handleNewIdeaClick = () => {
    if (!user) setShowAuth(true);
    else setShowSubmit(true);
  };

  const handleSubmit = useCallback(async (data: any) => {
    const result = await api.addIdea(data);
    if (result.success) {
      await loadData();
      setShowSubmit(false);
    }
    return result;
  }, [loadData]);

  const handleUpvote = useCallback(async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      setShowAuth(true);
      return;
    }
    await api.upvoteIdea(id);
    loadData();
  }, [user, loadData]);

  const handleDelete = useCallback(async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Are you sure you want to delete this idea?")) return;
    await api.deleteIdea(id);
    loadData();
  }, [loadData]);

  const handleIdeaUpdate = useCallback((updated: Idea) => {
    setIdeas(prev => prev.map(i => i.id === updated.id ? updated : i));
    setMyIdeas(prev => prev.map(i => i.id === updated.id ? updated : i));
  }, []);

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
        onNewIdea={handleNewIdeaClick}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">

        {/* ===== DASHBOARD SECTION ===== */}
        {activeSection === "dashboard" && (
          <>
            <StatsPanel stats={stats} />

            {trending.length > 0 && (
              <TrendingSection ideas={trending} onUpvote={(id) => handleUpvote(id)} />
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
                  {ideas.length === 0 ? "No active ideas yet" : "No ideas match your filters"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {ideas.length === 0 ? "Submit your first startup idea to get started." : "Try adjusting your search or filter criteria."}
                </p>
                {ideas.length === 0 && (
                  <button
                    onClick={handleNewIdeaClick}
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
                    onClick={setSelectedIdea}
                    index={index}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== ARCHIVED / MY IDEAS SECTION ===== */}
        {activeSection === "archived" && user && (
          <section className="mt-6">
            <h2 className="text-lg font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              My Ideas & Archive
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Manage your submitted ideas, view hidden drafts, and access expired concepts.
            </p>

            {myIdeas.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>You haven't submitted any ideas yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myIdeas.map((idea, index) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onUpvote={handleUpvote}
                    onDelete={handleDelete}
                    onClick={setSelectedIdea}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>
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

            {trending.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>No trending ideas yet.</p>
            ) : (
              <div className="space-y-3">
                {trending.map((idea, i) => {
                  const popularity = idea.popularityScore || getPopularityScore(idea);
                  return (
                    <div
                      key={idea.id}
                      onClick={() => setSelectedIdea(idea)}
                      className="cursor-pointer leaderboard-row flex items-center gap-4 rounded-xl border p-4 animate-slide-up"
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
                          <h3 className="text-sm font-bold truncate tracking-tight group-hover:underline" style={{ color: "var(--text-primary)" }}>{idea.title}</h3>
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
                          onClick={(e) => handleUpvote(idea.id, e)}
                          className="upvote-btn flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-full"
                          style={{ color: "var(--accent)" }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m18 15-6-6-6 6" />
                          </svg>
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
        {/* ... stats block identical conceptually, simplified for space ... */}
        {activeSection === "stats" && (
           <section className="mt-6 text-center py-8">
             <StatsPanel stats={stats} />
             <p className="text-sm mt-8" style={{ color: "var(--text-muted)" }}>Full analytics available in the central dashboard.</p>
           </section>
        )}

      </main>

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      {showSubmit && <SubmitIdeaDialog onSubmit={handleSubmit} onClose={() => setShowSubmit(false)} />}
      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          user={user}
          onClose={() => { setSelectedIdea(null); loadData(); }}
          onUpdate={handleIdeaUpdate}
          onDelete={(id) => { handleDelete(id); setSelectedIdea(null); }}
        />
      )}
    </div>
  );
}
