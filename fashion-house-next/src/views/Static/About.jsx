"use client";

import Footer from "@/views/sharedPages/Footer";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { Shield, Truck, Headphones, Heart, Target, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Trusted & Secure",
    description: "Your data and transactions are protected with industry-leading security measures.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "We deliver your orders quickly and reliably right to your doorstep.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated support team is always ready to assist you with any queries.",
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every decision we make starts with our customers. Your satisfaction is our top priority.",
  },
  {
    icon: Target,
    title: "Quality Guarantee",
    description: "We carefully curate our products to ensure you receive only the best quality.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "We believe in building a community of loyal customers who share our vision.",
  },
];

import usePageTitle from "@/hooks/usePageTitle";

export default function About({ children }) {
  const { siteName } = useSettings();
  usePageTitle("About Us");
  return (
    <div className="h-full overflow-y-auto bg-background">
      <Helmet>
        <title>{`About Us | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">About Us</h1>
        <p className="mt-2 text-muted-foreground">Last updated: August 2026</p>

        <div className="mt-8 space-y-12">
          <div>
            <h2 className="text-xl font-bold text-foreground">Who We Are</h2>
            <p className="mt-2 text-muted-foreground">
              Welcome to {siteName} — your one-stop destination for quality products at
              unbeatable prices. We started with a simple mission: to make online shopping
              accessible, affordable, and enjoyable for everyone.
            </p>
            <p className="mt-2 text-muted-foreground">
              Founded with a passion for excellence, we have grown from a small startup to a
              trusted e-commerce platform serving thousands of happy customers. Our journey is
              fueled by the belief that everyone deserves access to great products without
              breaking the bank.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">What We Offer</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-border bg-card p-6 text-center"
                  >
                    <Icon className="mx-auto size-8 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Our Mission</h2>
            <p className="mt-2 text-muted-foreground">
              Our mission is to redefine the online shopping experience by combining
              affordability with quality. We work directly with trusted suppliers to bring you
              products that meet our high standards — all at prices that make sense.
            </p>
            <p className="mt-2 text-muted-foreground">
              We are committed to transparency, fast delivery, and exceptional customer service.
              Whether you are shopping for the first time or are a loyal customer, we want every
              interaction with {siteName} to be seamless and satisfying.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Our Values</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {VALUES.map((value) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className="rounded-xl border border-border bg-card p-6 text-center"
                  >
                    <Icon className="mx-auto size-8 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Why Choose Us?</h2>
            <ul className="mt-2 list-inside list-disc space-y-2 text-muted-foreground">
              <li>Wide range of carefully curated products</li>
              <li>Competitive prices with regular deals and discounts</li>
              <li>Secure payment options for worry-free shopping</li>
              <li>Fast and reliable shipping across the country</li>
              <li>Hassle-free return and refund policy</li>
              <li>Dedicated customer support team available around the clock</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <h2 className="text-xl font-bold text-foreground">Join Our Growing Community</h2>
            <p className="mt-2 text-muted-foreground">
              Thousands of customers already trust {siteName} for their shopping needs.
              Experience the difference today and discover why people keep coming back.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
