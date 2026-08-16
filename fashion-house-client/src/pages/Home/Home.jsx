import Categories from "@/components/sections/Categories";
import BestSellingProducts from "@/components/sections/BestSellingProducts";
import FlashSale from "@/components/sections/FlashSale";
import Hero from "@/components/sections/Hero";
import NewArrivals from "@/components/sections/NewArrivals";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CustomerReviews from "@/components/sections/CustomerReviews";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/pages/sharedPages/Footer";
import LazySection from "@/components/LazySection";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { useLocation } from "react-router";
import { useEffect } from "react";

export default function Home() {
  const { siteName } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const sectionId = location.state?.scrollTo;
    if (sectionId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState({}, "");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);
  return (
    <div className="h-full">
      <Helmet><title>{`Home | ${siteName}`}</title></Helmet>
      <Hero />
      <LazySection>
        <NewArrivals />
      </LazySection>
      <LazySection>
        <Categories />
      </LazySection>
      <LazySection>
        <BestSellingProducts />
      </LazySection>
      <LazySection>
        <FlashSale />
      </LazySection>
      <LazySection>
        <WhyChooseUs />
      </LazySection>
      <LazySection>
        <CustomerReviews />
      </LazySection>
      <LazySection>
        <FAQ />
      </LazySection>
      <Footer />
    </div>
  );
}
