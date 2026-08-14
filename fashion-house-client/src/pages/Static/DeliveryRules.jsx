import Footer from "@/pages/sharedPages/Footer";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

export default function DeliveryRules() {
  const { siteName } = useSettings();
  return (
    <div className="h-full overflow-y-auto bg-background">
      <Helmet>
        <title>{`Delivery Rules | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Delivery Rules</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 2026</p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">1. Delivery Areas</h2>
            <p className="mt-2 text-muted-foreground">
              We currently deliver to all addresses within Bangladesh. International shipping
              is not available at this time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">2. Delivery Time</h2>
            <p className="mt-2 text-muted-foreground">
              Standard delivery takes 3-5 business days within Dhaka and 5-7 business days
              outside Dhaka. Express delivery (1-2 days) is available for Dhaka orders.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">3. Shipping Charges</h2>
            <p className="mt-2 text-muted-foreground">
              Standard shipping is free for orders over ৳6,000. A flat rate of ৳60 applies for
              orders within Dhaka, and ৳120 for orders outside Dhaka.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">4. Order Tracking</h2>
            <p className="mt-2 text-muted-foreground">
              Once your order is shipped, you will receive a tracking number via SMS and email
              to monitor your delivery status.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">5. Delivery Instructions</h2>
            <p className="mt-2 text-muted-foreground">
              Please provide a complete and accurate delivery address. Our delivery partner will
              contact you before delivery. Ensure someone is available to receive the package.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">6. Failed Delivery</h2>
            <p className="mt-2 text-muted-foreground">
              If delivery fails due to incorrect address or unavailability, we will attempt
              redelivery. Additional charges may apply for repeated attempts.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
