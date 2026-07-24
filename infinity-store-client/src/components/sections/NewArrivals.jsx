import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/services/product.api";
import { Skeleton } from "@/components/ui/skeleton";
import NewArrivalsProductCard from "./NewArrivalsProductCard";

function NewArrivalsSkeleton() {
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
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getNewArrivalProducts(products) {
  const sorted = [...products].sort((a, b) => {
    const dateA = new Date(a.meta?.createdAt ?? 0).getTime();
    const dateB = new Date(b.meta?.createdAt ?? 0).getTime();
    if (dateB !== dateA) return dateB - dateA;
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;
    return (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0);
  });

  return sorted.slice(0, 8);
}

export default function NewArrivals() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const products = useMemo(() => {
    const allProducts = data?.products ?? [];
    return getNewArrivalProducts(allProducts);
  }, [data]);

  return (
    <section id="new-arrivals" className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              New Arrivals
            </h2>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Freshly added products waiting for you.
          </p>
        </motion.div>

        {isLoading ? (
          <NewArrivalsSkeleton />
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <NewArrivalsProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
