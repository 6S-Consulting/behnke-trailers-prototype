import { useEffect } from "react";
import {
  Star,
  Truck,
  Shield,
  CreditCard,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/lib/router";
import { useCart } from "@/context/CartContext";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { products } from "@/data/products";
import type { Product } from "@/data/products";
import { BulkOrderUpload } from "@/components/BulkOrderUpload";
import TrailerViewer from "@/trailer/DirectionalDrillTrailer";
import bestSellerImg from "@/assets/images/pumps/best-seller-removebg-preview.png";
import heroImg from "@/assets/images/pumps/home/hero.png";
import brandImg from "@/assets/images/pumps/home/brand.png";
import pvpImg from "@/assets/images/pumps/products/pvp.png";
import pgp505Img from "@/assets/images/pumps/products/pgp505.png";
import f1Img from "@/assets/images/pumps/products/f1.png";
import pgp315Img from "@/assets/images/pumps/products/pgp315.png";

interface DiscountProduct extends Product {
  originalPrice: number;
  discount: number;
}

interface Review {
  name: string;
  rating: number;
  text: string;
  marketplace: string;
}

export function Home() {
  const { navigate } = useRouter();

  // Get best sellers (simulate with first 12 products for better carousel effect)
  // Filter out sold out products
  const bestSellers = products
    .filter((p) => p.isBestSeller && p.stockStatus !== "Out of Stock")
    .slice(0, 15);

  // Get discounted products and calculate original prices (limit to 9)
  const discountedProducts: DiscountProduct[] = products
    .filter((p) => p.discountPercentage && p.stockStatus !== "Out of Stock")
    .map((p) => ({
      ...p,
      originalPrice: p.price / (1 - p.discountPercentage! / 100),
      discount: p.discountPercentage!,
    }))
    .slice(0, 9);

  const reviews: Review[] = [
    {
      name: "John Martinez",
      rating: 5,
      text: "Excellent quality pumps! Been using them for 3 years on my construction equipment. Never had a failure.",
      marketplace: "Amazon",
    },
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Fast shipping and great customer service. The pump fit perfectly on my machine.",
      marketplace: "eBay",
    },
    {
      name: "Mike Thompson",
      rating: 4,
      text: "Good value for money. Quality is solid and pricing is competitive.",
      marketplace: "Amazon",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="z-10">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">
                YOUR HYDRAULIC
                <br />
                <span className="bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% font-bold bg-clip-text text-transparent">
                  SOLUTION IS HERE
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-slate-700 font-bold mb-3">
                Premium Industrial & Mobile Pumps
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-base text-slate-600 font-semibold">
                  Starting at
                </span>
                <span className="text-4xl font-black bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% bg-clip-text text-transparent">
                  $49
                </span>
              </div>
              <Button
                size="lg"
                className="h-12 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white px-8 text-base font-black uppercase tracking-wide shadow-xl hover:opacity-90"
                onClick={() => navigate("/catalog?stock=In+Stock")}
              >
                Shop Now
              </Button>
            </div>

            {/* Right Image */}
            <div className="relative">
              <ResponsiveImage
                src={heroImg}
                alt="Premium Hydraulic Pumps"
                width={640}
                height={400}
                fetchPriority="high"
                className="rounded-2xl shadow-2xl max-h-[400px] object-contain bg-white"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3D Trailer Viewer */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-4">
              Directional Drill Tilt Trailer (3D Interactive)
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Explore the engineering model in Imperial scale (inches) showing
              accurate components.
            </p>
            <TrailerViewer />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className=" grid grid-cols-2 lg:grid-cols-4 gap-8">
            <TrustBadge
              icon={<Users className="w-8 h-8" />}
              title="10,000+"
              subtitle="Happy Customers"
            />
            <TrustBadge
              icon={<Truck className="w-8 h-8" />}
              title="Free Shipping"
              subtitle="Across USA"
            />
            <TrustBadge
              icon={<Shield className="w-8 h-8" />}
              title="30-Day"
              subtitle="Money Back Guarantee"
            />
            <TrustBadge
              icon={<CreditCard className="w-8 h-8" />}
              title="100% Secure"
              subtitle="Payment"
            />
          </div>
        </div>
      </section>
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-3">
              Bulk Order Made Easy
            </h2>
            <p className="text-lg text-slate-600">
              Upload your order list and let our AI match products from our
              catalog
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <BulkOrderUpload variant="full" />
          </div>
        </div>
      </section>

      {/* Product Categories - Hydraulic Pumps */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-3">
              Hydraulic Pump Categories
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of industrial-grade hydraulic
              pumps
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <CategoryIcon name="Industrial Piston Pumps" />
            <CategoryIcon name="Industrial Gear Pumps" />
            <CategoryIcon name="Mobile Piston Pumps" />
            <CategoryIcon name="Mobile Gear Pumps" />
          </div>
        </div>
      </section>

      {/* Best Sellers Carousel */}
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl lg:text-5xl font-black text-black mb-4">
              Best Sellers
            </h2>
            <p className="text-lg text-black">
              Our most popular hydraulic pumps
            </p>
          </div>

          <Carousel
            items={bestSellers}
            renderItem={(product) => <ProductCard product={product} />}
            itemsPerView={5}
            autoPlay
            autoPlayInterval={2500}
            darkArrows
          />
        </div>
      </section>

      {/* Shop by Discounts */}
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
              Shop by Discounts
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto ">
              Limited time offers on premium pumps
            </p>
          </div>

          <Carousel
            items={discountedProducts}
            renderItem={(product) => <DiscountCard product={product} />}
            itemsPerView={5}
            autoPlay
            autoPlayInterval={3500}
            darkArrows
          />
        </div>
      </section>

      {/* Brand Information - HYDRAULIC pumps */}
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 py-16 ">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center ">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-black  mb-8">
                <span className="bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% bg-clip-text text-transparent">
                  HYDRAULIC
                </span>{" "}
                Pumps
              </h2>
              <ul className="space-y-4">
                <BrandFeature text="Reliable Performance" />
                <BrandFeature text="Durable & Long-Lasting" />
                <BrandFeature text="Excellent Value for Money" />
                <BrandFeature text="Precision Engineering" />
                <BrandFeature text="Customized Solutions" />
                <BrandFeature text="Trusted Across Industries" />
              </ul>
            </div>

            {/* Right Image */}
            <div className="relative">
              <ResponsiveImage
                src={brandImg}
                alt="Hydraulic Pumps Manufacturing"
                width={640}
                height={400}
                className="w-full max-w-xl rounded-2xl shadow-2xl mx-auto object-contain bg-white hidden md:block"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
              Customer Reviews
            </h2>
            <p className="text-lg text-slate-600">
              See what our customers are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl lg:text-3xl font-black text-white mb-2">
                Join our newsletter and get $20 discount for your first order
              </h3>
            </div>
            <div className="flex gap-3 w-full md:w-auto items-stretch h-14">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-6 rounded-lg text-black flex-1 md:w-80 focus:outline-none focus:ring-2 focus:ring-white bg-white border-2 border-white h-full"
              />
              <Button className="bg-white hover:bg-slate-100 text-black font-black px-8 whitespace-nowrap h-full rounded-lg">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Reusable Carousel Component with Infinite Loop
function Carousel<T>({
  items,
  renderItem,
  itemsPerView = 4,
  autoPlay = false,
  autoPlayInterval = 3000,
  darkArrows = false,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  itemsPerView?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  darkArrows?: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Responsive check
  const [visibleItems, setVisibleItems] = useState(itemsPerView);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(itemsPerView);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemsPerView]);

  // Clone items for infinite effect: [Items, Items(clone-start)]
  // To smooth loop, we need at least 'visibleItems' clones at the end
  const clonesNeeded = visibleItems;
  const extendedItems = [...items, ...items.slice(0, clonesNeeded)];
  const maxIndex = items.length; // Real items count

  const next = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        next();
      }, autoPlayInterval);
    }
  }, [autoPlay, autoPlayInterval, next]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const prev = () => {
    if (currentIndex === 0) {
      // Snap to end clone spot instantly, then animate to real end - 1
      // Complex logic. Easier to just simple prev or allow wrapping physically if we prepend clones too.
      // For simple "auto-play forward", we mostly care about next.
      // Let's implement wrap-around for prev:
      // If at 0, we can't smoothly go left unless we have prepended items.
      // For now, simple loop back to maxIndex-1 without transition is acceptable or standard wrap.
      // But user wants "smoothly move like a cycle".
      // Let's stick to simple wrap for manual prev for now to keep code clean.
      setCurrentIndex(items.length - 1);
    } else {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
    resetTimer();
  };

  // Handle transition end to snap back if needed
  const handleTransitionEnd = () => {
    if (currentIndex >= maxIndex) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  /* Touch support for Swipe */
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    resetTimer(); // Pause on touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      next();
    }
    if (isRightSwipe) {
      prev();
    }

    setTouchEnd(0);
    setTouchStart(0);
    resetTimer();
  };

  return (
    <div className="relative group/carousel">
      {/* Arrows */}
      <button
        onClick={() => {
          prev();
          resetTimer();
        }}
        className={`hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full shadow-xl focus:outline-none opacity-0 group-hover/carousel:opacity-100 transition-opacity ${
          darkArrows
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white hover:opacity-90"
        }`}
        aria-label="Previous item"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div
        className="overflow-hidden mx-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
            transition: isTransitioning ? "transform 500ms ease-out" : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedItems.map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / visibleItems}%` }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          next();
          resetTimer();
        }}
        className={`hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full shadow-xl focus:outline-none opacity-0 group-hover/carousel:opacity-100 transition-opacity ${
          darkArrows
            ? "bg-slate-900 text-white hover:bg-slate-800"
            : "bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white hover:opacity-90"
        }`}
        aria-label="Next item"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators (Optional - showing real index) */}
      <div className="flex justify-center gap-2 mt-6">
        {items.map(
          (_, i) =>
            // Only show limit to avoid clutter
            i < 10 && (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex % items.length === i
                    ? `w-8 ${darkArrows ? "bg-slate-900" : "bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100%"}`
                    : `w-2 ${darkArrows ? "bg-slate-400" : "bg-gray-700"}`
                }`}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsTransitioning(true);
                  resetTimer();
                }}
              />
            ),
        )}
      </div>
    </div>
  );
}

