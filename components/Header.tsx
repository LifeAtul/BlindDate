"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, LogOut, Sun, Moon, Plus, Rocket, LayoutDashboard, TrendingUp, BarChart3, Info } from "lucide-react";
import { User } from "@/lib/types";

interface HeaderProps {
  onNewIdea: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

export default function Header({ onNewIdea, activeSection, onNavigate, user, onLoginClick, onLogout }: HeaderProps) {
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
    ...(user ? [{ id: "archived", label: "My Ideas & Archived", icon: BarChart3 }] : []),
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 pt-2">
          {/* Logo */}
          <button onClick={() => onNavigate("dashboard")} className="flex items-center gap-2.5 btn-ghost px-2 py-1.5 -ml-2 rounded-lg">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <Rocket className="w-4 h-4" style={{ color: dark ? "#fff" : "#fff" }} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[15px] font-bold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>IdeaVault</span>
              <span className="text-[10px] font-medium leading-tight" style={{ color: "var(--text-muted)" }}>Startup Idea Validator</span>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center btn-ghost"
              style={{ color: "var(--text-secondary)" }}
              data-tooltip={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--bg-secondary)" }}>
                  <UserIcon className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{user.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="w-8 h-8 rounded-full flex items-center justify-center btn-ghost"
                  style={{ color: "var(--danger)" }}
                  data-tooltip="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-1.5 text-sm font-bold rounded-full btn-ghost"
                style={{ color: "var(--text-primary)" }}
              >
                Log In
              </button>
            )}

            <button
              onClick={onNewIdea}
              className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Idea</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-1 mt-1 -mb-px overflow-x-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="nav-tab flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap"
                style={{
                  borderColor: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                }}
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
