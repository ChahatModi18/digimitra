import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  getStoredToken,
  clearStoredToken,
  loginUser,
  registerUser,
  ensureAuthenticatedSession,
} from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeBusinessId: number | null;
  setActiveBusinessId: (id: number | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    role?: string;
  }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getSafeItem = (key: string): string | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const setSafeItem = (key: string, value: string): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (e) {
    // ignore
  }
};

const removeSafeItem = (key: string): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    // ignore
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<User | null>(() => {
    const saved = getSafeItem("digimitra_user_info");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeBusinessId, setActiveBusinessIdState] = useState<number | null>(() => {
    const saved = getSafeItem("digimitra_active_biz_id");
    return saved ? Number(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Ensure active token on startup
    const initAuth = async () => {
      try {
        const stored = getStoredToken();
        if (stored) {
          setToken(stored);
        } else {
          // Initialize demo session if non-existent
          const t = await ensureAuthenticatedSession();
          setToken(t);
        }
      } catch (err) {
        console.warn("Session init warning:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const setActiveBusinessId = (id: number | null) => {
    setActiveBusinessIdState(id);
    if (id !== null) {
      setSafeItem("digimitra_active_biz_id", String(id));
    } else {
      removeSafeItem("digimitra_active_biz_id");
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, pass);
      setToken(data.access_token);
      setUser(data.user);
      setSafeItem("digimitra_user_info", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    role?: string;
  }) => {
    setIsLoading(true);
    try {
      await registerUser(payload);
      const data = await loginUser(payload.email, payload.password);
      setToken(data.access_token);
      setUser(data.user);
      setSafeItem("digimitra_user_info", JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const t = await ensureAuthenticatedSession();
      setToken(t);
      const demoUser: User = {
        id: 1,
        email: "demo_owner@digimitra.in",
        full_name: "Ramesh Sharma (Demo Owner)",
        role: "business_owner",
      };
      setUser(demoUser);
      setSafeItem("digimitra_user_info", JSON.stringify(demoUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearStoredToken();
    removeSafeItem("digimitra_user_info");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        activeBusinessId,
        setActiveBusinessId,
        login,
        register,
        demoLogin,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
