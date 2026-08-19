"use client";

import Footer from "@/views/sharedPages/Footer";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

import usePageTitle from "@/hooks/usePageTitle";

export default function Privacy({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Privacy Policy");
  return (
    <div className="h-full overflow-y-auto bg-background">
      <Helmet>
        <title>{`Privacy Policy | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 2026</p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p className="mt-2 text-muted-foreground">
              We collect information you provide directly, such as your name, email address,
              shipping address, and payment details when you place an order or create an account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">2. How We Use Your Information</h2>
            <p className="mt-2 text-muted-foreground">
              We use your information to process orders, send order updates, improve our
              services, and communicate with you about promotions or new products.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">3. Information Sharing</h2>
            <p className="mt-2 text-muted-foreground">
              We do not sell or rent your personal information to third parties. We may share
              your data with trusted service providers who assist in operating our website and
              fulfilling orders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">4. Data Security</h2>
            <p className="mt-2 text-muted-foreground">
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">5. Cookies</h2>
            <p className="mt-2 text-muted-foreground">
              Our website uses cookies to enhance your browsing experience. You can choose to
              disable cookies through your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">6. Your Rights</h2>
            <p className="mt-2 text-muted-foreground">
              You have the right to access, update, or delete your personal information. Contact
              us at support@infinitystore.com for any requests.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
