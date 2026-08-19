"use client";

import Footer from "@/views/sharedPages/Footer";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

import usePageTitle from "@/hooks/usePageTitle";

export default function ReturnPolicy({ children }) {
  const { siteName } = useSettings();
  usePageTitle("Return Policy");
  return (
    <div className="h-full overflow-y-auto bg-background">
      <Helmet>
        <title>{`Return Policy | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Return Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 2026</p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">1. Return Eligibility</h2>
            <p className="mt-2 text-muted-foreground">
              You may return most items within 7 days of delivery. Items must be unused, in
              original packaging, and in the same condition as received.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">2. Non-Returnable Items</h2>
            <p className="mt-2 text-muted-foreground">
              Certain items cannot be returned, including perishable goods, personal care
              products, custom-made items, and gift cards.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">3. Return Process</h2>
            <p className="mt-2 text-muted-foreground">
              To initiate a return, contact our support team with your order number. We will
              provide instructions for shipping the item back.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">4. Refunds</h2>
            <p className="mt-2 text-muted-foreground">
              Refunds are processed within 5-7 business days after we receive and inspect the
              returned item. The refund will be credited to your original payment method.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">5. Exchanges</h2>
            <p className="mt-2 text-muted-foreground">
              We offer exchanges for items of equal value. Contact us to arrange an exchange
              for a different size or color.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">6. Damaged Items</h2>
            <p className="mt-2 text-muted-foreground">
              If you receive a damaged or defective item, contact us within 48 hours with photos
              of the damage. We will arrange a replacement or full refund.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
