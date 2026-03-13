import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { useAdmin } from "@/admin/context/AdminContext";
import { Product, PUMP_CATEGORIES, PumpCategory } from "@/data/products";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Textarea } from "@/admin/components/ui/textarea";
import { Switch } from "@/admin/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { ArrowLeft, Save, X, ImagePlus } from "lucide-react";

const emptyProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  sku: "",
  category: "Industrial Piston Pumps",
  price: 0,
  baseCost: 0,
  bulkPricingNote: "",
  stock: 0,
  inStock: true,
  status: "draft",
  specifications: {
    displacement: "",
    maxPressure: "",
    maxSpeed: "",
    mountingType: "",
    shaftType: "",
    portType: "",
  },
  isBestSeller: false,
  isFeatured: false,
  // Required Product base fields - defaults
  primaryImage: "",
  secondaryImage: "",
  image: "",
  description: "",
  specs: {
    displacement: "",
    maxPressure: "",
    maxSpeed: "",
    mounting: "",
  },
  stockStatus: "In Stock",
  collections: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, setProducts } = useAdmin();
  const isEditing = id && id !== "new";

  const [formData, setFormData] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>(emptyProduct);

  useEffect(() => {
    if (isEditing) {
      const product = products.find((p) => p.id === id);
      if (product) {
        const { id: _, createdAt, updatedAt, ...rest } = product;
        setFormData(rest);
      }
    }
  }, [id, products, isEditing]);

  const handleSubmit = (status: "active" | "draft") => {
    const now = new Date().toISOString().split("T")[0];

    if (isEditing) {
      setProducts(
        products.map((p) =>
          p.id === id
            ? { ...p, ...formData, status, updatedAt: now }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        ...formData,
        id: `prod-${Date.now()}`,
        status,
        createdAt: now,
        updatedAt: now,
      };
      setProducts([...products, newProduct]);
    }

    navigate("/admin/products");
  };

  const updateSpec = (key: keyof NonNullable<Product["specifications"]>, value: string) => {
    setFormData({
      ...formData,
      specifications: { ...(formData.specifications ?? {}), [key]: value },
    });
  };

  return (
    <AdminLayout
      title={isEditing ? "Edit Product" : "Add New Product"}
      subtitle={isEditing ? `Editing: ${formData.name}` : "Create a new hydraulic pump product"}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/products")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSubmit("draft")}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit("active")}>
            <Save className="h-4 w-4 mr-2" />
            Save Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., PVP16 Hydraulic Piston Pump"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Model ID *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., HDCT-4-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as PumpCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PUMP_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <h3 className="form-section-title">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseCost">Base Cost ($)</Label>
                <Input
                  id="baseCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.baseCost}
                  onChange={(e) => setFormData({ ...formData, baseCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulkPricing">Bulk Pricing Note</Label>
                <Input
                  id="bulkPricing"
                  value={formData.bulkPricingNote || ""}
                  onChange={(e) => setFormData({ ...formData, bulkPricingNote: e.target.value })}
                  placeholder="e.g., 10+ units: 8% off"
                />
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="form-section">
            <h3 className="form-section-title">Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                />
                <Label htmlFor="inStock">Mark as In Stock</Label>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section">
            <h3 className="form-section-title">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displacement">Displacement</Label>
                <Input
                  id="displacement"
                  value={formData.specifications?.displacement ?? ""}
                  onChange={(e) => updateSpec("displacement", e.target.value)}
                  placeholder="e.g., 16 cc/rev"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSpeed">Max Speed</Label>
                <Input
                  id="maxSpeed"
                  value={formData.specifications?.maxSpeed ?? ""}
                  onChange={(e) => updateSpec("maxSpeed", e.target.value)}
                  placeholder="e.g., 1800 RPM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shaftType">Shaft Type</Label>
                <Input
                  id="shaftType"
                  value={formData.specifications?.shaftType ?? ""}
                  onChange={(e) => updateSpec("shaftType", e.target.value)}
                  placeholder="e.g., Keyed / Splined"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPressure">Max Pressure</Label>
                <Input
                  id="maxPressure"
                  value={formData.specifications?.maxPressure ?? ""}
                  onChange={(e) => updateSpec("maxPressure", e.target.value)}
                  placeholder="e.g., 3000 PSI"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mountingType">Mounting Type</Label>
                <Input
                  id="mountingType"
                  value={formData.specifications?.mountingType ?? ""}
                  onChange={(e) => updateSpec("mountingType", e.target.value)}
                  placeholder="e.g., SAE B 2-Bolt"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portType">Port Type</Label>
                <Input
                  id="portType"
                  value={formData.specifications?.portType ?? ""}
                  onChange={(e) => updateSpec("portType", e.target.value)}
                  placeholder="e.g., SAE O-Ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <div className="form-section">
            <h3 className="form-section-title">Product Images</h3>
            <div className="border-2 border-dashed border-border rounded-sm p-8 text-center">
              <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop images here</p>
              <Button variant="outline" size="sm">
                Browse Files
              </Button>
            </div>
          </div>

          {/* Flags */}
          <div className="form-section">
            <h3 className="form-section-title">Product Flags</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bestSeller">Best Seller</Label>
                  <p className="text-xs text-muted-foreground">Highlight as a top-selling product</p>
                </div>
                <Switch
                  id="bestSeller"
                  checked={formData.isBestSeller}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show on homepage featured section</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
