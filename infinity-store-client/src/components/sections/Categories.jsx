import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/services/product.api";
import { getCategories } from "@/services/category.api";
import CategoryCard from "./CategoryCard";

function CategoriesSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="shrink-0 animate-pulse">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-gray-200 bg-gray-50 sm:h-32 sm:w-32 overflow-hidden">
            <div className="h-16 w-16 rounded-full bg-muted sm:h-20 sm:w-20" />
          </div>
          <div className="mx-auto mt-3 h-3.5 w-16 rounded bg-muted" />
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
    <section id="categories" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
          <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 sm:gap-6 [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.slug} category={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
