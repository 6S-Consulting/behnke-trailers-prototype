import {
  Heart,
  LayoutDashboard,
  Menu,
  Scale,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  Compass,
} from "lucide-react";
import { useState } from "react";
import { Link, useRouter } from "@/lib/router";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { MultiModalSearch } from "./MultiModalSearch";
import { DiscoveryModal } from "./DiscoveryModal";
import { useCompare } from "@/context/CompareContext";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
  const { items, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareList } = useCompare();
  const { route, navigate } = useRouter();
  const { isLoggedIn, logout, role } = useAuth();

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const isActive = (path: string) =>
    route === path || (path !== "/" && route.startsWith(path));

  const categories = [
    {
      name: "Industrial Piston Pumps",
      hasSubmenu: true,
      subcategories: [
        { label: "PVP Series", groupId: "pvp-series" },
        { label: "PD Series", groupId: "pd-series" },
        { label: "Oildyne Miniature", groupId: "oildyne" },
      ],
    },
    {
      name: "Industrial Gear Pumps",
      hasSubmenu: true,
      subcategories: [
        { label: "PGP505 Series", groupId: "pgp505" },
        { label: "PGP511 Series", groupId: "pgp511" },
      ],
    },
    {
      name: "Mobile Piston Pumps",
      hasSubmenu: true,
      subcategories: [
        { label: "F1 Series", groupId: "f1-series" },
        { label: "F2 Series", groupId: "f2-series" },
        { label: "F3 Series", groupId: "f3-series" },
        { label: "Gold Cup Series", groupId: "gold-cup" },
      ],
    },
    {
      name: "Mobile Gear Pumps",
      hasSubmenu: true,
      subcategories: [
        { label: "PGP315 Series", groupId: "pgp315" },
        { label: "PGP330 Series", groupId: "pgp330" },
        { label: "PGP350 Series", groupId: "pgp350" },
        { label: "PGP365 Series", groupId: "pgp365" },
      ],
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full shadow-sm">
      {/* Top Bar - Gradient  */}
      <div className="relative bg-white py-3">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-40% to-[#00a1d0] to-100%" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-0 flex-shrink-0">
              <div className="flex flex-col ml-1 sm:ml-3">
                <span className="text-xl font-black leading-none tracking-tight text-slate-900 uppercase">
                  HYDRAULIC <span className="text-[#4567a4]">pumps</span>
                </span>
                <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">
                  Premium Hydraulic Solutions
                </span>
              </div>
            </Link>

            {/* Multi-Modal Search Bar */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl">
              <MultiModalSearch />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Discover Feature */}
              <button
                onClick={() => setIsDiscoverOpen(true)}
                className="hidden lg:flex flex-col items-center text-slate-700 hover:text-[#4567a4] transition-colors group"
                aria-label="Discover products"
              >
                <Compass size={22} strokeWidth={2.5} className="group-hover:rotate-45 transition-transform duration-500" />
                <span className="text-[10px] font-bold mt-0.5 uppercase">
                  Discover
                </span>
              </button>

              {isLoggedIn && role === "admin" && (
                <Link
                  to="/admin"
                  className="hidden sm:flex flex-col items-center text-slate-700 hover:text-[#4567a4] transition-colors"
                >
                  <LayoutDashboard size={22} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold mt-0.5 uppercase">
                    Admin
                  </span>
                </Link>
              )}

              <div className="relative group hidden sm:flex flex-col items-center z-50">
                <Link
                  to={isLoggedIn ? "/account" : "/login"}
                  className="flex flex-col items-center text-slate-700 hover:text-[#4567a4] transition-colors"
                >
                  <User size={22} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold mt-0.5 uppercase">
                    {isLoggedIn ? "Account" : "Sign in"}
                  </span>
                </Link>

                {isLoggedIn && (
                  <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block z-50">
                    <div className="bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden py-1">
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-black font-medium"
                      >
                        My Account
                      </Link>

                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/compare"
                className="hidden sm:flex flex-col items-center text-slate-700 hover:text-[#4567a4] transition-colors"
              >
                <div className="relative">
                  <Scale size={22} strokeWidth={2.5} />
                  {compareList.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#da789b] via-[#cb44a8] to-[#4567a4] text-[9px] font-black text-white">
                      {compareList.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold mt-0.5 uppercase">
                  Compare
                </span>
              </Link>

              <Link
                to="/wishlist"
                className="hidden sm:flex flex-col items-center text-slate-700 hover:text-[#4567a4] transition-colors"
              >
                <div className="relative">
                  <Heart size={22} strokeWidth={2.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#da789b] via-[#cb44a8] to-[#4567a4] text-[9px] font-black text-white">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold mt-0.5 uppercase">
                  Wishlist
                </span>
              </Link>

              <button
                onClick={openCart}
                className="flex flex-col items-center text-slate-700 hover:text-[#4567a4] transition-colors relative"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <div className="relative">
                  <ShoppingCart size={22} strokeWidth={2.5} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#da789b] via-[#cb44a8] to-[#4567a4] text-[9px] font-black text-white">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold mt-0.5 uppercase">
                  Cart
                </span>
              </button>

              <button
                className="md:hidden text-slate-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative bg-white hidden md:block">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-40% to-[#00a1d0] to-100%" />
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-12 items-center justify-between">
            <div className="flex items-center h-full">
              {/* Category Dropdown */}
              <div
                className="relative flex items-center gap-2 px-4 h-full border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors group"
                onMouseEnter={() => setIsCategoriesOpen(true)}
                onMouseLeave={() => setIsCategoriesOpen(false)}
              >
                <Menu size={18} />
                <span className="text-sm font-bold uppercase tracking-wide">
                  Browse Categories
                </span>
                <ChevronDown
                  size={14}
                  className="ml-1 text-gray-400 group-hover:text-black transition-colors"
                />

                {/* Dropdown Menu */}
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 bg-white shadow-xl border border-gray-100 rounded-b-lg z-50 flex">
                    {/* Main Categories */}
                    <div className="w-64">
                      {categories.map((category, index) => (
                        <div
                          key={index}
                          className="relative"
                          onMouseEnter={() => {
                            setActiveSubmenu(category.name);
                          }}
                        >
                          <button
                            onClick={() => {
                              navigate(
                                `/catalog?category=${encodeURIComponent(category.name)}&stock=In+Stock`,
                              );
                              setIsCategoriesOpen(false);
                              setActiveSubmenu(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0 ${
                              activeSubmenu === category.name
                                ? "bg-gray-50"
                                : ""
                            }`}
                          >
                            <span className="text-xs font-bold text-black">
                              {category.name}
                            </span>
                            {category.hasSubmenu && (
                              <ChevronDown
                                size={14}
                                className="text-gray-400 rotate-[-90deg]"
                              />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Series Submenu */}
                    {activeSubmenu && (
                      <div className="w-60 border-l border-gray-100 bg-white">
                        {/* Series label */}
                        {(categories.find((c) => c.name === activeSubmenu)?.subcategories?.length ?? 0) > 0 && (
                          <div className="px-4 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            Series
                          </div>
                        )}
                        {categories
                          .find((cat) => cat.name === activeSubmenu)
                          ?.subcategories?.map((series, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                navigate(
                                  `/catalog?category=${encodeURIComponent(activeSubmenu)}&series=${encodeURIComponent(series.groupId)}&stock=In+Stock`,
                                );
                                setIsCategoriesOpen(false);
                                setActiveSubmenu(null);
                              }}
                              className="w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <span className="text-xs font-bold text-black hover:text-[#da789b]">
                                {series.label}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-8 px-8">
                <Link
                  to="/"
                  className={`text-xs font-bold uppercase tracking-normal transition-colors hover:text-[#da789b] ${isActive("/") && route === "/" ? "text-[#da789b]" : "text-black"}`}
                >
                  Home
                </Link>
                <Link
                  to="/catalog?stock=In+Stock"
                  className={`text-xs font-bold uppercase tracking-normal transition-colors hover:text-[#da789b] ${isActive("/catalog") ? "text-[#da789b]" : "text-black"}`}
                >
                  Shop
                </Link>

                <Link
                  to="/warranty"
                  className="text-xs font-bold uppercase tracking-normal text-black transition-colors hover:text-[#da789b]"
                >
                  Warranty registration
                </Link>
                <Link
                  to="/request-quote"
                  className="text-xs font-bold uppercase tracking-normal text-black transition-colors hover:text-[#da789b]"
                >
                  Request quote
                </Link>
                <Link
                  to="/contact"
                  className="text-xs font-bold uppercase tracking-normal text-black transition-colors hover:text-[#da789b]"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-6 shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            <div className="block md:hidden">
              <MultiModalSearch />
            </div>

            {/* Mobile quick actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  navigate(isLoggedIn ? "/account" : "/login");
                  setIsMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-black hover:bg-gray-50"
              >
                <User size={20} strokeWidth={2.5} />
                <span className="mt-1 text-[10px] font-bold uppercase">
                  {isLoggedIn ? "Account" : "Sign in"}
                </span>
              </button>
              <button
                onClick={() => {
                  navigate("/wishlist");
                  setIsMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-black hover:bg-gray-50"
              >
                <div className="relative">
                  <Heart size={20} strokeWidth={2.5} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-[#da789b]">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[10px] font-bold uppercase">
                  Wishlist
                </span>
              </button>
              <button
                onClick={() => {
                  navigate("/compare");
                  setIsMenuOpen(false);
                }}
                className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-black hover:bg-gray-50"
              >
                <div className="relative">
                  <Scale size={20} strokeWidth={2.5} />
                  {compareList.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-[#da789b]">
                      {compareList.length}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[10px] font-bold uppercase">
                  Compare
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsDiscoverOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-black uppercase text-xs hover:bg-slate-50 transition-colors"
            >
              <Compass size={20} className="text-[#4567a4]" />
              <span>Discover Your Pump</span>
            </button>



            {/* Mobile Categories */}
            <div className="border-b border-gray-100 pb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Categories
              </div>
              {categories.map((category, index) => (
                <div key={index}>
                  <button
                    onClick={() => {
                      if (category.hasSubmenu) {
                        setActiveSubmenu(
                          activeSubmenu === category.name
                            ? null
                            : category.name,
                        );
                      } else {
                        navigate(
                          `/catalog?category=${encodeURIComponent(category.name)}&stock=In+Stock`,
                        );
                        setIsMenuOpen(false);
                      }
                    }}
                    className="w-full flex items-center justify-between py-2 text-left"
                  >
                    <span className="text-xs font-bold text-black">
                      {category.name}
                    </span>
                    {category.hasSubmenu && (
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform ${
                          activeSubmenu === category.name
                            ? "rotate-0"
                            : "rotate-[-90deg]"
                        }`}
                      />
                    )}
                  </button>

                  {/* Mobile Series Submenu */}
                  {category.hasSubmenu && activeSubmenu === category.name && (
                    <div className="ml-3 mt-1 space-y-1">
                      <button
                        onClick={() => {
                          navigate(
                            `/catalog?category=${encodeURIComponent(category.name)}&stock=In+Stock`,
                          );
                          setIsMenuOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="w-full text-left py-1.5 text-xs font-black text-[#4567a4]"
                      >
                        All {category.name}
                      </button>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1">Series</div>
                      {category.subcategories?.map((series, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => {
                            navigate(
                              `/catalog?category=${encodeURIComponent(category.name)}&series=${encodeURIComponent(series.groupId)}&stock=In+Stock`,
                            );
                            setIsMenuOpen(false);
                            setActiveSubmenu(null);
                          }}
                          className="w-full text-left py-1.5 text-xs font-bold text-black hover:text-[#da789b]"
                        >
                          {series.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Link
              to="/"
              className="text-sm font-bold uppercase tracking-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/catalog?stock=In+Stock"
              className="text-sm font-bold uppercase tracking-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>

            <Link
              to="/warranty"
              className="text-sm font-bold uppercase tracking-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Warranty registration
            </Link>
            <Link
              to="/request-quote"
              className="text-sm font-bold uppercase tracking-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Request quote
            </Link>
            <Link
              to="/contact"
              className="text-sm font-bold uppercase tracking-normal"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Customer Support</p>
              <a href="tel:+15153091469" className="text-base font-bold">
                (515) 309-1469
              </a>
            </div>
            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-700"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}


      <DiscoveryModal
        isOpen={isDiscoverOpen}
        onClose={() => setIsDiscoverOpen(false)}
      />
    </nav>
  );
}