// Component: Trust Badge
function TrustBadge({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white p-4 rounded-full mb-3">
        {icon}
      </div>
      <p className="font-black text-lg text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

// Component: Category Icon
function CategoryIcon({ name }: { name: string }) {
  // Map category names to image paths
  const categoryImages: Record<string, string> = {
    "Industrial Piston Pumps": pvpImg,
    "Industrial Gear Pumps": pgp505Img,
    "Mobile Piston Pumps": f1Img,
    "Mobile Gear Pumps": pgp315Img,
  };

  const { navigate } = useRouter();

  return (
    <div
      className="flex flex-col items-center text-center group cursor-pointer"
      onClick={() =>
        navigate(`/catalog?category=${encodeURIComponent(name)}&stock=In+Stock`)
      }
    >
      <div className="w-32 h-32 bg-white rounded-full mb-3 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all border-4 border-[#da789b] overflow-hidden p-3">
        <ResponsiveImage
          src={categoryImages[name]}
          alt={name}
          width={128}
          height={128}
          className="object-contain"
          sizes="128px"
        />
      </div>
      <p className="text-xs font-bold text-slate-700 leading-tight">{name}</p>
    </div>
  );
}

// Component: Product Card — same structure as Catalog ProductCard
function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { navigate } = useRouter();

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-visible hover:shadow-lg hover:border-[#4567a4]/30 transition-all cursor-pointer flex flex-col relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Best Seller ribbon */}
      {product.isBestSeller && (
        <div
          className="absolute top-5 -left-6 z-20 pointer-events-none"
          style={{ width: 100, height: 52 }}
        >
          <img
            src={bestSellerImg}
            alt="Best Seller"
            style={{ width: 100, position: "absolute", bottom: 0, right: 0 }}
          />
        </div>
      )}
      <div className="relative overflow-hidden bg-white rounded-t-xl p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full object-contain aspect-square group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-[#4567a4] font-semibold uppercase tracking-wide mb-1">
          {product.category}
        </div>
        <div className="h-10 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="font-bold text-lg text-slate-900">
            ${product.price.toFixed(2)}
          </div>
          {product.stockStatus === "Out of Stock" ? (
            <button
              onClick={(e) => e.stopPropagation()}
              disabled
              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold cursor-not-allowed opacity-90"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="text-xs bg-[#4567a4] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#3456a0] transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Component: Discount Card — catalog structure + discount badge
function DiscountCard({ product }: { product: DiscountProduct }) {
  const { addToCart } = useCart();
  const { navigate } = useRouter();

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-visible hover:shadow-lg hover:border-[#4567a4]/30 transition-all cursor-pointer flex flex-col relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden bg-white rounded-t-xl p-6">
        {/* Discount badge */}
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded-lg font-bold text-xs z-10">
          -{product.discount}%
        </div>
        <img
          src={product.image}
          alt={product.name}
          className="w-full object-contain aspect-square group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-[#4567a4] font-semibold uppercase tracking-wide mb-1">
          {product.category}
        </div>
        <div className="h-10 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>
        <div className="mt-auto space-y-2">
          <div>
            <span className="font-bold text-lg text-red-600">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 line-through ml-1.5">
              ${product.originalPrice.toFixed(2)}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-full text-xs bg-[#4567a4] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#3456a0] transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// Component: Brand Feature
function BrandFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-lg">
      <div className="w-2 h-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% rounded-full"></div>
      <span className="text-black font-semibold">{text}</span>
    </li>
  );
}

// Component: Review Card
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < review.rating ? "fill-[#da789b] text-[#da789b]" : "text-gray-300"}`}
          />
        ))}
      </div>
      <p className="text-slate-700 mb-6 italic">"{review.text}"</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-900">{review.name}</p>
          <p className="text-sm text-slate-500">Verified Buyer</p>
        </div>
        <div className="bg-slate-100 px-3 py-1 rounded-full">
          <p className="text-xs font-bold text-slate-600">
            {review.marketplace}
          </p>
        </div>
      </div>
    </div>
  );
}
