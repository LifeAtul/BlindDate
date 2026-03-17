"use client";

import { Idea, DIFFICULTY_LABELS, getPopularityScore } from "@/lib/types";
import { ChevronUp, TrendingUp } from "lucide-react";

interface TrendingSectionProps {
  ideas: Idea[];
  onUpvote: (id: string) => void;
}

export default function TrendingSection({ ideas, onUpvote }: TrendingSectionProps) {
  if (ideas.length === 0) return null;

  return (
    <section className="mb-6" id="trending-section">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
        <h2 className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Trending
        </h2>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
          Top {ideas.length}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {ideas.map((idea, i) => {
          const popularity = getPopularityScore(idea);
          return (
            <div
              key={idea.id}
              className="trending-card flex-shrink-0 w-56 rounded-xl border p-3.5 cursor-default"
              style={{
                background: "var(--bg-elevated)",
                borderColor: i === 0 ? "var(--accent)" : "var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {idea.category}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: i === 0 ? "var(--accent)" : "var(--bg-secondary)",
                    color: i === 0 ? "white" : "var(--text-muted)",
                  }}
                >
                  #{i + 1}
                </span>
              </div>
              <h4 className="text-sm font-bold mb-1 truncate tracking-tight" style={{ color: "var(--text-primary)" }}>
                {idea.title}
              </h4>
              <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {idea.description}
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onUpvote(idea.id)}
                  className="upvote-btn flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full"
                  style={{ color: "var(--accent)" }}
                >
                  <ChevronUp className="w-3 h-3" />
                  {idea.upvotes}
                </button>
                <span className="text-[10px] font-bold tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {popularity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
