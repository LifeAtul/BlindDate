"use client";

import { IdeaFilters, CATEGORIES, MARKET_POTENTIALS, DIFFICULTY_LABELS, DifficultyLevel } from "@/lib/types";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  filters: IdeaFilters;
  onFilterChange: (key: keyof IdeaFilters, value: string) => void;
  onClear: () => void;
  resultCount: number;
}

export default function FilterBar({ filters, onFilterChange, onClear, resultCount }: FilterBarProps) {
  const hasActiveFilters =
    filters.category !== "All" ||
    filters.difficulty !== "All" ||
    filters.marketPotential !== "All" ||
    filters.search !== "";

  return (
    <section className="mb-5" id="filter-bar">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Search ideas..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border text-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          id="search-input"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange("search", "")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center btn-ghost"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={filters.category}
          onChange={(e) => onFilterChange("category", e.target.value)}
          className="px-3 py-2 rounded-full border text-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: filters.category !== "All" ? "var(--accent)" : "var(--border)",
            color: "var(--text-primary)",
          }}
          id="filter-category"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => onFilterChange("difficulty", e.target.value)}
          className="px-3 py-2 rounded-full border text-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: filters.difficulty !== "All" ? "var(--accent)" : "var(--border)",
            color: "var(--text-primary)",
          }}
          id="filter-difficulty"
        >
          <option value="All">All Difficulties</option>
          {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((d) => (
            <option key={d} value={d}>{d} — {DIFFICULTY_LABELS[d]}</option>
          ))}
        </select>

        <select
          value={filters.marketPotential}
          onChange={(e) => onFilterChange("marketPotential", e.target.value)}
          className="px-3 py-2 rounded-full border text-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: filters.marketPotential !== "All" ? "var(--accent)" : "var(--border)",
            color: "var(--text-primary)",
          }}
          id="filter-market"
        >
          <option value="All">All Market Potential</option>
          {MARKET_POTENTIALS.map((mp) => (
            <option key={mp} value={mp}>{mp}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-xs font-semibold px-3 py-1.5 rounded-full btn-ghost"
              style={{ color: "var(--accent)" }}
              id="clear-filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
