import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  name: string;
  email: string;
  photoURL?: string;
  provider: "email" | "google";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("fashionhub_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("fashionhub_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("fashionhub_user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!email || !password) throw new Error("Email and password required");
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      
      setUser({ name: data.user.name, email: data.user.email, provider: "email" });
      localStorage.setItem("fashionhub_token", data.token);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setUser({
      name: "Google User",
      email: "user@gmail.com",
      photoURL: "https://ui-avatars.com/api/?name=Google+User&background=f59e0b&color=fff",
      provider: "google",
    });
    setLoading(false);
  };

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      if (!name || !email || !password) throw new Error("All fields required");
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      
      setUser({ name: data.user.name, email: data.user.email, provider: "email" });
      localStorage.setItem("fashionhub_token", data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fashionhub_token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
