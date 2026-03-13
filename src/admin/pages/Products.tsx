import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { DataTable } from "@/admin/components/admin/DataTable";
import { StatusBadge } from "@/admin/components/admin/StatusBadge";
import { useAdmin } from "@/admin/context/AdminContext";
import { Product, PUMP_CATEGORIES } from "@/data/products";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { Plus, Search, Filter, Edit, Eye, Trash2, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Products() {
  const { products, setProducts } = useAdmin();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [bestSellerFilter, setBestSellerFilter] = useState<boolean>(false);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" && product.stock > 0) ||
      (stockFilter === "out-of-stock" && product.stock === 0) ||
      (stockFilter === "low-stock" && product.stock > 0 && product.stock <= 10);
    const matchesBestSeller = !bestSellerFilter || product.isBestSeller;

    return matchesSearch && matchesCategory && matchesStock && matchesBestSeller;
  });

  const handleDelete = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return "out-of-stock";
    if (product.stock <= 10) return "low-stock";
    return "in-stock";
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">IMG</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{product.name}</span>
              {product.isBestSeller && <Star className="h-3 w-3 text-primary fill-primary" />}
            </div>
            <span className="text-xs text-muted-foreground">{product.sku}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product: Product) => (
        <span className="text-sm text-muted-foreground">{product.category}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: Product) => (
        <span className="font-medium text-foreground">${product.price.toFixed(2)}</span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{product.stock}</span>
          <StatusBadge status={getStockStatus(product)} />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product: Product) => <StatusBadge status={product.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${product.id}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${product.id}/edit`);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Products" subtitle="Manage your hydraulic pump catalog">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PUMP_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={bestSellerFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setBestSellerFilter(!bestSellerFilter)}
            className="gap-1"
          >
            <Star className="h-4 w-4" />
            Best Sellers
          </Button>
        </div>
        <Link to="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        onRowClick={(product) => navigate(`/admin/products/${product.id}`)}
        emptyMessage="No products found matching your filters"
      />
    </AdminLayout>
  );
}
