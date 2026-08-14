import { Link, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Sun, Moon, ChevronDown, Menu, X, Phone, Package, House, LayoutGrid, Store, TrendingUp, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useCart from "@/hooks/useCart";
import useTheme from "@/hooks/useTheme";
import { getCategories } from "@/services/category.api";
import useSettings from "@/hooks/useSettings";
import { getLocalCartCount } from "@/utils/localCart";

const Navbar = () => {
    const { cartCount, refetchCartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { siteName, logo, contactPhone } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCatOpen, setMobileCatOpen] = useState(false);

    const scrollToSection = (sectionId) => {
        if (location.pathname === "/") {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/", { state: { scrollTo: sectionId } });
        }
    };

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    useEffect(() => {
        refetchCartCount(getLocalCartCount());
    }, [refetchCartCount]);

    return (
        <header className="sticky top-0 z-100 bg-background">
            {/* Top Header */}
            <div className="border-b border-border">
                <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4">
                    <Link to="/" className="flex items-center shrink-0">
                        {logo && <img src={logo} alt={siteName} className="h-2 sm:h-16 w-auto dark:invert" />}
                    </Link>

                    <div className="hidden flex-1 max-w-xl mx-6 md:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Product....."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && search.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(search.trim())}`);
                                    }
                                }}
                                className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-4 pr-12 text-sm outline-none focus:border-foreground/30 transition-colors"
                            />
                            <button
                                onClick={() => {
                                    if (search.trim()) {
                                        navigate(`/products?search=${encodeURIComponent(search.trim())}`);
                                    }
                                }}
                                className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Search className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/orders"
                            className="hidden items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gray-800 lg:flex"
                        >
                            <Package className="size-4" />
                            <span className="hidden xl:inline">Track Your Order</span>
                        </Link>

                        <a
                            href={`tel:${contactPhone || "+8801XXXXXXXXX"}`}
                            className="hidden items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-gray-800 lg:flex"
                        >
                            <Phone className="size-4" />
                            <span className="hidden xl:inline">{contactPhone || "+8809613111333"}</span>
                        </a>

                        <div className="hidden h-6 w-px bg-border lg:block" />

                        <button
                            onClick={toggleTheme}
                            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </button>

                        <Link
                            to="/cart"
                            className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ShoppingCart className="size-5" />
                            {cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/login"
                            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                            Admin
                        </Link>

                        <button
                            onClick={() => setMobileOpen(true)}
                            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                        >
                            <Menu className="size-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <nav className="hidden border-b border-border md:block">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center gap-1">
                        <Link to="/" className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] ${location.pathname === "/" ? "border-foreground text-foreground" : "border-transparent text-foreground hover:bg-muted"}`}>
                            <House className="size-4" />
                            <span className="text-base">Home</span>
                        </Link>

                        <div className="relative group/dropdown">
                            <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] border-transparent text-foreground hover:bg-muted">
                                <LayoutGrid className="size-4" />
                                <span className="text-base">Categories</span>
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                            </button>
                            <div className="invisible opacity-0 group-hover/dropdown:visible group-hover/dropdown:opacity-100 transition-all duration-200 fixed left-1/2 -translate-x-1/2 z-200 w-7xl border-b border-border bg-background shadow-xl">
                                <div className="mx-auto max-w-7xl p-6">
                                    <div className="grid grid-cols-6 gap-6">
                                        {categories?.slice(0, 18).map((cat) => (
                                            <div key={cat._id}>
                                                <Link
                                                    to={`/products?category=${cat.slug}`}
                                                    className="block text-sm font-bold text-foreground hover:underline mb-2"
                                                >
                                                    {cat.name}
                                                </Link>
                                                {cat.children?.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        {cat.children.map((sub, idx) => (
                                                            <Link
                                                                key={idx}
                                                                to={`/products?category=${sub.slug || cat.slug}`}
                                                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/products" className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] ${location.pathname === "/products" && !location.search ? "border-foreground text-foreground" : "border-transparent text-foreground hover:bg-muted"}`}>
                            <Store className="size-4" />
                            <span className="text-base">Shop Product</span>
                        </Link>

                        <button
                            onClick={() => scrollToSection("best-selling")}
                            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] border-transparent text-foreground hover:bg-muted"
                        >
                            <TrendingUp className="size-4" />
                            <span className="text-base">Best Selling</span>
                        </button>

                        <button
                            onClick={() => scrollToSection("flash-sale")}
                            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] border-transparent text-foreground hover:bg-muted"
                        >
                            <Zap className="size-4" />
                            <span className="text-base">Flash Sale</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-100 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <Link to="/" onClick={() => setMobileOpen(false)}>
                                {logo && <img src={logo} alt={siteName} className="h-14 w-auto dark:invert" />}
                            </Link>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="px-5 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search Product....."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && search.trim()) {
                                            navigate(`/products?search=${encodeURIComponent(search.trim())}`);
                                            setMobileOpen(false);
                                        }
                                    }}
                                    className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground/30"
                                />
                            </div>
                        </div>

                        <div className="px-5 pb-4">
                            <Link
                                to="/orders"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <Package className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="font-semibold">Track Order</div>
                                    <div className="text-xs text-muted-foreground">Know Your Order Status</div>
                                </div>
                            </Link>
                        </div>

                        <nav className="border-t border-border px-5 py-4">
                            <div className="space-y-1">
                                <Link
                                    to="/"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Home
                                </Link>

                                <div>
                                    <button
                                        onClick={() => setMobileCatOpen(!mobileCatOpen)}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        <span>Categories</span>
                                        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {mobileCatOpen && (
                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-4">
                                            {categories?.map((cat) => (
                                                <Link
                                                    key={cat._id}
                                                    to={`/products?category=${cat.slug}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to="/products"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Shop Product
                                </Link>

                                <button
                                    onClick={() => { scrollToSection("best-selling"); setMobileOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Best Selling
                                </button>

                                <button
                                    onClick={() => { scrollToSection("flash-sale"); setMobileOpen(false); }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Flash Sale
                                </button>
                            </div>
                        </nav>

                        <div className="border-t border-border px-5 py-4 space-y-2">
                            <Link
                                to="/cart"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <ShoppingCart className="size-4" />
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
