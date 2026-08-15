import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function AdminRoute({ children }) {
  const { user, loading, fetchUser } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!loading && !user && !checking) {
      setChecking(true);
      fetchUser().finally(() => setChecking(false));
    }
  }, [loading, user, checking, fetchUser]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (user?.role === "admin") {
    return children;
  }

  return <Navigate to="/login" replace />;
}
