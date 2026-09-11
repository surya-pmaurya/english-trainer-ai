import {
  ArrowRight,
  BookOpen,
  Bot,
  ChartNoAxesCombined,
  CheckCircle2,
  MessageCircle,
  Mic,
  Moon,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "../components/ui/Brand";
import { useTheme } from "../context/ThemeContext";

const features = [
  [
    Bot,
    "AI conversations",
    "Practise natural, level-aware conversations with a patient English coach.",
  ],
  [
    Mic,
    "Speaking practice",
    "Use your microphone when your browser supports speech recognition.",
  ],
  [
    BookOpen,
    "Smart corrections",
    "See concise explanations and more natural ways to say what you mean.",
  ],
  [
    ChartNoAxesCombined,
    "Clear progress",
    "Turn practice sessions into useful scores, patterns, and next steps.",
  ],
];
export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Toggle dark mode"
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Moon size={19} />
          </button>
          <Link
            className="hidden text-sm font-semibold text-slate-600 hover:text-lavender sm:block dark:text-slate-300"
            to="/login"
          >
            Log in
          </Link>
          <Link className="btn-primary px-3 py-2 sm:px-4" to="/register">
            Start learning <ArrowRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
          <div className="absolute -left-36 top-16 -z-10 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/30" />
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Sparkles size={15} />
              Your personal English tutor
            </div>
            <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
              Practice English.{" "}
              <span className="text-lavender">Speak confidently.</span> Improve
              every day.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              A thoughtful AI coach that helps you have real conversations,
              understand your mistakes, and build a learning habit that lasts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/register">
                Start learning free <ArrowRight size={17} />
              </Link>
              <Link className="btn-secondary" to="/login">
                I already have an account
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {[
                "Friendly feedback",
                "Practice at your pace",
                "Your data stays private",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-mint" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="surface relative overflow-hidden p-5 sm:p-7">
              <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[5rem] bg-mint/10" />
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lavender text-white">
                  <Bot />
                </span>
                <div>
                  <p className="font-bold">Your AI Trainer</p>
                  <p className="text-sm text-mint">● Ready to practise</p>
                </div>
              </div>
              <div className="mt-7 space-y-4">
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-indigo-50 p-4 text-sm leading-6 text-slate-700 dark:bg-indigo-950/60 dark:text-slate-200">
                  Hi! Let’s talk about your day. What was one good thing that
                  happened today?
                </div>
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-sm bg-lavender p-4 text-sm leading-6 text-white">
                  I go to the office and I finished my project.
                </div>
                <div className="rounded-2xl border border-mint/20 bg-mint/5 p-4">
                  <p className="text-sm font-bold text-mint">
                    A small improvement
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    “I <b>went</b> to the office and finished my project.” We
                    use <b>went</b> for an action in the past.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-400 dark:border-slate-700">
                <MessageCircle size={17} /> Write a reply…
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-mint">
                Made for real progress
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to turn practice into confidence.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(([Icon, title, copy]) => (
                <article
                  key={title}
                  className="rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-lavender dark:bg-indigo-950">
                    <Icon size={21} />
                  </span>
                  <h3 className="mt-5 font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="surface bg-ink px-7 py-12 text-white dark:bg-indigo-950 sm:px-12">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-mint">
              How it works
            </p>
            <div className="mt-7 grid gap-8 md:grid-cols-4">
              {[
                ["01", "Choose a practice mode"],
                ["02", "Talk with your AI trainer"],
                ["03", "Understand your corrections"],
                ["04", "See your improvement"],
              ].map(([num, copy]) => (
                <div key={num}>
                  <p className="text-4xl font-bold text-mint/70">{num}</p>
                  <p className="mt-2 font-semibold">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
        © {new Date().getFullYear()} English Trainer AI
      </footer>
    </div>
  );
}
