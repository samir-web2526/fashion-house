import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

export default function NotFound() {
  const { siteName } = useSettings();
  return (
    <div className="p-6">
      <Helmet>
        <title>{`404 - Page Not Found | ${siteName}`}</title>
      </Helmet>

      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-slate-600">Page not found.</p>
    </div>
  );
}
