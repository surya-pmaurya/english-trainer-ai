import {
  Activity,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleStop,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  Mic,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeading from "../components/ui/PageHeading";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import api, { getErrorMessage } from "../services/api";

const modeInfo = {
  conversation: {
    label: "Free conversation",
    prompt:
      "Let’s have a friendly conversation. What would you like to talk about today?",
    description: "Open dialogue for natural fluency and spontaneous expression.",
    tips: "Focus on keeping the conversation flowing without worrying about small errors.",
  },
  speaking: {
    label: "Speaking practice",
    prompt:
      "Tell me about your work, studies, or a recent experience. I’ll listen and help with your English.",
    description: "Vocal confidence, descriptive sentences, and everyday pacing.",
    tips: "Speak in complete sentences and click the mic icon to dictate freely.",
  },
  grammar: {
    label: "Grammar check",
    prompt:
      "Write a sentence you would like to check. I’ll explain any meaningful improvements.",
    description: "Accurate tenses, prepositions, articles, and sentence mechanics.",
    tips: "Try difficult or tricky sentence structures you’re unsure about.",
  },
  interview: {
    label: "Interview practice",
    prompt: "Let’s begin your interview practice. Tell me about yourself.",
    description: "Professional tone, concise STAR-method storytelling, and clear diction.",
    tips: "Highlight your strengths and structure your answer with beginning and result.",
  },
  travel: {
    label: "Travel English",
    prompt:
      "Welcome to travel practice! Imagine you have just arrived at an airport. How can I help you?",
    description: "Directions, ordering food, hotel booking, and situational travel dialogue.",
    tips: "Practice polite inquiries using 'Could you please...' and 'Excuse me'.",
  },
  workplace: {
    label: "Workplace English",
    prompt:
      "Let’s practise a workplace situation. Tell me about a meeting you recently attended.",
    description: "Business emails, project updates, negotiations, and workplace etiquette.",
    tips: "Use clear professional phrasing and concise updates.",
  },
};

const promptSuggestions = [
  "Can you ask me a question about my hobbies?",
  "How could I say that more naturally?",
  "Let's practice a real-life scenario.",
  "What is the grammar rule behind that?",
];

export default function PracticePage() {
  const [params, setParams] = useSearchParams();
  const initialMode = modeInfo[params.get("mode")]
    ? params.get("mode")
    : "conversation";
  const [mode, setMode] = useState(initialMode);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileTab, setMobileTab] = useState("chat"); // 'chat' | 'insights'
  const navigate = useNavigate();
  const endRef = useRef(null);

  const applyTranscript = useCallback(
    (transcript) =>
      setText((previous) =>
        previous ? `${previous} ${transcript}` : transcript,
      ),
    [],
  );
  const speech = useSpeechRecognition(applyTranscript);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    let active = true;
    api
      .post("/practice/start", { type: mode })
      .then(({ data }) => {
        if (!active) return;
        setSession(data.data.session);
        setMessages([{ role: "assistant", content: modeInfo[mode].prompt }]);
      })
      .catch((e) => active && setError(getErrorMessage(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [mode]);

  const send = async (suggestedContent) => {
    const content = (typeof suggestedContent === "string" ? suggestedContent : text).trim();
    if (!content || sending || !session) return;
    setText("");
    setError("");
    const optimistic = { role: "user", content };
    setMessages((current) => [...current, optimistic]);
    setSending(true);
    try {
      const { data } = await api.post("/practice/message", {
        sessionId: session.id,
        content,
      });
      const result = data.data;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.reply,
          correction: result.correction,
          vocabulary: result.vocabulary,
          scores: result.scores,
        },
      ]);
    } catch (e) {
      setMessages((current) =>
        current.filter((message) => message !== optimistic),
      );
      setText(content);
      setError(
        getErrorMessage(
          e,
          "Your trainer could not reply. Your message was not lost — please try again.",
        ),
      );
    } finally {
      setSending(false);
    }
  };

  const finish = async () => {
    if (!session || messages.length < 2) {
      navigate("/dashboard");
      return;
    }
    try {
      const { data } = await api.post("/practice/complete", {
        sessionId: session.id,
      });
      navigate(`/history/${data.data.session.id}`);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const speak = (content) =>
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(content));

  // Extract session insights
  const sessionVocab = useMemo(() => {
    const map = new Map();
    messages.forEach((m) => {
      (m.vocabulary || []).forEach((v) => {
        if (!map.has(v.word.toLowerCase())) {
          map.set(v.word.toLowerCase(), v);
        }
      });
    });
    return Array.from(map.values());
  }, [messages]);

  const latestCorrection = useMemo(() => {
    return [...messages].reverse().find((m) => m.correction)?.correction;
  }, [messages]);

  const latestScores = useMemo(() => {
    return (
      [...messages].reverse().find((m) => m.scores && Object.keys(m.scores).length > 0)
        ?.scores || {}
    );
  }, [messages]);

  return (
    <div className="flex min-h-[calc(100vh-6.5rem)] flex-col">
      {/* Top Heading */}
      <PageHeading eyebrow="Interactive Practice Studio" title={modeInfo[mode].label}>
        <div className="flex items-center gap-2">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setMobileTab("chat")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mobileTab === "chat"
                  ? "bg-white text-lavender shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setMobileTab("insights")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                mobileTab === "insights"
                  ? "bg-white text-lavender shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Insights ({sessionVocab.length})
            </button>
          </div>

          <button className="btn-secondary" onClick={finish}>
            <CheckCircle2 size={16} />
            <span>Finish session</span>
          </button>
        </div>
      </PageHeading>

      {/* Main 2-Column Desktop Grid / Adaptive Mobile View */}
      <div className="grid flex-1 items-start gap-6 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_410px]">
        {/* Left Column: Chat Room */}
        <div
          className={`surface flex min-h-[620px] flex-col overflow-hidden ${
            mobileTab === "insights" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-lavender text-white shadow-md shadow-indigo-200 dark:shadow-none">
                <Bot size={20} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-mint dark:border-slate-900" />
              </span>
              <div>
                <p className="font-bold text-sm sm:text-base">AI English Coach</p>
                <p className="text-xs font-medium text-mint">
                  ● Ready & listening to you
                </p>
              </div>
            </div>

            <label className="relative">
              <span className="sr-only">Practice mode</span>
              <select
                value={mode}
                onChange={(e) => {
                  const next = e.target.value;
                  setMode(next);
                  setParams({ mode: next });
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-slate-700 hover:border-lavender dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <option value="conversation">Free Conversation</option>
                <option value="speaking">Speaking Practice</option>
                <option value="grammar">Grammar Check</option>
                <option value="interview">Job Interview</option>
                <option value="travel">Travel English</option>
                <option value="workplace">Workplace English</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-3 text-slate-400"
                size={14}
              />
            </label>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 dark:bg-slate-950/40">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-slate-500 py-16">
                <div className="text-center">
                  <LoaderCircle className="mx-auto mb-3 animate-spin text-lavender" size={28} />
                  <p className="font-semibold">Starting your personalized practice room…</p>
                  <p className="text-xs text-slate-400 mt-1">Adapting to your goals</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={`${message.role}-${index}`}
                  message={message}
                  onSpeak={speak}
                />
              ))
            )}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="flex gap-1.5 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
                  <i className="h-2 w-2 animate-bounce rounded-full bg-lavender" />
                  <i className="h-2 w-2 animate-bounce rounded-full bg-lavender [animation-delay:150ms]" />
                  <i className="h-2 w-2 animate-bounce rounded-full bg-lavender [animation-delay:300ms]" />
                </span>
                <span className="text-xs text-slate-400 font-medium">Your trainer is crafting feedback…</span>
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/50 dark:text-rose-200"
              >
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Conversation Starter Chips */}
          <div className="hidden sm:flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider self-center mr-1">
              Suggestions:
            </span>
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                disabled={sending}
                className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-lavender hover:text-lavender dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-lavender transition truncate max-w-[280px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Textarea & Voice Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-slate-100 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-colors focus-within:border-lavender focus-within:bg-white focus-within:ring-2 focus-within:ring-lavender/20 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-lavender dark:focus-within:bg-slate-950">
              <textarea
                aria-label="Message your AI trainer"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={
                  speech.isListening
                    ? "Listening to your voice… speak clearly"
                    : "Type your message in English… (Press Enter to send)"
                }
                rows={3}
                className="no-scrollbar w-full resize-none border-0 bg-transparent p-1 text-sm leading-6 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              />

              {/* Bottom action bar with hints on left, mic and send buttons down on the right */}
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200/60 pt-2 dark:border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="hidden sm:inline-block">
                    Press <kbd className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Enter ↵</kbd> to send, <kbd className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Shift+Enter</kbd> for line break
                  </span>
                  {speech.isListening && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-rose-500 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Recording live speech…
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {speech.isSupported && (
                    <button
                      type="button"
                      onClick={speech.isListening ? speech.stop : speech.start}
                      aria-label={
                        speech.isListening ? "Stop listening" : "Speak your answer"
                      }
                      title={
                        speech.isListening ? "Stop microphone" : "Dictate via microphone"
                      }
                      className={`grid h-10 w-10 place-items-center rounded-xl transition shrink-0 ${
                        speech.isListening
                          ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200 dark:shadow-none"
                          : "bg-slate-200/70 text-slate-600 hover:bg-slate-300/80 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {speech.isListening ? <CircleStop size={18} /> : <Mic size={18} />}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-lavender px-4 text-xs font-semibold text-white shadow-md shadow-indigo-200/50 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0 dark:shadow-none"
                    aria-label="Send message"
                    title="Send message (Enter)"
                  >
                    <span>Send</span>
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>

            {speech.error && (
              <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                {speech.error}
              </p>
            )}
          </form>
        </div>

        {/* Right Column: Desktop Live Insights & Learning Companion */}
        <div
          className={`space-y-4 ${
            mobileTab === "chat" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Active Mode Guide Card */}
          <div className="surface p-5 border border-indigo-100 dark:border-indigo-950 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-lavender text-white">
                <GraduationCap size={17} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {modeInfo[mode].label}
                </h3>
                <p className="text-[11px] text-slate-500">Practice Goal</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {modeInfo[mode].description}
            </p>
            <div className="mt-3 rounded-xl bg-white p-3 text-xs text-slate-600 shadow-sm dark:bg-slate-800/80 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60">
              <p className="font-semibold text-lavender flex items-center gap-1.5 mb-1">
                <Lightbulb size={14} /> Coach Tip:
              </p>
              {modeInfo[mode].tips}
            </div>
          </div>

          {/* Live Skill Score Meters */}
          <div className="surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Activity size={16} className="text-mint" />
                Latest Message Score
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">0 - 100</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Grammar", value: latestScores.grammar ?? 75, color: "bg-indigo-500" },
                { label: "Vocabulary", value: latestScores.vocabulary ?? 80, color: "bg-mint" },
                { label: "Fluency", value: latestScores.fluency ?? 75, color: "bg-amber-500" },
              ].map((skill) => (
                <div key={skill.label} className="text-xs">
                  <div className="flex justify-between font-semibold mb-1 text-slate-600 dark:text-slate-300">
                    <span>{skill.label}</span>
                    <span>{skill.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, skill.value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Latest Grammar Improvement */}
          <div className="surface p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-500" />
              Latest Correction
            </h3>
            {latestCorrection ? (
              <div className="rounded-2xl border border-mint/30 bg-mint/5 p-4 text-xs space-y-2 dark:bg-mint/10">
                <div className="inline-block rounded-md bg-mint/20 px-2 py-0.5 text-[10px] font-bold uppercase text-mint">
                  {latestCorrection.category || "Grammar"}
                </div>
                <div>
                  <span className="font-semibold text-rose-500 block">Original:</span>
                  <p className="line-through text-slate-500 dark:text-slate-400">
                    {latestCorrection.original}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-mint block">Better phrasing:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {latestCorrection.corrected}
                  </p>
                </div>
                <p className="text-slate-600 dark:text-slate-300 border-t border-mint/20 pt-2 text-[11px]">
                  {latestCorrection.explanation}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-800/60">
                <p>No errors in your latest response!</p>
                <p className="mt-1 text-[11px] text-mint font-medium">Keep speaking naturally.</p>
              </div>
            )}
          </div>

          {/* Session Vocabulary Accumulator */}
          <div className="surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen size={16} className="text-lavender" />
                Session Vocabulary
              </h3>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-lavender dark:bg-indigo-950">
                {sessionVocab.length}
              </span>
            </div>

            {sessionVocab.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Words recommended during this session will collect here automatically.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {sessionVocab.map((v) => (
                  <div
                    key={v.word}
                    className="rounded-xl border border-slate-100 p-2.5 text-xs dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {v.word}
                      </span>
                      <button
                        type="button"
                        onClick={() => speak(v.word)}
                        className="text-slate-400 hover:text-lavender p-1 rounded-lg"
                        title={`Listen to ${v.word}`}
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 leading-4">
                      {v.meaning}
                    </p>
                    {v.example && (
                      <p className="italic text-slate-400 text-[11px] mt-1 border-l-2 border-lavender/40 pl-2">
                        “{v.example}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onSpeak }) {
  const learner = message.role === "user";
  return (
    <div className={`flex ${learner ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] sm:max-w-[80%] lg:max-w-[76%] ${
          learner
            ? "rounded-2xl rounded-tr-sm bg-lavender text-white shadow-md shadow-indigo-100 dark:shadow-none"
            : "rounded-2xl rounded-tl-sm bg-white text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-800"
        } px-4 sm:px-5 py-3.5 text-sm leading-6`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!learner && (
          <button
            type="button"
            onClick={() => onSpeak(message.content)}
            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-lavender hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-200 transition"
          >
            <Volume2 size={14} />
            <span>Listen to audio</span>
          </button>
        )}

        {message.correction && (
          <div className="mt-3 rounded-xl border border-mint/20 bg-mint/10 p-3 text-slate-700 dark:text-slate-100">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-mint">
              <Sparkles size={13} />
              <span>Suggested Improvement</span>
            </p>
            <p className="mt-2 text-xs">
              <span className="font-semibold text-mint">Better:</span>{" "}
              {message.correction.corrected}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {message.correction.explanation}
            </p>
          </div>
        )}

        {message.vocabulary?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.vocabulary.map((item) => (
              <span
                key={item.word}
                className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-lavender dark:bg-indigo-950 dark:text-indigo-300"
              >
                {item.word}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

