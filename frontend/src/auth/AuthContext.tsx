import type { AuthUser } from "@/types/auth";
import { toRole } from "@/types/auth";
import { userApi } from "@/api/user.api";
import type { UserProfile } from "@/types/user";
import {
  AUTH_LOGOUT_EVENT,
  clearSession,
  getStoredToken,
  getStoredUser,
  persistUser,
} from "@/lib/auth-session";
import { isUnauthorizedError } from "@/lib/errors";
import { queryClient } from "@/lib/query-client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextType {
  user: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  loading: boolean;
  sessionError: boolean;
  retrySession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const profileToAuthUser = (profile: UserProfile): AuthUser => ({
  id: profile.id,
  email: profile.email,
  role: toRole(profile.role),
  name: profile.name,
  phone: profile.phone,
  createdAt: profile.createdAt,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [hydrateNonce, setHydrateNonce] = useState(0);

  const normalizeUser = (userData: AuthUser | null): AuthUser | null => {
    if (!userData) return null;
    return {
      ...userData,
      role: toRole(userData.role),
    };
  };

  const setAuthUser = (userData: AuthUser | null) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
  };

  const retrySession = useCallback(() => {
    setSessionError(false);
    setLoading(true);
    setHydrateNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      setSessionError(false);
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      try {
        const profile = await userApi.getProfile();
        if (cancelled) return;

        const authUser = profileToAuthUser(profile);
        setAuthUser(authUser);
        persistUser(authUser);
        setSessionError(false);
      } catch (error) {
        if (cancelled) return;

        if (isUnauthorizedError(error)) {
          clearSession();
          queryClient.clear();
          setAuthUser(null);
          setSessionError(false);
          return;
        }

        const storedUser = getStoredUser();
        if (storedUser) {
          setAuthUser(storedUser);
        }
        setSessionError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [hydrateNonce]);

  useEffect(() => {
    const onLogout = () => {
      setAuthUser(null);
      setSessionError(false);
      queryClient.clear();
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setAuthUser, loading, sessionError, retrySession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be called within an AuthProvider");
  }

  return context;
};
