import {
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleStop,
  LoaderCircle,
  Mic,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageHeading from "../components/ui/PageHeading";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import api, { getErrorMessage } from "../services/api";

const modeInfo = {
  conversation: {
    label: "Free conversation",
    prompt:
      "Let’s have a friendly conversation. What would you like to talk about today?",
  },
  speaking: {
    label: "Speaking practice",
    prompt:
      "Tell me about your work, studies, or a recent experience. I’ll listen and help with your English.",
  },
  grammar: {
    label: "Grammar check",
    prompt:
      "Write a sentence you would like to check. I’ll explain any meaningful improvements.",
  },
  interview: {
    label: "Interview practice",
    prompt: "Let’s begin your interview practice. Tell me about yourself.",
  },
  travel: {
    label: "Travel English",
    prompt:
      "Welcome to travel practice! Imagine you have just arrived at an airport. How can I help you?",
  },
  workplace: {
    label: "Workplace English",
    prompt:
      "Let’s practise a workplace situation. Tell me about a meeting you recently attended.",
  },
};
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
    setLoading(true);
    setMessages([]);
    setError("");
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
  const send = async (event) => {
    event?.preventDefault();
    const content = text.trim();
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
  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      <PageHeading eyebrow="Practice room" title={modeInfo[mode].label}>
        <button className="btn-secondary" onClick={finish}>
          <CheckCircle2 size={17} />
          Finish session
        </button>
      </PageHeading>
      <div className="surface flex min-h-[590px] flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender text-white">
              <Bot size={20} />
            </span>
            <div>
              <p className="font-bold">AI Trainer</p>
              <p className="text-xs font-medium text-mint">
                ● Here to help you learn
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
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="conversation">Conversation</option>
              <option value="speaking">Speaking</option>
              <option value="grammar">Grammar</option>
              <option value="interview">Interview</option>
              <option value="travel">Travel</option>
              <option value="workplace">Workplace</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-2.5"
              size={15}
            />
          </label>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 dark:bg-slate-950/30">
          {loading ? (
            <div className="grid h-full place-items-center text-sm text-slate-500">
              <LoaderCircle className="mb-2 animate-spin text-lavender" />
              Preparing your learning space…
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
              <span className="flex gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-lavender" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-lavender [animation-delay:150ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-lavender [animation-delay:300ms]" />
              </span>{" "}
              Your trainer is thinking…
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200"
            >
              {error}
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={send}
          className="border-t border-slate-100 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-end gap-2">
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
                speech.isListening ? "Listening…" : "Write your message…"
              }
              rows={1}
              className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 placeholder:text-slate-400 focus:border-lavender dark:border-slate-700 dark:bg-slate-950"
            />
            {speech.isSupported && (
              <button
                type="button"
                onClick={speech.isListening ? speech.stop : speech.start}
                aria-label={
                  speech.isListening ? "Stop listening" : "Speak your answer"
                }
                className={`grid h-12 w-12 place-items-center rounded-xl transition ${speech.isListening ? "bg-rose-500 text-white" : "bg-mint/10 text-mint hover:bg-mint/20"}`}
              >
                {speech.isListening ? (
                  <CircleStop size={19} />
                ) : (
                  <Mic size={19} />
                )}
              </button>
            )}
            <button
              disabled={!text.trim() || sending}
              className="grid h-12 w-12 place-items-center rounded-xl bg-lavender text-white disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </div>
          {speech.error && (
            <p className="mt-2 text-xs text-amber-600">{speech.error}</p>
          )}
          {!speech.isSupported && (
            <p className="mt-2 text-xs text-slate-500">
              Speech input isn’t available in this browser, so you can continue
              by typing.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
function MessageBubble({ message, onSpeak }) {
  const learner = message.role === "user";
  return (
    <div className={`flex ${learner ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[92%] sm:max-w-[78%] ${learner ? "rounded-2xl rounded-tr-sm bg-lavender text-white" : "rounded-2xl rounded-tl-sm bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-100"} px-4 py-3 text-sm leading-6`}
      >
        <p>{message.content}</p>
        {!learner && (
          <button
            type="button"
            onClick={() => onSpeak(message.content)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-lavender"
          >
            <Volume2 size={14} />
            Listen
          </button>
        )}
        {message.correction && (
          <div className="mt-3 rounded-xl border border-mint/20 bg-mint/10 p-3 text-slate-700 dark:text-slate-100">
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-mint">
              <Sparkles size={13} />A helpful correction
            </p>
            <p className="mt-2 text-xs">
              <span className="font-semibold">Better:</span>{" "}
              {message.correction.corrected}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {message.correction.explanation}
            </p>
          </div>
        )}
        {message.vocabulary?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.vocabulary.map((item) => (
              <span
                key={item.word}
                className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-lavender dark:bg-indigo-950"
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
