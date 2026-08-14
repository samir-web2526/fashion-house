import { useMemo, useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getProducts } from "@/services/product.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import ReviewCard from "./ReviewCard";

function ReviewSkeleton() {
  return (
    <div className="flex gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="shrink-0 basis-1/3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-4 h-4 w-24" />
            <Skeleton className="mt-3 h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getAllReviews(products) {
  const reviews = [];
  for (const product of products) {
    for (const review of product.reviews ?? []) {
      reviews.push({ ...review, productName: product.title });
    }
  }
  reviews.sort((a, b) => {
    const dateDiff = new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.rating ?? 0) - (a.rating ?? 0);
  });
  return reviews.slice(0, 10);
}

export default function CustomerReviews() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const reviews = useMemo(() => {
    const products = data?.products ?? [];
    return getAllReviews(products);
  }, [data]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What Our Customers Say
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Real reviews from customers who purchased our products.
          </p>
        </motion.div>

        {isLoading ? (
          <ReviewSkeleton />
        ) : reviews.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No reviews yet.
          </p>
        ) : (
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {reviews.map((review, i) => (
                  <div
                    key={`${review.reviewerName}-${review.date}-${i}`}
                    className="shrink-0 basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
                  >
                    <ReviewCard review={review} index={i} />
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon-sm"
              className="absolute -left-5 top-1/2 -translate-y-1/2 rounded-full shadow-md"
              disabled={!canScrollPrev}
              onClick={() => emblaApi?.scrollPrev()}
            >
              <ChevronLeftIcon className="size-4" />
              <span className="sr-only">Previous</span>
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              className="absolute -right-5 top-1/2 -translate-y-1/2 rounded-full shadow-md"
              disabled={!canScrollNext}
              onClick={() => emblaApi?.scrollNext()}
            >
              <ChevronRightIcon className="size-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
