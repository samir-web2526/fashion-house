"use client";

import { usePathname } from 'next/navigation';
import Categories from "@/components/sections/Categories";
import BestSellingProducts from "@/components/sections/BestSellingProducts";
import FlashSale from "@/components/sections/FlashSale";
import Hero from "@/components/sections/Hero";
import NewArrivals from "@/components/sections/NewArrivals";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import CustomerReviews from "@/components/sections/CustomerReviews";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/views/sharedPages/Footer";
import useSettings from "@/hooks/useSettings";
// 
import { useEffect } from "react";

export default function Home({ initialData }) {
  const { siteName } = useSettings();

  return (
    <div className="h-full">
      <Hero initialData={initialData?.bannersData} />
      <NewArrivals initialData={initialData?.newArrivalsData} />
      <Categories initialData={initialData?.categoriesData} />
      <BestSellingProducts initialData={initialData?.bestSellingData} />
      <FlashSale initialData={initialData?.flashSaleData} />
      <WhyChooseUs />
      <CustomerReviews initialData={initialData?.reviewsData} />
      <FAQ />
      <Footer />
    </div>
  );
}
