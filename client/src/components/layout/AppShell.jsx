import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  Flame,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  TriangleAlert,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Brand from "../ui/Brand";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const items = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Practice", "/practice", Bot],
  ["Progress", "/progress", BarChart3],
  ["Mistakes", "/mistakes", TriangleAlert],
  ["Vocabulary", "/vocabulary", BookOpen],
  ["History", "/history", History],
];

const pageTitles = {
  "/dashboard": "Dashboard",
  "/practice": "Practice Studio",
  "/progress": "Progress & Insights",
  "/mistakes": "Mistake Patterns",
  "/vocabulary": "Vocabulary Bank",
  "/history": "Practice History",
  "/profile": "Account Profile",
  "/settings": "App Settings",
};

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/history/") ? "Session Review" : "English Trainer");

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
      <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Menu
      </div>
      {items.map(([label, to, Icon]) => (
        <NavLink
          key={to}
          to={to}
          onClick={close}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-indigo-50 text-lavender shadow-sm dark:bg-indigo-950/60 dark:text-indigo-300 font-bold"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div className="mt-auto space-y-1 pt-6">
        <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Account
        </div>
        <NavLink
          to="/settings"
          onClick={close}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-indigo-50 text-lavender font-bold dark:bg-indigo-950/60"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-ink dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {nav}
        </div>
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint/15 text-sm font-bold text-mint">
              {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name || "Learner"}
              </span>
              <span className="block text-xs text-slate-500 truncate">
                {user?.englishLevel || "Getting started"}
              </span>
            </span>
            <ChevronRight size={16} className="text-slate-400 shrink-0" />
          </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={close}
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <Brand />
              <button
                aria-label="Close menu"
                onClick={close}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:pl-64">
        {/* Desktop Top Navigation Bar */}
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 lg:flex">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {currentTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter Badge */}
            <div
              title="Consecutive daily practice streak"
              className="flex items-center gap-1.5 rounded-full border border-orange-200/70 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-400"
            >
              <Flame size={15} className="text-orange-500 animate-pulse" />
              <span>{user?.currentStreak || 0} days streak</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Quick Practice CTA */}
            {location.pathname !== "/practice" && (
              <Link
                to="/practice"
                className="btn-primary py-2 px-3.5 text-xs font-bold shadow-sm"
              >
                <Bot size={15} />
                <span>Practice Room</span>
              </Link>
            )}

            {/* Profile Avatar Chip */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white/60 p-1.5 pr-3 hover:bg-white dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-mint/15 text-xs font-bold text-mint">
                {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
              </span>
              <span className="text-left text-xs">
                <span className="block font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                  {user?.name?.split(" ")[0] || "Learner"}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium truncate">
                  {user?.englishLevel || "Intermediate"}
                </span>
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 xl:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

