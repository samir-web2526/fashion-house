import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getProducts } from "@/services/product.api";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";

function FeaturedSkeleton() {
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

function calculateScore(product) {
  const rating = product.rating ?? 0;
  const discount = product.discountPercentage ?? 0;
  const stock = product.stock ?? 0;

  return rating * 50 + discount * 3 + Math.log2(stock + 1) * 5;
}

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const featuredProducts = useMemo(() => {
    const products = data?.products ?? [];

    const scored = products.map((product) => ({
      ...product,
      score: calculateScore(product),
    }));

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
      if ((b.discountPercentage ?? 0) !== (a.discountPercentage ?? 0))
        return (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0);
      return (b.stock ?? 0) - (a.stock ?? 0);
    });

    const top = scored.slice(0, 8);
    if (top.length === 0) return [];

    const maxRating = Math.max(...top.map((p) => p.rating ?? 0));
    const maxReviews = Math.max(...top.map((p) => (p.reviews?.length ?? 0)));

    return top.map((product) => {
      const rating = product.rating ?? 0;
      const reviewCount = product.reviews?.length ?? 0;
      const discount = product.discountPercentage ?? 0;

      let badge = null;

      if (discount >= 15) {
        badge = "best-seller";
      }
      else if (rating === maxRating && maxRating > 0) {
        badge = "top-rated";
      }
       else if (reviewCount === maxReviews && maxReviews > 0) {
        badge = "popular";
      }

      return { ...product, badge };
    });
  }, [data]);

  return (
    <section id="featured-products" className="bg-background pb-16 pt-6 sm:pb-20 sm:pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Featured Products
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Discover our most recommended products based on quality, value, and availability.
          </p>
        </motion.div>

        {isLoading ? (
          <FeaturedSkeleton />
        ) : featuredProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
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
