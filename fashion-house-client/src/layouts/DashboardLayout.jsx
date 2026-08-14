import { useState } from "react";
import Sidebar from "@/pages/sharedPages/Sidebar";
import { Outlet, useNavigate } from "react-router";
import { Sun, Moon, Menu } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted lg:hidden"
          title="Open menu"
        >
          <Menu className="size-4" />
        </button>
        <div />
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {user && (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <ul
                tabIndex={0}
                className="menu dropdown-content z-50 mt-3 w-48 rounded-box bg-background p-2 shadow"
              >
                <li>
                  <button onClick={() => navigate("/profile")}>
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
