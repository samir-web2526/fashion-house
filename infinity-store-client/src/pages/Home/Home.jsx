import Categories from "@/components/sections/Categories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import FlashSale from "@/components/sections/FlashSale";
import Hero from "@/components/sections/Hero";
import NewArrivals from "@/components/sections/NewArrivals";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CustomerReviews from "@/components/sections/CustomerReviews";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/pages/sharedPages/Footer";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

export default function Home() {
  const { siteName } = useSettings();
  return (
    <div className="h-full overflow-y-auto">
      <Helmet><title>{`Home | ${siteName}`}</title></Helmet>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <FlashSale />
      <NewArrivals />
      <WhyChooseUs />
      <CustomerReviews />
      <FAQ />
      <Footer />
    </div>
  );
}
