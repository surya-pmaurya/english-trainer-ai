import {
  BookOpen,
  ChevronRight,
  Flame,
  History,
  Lightbulb,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Settings2,
  Target,
  TriangleAlert,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeading from "../components/ui/PageHeading";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api, { getErrorMessage } from "../services/api";

const Empty = ({ icon: Icon = Lightbulb, title, copy, to = "/practice" }) => (
  <div className="surface grid min-h-64 place-items-center p-8 text-center">
    <div>
      <Icon className="mx-auto text-slate-400" />
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {copy}
      </p>
      {to && (
        <Link className="btn-primary mt-5" to={to}>
          Start practice
        </Link>
      )}
    </div>
  </div>
);
function useData(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    api
      .get(url)
      .then(({ data: response }) => setData(response.data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };
  useEffect((reload) => {
    const timeoutId = setTimeout(reload, 0);
    return () => clearTimeout(timeoutId);
  }, [url]);
  return { data, error, loading, reload, setData };
}
const scoreColor = (value) =>
  value >= 75 ? "text-mint" : value >= 55 ? "text-amber-500" : "text-rose-500";
export function ProgressPage() {
  const { data, loading, error, reload } = useData("/progress/overview");
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const scores = data?.scores || {};
  return (
    <div>
      <PageHeading eyebrow="Your growth" title="Progress that makes sense" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries({
          Grammar: scores.grammar,
          Vocabulary: scores.vocabulary,
          Fluency: scores.fluency,
          Speaking: scores.speaking,
        }).map(([name, value]) => (
          <div className="surface p-5" key={name}>
            <p className="text-sm font-semibold text-slate-500">{name}</p>
            <p className={`mt-2 text-4xl font-bold ${scoreColor(value || 0)}`}>
              {value || 0}
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-lavender"
                style={{ width: `${value || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <section className="mt-7 grid gap-7 lg:grid-cols-2">
        <div className="surface p-6">
          <h2 className="text-lg font-bold">Your consistency</h2>
          <div className="mt-6 flex items-center gap-5">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-orange-50 text-orange-500 dark:bg-orange-950">
              <Flame size={30} />
            </span>
            <div>
              <p className="text-3xl font-bold">
                {data?.streak?.current || 0} days
              </p>
              <p className="text-sm text-slate-500">
                Current learning streak · Best: {data?.streak?.longest || 0}{" "}
                days
              </p>
            </div>
          </div>
        </div>
        <div className="surface p-6">
          <h2 className="text-lg font-bold">Keep moving forward</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Complete a focused session and we’ll identify your next most helpful
            practice area from your actual learning history.
          </p>
          <Link className="btn-primary mt-6" to="/practice">
            <Target size={17} />
            Choose a practice
          </Link>
        </div>
      </section>
    </div>
  );
}
export function MistakesPage() {
  const { data, loading, error, reload } = useData("/mistakes");
  const [selectedCategory, setSelectedCategory] = useState("All");
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const mistakes = data?.mistakes || [];

  const categories = ["All", ...new Set(mistakes.map((m) => m.category).filter(Boolean))];
  const filtered = selectedCategory === "All"
    ? mistakes
    : mistakes.filter((m) => m.category === selectedCategory);

  return (
    <div>
      <PageHeading eyebrow="Learn from patterns" title="Your common mistakes" />

      {/* Category Filter Pills on Desktop and Mobile */}
      {mistakes.length > 0 && categories.length > 2 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-lavender text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty
          icon={TriangleAlert}
          title="No recurring mistakes in this category"
          copy="As you practise, helpful patterns will appear here — never every tiny imperfection."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((mistake) => (
            <article key={mistake.id} className="surface p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                    {mistake.category || "Grammar"}
                  </span>
                  <span className="text-right text-xs font-semibold text-slate-400">
                    Noticed {mistake.occurrences} {mistake.occurrences === 1 ? "time" : "times"}
                  </span>
                </div>

                {/* Side-by-side or stacked diff on desktop */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 dark:border-rose-950 dark:bg-rose-950/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                      What you said
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-through">
                      {mistake.originalText}
                    </p>
                  </div>

                  <div className="rounded-xl border border-mint/20 bg-mint/5 p-3 dark:border-mint/30 dark:bg-mint/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mint block mb-1">
                      Better alternative
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {mistake.correctedText}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-600 dark:text-slate-400">
                  {mistake.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <Link
                  to="/practice?mode=grammar"
                  className="text-xs font-bold text-lavender hover:underline"
                >
                  Practice this rule →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
export function VocabularyPage() {
  const { data, loading, error, reload } = useData("/vocabulary");
  const [saving, setSaving] = useState(false);
  const words = data?.vocabulary || [];
  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.post("/vocabulary", Object.fromEntries(form));
      event.currentTarget.reset();
      reload();
    } finally {
      setSaving(false);
    }
  };
  const speakWord = (word) =>
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(word));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div>
      <PageHeading
        eyebrow="Words worth keeping"
        title="Vocabulary collection"
      />
      <form
        onSubmit={save}
        className="surface mb-7 grid gap-3 p-4 md:grid-cols-[1fr_1.4fr_1.4fr_auto]"
      >
        <input required name="word" className="input mt-0" placeholder="Word" />
        <input
          required
          name="meaning"
          className="input mt-0"
          placeholder="Meaning"
        />
        <input
          name="example"
          className="input mt-0"
          placeholder="Example sentence (optional)"
        />
        <button disabled={saving} className="btn-primary">
          <Plus size={17} />
          Save word
        </button>
      </form>
      {words.length === 0 ? (
        <Empty
          icon={BookOpen}
          title="Your vocabulary collection is empty"
          copy="New words suggested during practice will appear here. You can also add your own."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {words.map((word) => (
            <article className="surface p-5 flex flex-col justify-between" key={word.id}>
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{word.word}</h2>
                    <button
                      type="button"
                      onClick={() => speakWord(word.word)}
                      className="text-slate-400 hover:text-lavender p-1 rounded-lg"
                      title="Listen to pronunciation"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  {word.mastered && (
                    <span className="rounded-full bg-mint/10 px-2 py-0.5 text-xs font-bold text-mint">
                      Mastered
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {word.meaning}
                </p>
                {word.example && (
                  <p className="mt-3 border-l-2 border-lavender/50 pl-3 text-xs italic text-slate-500 dark:text-slate-400">
                    “{word.example}”
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
export function HistoryPage() {
  const { data, loading, error, reload } = useData("/practice/history");
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const sessions = data?.sessions || [];
  return (
    <div>
      <PageHeading eyebrow="Your learning record" title="Session history" />
      {sessions.length === 0 ? (
        <Empty
          icon={History}
          title="No completed sessions yet"
          copy="Your completed conversations, feedback, and scores will live here."
        />
      ) : (
        <div className="surface divide-y divide-slate-100 dark:divide-slate-800">
          {sessions.map((session) => (
            <Link
              key={session.id}
              to={`/history/${session.id}`}
              className="flex items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span>
                <b className="capitalize">{session.type} practice</b>
                <small className="mt-1 block text-slate-500">
                  {session.date} · {session.duration} minutes
                </small>
              </span>
              <span className="flex items-center gap-4">
                <b>{session.overallScore}/100</b>
                <ChevronRight className="text-slate-400" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
export function SessionResultPage() {
  const { id } = useParams();
  const { data, loading, error, reload } = useData(`/practice/${id}`);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const session = data?.session;
  return (
    <div>
      <PageHeading eyebrow="Session complete" title="Here’s what you learned">
        <Link className="btn-secondary" to="/history">
          Back to history
        </Link>
      </PageHeading>
      <div className="grid gap-7 lg:grid-cols-[380px_1fr] items-start">
        <section className="surface p-7 lg:sticky lg:top-24">
          <p className="text-sm font-semibold text-slate-500">Overall score</p>
          <p
            className={`mt-2 text-6xl font-bold ${scoreColor(session.overallScore)}`}
          >
            {session.overallScore}
          </p>
          <p className="mt-6 text-sm leading-6 text-slate-500">
            {session.aiSummary || "Nice work showing up and practising today."}
          </p>
          <div className="mt-7 space-y-3">
            {Object.entries(session.scores || {}).map(([name, value]) => (
              <div
                key={name}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize text-slate-500">{name}</span>
                <b>{value}/100</b>
              </div>
            ))}
          </div>
        </section>
        <section className="surface p-7">
          <h2 className="text-lg font-bold">Conversation & feedback</h2>
          <div className="mt-5 space-y-4">
            {session.messages?.map((message, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 text-sm leading-6 ${message.role === "user" ? "ml-6 bg-indigo-50 dark:bg-indigo-950/50" : "mr-6 bg-slate-50 dark:bg-slate-800"}`}
              >
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {message.role === "user" ? "You" : "AI trainer"}
                </p>
                {message.content}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const { data } = await api.patch(
      "/users/me",
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    updateUser(data.data.user);
    setSaving(false);
    setMessage("Profile saved.");
  };
  return (
    <div>
      <PageHeading eyebrow="Your account" title="Profile" />
      <form onSubmit={save} className="surface max-w-2xl p-6 sm:p-8">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-mint/15 text-2xl font-bold text-mint">
          {user?.name?.slice(0, 1)}
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="label">Name</span>
            <input name="name" defaultValue={user?.name} className="input" />
          </label>
          <label>
            <span className="label">Email address</span>
            <input
              value={user?.email || ""}
              readOnly
              className="input cursor-not-allowed opacity-70"
            />
          </label>
          <label>
            <span className="label">Native language</span>
            <input
              name="nativeLanguage"
              defaultValue={user?.nativeLanguage}
              placeholder="e.g. Hindi"
              className="input"
            />
          </label>
          <label>
            <span className="label">English level</span>
            <select
              name="englishLevel"
              defaultValue={user?.englishLevel || "Intermediate"}
              className="input"
            >
              <option>Beginner</option>
              <option>Elementary</option>
              <option>Intermediate</option>
              <option>Upper Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
        </div>
        {message && (
          <p className="mt-4 text-sm font-semibold text-mint">{message}</p>
        )}
        <button disabled={saving} className="btn-primary mt-7">
          <Save size={17} />
          Save changes
        </button>
      </form>
    </div>
  );
}
export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const save = async (event) => {
    event.preventDefault();
    const { data } = await api.patch(
      "/users/me/preferences",
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    updateUser(data.data.user);
    setSaved(true);
  };
  const changePassword = async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (values.newPassword !== values.confirmPassword)
      return setPasswordMessage("New passwords do not match.");
    try {
      await api.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      await logout();
      navigate("/login");
    } catch (error) {
      setPasswordMessage(getErrorMessage(error));
    }
  };
  return (
    <div>
      <PageHeading eyebrow="Make it yours" title="Settings" />
      <div className="grid max-w-3xl gap-7">
        <section className="surface p-6">
          <div className="flex items-center gap-3">
            <Settings2 className="text-lavender" />
            <div>
              <h2 className="font-bold">Appearance</h2>
              <p className="text-sm text-slate-500">
                Choose the theme that feels best for long learning sessions.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {["light", "dark", "system"].map((option) => (
              <button
                key={option}
                onClick={() => setTheme(option)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold capitalize ${theme === option ? "border-lavender bg-indigo-50 text-lavender dark:bg-indigo-950" : "border-slate-200 dark:border-slate-700"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </section>
        <form onSubmit={save} className="surface p-6">
          <h2 className="font-bold">Learning preferences</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set the style of feedback you find most useful.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">Correction frequency</span>
              <select
                name="correctionFrequency"
                defaultValue={
                  user?.preferences?.correctionFrequency || "balanced"
                }
                className="input"
              >
                <option value="gentle">Gentle</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
            </label>
            <label>
              <span className="label">AI difficulty</span>
              <select
                name="aiDifficulty"
                defaultValue={user?.preferences?.aiDifficulty || "adaptive"}
                className="input"
              >
                <option value="adaptive">Adaptive</option>
                <option value="easier">A little easier</option>
                <option value="challenging">More challenging</option>
              </select>
            </label>
          </div>
          {saved && (
            <p className="mt-4 text-sm font-semibold text-mint">
              Preferences saved.
            </p>
          )}
          <button className="btn-primary mt-6">
            <Save size={17} />
            Save preferences
          </button>
        </form>
        <form onSubmit={changePassword} className="surface p-6">
          <h2 className="font-bold">Security</h2>
          <p className="mt-1 text-sm text-slate-500">
            Changing your password signs you out on every device.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Current password</span>
              <input
                required
                name="currentPassword"
                type="password"
                className="input"
              />
            </label>
            <label>
              <span className="label">New password</span>
              <input
                required
                name="newPassword"
                type="password"
                minLength="8"
                className="input"
              />
            </label>
            <label>
              <span className="label">Confirm new password</span>
              <input
                required
                name="confirmPassword"
                type="password"
                minLength="8"
                className="input"
              />
            </label>
          </div>
          {passwordMessage && (
            <p className="mt-4 text-sm text-rose-600">{passwordMessage}</p>
          )}
          <button className="btn-secondary mt-5">
            <Pencil size={16} />
            Change password
          </button>
        </form>
      </div>
    </div>
  );
}
function Loading() {
  return (
    <div className="grid min-h-64 place-items-center text-sm text-slate-500">
      <LoaderCircle className="mb-2 animate-spin text-lavender" />
      Loading your learning data…
    </div>
  );
}
function ErrorState({ message, onRetry }) {
  const isAuthError =
    message?.toLowerCase()?.includes("session") ||
    message?.toLowerCase()?.includes("unauthenticated") ||
    message?.toLowerCase()?.includes("log in") ||
    message?.toLowerCase()?.includes("expired") ||
    message?.toLowerCase()?.includes("authentication") ||
    message?.toLowerCase()?.includes("401");

  return (
    <div className="surface grid min-h-64 place-items-center p-8 text-center">
      <div>
        <TriangleAlert className="mx-auto text-rose-500" size={36} />
        <h2 className="mt-4 text-lg font-bold">Unable to load data</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {message}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {onRetry && (
            <button type="button" className="btn-secondary" onClick={onRetry}>
              Try again
            </button>
          )}
          {isAuthError ? (
            <Link className="btn-primary" to="/login">
              Log in again
            </Link>
          ) : (
            <Link className="btn-primary" to="/practice">
              Start practice
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
