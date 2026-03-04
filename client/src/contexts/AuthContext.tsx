import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  email: string;
  name: string;
  orgName: string;
  sector: string;
  plan: "starter" | "business" | "agency";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; orgName: string; sector: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USER: User = {
  id: "u-001",
  email: "demo@feosync.mg",
  name: "Hanta Rakoto",
  orgName: "Le Grill d'Ivandry",
  sector: "restaurant",
  plan: "business",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("fs_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const u = { ...MOCK_USER, email };
    setUser(u);
    localStorage.setItem("fs_user", JSON.stringify(u));
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; orgName: string; sector: string }) => {
    await new Promise(r => setTimeout(r, 1000));
    const u: User = { ...MOCK_USER, ...data, id: "u-" + Date.now() };
    setUser(u);
    localStorage.setItem("fs_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("fs_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
