"use client";

import { IdeaStats } from "@/lib/types";

interface StatsPanelProps {
  stats: IdeaStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const items = [
    { label: "Total Ideas", value: stats.total },
    { label: "Top Category", value: stats.mostCommonCategory },
    { label: "Avg. Difficulty", value: stats.averageDifficulty > 0 ? `${stats.averageDifficulty} / 5` : "—" },
    { label: "Categories", value: Object.keys(stats.categoryBreakdown).length },
  ];

  const sortedCategories = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1]);
  const maxCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  return (
    <section className="mt-5 mb-6" id="stats-panel">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="stat-card rounded-xl px-4 py-4 border cursor-default"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {item.label}
            </p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {sortedCategories.length > 0 && (
        <div
          className="stat-card rounded-xl border p-4 cursor-default"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}
        >
          <h3 className="text-sm font-bold mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>
            Ideas by Category
          </h3>
          <div className="space-y-2.5">
            {sortedCategories.map(([category, count]) => (
              <div key={category} className="flex items-center gap-3 group">
                <span className="text-xs font-medium w-28 truncate transition-colors group-hover:opacity-80" style={{ color: "var(--text-secondary)" }}>
                  {category}
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                  <div
                    className="chart-bar h-full rounded-full"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <span className="text-xs font-bold w-6 text-right tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
