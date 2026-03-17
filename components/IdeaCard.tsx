"use client";

import { Eye } from "lucide-react";
import { Idea, DIFFICULTY_LABELS, DifficultyLevel, getPopularityScore } from "@/lib/types";
import { ChevronUp, Trash2 } from "lucide-react";

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

interface IdeaCardProps {
  idea: Idea;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  onClick: (idea: Idea) => void;
  index: number;
}

export default function IdeaCard({ idea, onUpvote, onDelete, onClick, index }: IdeaCardProps) {
  const timeAgo = getTimeAgo(idea.createdAt);
  const popularity = getPopularityScore(idea);

  return (
    <div
      className="idea-card rounded-xl border flex flex-col animate-slide-up group cursor-pointer"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border)",
        animationDelay: `${index * 40}ms`,
      }}
      onClick={() => onClick(idea)}
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
          <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold mb-1.5 leading-snug tracking-tight group-hover:underline decoration-2 underline-offset-2" style={{ color: "var(--text-primary)" }}>
          {idea.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] mb-3 leading-relaxed" style={{ color: "var(--text-secondary)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {idea.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: difficultyColors[idea.difficulty], background: `${difficultyColors[idea.difficulty]}10` }}
          >
            {idea.difficulty}/5 · {DIFFICULTY_LABELS[idea.difficulty]}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: marketColors[idea.marketPotential], background: `${marketColors[idea.marketPotential]}10` }}
          >
            {idea.marketPotential}
          </span>
        </div>
        
        {/* Author & Views */}
        <div className="flex items-center justify-between mt-auto">
           <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
             By <span className="font-bold" style={{ color: "var(--text-primary)" }}>{idea.authorName || "Anonymous"}</span>
           </span>
           <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--text-muted)" }}>
             <Eye className="w-3.5 h-3.5" />
             {idea.viewCount || 0}
           </span>
        </div>
      </div>

      {/* Footer (Actions) */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-t"
        style={{ borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking footer
      >
        <button
          onClick={(e) => onUpvote(idea.id, e)}
          className="upvote-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
          style={{ color: "var(--accent)" }}
          id={`upvote-${idea.id}`}
        >
          <ChevronUp className="w-4 h-4" />
          {idea.upvotes}
        </button>
        {onDelete && (
          <button
            onClick={(e) => onDelete(idea.id, e)}
            className="delete-btn p-2 rounded-full"
            style={{ color: "var(--text-muted)" }}
            id={`delete-${idea.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
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
