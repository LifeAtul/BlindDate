"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Plus, Rocket, LayoutDashboard, TrendingUp, BarChart3, Info } from "lucide-react";

interface HeaderProps {
  onNewIdea: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ onNewIdea, activeSection, onNavigate }: HeaderProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 btn-ghost px-2 py-1.5 -ml-2 rounded-lg"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Rocket className="w-4 h-4" style={{ color: dark ? "#fff" : "#fff" }} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-bold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
                IdeaVault
              </span>
              <span className="text-[10px] font-medium leading-tight" style={{ color: "var(--text-muted)" }}>
                Startup Idea Validator
              </span>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center btn-ghost"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Toggle theme"
              data-tooltip={dark ? "Light mode" : "Dark mode"}
              id="theme-toggle"
            >
              {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={onNewIdea}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ background: "var(--accent)", color: "#ffffff" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--accent)"}
              id="submit-idea-btn"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Idea</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto" id="main-nav">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="nav-tab flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap"
                style={{
                  borderColor: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                }}
                id={`nav-${item.id}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
