import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
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
const goals = [
  "Improve speaking",
  "Prepare for interviews",
  "Improve grammar",
  "Improve vocabulary",
  "Travel English",
  "Business English",
  "Daily conversation",
];
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
    <div className="min-h-screen bg-slate-50 px-5 py-6 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Brand />
        <div className="mt-16">
          <div className="flex gap-2">
            {[0, 1, 2].map((item) => (
              <span
                key={item}
                className={`h-1.5 flex-1 rounded-full ${item <= step ? "bg-lavender" : "bg-slate-200 dark:bg-slate-800"}`}
              />
            ))}
          </div>
          <div className="surface mx-auto mt-8 max-w-2xl p-6 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-mint">
              Step {step + 1} of 3
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {label}
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
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
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${selected ? "border-lavender bg-indigo-50 text-lavender dark:bg-indigo-950/50" : "border-slate-200 hover:border-indigo-200 dark:border-slate-700"}`}
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
            <div className="mt-9 flex justify-between">
              <button
                className="btn-secondary"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
              {step < 2 ? (
                <button
                  className="btn-primary"
                  onClick={() => setStep(step + 1)}
                >
                  Continue <ArrowRight size={17} />
                </button>
              ) : (
                <button
                  className="btn-primary"
                  disabled={form.formState.isSubmitting}
                  onClick={form.handleSubmit(finish)}
                >
                  Finish setup <ArrowRight size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
