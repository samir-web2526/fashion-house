import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X} from "lucide-react";
import { getProducts } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/sections/ProductCard";
import Pagination from "@/components/ui/Pagination";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "asc" },
  { label: "Price: High to Low", value: "desc" },
  { label: "Rating", value: "rating" },
];

export default function Products() {
  const { siteName } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const updateCategory = (slug) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (slug) next.set("category", slug);
      else next.delete("category");
      return next;
    });
    setPage(1);
  };

  const applySearch = (q) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (q) next.set("search", q);
      else next.delete("search");
      return next;
    });
    setPage(1);
  };

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const categories = useMemo(() => {
    return categoriesData ?? [];
  }, [categoriesData]);

  const filteredProducts = useMemo(() => {
    let products = data?.products ?? [];

    if (selectedCategory) {
      const match = categories.find(
        (p) =>
          p.slug === selectedCategory ||
          p.children?.some(
            (c) =>
              c.slug === selectedCategory ||
              c.categories?.includes(selectedCategory)
          )
      );
      if (match) {
        const childSlugs = [];
        if (match.slug === selectedCategory) {
          for (const c of match.children ?? []) {
            childSlugs.push(...(c.categories ?? []));
          }
        } else {
          const child = match.children?.find(
            (c) =>
              c.slug === selectedCategory ||
              c.categories?.includes(selectedCategory)
          );
          if (child) childSlugs.push(...(child.categories ?? []));
        }
        if (childSlugs.length > 0) {
          products = products.filter((p) => childSlugs.includes(p.category));
        } else {
          products = products.filter((p) => p.category === selectedCategory);
        }
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      const matchedCategorySlugs = [];
      for (const parent of categories) {
        if (parent.name.toLowerCase().includes(q) || parent.slug.toLowerCase().includes(q)) {
          for (const c of parent.children ?? []) {
            matchedCategorySlugs.push(...(c.categories ?? []));
          }
        }
        for (const child of parent.children ?? []) {
          if (child.name.toLowerCase().includes(q) || child.slug.toLowerCase().includes(q)) {
            matchedCategorySlugs.push(...(child.categories ?? []));
          }
        }
      }

      products = products.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          matchedCategorySlugs.includes(p.category)
      );
    }

    const sorted = [...products];
    switch (sort) {
      case "asc":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "desc":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.meta?.createdAt ?? 0).getTime() -
            new Date(a.meta?.createdAt ?? 0).getTime()
        );
    }

    return sorted;
  }, [data, selectedCategory, searchQuery, sort, categories]);

  const totalPages = Math.ceil(filteredProducts.length / limit);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * limit,
    page * limit
  );

  const handleCategoryChange = (slug) => {
    updateCategory(slug === selectedCategory ? "" : slug);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSort("newest");
    setPage(1);
  };

  const hasFilters = selectedCategory || searchQuery;

  const activeCategoryLabel = useMemo(() => {
    if (!selectedCategory) return null;
    for (const parent of categories) {
      if (parent.slug === selectedCategory) return parent.name;
      for (const child of parent.children ?? []) {
        if (
          child.slug === selectedCategory ||
          child.categories?.includes(selectedCategory)
        ) {
          return child.name;
        }
      }
    }
    return selectedCategory;
  }, [selectedCategory, categories]);

  return (
    <div className="flex h-full flex-col bg-background">
      <Helmet><title>{`Products | ${siteName}`}</title></Helmet>
      <div className="shrink-0 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              All Products
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {filteredProducts.length} products found
              {activeCategoryLabel && (
                <> in <span className="font-medium text-foreground">{activeCategoryLabel}</span></>
              )}
              {searchQuery && (
                <> for &ldquo;<span className="font-medium text-foreground">{searchQuery}</span>&rdquo;</>
              )}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-4 pb-8 sm:px-6 lg:h-0 lg:flex-1 lg:overflow-y-auto lg:px-8">
        <div className="mx-auto max-w-7xl lg:flex lg:gap-8">

          {showFilters && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background p-4 transition-transform duration-200 lg:static lg:translate-x-0 lg:w-56 lg:border-0 lg:p-0 lg:py-1 lg:overflow-visible ${
              showFilters ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="space-y-6 py-1 overflow-visible">
              <div className="flex items-center justify-between lg:hidden">
                <span className="text-sm font-semibold text-foreground">Filters</span>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  key={searchQuery}
                  placeholder="Search products..."
                  defaultValue={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applySearch(e.target.value);
                    }
                  }}
                  className="pl-9"
                />
              </div>

              <div className="overflow-visible">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Categories
                </h3>
                <div className="space-y-0.5 overflow-visible">
                  {categories.map((parent) => {
                    const isActive =
                      selectedCategory === parent.slug ||
                      parent.children?.some(
                        (c) =>
                          c.slug === selectedCategory ||
                          c.categories?.includes(selectedCategory)
                      );

                    return (
                      <div key={parent.slug} className="relative group/parent">
                        <button
                          onClick={() => {
                            handleCategoryChange(selectedCategory === parent.slug ? "" : parent.slug);
                            if (!parent.children?.length) setShowFilters(false);
                          }}className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {parent.name}
                          {parent.children?.length > 0 && (
                            <svg
                              className={`size-3.5 transition-transform lg:group-hover/parent:rotate-90 ${isActive ? "rotate-90 lg:rotate-0 text-primary-foreground" : "rotate-90 lg:rotate-0 text-muted-foreground"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>

                        {parent.children?.length > 0 && (
                          <div className="invisible absolute left-0 top-full z-20 mt-0.5 w-full rounded-xl border border-border bg-card py-1.5 shadow-lg transition-all duration-150 group-hover/parent:visible group-hover/parent:opacity-100">
                            {parent.children.map((child) => {
                              const childActive =
                                selectedCategory === child.slug ||
                                child.categories?.includes(selectedCategory);

                              return (
                                <button
                                  key={child.slug}
                                  onClick={() => {
                                    handleCategoryChange(child.slug);
                                    setShowFilters(false);
                                  }}
                                  className={`flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm transition-colors ${
                                    childActive
                                      ? "bg-primary/10 font-medium text-primary"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  <span className="size-1 rounded-full bg-current opacity-40" />
                                  {child.name}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {parent.children?.length > 0 && isActive && (
                          <div className="pl-4 lg:hidden">
                            {parent.children.map((child) => {
                              const childActive =
                                selectedCategory === child.slug ||
                                child.categories?.includes(selectedCategory);

                              return (
                                <button
                                  key={child.slug}
                                  onClick={() => {
                                    handleCategoryChange(child.slug);
                                    setShowFilters(false);
                                  }}
                                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                                    childActive
                                      ? "bg-primary/10 font-medium text-primary"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  <span className="size-1 rounded-full bg-current opacity-40" />
                                  {child.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                >
                  <X className="size-4" data-icon="inline-start" />
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          <div className="min-w-0 lg:flex-1">
            <div className="shrink-0 py-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {activeCategoryLabel}
                      <button
                        onClick={() => handleCategoryChange(selectedCategory)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setShowFilters(true)}
                  >
                    <SlidersHorizontal className="size-4" />
                    Filters
                  </Button>
                  <SlidersHorizontal className="size-4 text-muted-foreground hidden lg:block" />
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : paginatedProducts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm text-muted-foreground">No products found.</p>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center pb-4">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
