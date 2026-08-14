import { useMemo } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import { Skeleton } from "@/components/ui/skeleton";

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-9">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square overflow-hidden rounded-full border border-border bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="mt-1.5 h-3 w-full rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function Categories() {
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const isLoading = categoriesLoading || productsLoading;

  const categories = useMemo(() => {
    const rawCategories = categoriesData ?? [];
    const products = productsData?.products ?? [];

    const countMap = new Map();
    for (const product of products) {
      const cat = product.category;
      if (!cat) continue;
      countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
    }

    return rawCategories.map((parent) => {
      let totalCount = 0;
      for (const child of parent.children ?? []) {
        for (const catSlug of child.categories ?? []) {
          totalCount += countMap.get(catSlug) ?? 0;
        }
      }

      return {
        name: parent.name,
        slug: parent.slug,
        image: parent.image || "",
        count: totalCount,
      };
    });
  }, [categoriesData, productsData]);

  return (
    <section id="categories" className="bg-background py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Categories
          </h2>
        </motion.div>

        {isLoading ? (
          <CategoriesSkeleton />
        ) : categories.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No categories found.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-9">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block text-center"
                >
                  <div className="aspect-square overflow-hidden rounded-full border border-border bg-muted transition-all duration-300 group-hover:border-foreground/30 group-hover:shadow-md">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-1.5 text-[11px] font-bold text-foreground sm:text-xs">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
