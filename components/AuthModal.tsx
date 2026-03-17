"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { X, Loader2 } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!form.email || !form.password || (!isLogin && !form.name)) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = isLogin 
        ? await api.login(form.email, form.password)
        : await api.register(form.name, form.email, form.password);

      if (res.error) {
        setError(res.error);
      } else if (res.token && res.user) {
        onSuccess(res.user, res.token);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="dialog-content flex flex-col max-w-sm" role="dialog" aria-modal="true" id="auth-dialog">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center btn-ghost"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            className="text-sm p-3 mb-4 rounded-lg border font-medium text-center"
            style={{ background: "var(--accent-light)", borderColor: "var(--accent)", color: "var(--danger)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-full border text-sm transition-shadow"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-full border text-sm transition-shadow"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-full border text-sm transition-shadow"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-full text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="font-bold underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: "var(--text-primary)" }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </>
  );
}
