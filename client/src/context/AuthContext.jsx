import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { setAccessToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.data.user);
    return data.data.user;
  }, []);

  useEffect(() => {
    api
      .post("/auth/refresh")
      .then(({ data }) => {
        setAccessToken(data.data.accessToken);
        return loadUser();
      })
      .catch(() => setAccessToken(null))
      .finally(() => setIsLoading(false));
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
export const useAuth = () => useContext(AuthContext);
