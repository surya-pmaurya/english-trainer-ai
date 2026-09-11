import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  CircleUserRound,
  Flame,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Brand from "../ui/Brand";
import { useAuth } from "../../context/AuthContext";

const items = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Practice", "/practice", Bot],
  ["Progress", "/progress", BarChart3],
  ["Mistakes", "/mistakes", TriangleAlert],
  ["Vocabulary", "/vocabulary", BookOpen],
  ["History", "/history", History],
];
export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const signOut = async () => {
    await logout();
    navigate("/login");
  };
  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-7">
      {items.map(([label, to, Icon]) => (
        <NavLink
          key={to}
          to={to}
          onClick={close}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-indigo-50 text-lavender dark:bg-indigo-950/60" : "text-slate-500 hover:bg-slate-100 hover:text-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
      <div className="mt-auto space-y-1">
        <NavLink
          to="/settings"
          onClick={close}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Settings size={19} />
          Settings
        </NavLink>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40"
        >
          <LogOut size={19} />
          Log out
        </button>
      </div>
    </nav>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[252px_1fr]">
      <aside className="fixed inset-y-0 z-30 hidden w-[252px] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="px-6 py-6">
          <Brand />
        </div>
        {nav}
        <Link
          to="/profile"
          className="m-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-mint/15 text-sm font-bold text-mint">
            {user?.name?.slice(0, 1) || "U"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {user?.name || "Learner"}
            </span>
            <span className="block text-xs text-slate-500">
              {user?.englishLevel || "Getting started"}
            </span>
          </span>
          <ChevronRight size={16} />
        </Link>
      </aside>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:hidden">
        <Brand />
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={close}
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative flex h-full w-72 flex-col bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between px-5 py-5">
              <Brand />
              <button aria-label="Close menu" onClick={close}>
                <X />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-7 lg:p-9">
        <Outlet />
      </main>
    </div>
  );
}
