import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Award, Check, Clock, Sparkles, Target } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import Brand from "../components/ui/Brand";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const levels = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper Intermediate",
  "Advanced",
];

const levelInsights = {
  Beginner: {
    badge: "Foundational (A1)",
    description: "Focus on simple present/past patterns, high-frequency vocabulary, and spoken confidence.",
    highlight: "Slow speech pace & gentle explanations",
  },
  Elementary: {
    badge: "Elementary (A2)",
    description: "Daily routine conversations, common questions, and practical everyday phrases.",
    highlight: "Grammar reminders & sentence builders",
  },
  Intermediate: {
    badge: "Independent (B1)",
    description: "Expressing opinions, natural idioms, conditional phrases, and spontaneous responses.",
    highlight: "Balanced feedback on nuance & flow",
  },
  "Upper Intermediate": {
    badge: "Proficient (B2)",
    description: "Nuanced phrasing, professional discussions, complex tenses, and expressive vocabulary.",
    highlight: "Detailed error breakdown & native collocations",
  },
  Advanced: {
    badge: "Mastery (C1-C2)",
    description: "Executive-level precision, subtle humor, debate strategies, and professional impact.",
    highlight: "Advanced stylistic refinements",
  },
};

const goals = [
  "Improve speaking",
  "Prepare for interviews",
  "Improve grammar",
  "Improve vocabulary",
  "Travel English",
  "Business English",
  "Daily conversation",
];

const goalInsights = {
  "Improve speaking": "Real-time conversational flow, pronunciation drills, and reducing pauses.",
  "Prepare for interviews": "STAR method answering, professional tone, and confident career vocabulary.",
  "Improve grammar": "Instant rule breakdown, syntax correction cards, and targeted repetitive drills.",
  "Improve vocabulary": "Contextual word suggestions, synonyms, CEFR-graded phrases, and flashcards.",
  "Travel English": "Airport navigation, hotel bookings, ordering in restaurants, and asking for directions.",
  "Business English": "Meeting etiquette, professional emails, negotiation tactics, and presenting pitches.",
  "Daily conversation": "Casual chat, cultural references, storytelling, making friends, and everyday slang.",
};

const targets = [10, 15, 20, 30];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(
      z.object({
        englishLevel: z.enum(levels),
        learningGoal: z.string().min(1),
        dailyGoalMinutes: z.coerce.number().min(5).max(120),
      }),
    ),
    defaultValues: {
      englishLevel: "Intermediate",
      learningGoal: "Improve speaking",
      dailyGoalMinutes: 15,
    },
  });

  const finish = async (values) => {
    const { data } = await api.patch("/users/me", {
      ...values,
      onboardingCompleted: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    updateUser(data.data.user);
    navigate("/dashboard");
  };

  const selectedLevel = form.watch("englishLevel");
  const selectedGoal = form.watch("learningGoal");
  const selectedMinutes = form.watch("dailyGoalMinutes");

  const currentLevelInsight = levelInsights[selectedLevel] || levelInsights.Intermediate;
  const currentGoalInsight = goalInsights[selectedGoal] || goalInsights["Improve speaking"];

  const choices = step === 0 ? levels : step === 1 ? goals : targets;
  const name =
    step === 0
      ? "englishLevel"
      : step === 1
        ? "learningGoal"
        : "dailyGoalMinutes";
  const label =
    step === 0
      ? "What is your current English level?"
      : step === 1
        ? "What would you like to focus on?"
        : "How much time can you give each day?";

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 dark:bg-slate-950 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <Brand />
        <div className="mt-8 lg:mt-12">
          {/* Progress bar */}
          <div className="flex gap-2 max-w-2xl mx-auto lg:max-w-none">
            {[0, 1, 2].map((item) => (
              <span
                key={item}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  item <= step ? "bg-lavender" : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* 2-column layout on desktop */}
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
            {/* Step form column */}
            <div className="surface mx-auto max-w-2xl w-full p-6 sm:p-10 lg:col-span-7 xl:col-span-7 lg:max-w-none shadow-lg border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[.16em] text-mint">
                  Step {step + 1} of 3
                </p>
                <span className="text-xs font-semibold text-slate-400">
                  {step === 0 ? "Proficiency" : step === 1 ? "Target Goal" : "Daily Pace"}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                {label}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">
                Your trainer will adapt its conversations, feedback, and
                recommendations for you.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {choices.map((choice) => {
                  const selected = form.watch(name) === choice;
                  return (
                    <button
                      type="button"
                      key={choice}
                      onClick={() =>
                        form.setValue(name, choice, { shouldValidate: true })
                      }
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-lavender bg-indigo-50/70 text-lavender shadow-sm ring-2 ring-lavender/20 dark:bg-indigo-950/50"
                          : "border-slate-200 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-slate-600"
                      }`}
                    >
                      <span>
                        {typeof choice === "number"
                          ? `${choice} minutes a day`
                          : choice}
                      </span>
                      {selected && (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-lavender text-white">
                          <Check size={13} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-6">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={step === 0}
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
                {step < 2 ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setStep(step + 1)}
                  >
                    Continue <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={form.formState.isSubmitting}
                    onClick={form.handleSubmit(finish)}
                  >
                    Finish setup <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* Live dynamic coach curriculum preview on desktop */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col gap-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 text-white shadow-xl border border-indigo-800/40 sticky top-24">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md border border-white/10">
                  <Sparkles size={13} className="text-mint animate-pulse" />
                  Your Custom Plan
                </div>
                <span className="text-xs text-indigo-300">Live preview</span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white">
                Personalized AI Curriculum
              </h2>

              <div className="space-y-3">
                {/* Level Card */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 transition-all">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Award size={14} className="text-indigo-400" />
                    <span>Selected Proficiency</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-bold text-white text-base">{selectedLevel}</span>
                    <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-200 border border-indigo-400/20">
                      {currentLevelInsight.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-indigo-200/80 leading-relaxed">
                    {currentLevelInsight.description}
                  </p>
                  <div className="mt-2 rounded-lg bg-indigo-950/60 px-2.5 py-1 text-[11px] text-emerald-300 font-medium">
                    ⚡ {currentLevelInsight.highlight}
                  </div>
                </div>

                {/* Goal Card */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 transition-all">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Target size={14} className="text-mint" />
                    <span>Primary Focus</span>
                  </div>
                  <div className="mt-1 font-bold text-white text-base">
                    {selectedGoal}
                  </div>
                  <p className="mt-1.5 text-xs text-indigo-200/80 leading-relaxed">
                    {currentGoalInsight}
                  </p>
                </div>

                {/* Pace Card */}
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 transition-all">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                    <Clock size={14} className="text-amber-400" />
                    <span>Daily Practice Goal</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-300">{selectedMinutes}</span>
                    <span className="text-xs text-indigo-200">minutes per day</span>
                  </div>
                  <p className="mt-1.5 text-xs text-indigo-200/70">
                    Estimated ~{selectedMinutes * 7} mins/week of active speaking & grammar mastery.
                  </p>
                </div>
              </div>

              {/* Coach note */}
              <div className="rounded-xl bg-indigo-500/10 p-3 text-xs text-indigo-200/90 border border-indigo-400/20">
                💬 <span className="font-semibold text-white">Trainer Note:</span> Your AI tutor will dynamically calibrate its speech velocity and correction intensity based on these preferences.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
