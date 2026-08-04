import { Link } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { getProducts } from "@/services/product.api";
import { formatBDT } from "@/utils/currency";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const heroStyles = `
  .hero-swiper .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.4);
    opacity: 1;
    transition: all 0.3s;
  }
  .hero-swiper .swiper-pagination-bullet-active {
    background: #fff;
    width: 24px;
    border-radius: 5px;
  }
`;

export default function Hero() {
  const { data, isLoading } = useQuery({
    queryKey: ["hero-products"],
    queryFn: () => getProducts({ limit: 50, featured: true }),
  });

  const products = (data?.products ?? []).filter(
    (p) => p.thumbnail || p.images?.length
  );

  if (isLoading) {
    return (
      <section
        id="hero"
        className="relative h-[400px] overflow-hidden bg-gradient-to-br from-background via-background to-muted sm:h-[500px] lg:h-[600px]"
      >
        <div className="flex size-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section
        id="hero"
        className="relative h-[400px] overflow-hidden bg-gradient-to-br from-background via-background to-muted sm:h-[500px] lg:h-[600px]"
      >
        <div className="flex size-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground/40">
            <svg
              className="size-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="text-sm font-medium">Premium Collection</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="relative overflow-hidden">
      <style>{heroStyles}</style>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: ".hero-prev",
          nextEl: ".hero-next",
        }}
        loop={products.length > 1}
        className="hero-swiper h-[400px] sm:h-[500px] lg:h-[600px]"
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="relative size-full bg-muted">
              <img
                src={product.thumbnail || product.images?.[0]}
                alt={product.title}
                className="size-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pb-24">
                  <div className="max-w-lg">
                    {product.brand && (
                      <span className="mb-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {product.brand}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl lg:leading-tight">
                      {product.title}
                    </h2>
                    {product.price != null && (
                      <p className="mt-2 text-xl font-semibold text-white sm:text-2xl lg:text-3xl">
                        {formatBDT(product.price)}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-3 sm:mt-6">
                      <Button
                        size="lg"
                        className="rounded-full px-6 sm:px-8"
                        nativeButton={false}
                        render={<Link to={`/products/${product._id}`} />}
                      >
                        <ShoppingCart className="size-4" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {products.length > 1 && (
          <>
            <button className="hero-prev absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background sm:left-5 sm:size-12">
              <ChevronLeft className="size-5" />
            </button>
            <button className="hero-next absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background sm:right-5 sm:size-12">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </Swiper>
    </section>
  );
}
