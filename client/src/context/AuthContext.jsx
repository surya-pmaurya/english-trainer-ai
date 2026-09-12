import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { onAuthFailure, refreshAuth, setAccessToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
      return data.data.user;
    } catch (e) {
      setUser(null);
      throw e;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthFailure(() => {
      setUser(null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      try {
        const storedToken =
          typeof window !== "undefined"
            ? localStorage.getItem("eta_access_token")
            : null;

        if (storedToken) {
          try {
            await loadUser();
            if (active) setIsLoading(false);
            return;
          } catch {
            // Stored token might be expired; attempt refreshAuth below
          }
        }

        const token = await refreshAuth();
        if (token && active) {
          await loadUser();
        }
      } catch {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, [loadUser]);

  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateUser = (next) => setUser(next);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, loadUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// This hook intentionally shares the auth context API from the provider module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

