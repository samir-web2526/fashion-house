import { useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { getProfile, logoutUser } from "../services/auth.api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        if (err?.response?.status !== 401) {
          console.error("Failed to fetch profile:", err);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data);
      return data;
    } catch (error) {
      console.error(error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.error(error);
  } finally {
    setUser(null);
  }
};

const info = {
  user,
  setUser,
  loading,
  fetchUser,
  logout
};

return (
  <AuthContext.Provider value={info}>
    {children}
  </AuthContext.Provider>
)
}