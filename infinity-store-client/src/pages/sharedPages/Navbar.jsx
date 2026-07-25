import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import useCart from "@/hooks/useCart";
import useTheme from "@/hooks/useTheme";
import { getCart } from "../../services/cart.api";
import fallbackLogo from "@/assets/images/logo.png";
import useSettings from "@/hooks/useSettings";

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const { cartCount, refetchCartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { siteName, logo } = useSettings();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (user) {
            getCart()
                .then((res) => {
                    refetchCartCount(res?.items?.length ?? res?.cart?.items?.length ?? 0);
                })
                .catch(() => {});
        }
    }, [user, refetchCartCount]);

    if (loading) {
            return (
                <header className="sticky top-0 z-50 h-16 border-b bg-background"></header>
        );
    }

    return (
        <header className="sticky top-0 z-50 border-b bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

                <Link
                    to="/"
                    className="flex items-center"
                >
                    <img src={logo || fallbackLogo} alt={siteName} className="h-10 w-auto dark:invert" />
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    <Link to="/">Home</Link>

                    <Link to="/products">
                        Products
                    </Link>
                </nav>

                <div className="flex items-center gap-4">

                    <div className="hidden relative lg:block">
                        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && search.trim()) {
                                    navigate(`/products?search=${encodeURIComponent(search.trim())}`);
                                }
                            }}
                            className="rounded-md border pl-8 pr-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted"
                        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    >
                        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </button>

                    {user && user.role !== "admin" && (
  <Link
    to="/cart"
    className="relative text-2xl"
  >
    <ShoppingCart className="size-6" />

    {cartCount > 0 && (
    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
      {cartCount}
    </span>
    )}
  </Link>
)}

                    {!user && (
                        <div className="flex items-center gap-3">

                            <Link
                                to="/login"
                                className="rounded-md border px-4 py-2"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-md bg-amber-600 px-4 py-2 text-white"
                            >
                                Register
                            </Link>

                        </div>
                    )}

                    {user && (
                        <div className="dropdown dropdown-end">

                            <div
                                tabIndex={0}
                                role="button"
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-amber-600 font-semibold text-white"
                            >
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>

                            <ul
                                tabIndex={0}
                                className="menu dropdown-content z-50 mt-3 w-56 rounded-box bg-background p-2 shadow"
                            >
                                <li>
                                    <Link to="/profile">
                                        Profile
                                    </Link>
                                </li>

                                {user.role !== "admin" && (
                                    <li>
                                        <Link to="/orders">
                                            My Orders
                                        </Link>
                                    </li>
                                )}

                                {user.role === "admin" && (
                                    <li>
                                        <Link to="/dashboard">
                                            Dashboard
                                        </Link>
                                    </li>
                                )}

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

            </div>
        </header>
    );
};

export default Navbar;