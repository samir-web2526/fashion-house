import Home from "@/views/Home/Home";
import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: "Home",
};

export const dynamic = 'force-dynamic';

async function fetchHomeData() {
  const baseUrl = getApiUrl();

  try {
    const [
      categoriesRes,
      newArrivalsRes,
      bestSellingRes,
      flashSaleRes,
      reviewsRes,
      bannersRes
    ] = await Promise.all([
      fetch(`${baseUrl}/categories`, { next: { revalidate: 10 } }),
      fetch(`${baseUrl}/products/new-arrivals`, { next: { revalidate: 10 } }),
      fetch(`${baseUrl}/products/best-sellers`, { next: { revalidate: 10 } }),
      fetch(`${baseUrl}/products/flash-sale`, { next: { revalidate: 10 } }),
      fetch(`${baseUrl}/products/reviews`, { next: { revalidate: 10 } }),
      fetch(`${baseUrl}/banners`, { next: { revalidate: 10 } }),
    ]);

    return {
      categoriesData: categoriesRes.ok ? await categoriesRes.json() : [],
      newArrivalsData: newArrivalsRes.ok ? await newArrivalsRes.json() : { products: [] },
      bestSellingData: bestSellingRes.ok ? await bestSellingRes.json() : { products: [] },
      flashSaleData: flashSaleRes.ok ? await flashSaleRes.json() : { products: [] },
      reviewsData: reviewsRes.ok ? await reviewsRes.json() : { reviews: [] },
      bannersData: bannersRes.ok ? await bannersRes.json() : [],
    };
  } catch (err) {
    console.error("Failed to fetch home page data:", err.message);
    return {
      categoriesData: [],
      newArrivalsData: { products: [] },
      bestSellingData: { products: [] },
      flashSaleData: { products: [] },
      reviewsData: { reviews: [] },
      bannersData: [],
    };
  }
}

export default async function Page() {
  const initialData = await fetchHomeData();

  return <Home initialData={initialData} />;
}
