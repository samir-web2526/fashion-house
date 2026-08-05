import { Link } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { getBanners } from "@/services/banner.api";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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
    queryKey: ["banners"],
    queryFn: getBanners,
  });

  const banners = (data ?? []).filter((b) => b.isActive && (b.image || b.images?.length > 0));

  if (isLoading) {
    return (
      <section
        id="hero"
        className="relative h-80 overflow-hidden sm:h-100 lg:h-125"
      >
        <div className="flex size-full items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section id="hero" className="relative overflow-hidden px-4 sm:px-6 lg:px-40 pt-4 sm:pt-6">
      <style>{heroStyles}</style>
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        speed={800}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: ".hero-prev",
          nextEl: ".hero-next",
        }}
        loop={banners.length > 1}
        className="hero-swiper h-80 sm:h-100 lg:h-125"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner._id}>
            <div className="relative size-full">
              <img
                src={banner.image || banner.images?.[0]}
                alt={banner.title}
                className="size-full object-cover object-center opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-end">
                <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 sm:px-6 sm:pb-16 lg:px-8 lg:pb-24">
                  <div className="max-w-lg">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl lg:leading-tight">
                      {banner.title}
                    </h2>
                    <div className="mt-4 flex items-center gap-3 sm:mt-6">
                      <Button
                        size="lg"
                        className="rounded-full px-6 sm:px-8 bg-yellow-500 hover:bg-white hover:text-black transition-all duration-500 ease-in-out"
                        nativeButton={false}
                        render={<Link to="/products" />}
                      >
                        <ShoppingCart className="size-4" />
                        Shop Now
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        {banners.length > 1 && (
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
      </div>
    </section>
  );
}
