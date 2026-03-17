"use client";

import { useState } from "react";
import { Idea, CATEGORIES, MARKET_POTENTIALS, DIFFICULTY_LABELS, DifficultyLevel, Category, MarketPotential } from "@/lib/types";
import { X } from "lucide-react";

interface SubmitIdeaDialogProps {
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string; idea?: any }>;
  onClose: () => void;
}

export default function SubmitIdeaDialog({ onSubmit, onClose }: SubmitIdeaDialogProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    problemStatement: "",
    category: "",
    difficulty: "",
    marketPotential: "",
    expiresInHours: "" as string | undefined,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) { setError("Title is required"); return; }
    if (!form.description.trim()) { setError("Description is required"); return; }
    if (!form.problemStatement.trim()) { setError("Problem statement is required"); return; }
    if (!form.category) { setError("Please select a category"); return; }
    if (!form.difficulty) { setError("Please select difficulty"); return; }
    if (!form.marketPotential) { setError("Please select market potential"); return; }

    setSubmitting(true);
    const result = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      problemStatement: form.problemStatement.trim(),
      category: form.category as Category,
      difficulty: Number(form.difficulty) as DifficultyLevel,
      marketPotential: form.marketPotential as MarketPotential,
      expiresInHours: form.expiresInHours ? Number(form.expiresInHours) : undefined,
    });

    if (!result.success) {
      setError(result.error || "Something went wrong");
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="dialog-content" role="dialog" aria-modal="true" id="submit-dialog">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              New Idea
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Share your startup concept
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center btn-ghost"
            style={{ color: "var(--text-muted)" }}
            id="close-dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            className="text-sm p-3 mb-4 rounded-lg border font-medium"
            style={{ background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--danger)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
              Startup Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter startup name"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              id="input-title"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
              Short Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Briefly describe your idea"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              id="input-description"
              maxLength={300}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
              Problem Statement
            </label>
            <textarea
              value={form.problemStatement}
              onChange={(e) => updateField("problemStatement", e.target.value)}
              placeholder="What problem does this solve?"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              id="input-problem"
              maxLength={300}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: form.category ? "var(--text-primary)" : "var(--text-muted)" }}
                id="input-category"
              >
                <option value="">Select</option>
                {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                Difficulty
              </label>
              <select
                value={form.difficulty}
                onChange={(e) => updateField("difficulty", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: form.difficulty ? "var(--text-primary)" : "var(--text-muted)" }}
                id="input-difficulty"
              >
                <option value="">Select</option>
                {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((d) => (<option key={d} value={d}>{d} — {DIFFICULTY_LABELS[d]}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-muted)" }}>
                Market Potential
              </label>
              <select
                value={form.marketPotential}
                onChange={(e) => updateField("marketPotential", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: form.marketPotential ? "var(--text-primary)" : "var(--text-muted)" }}
                id="input-market"
              >
                <option value="">Select</option>
                {MARKET_POTENTIALS.map((mp) => (<option key={mp} value={mp}>{mp}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 flex justify-between" style={{ color: "var(--text-muted)" }}>
                <span>Expiry</span>
                <span style={{ color: "var(--text-secondary)" }}>Optional</span>
              </label>
              <select
                value={form.expiresInHours}
                onChange={(e) => updateField("expiresInHours", e.target.value)}
                className="w-full px-4 py-3 rounded-full border text-sm transition-shadow"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: form.expiresInHours !== undefined ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                <option value={undefined}>Never (Default)</option>
                <option value={24}>24 Hours</option>
                <option value={48}>48 Hours</option>
                <option value={168}>7 Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#ffffff" }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "var(--accent-hover)"; }}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent)"}
            id="submit-btn"
          >
            {submitting ? "Submitting..." : "Submit Idea"}
          </button>
        </form>
      </div>
    </>
  );
}
