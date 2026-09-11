import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import { useAuth } from "./context/AuthContext";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from "./pages/AuthPages";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import {
  HistoryPage,
  MistakesPage,
  ProfilePage,
  ProgressPage,
  SessionResultPage,
  SettingsPage,
  VocabularyPage,
} from "./pages/LearningPages";
import OnboardingPage from "./pages/OnboardingPage";
import PracticePage from "./pages/PracticePage";

function Protected({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        Loading your learning space…
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}
function Onboarded({ children }) {
  const { user } = useAuth();
  return user?.onboardingCompleted ? (
    children
  ) : (
    <Navigate to="/onboarding" replace />
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/onboarding"
        element={
          <Protected>
            <OnboardingPage />
          </Protected>
        }
      />
      <Route
        element={
          <Protected>
            <Onboarded>
              <AppShell />
            </Onboarded>
          </Protected>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<SessionResultPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
