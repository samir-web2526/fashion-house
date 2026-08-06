import { Link, useNavigate } from "react-router";
import { Phone, MapPin } from "lucide-react";
import fallbackLogo from "@/assets/images/logo.png";
import useSettings from "@/hooks/useSettings";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const QUICK_LINKS = [
  { label: "Home", to: "/#hero" },
  { label: "Products", to: "/products" },
  { label: "Categories", to: "/#categories" },
  { label: "Featured Products", to: "/#featured-products" },
  { label: "Flash Sale", to: "/#flash-sale" },
  { label: "New Arrivals", to: "/#new-arrivals" },
];

const USEFUL_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Return Policy", to: "/return-policy" },
  { label: "Delivery Rules", to: "/delivery-rules" },
  { label: "Contact Us", to: "/contact" },
];

const SOCIAL_LINKS = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  const navigate = useNavigate();
  const { siteName, logo } = useSettings();

  const handleScrollLink = (e, to) => {
    if (to.startsWith("/#")) {
      const sectionId = to.substring(2);
      const element = document.getElementById(sectionId);
      if (element && window.location.pathname === "/") {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(to);
  };

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <Link to="/" className="inline-block">
              <img src={logo || fallbackLogo} alt={siteName} className="h-20 w-auto dark:invert" />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteName} — Your premium destination for quality products at
              unbeatable prices.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                <span>Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-muted-foreground/50" />
                <span>+880 1XXXXXXXXX</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={(e) => handleScrollLink(e, link.to)}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Useful Links
            </h3>
            <ul className="space-y-2.5">
              {USEFUL_LINKS.map((link) => (
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

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Stay Connected
            </h3>
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
                    className="flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:text-foreground"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights
            reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
