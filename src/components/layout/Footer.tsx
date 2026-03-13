import { Facebook, Linkedin, Twitter, Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <h4 className="font-black text-lg mb-4 uppercase">
              HYDRAULIC <span className="text-[#4567a4]">pumps</span>
            </h4>
            <p className="text-slate-400 mb-4">
              5500 SW 6TH PL

              <br />
             Ocala, Florida 34474
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-black text-lg mb-4">Shop</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="/catalog"
                  className="hover:text-[#da789b] transition-colors"
                >
                  Hydraulic Pumps
                </a>
              </li>
              <li>
                <a
                  href="/catalog"
                  className="hover:text-[#da789b] transition-colors"
                >
                  Power Units
                </a>
              </li>
              <li>
                <a
                  href="/catalog"
                  className="hover:text-[#da789b] transition-colors"
                >
                  Accessories
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="/" className="hover:text-[#da789b] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/warranty"
                  className="hover:text-[#da789b] transition-colors"
                >
                  Warranty Registration
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#da789b] transition-colors"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-[#da789b] transition-colors"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black text-lg mb-4">Contact</h3>
            <ul className="space-y-4 text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#da789b]" />
                <a
                  href="mailto:sales@hydraulicpumps.com"
                  className="text-sm hover:text-[#da789b] transition-colors"
                >
                  sales@hydraulicpumps.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15153091469"
                  className="hover:text-[#da789b] transition-colors font-bold text-lg"
                >
                  (515) 309-1469
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://facebook.com"
                className="bg-slate-800 hover:bg-[#da789b] p-2 rounded-full transition-colors"
                aria-label="Visit HYDRAULIC pumps on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                className="bg-slate-800 hover:bg-[#da789b] p-2 rounded-full transition-colors"
                aria-label="Visit HYDRAULIC pumps on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                className="bg-slate-800 hover:bg-[#da789b] p-2 rounded-full transition-colors"
                aria-label="Visit HYDRAULIC pumps on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                className="bg-slate-800 hover:bg-[#da789b] p-2 rounded-full transition-colors"
                aria-label="Visit HYDRAULIC pumps on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © 2026 HYDRAULIC pumps. All rights reserved.
          </p>
          <div className="flex gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
              alt="Visa"
              className="h-8 opacity-70"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className="h-8 opacity-70"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
              alt="PayPal"
              className="h-8 opacity-70"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
