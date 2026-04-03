import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo/logo.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Industries", href: "/#industries" },
  { label: "Customer Build", href: "/#custom-builds" },
  { label: "Trailers", href: "/trailers" },
  { label: "Dealers", href: "/#dealers" },
  { label: "Contact", href: "/#contact" },
];

const Header = () => {
  const { pathname } = useLocation();
  const isHomePage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={isHomePage ? { y: -100 } : false}
      animate={{ y: 0 }}
      transition={
        isHomePage
          ? { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
          : { duration: 0 }
      }
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-20 px-6">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Behnke Trailers" className="h-14 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-sm hover:brightness-110 transition-all duration-300"
          >
            Login
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background/98 backdrop-blur-md border-b border-border px-6 pb-6"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block mt-2 text-center px-5 py-2.5 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-sm"
          >
            Login
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
