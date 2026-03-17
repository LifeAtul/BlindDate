"use client";

import { Idea, DIFFICULTY_LABELS, DifficultyLevel, getPopularityScore } from "@/lib/types";
import { ChevronUp, Trash2 } from "lucide-react";

interface IdeaCardProps {
  idea: Idea;
  onUpvote: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

const difficultyColors: Record<DifficultyLevel, string> = {
  1: "#16a34a",
  2: "#2563eb",
  3: "#d97706",
  4: "#dc2626",
  5: "#7c3aed",
};

const marketColors: Record<string, string> = {
  Low: "#999999",
  Medium: "#2563eb",
  High: "#16a34a",
  "Very High": "#d97706",
};

export default function IdeaCard({ idea, onUpvote, onDelete, index }: IdeaCardProps) {
  const timeAgo = getTimeAgo(idea.createdAt);
  const popularity = getPopularityScore(idea);

  return (
    <div
      className="idea-card rounded-xl border flex flex-col animate-slide-up"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border)",
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div className="p-4 flex-1">
        {/* Category + Time */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          >
            {idea.category}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold mb-1.5 leading-snug tracking-tight" style={{ color: "var(--text-primary)" }}>
          {idea.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] mb-3 leading-relaxed" style={{ color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {idea.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: difficultyColors[idea.difficulty],
              background: `${difficultyColors[idea.difficulty]}10`,
            }}
          >
            {idea.difficulty}/5 · {DIFFICULTY_LABELS[idea.difficulty]}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: marketColors[idea.marketPotential],
              background: `${marketColors[idea.marketPotential]}10`,
            }}
          >
            {idea.marketPotential}
          </span>
        </div>

        {/* Popularity */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
            <div
              className="popularity-bar h-full rounded-full"
              style={{
                width: `${Math.min(popularity, 100)}%`,
                background: "var(--accent)",
                opacity: 0.7,
              }}
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: "var(--text-muted)" }}>
            {popularity}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => onUpvote(idea.id)}
          className="upvote-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{ color: "var(--accent)" }}
          id={`upvote-${idea.id}`}
        >
          <ChevronUp className="w-4 h-4" />
          {idea.upvotes}
        </button>
        <button
          onClick={() => onDelete(idea.id)}
          className="delete-btn p-2 rounded-full"
          style={{ color: "var(--text-muted)" }}
          id={`delete-${idea.id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
