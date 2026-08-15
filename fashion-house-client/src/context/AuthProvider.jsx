import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { getProfile, logoutUser } from "@/services/auth.api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const info = {
    user,
    setUser,
    loading,
    setLoading,
    fetchUser,
    logout,
  };

  return (
    <AuthContext.Provider value={info}>
      {children}
    </AuthContext.Provider>
  );
}
