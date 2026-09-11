import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  ShieldCheck,
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
    <div className="min-h-screen bg-slate-50 px-5 py-6 dark:bg-slate-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Brand />
        <div className="mx-auto mt-10 max-w-md">
          <div className="surface p-6 sm:p-8">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
            {children}
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
  const submit = async ({ confirmPassword, ...values }) => {
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
  const [state, setState] = useState("idle");
  const token = params.get("token");
  const email = params.get("email");
  useEffect(() => {
    if (!token) return;
    let active = true;
    setState("loading");
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
