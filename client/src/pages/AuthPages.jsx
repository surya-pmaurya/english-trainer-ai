import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import Brand from "../components/ui/Brand";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/\d/, "Include a number.");
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6 dark:bg-slate-950 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Brand />
        </div>

        <div className="mt-6 lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
          {/* Form column */}
          <div className="w-full max-w-md mx-auto lg:col-span-5 xl:col-span-5 lg:mx-0">
            <div className="surface p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
              {children}
            </div>
          </div>

          {/* Desktop Showcase column */}
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-10 text-white shadow-2xl border border-indigo-800/40 relative overflow-hidden min-h-[580px]">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-lavender/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-mint/15 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-indigo-200 backdrop-blur-md border border-white/10">
                <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
                Next-Gen English Immersion
              </div>

              <h2 className="mt-6 text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Speak fluent English with <br className="hidden xl:inline" />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                  real-time AI feedback.
                </span>
              </h2>

              <p className="mt-4 text-base text-indigo-200/80 max-w-lg leading-relaxed">
                Practice daily conversations, get instant grammar explanations, and expand your vocabulary with a 24/7 personalized AI tutor.
              </p>

              {/* Live Interactive Sample Card */}
              <div className="mt-8 space-y-3 rounded-2xl bg-white/5 p-5 backdrop-blur-lg border border-white/10 max-w-lg">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
                  <span>Live Feedback Preview</span>
                  <span className="rounded-full bg-mint/20 px-2 py-0.5 text-mint font-semibold">CEFR A1 - C2</span>
                </div>

                <div className="rounded-xl bg-slate-900/60 p-3 text-xs border border-white/5">
                  <span className="font-semibold text-rose-300 block mb-1">What you say:</span>
                  <p className="text-slate-300 italic">&ldquo;I have visited yesterday the museum with my friends.&rdquo;</p>
                </div>

                <div className="rounded-xl bg-indigo-950/70 p-3.5 text-xs border border-indigo-500/30">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
                    <CheckCircle2 size={14} />
                    <span>Better Phrasing:</span>
                  </div>
                  <p className="text-white font-medium">&ldquo;I visited the museum with my friends yesterday.&rdquo;</p>
                  <p className="mt-1 text-[11px] text-indigo-200/70">
                    Rule: Use past simple instead of present perfect when specifying finished time expressions like &apos;yesterday&apos;.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-lg bg-white/5 p-2 border border-white/5">
                    <span className="block text-[10px] text-indigo-300 uppercase font-semibold">Grammar</span>
                    <span className="text-sm font-bold text-emerald-400">94%</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 border border-white/5">
                    <span className="block text-[10px] text-indigo-300 uppercase font-semibold">Vocabulary</span>
                    <span className="text-sm font-bold text-sky-400">89%</span>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 border border-white/5">
                    <span className="block text-[10px] text-indigo-300 uppercase font-semibold">Fluency</span>
                    <span className="text-sm font-bold text-indigo-300">92%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom social proof */}
            <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200/80">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full bg-indigo-400/80 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-900">A</div>
                  <div className="h-7 w-7 rounded-full bg-emerald-400/80 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-900">K</div>
                  <div className="h-7 w-7 rounded-full bg-purple-400/80 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-900">M</div>
                  <div className="h-7 w-7 rounded-full bg-amber-400/80 border-2 border-slate-900 flex items-center justify-center font-bold text-[10px] text-slate-900">+</div>
                </div>
                <span>Joined by 10,000+ confident English speakers</span>
              </div>
              <div className="flex items-center gap-1 text-amber-300 font-semibold">
                <span>★ 4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Field({ label, error, type = "text", register, name, ...props }) {
  const [visible, setVisible] = useState(false);
  const passwordInput = type === "password";
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <input
          className="input pr-10"
          type={passwordInput && visible ? "text" : type}
          {...register(name)}
          {...props}
        />
        {passwordInput && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible(!visible)}
            className="absolute bottom-2.5 right-3 text-slate-400"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
      {error && (
        <span className="mt-1 block text-xs font-medium text-rose-600">
          {error.message}
        </span>
      )}
    </label>
  );
}
function Submit({ loading, children }) {
  return (
    <button disabled={loading} className="btn-primary mt-6 w-full">
      {loading && <LoaderCircle className="animate-spin" size={17} />}
      {children}
    </button>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const form = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email("Enter a valid email."),
        password: z.string().min(1, "Password is required."),
      }),
    ),
  });
  const submit = async (values) => {
    setServerError("");
    try {
      const user = await login(values);
      navigate(user.onboardingCompleted ? "/dashboard" : "/onboarding");
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  };
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Continue your English-learning journey."
    >
      <form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-4">
        <Field
          label="Email address"
          type="email"
          name="email"
          register={form.register}
          error={form.formState.errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          name="password"
          register={form.register}
          error={form.formState.errors.password}
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link
            className="text-sm font-semibold text-lavender hover:underline"
            to="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        {serverError && (
          <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <p>{serverError}</p>
            {serverError.toLowerCase().includes("verify") && (
              <p className="mt-2">
                <Link
                  className="font-semibold text-lavender underline"
                  to={`/verify-email?email=${encodeURIComponent(form.getValues("email") || "")}`}
                >
                  Resend verification email &rarr;
                </Link>
              </p>
            )}
          </div>
        )}
        <Submit loading={form.formState.isSubmitting}>Log in</Submit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{" "}
        <Link
          className="font-bold text-lavender hover:underline"
          to="/register"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const schema = z
    .object({
      name: z.string().min(2, "Please enter your full name.").max(80),
      email: z.string().email("Enter a valid email."),
      password,
      confirmPassword: z.string(),
    })
    .refine((value) => value.password === value.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  const form = useForm({ resolver: zodResolver(schema) });
  const submit = async ({...values }) => {
    setServerError("");
    try {
      await api.post("/auth/register", values);
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  };
  return (
    <AuthLayout
      title="Start learning today"
      subtitle="Create your account and meet your personal English tutor."
    >
      <form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-4">
        <Field
          label="Full name"
          name="name"
          register={form.register}
          error={form.formState.errors.name}
          autoComplete="name"
        />
        <Field
          label="Email address"
          type="email"
          name="email"
          register={form.register}
          error={form.formState.errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          type="password"
          name="password"
          register={form.register}
          error={form.formState.errors.password}
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirmPassword"
          register={form.register}
          error={form.formState.errors.confirmPassword}
          autoComplete="new-password"
        />
        {serverError && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {serverError}
          </p>
        )}
        <Submit loading={form.formState.isSubmitting}>Create account</Submit>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-bold text-lavender hover:underline" to="/login">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");
  const [state, setState] = useState(token ? "loading" : "idle");
  useEffect(() => {
    if (!token) return;
    let active = true;
    api
      .post("/auth/verify-email", { token })
      .then(() => active && setState("success"))
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [token]);
  const resend = async () => {
    setState("loading");
    try {
      await api.post("/auth/resend-verification", { email });
      setState("sent");
    } catch {
      setState("error");
    }
  };
  return (
    <AuthLayout
      title={state === "success" ? "Email verified!" : "Check your inbox"}
      subtitle={
        state === "success"
          ? "Your account is ready. You can now log in and start practising."
          : "We sent a verification link to your email address."
      }
    >
      <div className="mt-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mint/10 text-mint">
          {state === "success" ? (
            <CheckCircle2 size={31} />
          ) : (
            <Mail size={29} />
          )}
        </span>
        <p className="mt-5 text-sm text-slate-500">
          {state === "loading"
            ? "Verifying your link…"
            : state === "sent"
              ? "A fresh link is on its way."
              : state === "error"
                ? "That link is invalid or has expired. Request a new one below."
                : email ||
                  "Open the link in the verification email to activate your account."}
        </p>
        {state === "success" ? (
          <button
            className="btn-primary mt-6"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        ) : (
          <button
            disabled={!email || state === "loading"}
            className="btn-secondary mt-6"
            onClick={resend}
          >
            Resend verification email
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm({
    resolver: zodResolver(
      z.object({ email: z.string().email("Enter a valid email.") }),
    ),
  });
  const submit = async (values) => {
    await api.post("/auth/forgot-password", values);
    setSent(true);
  };
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we’ll send a secure reset link."
    >
      {sent ? (
        <div className="mt-7 rounded-2xl bg-mint/10 p-5 text-sm leading-6 text-slate-700 dark:text-slate-200">
          <Mail className="mb-3 text-mint" />
          If that email belongs to an account, a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(submit)} className="mt-7">
          <Field
            label="Email address"
            type="email"
            name="email"
            register={form.register}
            error={form.formState.errors.email}
          />
          <Submit loading={form.formState.isSubmitting}>Send reset link</Submit>
        </form>
      )}
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lavender"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>
    </AuthLayout>
  );
}
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const form = useForm({
    resolver: zodResolver(
      z
        .object({ password, confirmPassword: z.string() })
        .refine((v) => v.password === v.confirmPassword, {
          path: ["confirmPassword"],
          message: "Passwords do not match.",
        }),
    ),
  });
  const submit = async ({ password: newPassword }) => {
    try {
      await api.post("/auth/reset-password", {
        token: params.get("token"),
        password: newPassword,
      });
      navigate("/login");
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  };
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Make it strong and unique."
    >
      <form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-4">
        <Field
          label="New password"
          type="password"
          name="password"
          register={form.register}
          error={form.formState.errors.password}
        />
        <Field
          label="Confirm password"
          type="password"
          name="confirmPassword"
          register={form.register}
          error={form.formState.errors.confirmPassword}
        />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
        <Submit loading={form.formState.isSubmitting}>Reset password</Submit>
      </form>
    </AuthLayout>
  );
}
