import type { AuthUser } from "@/types/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: AuthUser | null;
  setAuthUser: (user: AuthUser | null) => void;
  loading: boolean;
}

// context with default val
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider
// to wrap the entire app to provide auth state globally
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserString = localStorage.getItem("storedUser");

    if (!token || !storedUserString) {
      setLoading(false);
      return;
    }

    try {
      const storedUser = JSON.parse(storedUserString) as AuthUser;

      setUser((prevUser) => {
        if (prevUser?.id === storedUser.id) {
          return prevUser;
        }
        return storedUser;
      });
    } catch (error) {
      console.error("Failed to parse stored user", error);

      localStorage.removeItem("token");

      localStorage.removeItem("storedUser");
    } finally {
      setLoading(false);
    }
  }, []);

  console.log("from auth context after use effect: ", user);

  return (
    <AuthContext.Provider value={{ user, setAuthUser: setUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// to access the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext muse be called within an AuthProvider comp",
    );
  }

  return context;
};
