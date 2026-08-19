"use client";

import Footer from "@/views/sharedPages/Footer";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

export default function Terms({ children }) {
  const { siteName } = useSettings();
  return (
    <div className="h-full overflow-y-auto bg-background">
      <Helmet>
        <title>{`Terms & Conditions | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Terms & Conditions</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 2026</p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-2 text-muted-foreground">
              By accessing and using {siteName}, you agree to be bound by these Terms and
              Conditions. If you do not agree, please do not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">2. Products & Pricing</h2>
            <p className="mt-2 text-muted-foreground">
              All product descriptions, images, and prices are subject to change without notice.
              We reserve the right to modify or discontinue any product at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">3. Orders</h2>
            <p className="mt-2 text-muted-foreground">
              We reserve the right to refuse or cancel any order for any reason. You are
              responsible for providing accurate billing and shipping information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">4. Payment</h2>
            <p className="mt-2 text-muted-foreground">
              Payment must be received in full before order processing. We accept the payment
              methods listed at checkout.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">5. Intellectual Property</h2>
            <p className="mt-2 text-muted-foreground">
              All content on this site, including text, graphics, logos, and images, is the
              property of {siteName} and is protected by copyright laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">6. Limitation of Liability</h2>
            <p className="mt-2 text-muted-foreground">
              {siteName} shall not be liable for any indirect, incidental, or consequential
              damages arising from the use of our products or services.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
