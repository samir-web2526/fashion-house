import { Phone, Mail, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import Footer from "@/pages/sharedPages/Footer";

export default function Contact() {
  const { siteName } = useSettings();
  return (
    <div className="h-full overflow-y-auto bg-background">
      <Helmet>
        <title>{`Contact Us | ${siteName}`}</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Have questions? We&apos;d love to hear from you.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Phone className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Phone</h3>
            <p className="mt-1 text-sm text-muted-foreground">+880 1XXXXXXXXX</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Mail className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Email</h3>
            <p className="mt-1 text-sm text-muted-foreground">support@infinitystore.com</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <MapPin className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground">Address</h3>
            <p className="mt-1 text-sm text-muted-foreground">Dhaka, Bangladesh</p>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">Send a Message</h2>
          <form className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
