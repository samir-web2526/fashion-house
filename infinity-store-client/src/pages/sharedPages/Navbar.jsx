import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Sun, Moon, ChevronDown, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import useCart from "@/hooks/useCart";
import useTheme from "@/hooks/useTheme";
import { getCart } from "../../services/cart.api";
import { getCategories } from "@/services/category.api";
import fallbackLogo from "@/assets/images/logo.png";
import useSettings from "@/hooks/useSettings";

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const { cartCount, refetchCartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { siteName, logo } = useSettings();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCatOpen, setMobileCatOpen] = useState(false);

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

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

                    <div className="relative group">
                        <button className="flex items-center gap-1 hover:text-amber-600 transition-colors">
                            Categories
                            <ChevronDown className="size-4" />
                        </button>

                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-0 top-full z-50 mt-2 w-125 rounded-lg border bg-background p-4 shadow-lg">
                            <div className="grid grid-cols-2 gap-4">
                                {categories?.map((cat) => (
                                    <div key={cat._id}>
                                        <Link
                                            to={`/products?category=${cat.slug}`}
                                            className="font-semibold text-sm hover:text-amber-600 transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                        {cat.children?.length > 0 && (
                                            <ul className="mt-1 space-y-1">
                                                {cat.children.map((child) => (
                                                    <li key={child.slug}>
                                                        <Link
                                                            to={`/products?category=${child.slug}`}
                                                            className="text-sm text-muted-foreground hover:text-amber-600 transition-colors"
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link to="/products">
                        Products
                    </Link>

                    <Link to="/about">
                        About Us
                    </Link>
                </nav>

                <div className="flex items-center gap-4">

                    <button
                        onClick={() => setMobileOpen(true)}
                        className="flex size-9 items-center justify-center rounded-md border transition-colors hover:bg-muted md:hidden"
                    >
                        <Menu className="size-5" />
                    </button>

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

            {mobileOpen && (
                <div className="fixed inset-0 z-100 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 bg-background p-6 shadow-lg overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <Link to="/" onClick={() => setMobileOpen(false)}>
                                <img src={logo || fallbackLogo} alt={siteName} className="h-8 w-auto dark:invert" />
                            </Link>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex size-8 items-center justify-center rounded-md border hover:bg-muted"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && search.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(search.trim())}`);
                                        setMobileOpen(false);
                                    }
                                }}
                                className="w-full rounded-md border pl-8 pr-3 py-2 text-sm"
                            />
                        </div>

                        <nav className="space-y-1">
                            <Link
                                to="/"
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                                Home
                            </Link>

                            <div>
                                <button
                                    onClick={() => setMobileCatOpen(!mobileCatOpen)}
                                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                                >
                                    Categories
                                    <ChevronDown className={`size-4 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
                                </button>
                                {mobileCatOpen && (
                                    <div className="ml-3 mt-1 space-y-2 border-l pl-3">
                                        {categories?.map((cat) => (
                                            <div key={cat._id}>
                                                <Link
                                                    to={`/products?category=${cat.slug}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block text-sm font-semibold hover:text-amber-600"
                                                >
                                                    {cat.name}
                                                </Link>
                                                {cat.children?.length > 0 && (
                                                    <ul className="mt-1 ml-3 space-y-1">
                                                        {cat.children.map((child) => (
                                                            <li key={child.slug}>
                                                                <Link
                                                                    to={`/products?category=${child.slug}`}
                                                                    onClick={() => setMobileOpen(false)}
                                                                    className="block text-sm text-muted-foreground hover:text-amber-600"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link
                                to="/products"
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                                Products
                            </Link>

                            <Link
                                to="/about"
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                            >
                                About Us
                            </Link>
                        </nav>

                        <div className="mt-6 border-t pt-4 space-y-2">
                            {!user && (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="block w-full rounded-md border px-4 py-2 text-center text-sm"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="block w-full rounded-md bg-amber-600 px-4 py-2 text-center text-sm text-white"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                            {user && (
                                <>
                                    <Link
                                        to="/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                                    >
                                        Profile
                                    </Link>
                                    {user.role !== "admin" && (
                                        <Link
                                            to="/orders"
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                                        >
                                            My Orders
                                        </Link>
                                    )}
                                    {user.role === "admin" && (
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            navigate("/login");
                                            setMobileOpen(false);
                                        }}
                                        className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-500 hover:bg-muted"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;