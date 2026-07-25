import { NavLink } from "react-router";
import fallbackLogo from "@/assets/images/logo.png";
import useSettings from "@/hooks/useSettings";

export default function Sidebar({ open, onClose }) {
  const { siteName, logo } = useSettings();
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Products",
      path: "/dashboard/products",
    },
    {
      name: "Categories",
      path: "/dashboard/categories",
    },
    {
      name: "Orders",
      path: "/dashboard/orders",
    },
    {
      name: "Users",
      path: "/dashboard/users",
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
    },
    {
      name: "Profile",
      path: "/profile",
    },
    {
      name: "Home",
      path: "/",
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card p-5 transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <img src={logo || fallbackLogo} alt={siteName} className="mb-6 h-10 w-auto dark:invert" />

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-md px-4 py-2 transition ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
