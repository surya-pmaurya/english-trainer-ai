import {
  BarChart3,
  BookOpen,
  Clock3,
  Flame,
  MessageCircle,
  Mic,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Link } from "react-router-dom";
import PageHeading from "../components/ui/PageHeading";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

const formatDuration = (minutes = 0) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
    : `${minutes}m`;
const modes = [
  {
    icon: MessageCircle,
    title: "Free conversation",
    copy: "Talk naturally about topics you enjoy.",
    to: "/practice?mode=conversation",
    tone: "bg-indigo-50 text-lavender dark:bg-indigo-950",
  },
  {
    icon: Mic,
    title: "Speaking practice",
    copy: "Build confidence with your voice.",
    to: "/practice?mode=speaking",
    tone: "bg-emerald-50 text-mint dark:bg-emerald-950",
  },
  {
    icon: BookOpen,
    title: "Grammar check",
    copy: "Write a sentence and learn from it.",
    to: "/practice?mode=grammar",
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-950",
  },
];
export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/progress/overview")
      .then(({ data }) => setOverview(data.data))
      .catch((e) => setError(getErrorMessage(e)));
  }, []);
  const score = overview?.scores || {};
  const stats = [
    {
      label: "Overall score",
      value: `${score.overall ?? 0}/100`,
      icon: BarChart3,
    },
    { label: "Grammar", value: `${score.grammar ?? 0}/100`, icon: BookOpen },
    { label: "Speaking", value: `${score.speaking ?? 0}/100`, icon: Mic },
    {
      label: "Current streak",
      value: `${overview?.streak?.current ?? user?.currentStreak ?? 0} days`,
      icon: Flame,
      tone: "text-orange-500",
    },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Your learning space"
        title={`Hello, ${user?.name?.split(" ")[0] || "Learner"} 👋`}
      >
        <Link className="btn-primary" to="/practice">
          <MessageCircle size={17} />
          Start practising
        </Link>
      </PageHeading>
      {error && (
        <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </p>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>
      <section className="mt-7 grid gap-7 xl:grid-cols-[1.45fr_.85fr]">
        <div className="surface p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Your progress</h2>
              <p className="mt-1 text-sm text-slate-500">
                Overall score over recent sessions
              </p>
            </div>
            <Link
              className="text-sm font-bold text-lavender hover:underline"
              to="/progress"
            >
              View details
            </Link>
          </div>
          {overview?.scoreHistory?.length ? (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.scoreHistory}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#7469ee" stopOpacity=".25" />
                      <stop offset="100%" stopColor="#7469ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#7469ee"
                    strokeWidth={3}
                    fill="url(#scoreFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>
        <div className="surface p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-950">
              <Target />
            </span>
            <div>
              <h2 className="font-bold">Today’s goal</h2>
              <p className="text-sm text-slate-500">
                A little every day adds up.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold">
                {overview?.dailyGoal?.minutes || 0}
                <span className="text-base font-medium text-slate-400">
                  {" "}
                  / {user?.dailyGoalMinutes || 15} min
                </span>
              </p>
              <span className="text-sm font-bold text-mint">
                {overview?.dailyGoal?.percent || 0}%
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-mint transition-all"
                style={{ width: `${overview?.dailyGoal?.percent || 0}%` }}
              />
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Clock3 size={16} />
              {overview?.dailyGoal?.sessions || 0} sessions completed today
            </p>
          </div>
        </div>
      </section>
      <section className="mt-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              What would you like to work on?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a focused way to practise today.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {modes.map((mode) => (
            <Link
              key={mode.title}
              to={mode.to}
              className="surface group p-5 transition hover:-translate-y-1"
            >
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl ${mode.tone}`}
              >
                <mode.icon size={21} />
              </span>
              <h3 className="mt-5 font-bold group-hover:text-lavender">
                {mode.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode.copy}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-7 surface p-5 sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Recent practice</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pick up where you left off.
            </p>
          </div>
          <Link
            to="/history"
            className="text-sm font-bold text-lavender hover:underline"
          >
            View all
          </Link>
        </div>
        {overview?.recentSessions?.length ? (
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {overview.recentSessions.map((session) => (
              <Link
                className="flex items-center justify-between py-4 first:pt-0 hover:text-lavender"
                key={session.id}
                to={`/history/${session.id}`}
              >
                <span>
                  <b className="block">{session.label}</b>
                  <small className="text-slate-500">
                    {formatDuration(session.duration)} · {session.date}
                  </small>
                </span>
                <b>{session.score}/100</b>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800">
            No sessions yet. Your first conversation is waiting for you.
          </p>
        )}
      </section>
    </div>
  );
}
function EmptyChart() {
  return (
    <div className="mt-6 grid h-64 place-items-center rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800">
      <div>
        <BarChart3 className="mx-auto text-slate-400" />
        <p className="mt-3 font-semibold">Your progress will appear here</p>
        <p className="mt-1 text-sm text-slate-500">
          Complete a practice session to start building your chart.
        </p>
      </div>
    </div>
  );
}
