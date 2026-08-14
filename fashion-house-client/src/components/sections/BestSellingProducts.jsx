import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/services/product.api";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";

function BestSellingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BestSellingProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const bestSellingProducts = useMemo(() => {
    const products = data?.products ?? [];

    const sorted = [...products].sort((a, b) => {
      const soldA = a.sold ?? 0;
      const soldB = b.sold ?? 0;
      if (soldB !== soldA) return soldB - soldA;
      const reviewA = a.reviews?.length ?? 0;
      const reviewB = b.reviews?.length ?? 0;
      if (reviewB !== reviewA) return reviewB - reviewA;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });

    const top = sorted.slice(0, 8);
    if (top.length === 0) return [];

    const maxSold = Math.max(...top.map((p) => p.sold ?? 0));
    const maxRating = Math.max(...top.map((p) => p.rating ?? 0));

    return top.map((product) => {
      let badge = null;

      if ((product.sold ?? 0) === maxSold && maxSold > 0) {
        badge = "best-seller";
      } else if ((product.rating ?? 0) === maxRating && maxRating > 0) {
        badge = "top-rated";
      }

      return { ...product, badge };
    });
  }, [data]);

  return (
    <section id="best-selling" className="bg-background pb-16 pt-6 sm:pb-20 sm:pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Best Selling Products
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Our most popular products loved by customers.
          </p>
        </motion.div>

        {isLoading ? (
          <BestSellingSkeleton />
        ) : bestSellingProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellingProducts.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                index={i}
                badge={product.badge}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
