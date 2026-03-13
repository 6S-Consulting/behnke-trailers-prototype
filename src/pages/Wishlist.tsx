import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Heart } from "lucide-react";

export function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { navigate } = useRouter();

  if (wishlistItems.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
          <Heart size={48} className="text-slate-300" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Your wishlist is empty
        </h2>
        <p className="mb-6 text-slate-500">
          Save items you want to see again here.
        </p>
        <Button onClick={() => navigate("/catalog")}>Browse Catalog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8">
          My Wishlist ({wishlistItems.length})
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((product) => {
            const isOutOfStock = product.stockStatus === "Out of Stock";
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 flex flex-col"
              >
                <div
                  className="relative aspect-square bg-slate-50 p-4 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                  {isOutOfStock && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Sold Out
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-red-500 hover:text-red-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {product.category}
                  </div>
                  <h3
                    className="font-bold text-slate-900 mb-2 line-clamp-2 cursor-pointer hover:text-[#D97706]"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div className="font-black text-lg text-slate-900">
                      ${product.price.toFixed(2)}
                    </div>
                    <Button
                      size="sm"
                      className={`font-bold ${
                        isOutOfStock
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
                          : "bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white hover:opacity-90"
                      }`}
                      onClick={() => {
                        if (!isOutOfStock) {
                          addToCart(product);
                          removeFromWishlist(product.id);
                        }
                      }}
                      disabled={isOutOfStock}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {isOutOfStock ? "Sold Out" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
