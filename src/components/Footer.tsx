import { Link } from "react-router-dom";
import logo from "@/assets/logo/image.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Behnke Trailers" className="h-20 w-auto" />
            </Link>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Heavy-duty trailers engineered for the toughest jobs in
              agriculture, construction, and heavy haul.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
              Products
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/trailers"
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Trailers
                </Link>
              </li>
              {[
                "Flatbed Trailers",
                "Tilt Trailers",
                "Tag Trailers",
                "Custom Builds",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {["About Us", "Dealers", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-widest mb-4">
              Contact
            </h4>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Behnke Enterprises
              <br />
              info@behnke.com
              <br />
              (555) 123-4567
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} Behnke Enterprises. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a
                key={l}
                href="#"
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
