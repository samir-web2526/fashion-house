import { Link } from "react-router";
import { Phone, MapPin, Mail } from "lucide-react";
import fallbackLogo from "@/assets/images/logo.png";
import useSettings from "@/hooks/useSettings";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

const SERVICES_LINKS = [
  { label: "Refund and Returns Policy", to: "/return-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const JOIN_LINKS = [
  { label: "Delivery Rules", to: "/delivery-rules" },
  { label: "Customer Feedback", to: "/contact" },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaTiktok, href: "#", label: "TikTok" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
];

export default function Footer() {
  // const navigate = useNavigate();
  const { siteName, logo, contactEmail, contactPhone, address } = useSettings();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo || fallbackLogo} alt={siteName} className="h-36 w-auto dark:invert" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteName} — providing elegance & lucrative outfit items sourced both locally & globally.
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 hover:text-foreground">
                  <Mail className="size-4 shrink-0" />
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-2 hover:text-foreground">
                  <Phone className="size-4 shrink-0" />
                  {contactPhone}
                </a>
              )}
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services & Help */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Services & Help
            </h3>
            <ul className="space-y-2.5">
              {SERVICES_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Join Us */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Join Us
            </h3>
            <ul className="space-y-2.5">
              {JOIN_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <a href={`tel:${contactPhone || "+8801XXXXXXXXX"}`} className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
                  Phone
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
