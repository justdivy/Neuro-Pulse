import { createContext, useContext, useEffect, useState } from "react";
import {
  API_BASE_URL,
  authFetch,
  clearAuthSession,
  getStoredToken,
  storeAuthSession,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Authentication session is invalid.");
        }

        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      })
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to sign in.");
    }

    storeAuthSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  const authenticatedFetch = async (path, options = {}) => {
    const response = await authFetch(path, options);

    if (response.status === 401) {
      logout();
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        authLoading,
        login,
        logout,
        updateUser,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}