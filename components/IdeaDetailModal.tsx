"use client";

import { useState, useEffect } from "react";
import { Idea, User } from "@/lib/types";
import { X, Eye, ThumbsUp, Calendar, Loader2, Settings } from "lucide-react";
import { api } from "@/lib/api";

interface IdeaDetailModalProps {
  idea: Idea;
  user: User | null;
  onClose: () => void;
  onUpdate: (updatedIdea: Idea) => void;
  onDelete: (id: string) => void;
}

export default function IdeaDetailModal({ idea: initialIdea, user, onClose, onUpdate, onDelete }: IdeaDetailModalProps) {
  const [idea, setIdea] = useState<Idea>(initialIdea);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialIdea);
  const [loading, setLoading] = useState(true);

  // Increment view count on mount
  useEffect(() => {
    async function recordView() {
      try {
        const res = await api.recordView(idea.id);
        setIdea(res);
        onUpdate(res);
      } catch (err) {
        // silently fail View increment for UX
      } finally {
        setLoading(false);
      }
    }
    recordView();
  }, [idea.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.updateIdea(idea.id, editForm);
      if (res.success) {
        setIdea(res.idea);
        onUpdate(res.idea);
        setIsEditing(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const isAuthor = user?.id === idea.authorId;

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="dialog-content flex flex-col max-w-2xl" role="dialog" aria-modal="true">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {isEditing ? "Edit Idea" : idea.title}
            </h2>
            {!isEditing && idea.status !== "ACTIVE" && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" 
                style={{ background: idea.status === "ARCHIVED" ? "var(--border)" : "var(--accent-light)", color: idea.status === "ARCHIVED" ? "var(--text-secondary)" : "var(--accent)" }}>
                {idea.status}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center btn-ghost flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              className="w-full px-4 py-3 rounded-full border text-sm"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border text-sm"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              rows={3}
            />
            
            <div className="flex items-center justify-between border-t border-b py-4 my-2" style={{ borderColor: "var(--border)" }}>
               <label className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Visibility Status</label>
               <select
                 value={editForm.status}
                 onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                 className="px-4 py-2 rounded-full border text-sm"
                 style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
               >
                 <option value="ACTIVE">Active (Public)</option>
                 <option value="HIDDEN">Hidden (Private)</option>
               </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full text-sm font-bold btn-ghost"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
               <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {idea.viewCount || 0} Views</span>
               <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /> {idea.upvotes} Upvotes</span>
               <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Created: {new Date(idea.createdAt).toLocaleDateString()}</span>
               {idea.updatedAt && idea.updatedAt !== idea.createdAt && (
                 <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-xs opacity-70" /> Updated: {new Date(idea.updatedAt).toLocaleDateString()}</span>
               )}
               {idea.expiresAt && (
                 <span className="flex items-center gap-1.5">Expires: {new Date(idea.expiresAt).toLocaleDateString()}</span>
               )}
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Description</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{idea.description}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>Problem Statement</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{idea.problemStatement}</p>
            </div>

            <div className="flex flex-wrap gap-2">
               <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>{idea.category}</span>
               <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>Difficulty: {idea.difficulty}/5</span>
               <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>Market: {idea.marketPotential}</span>
            </div>

            {isAuthor && (
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                >
                  <Settings className="w-4 h-4" /> Edit Idea
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this idea?")) {
                      onDelete(idea.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{ color: "var(--danger)" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
