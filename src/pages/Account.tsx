import { Order, useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import { usePaymentMethods } from "@/context/PaymentMethodContext";
import { useQuotes } from "@/context/QuoteContext";
import { useWarranty } from "@/context/WarrantyContext";
import { useRouter } from "@/lib/router";
import { pdf } from "@react-pdf/renderer";
import { InvoiceDocument, InvoiceData } from "@/utils/InvoiceTemplate"; // Your new component
import { CartItem } from "@/context/CartContext";
import genericLogo from "@/assets/images/logo.png";
//
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  Trash2,
  CreditCard,
  FileText,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Account() {
  const { orders } = useOrders();
  const { isLoggedIn, logout } = useAuth();
  const { addresses, addAddress, removeAddress } = useAddress();
  const { paymentMethods, addPaymentMethod, removePaymentMethod } =
    usePaymentMethods();
  const { quotes } = useQuotes();
  const { warranties } = useWarranty();
  const { navigate, searchParams } = useRouter();
  // Determine active tab from URL or fallback to 'orders'
  // We use the URL as the source of truth preventing synchronization issues

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === "quotes" ||
    tabParam === "orders" ||
    tabParam === "addresses" ||
    tabParam === "payments" ||
    tabParam === "warranties"
      ? tabParam
      : "orders";

  const setActiveTab = (
    tab: "orders" | "addresses" | "payments" | "quotes" | "warranties",
  ) => {
    // Update URL to match
    navigate(`/account?tab=${tab}`);
  };
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [generatedBlobs, setGeneratedBlobs] = useState<Record<string, Blob>>(
    {},
  );

  const [newAddress, setNewAddress] = useState({
    name: "Home",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [newPayment, setNewPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  const handleGenerateInvoice = async (order: Order): Promise<Blob> => {
    if (generatedBlobs[order.id]) return generatedBlobs[order.id];

    try {
      // 2. Map the order data to the InvoiceData format
      const invoiceData: InvoiceData = {
        // Spec: INV-{OrderID}-{YYYYMMDD}
        invoiceNumber: `INV-${order.id}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
        orderId: order.id,
        invoiceDate: new Date().toLocaleDateString(), // System Date
        paymentDate: order.date,
        paymentStatus: "Paid",
        transactionId: `TXN-${order.id.slice(-6)}`, // Placeholder unique ID
        currency: "USD",
        customer: {
          name: order.shippingAddress.name,
          email: "customer@example.com", // Default for now
          billingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
          shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
          state: order.shippingAddress.state,
          zip: order.shippingAddress.zip,
          country: "USA",
        },
        items: order.items.map((item: CartItem) => ({
          productName: item.name,
          sku: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        pricing: {
          subtotal: order.total,
          discountCode: "NONE",
          discountPercentOrAmount: "0%",
          discountTotal: 0,
          taxableAmount: order.total,
          stateTaxRate: 6.25,
          stateTaxAmount: order.total * 0.0625,
          shippingCost: 0,
          totalPaid: order.total + order.total * 0.0625,
        },
        company: {
          legalName: "HYDRAULIC pumps Inc.",
          address: "5500 SW 6TH PL, Ocala, FL 34474",
          taxId: "12-3456789",
          supportEmail: "sales@hydraulicpumps.com",
          returnPolicyUrl:
            "https://hydraulicpumps.com/pages/return-refund-policy",
          disputeUrl: "https://hydraulicpumps.com/pages/terms-conditions",
          logo: genericLogo,
        },
        paymentMethod: "Credit Card",
      };

      // 3. Generate the PDF
      const doc = <InvoiceDocument data={invoiceData} />;
      const blob = await pdf(doc).toBlob();
      setGeneratedBlobs((prev) => ({ ...prev, [order.id]: blob }));
      return blob;
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      throw error;
    }
  };

  const handlePreviewInvoice = async (order: Order) => {
    const blob = await handleGenerateInvoice(order);
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      alert("Popup blocked. Please allow popups for this site.");
    }
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadInvoice = async (order: Order) => {
    const blob = await handleGenerateInvoice(order);
    const fileName = `INV-${order.id}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.pdf`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddress);
    setShowAddressForm(false);
    setNewAddress({
      name: "Home",
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      state: "",
      zip: "",
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    addPaymentMethod(newPayment);
    setShowPaymentForm(false);
    setNewPayment({
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Account</h1>
            <p className="text-slate-500">
              Manage your orders and account settings
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign Out
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
                Menu
              </div>
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "orders"
                      ? "bg-[#4567a4]/10 text-[#4567a4]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Order History
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "addresses"
                      ? "bg-[#4567a4]/10 text-[#4567a4]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "payments"
                      ? "bg-[#4567a4]/10 text-[#4567a4]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Payment Methods
                </button>
                <button
                  onClick={() => setActiveTab("quotes")}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "quotes"
                      ? "bg-[#4567a4]/10 text-[#4567a4]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Quote History
                </button>
                <button
                  onClick={() => setActiveTab("warranties")}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "warranties"
                      ? "bg-[#4567a4]/10 text-[#4567a4]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Warranty History
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "orders" && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Recent Orders
                </h2>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-slate-500 mb-6">
                      You haven't placed any orders yet.
                    </p>
                    <Button onClick={() => navigate("/catalog")}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeTab === "orders" &&
                      orders.map((order) => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200"
                          >
                            <div
                              className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() =>
                                setExpandedOrderId(isExpanded ? null : order.id)
                              }
                            >
                              <div className="flex gap-8 text-sm items-center">
                                <div className="transition-transform duration-200">
                                  {isExpanded ? (
                                    <ChevronUp
                                      size={20}
                                      className="text-slate-400"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={20}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                                <div>
                                  <span className="block text-slate-500">
                                    Order Placed
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    {new Date(order.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-slate-500">
                                    Total
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    ${order.total.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-slate-500">
                                    Order #
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    {order.id}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {order.status === "Processing" && (
                                  <Clock size={16} className="text-[#4567a4]" />
                                )}
                                {order.status === "Shipped" && (
                                  <Truck size={16} className="text-slate-500" />
                                )}
                                {order.status === "Delivered" && (
                                  <CheckCircle
                                    size={16}
                                    className="text-green-500"
                                  />
                                )}
                                <span
                                  className={`font-bold text-sm ${
                                    order.status === "Processing"
                                      ? "text-[#4567a4]"
                                      : order.status === "Shipped"
                                        ? "text-slate-700"
                                        : "text-green-600"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b border-slate-100 pb-4">
                                  <div>
                                    <h4 className="font-bold text-slate-900 mb-2">
                                      Shipping Details
                                    </h4>
                                    <p className="text-slate-600">
                                      Standard Shipping (5-10 Business Days)
                                    </p>
                                    <p className="text-slate-600">
                                      Tracking:{" "}
                                      <span className="text-[#4567a4] hover:underline cursor-pointer">
                                        TRK-
                                        {order.id.substring(0, 8).toUpperCase()}
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-900 mb-2">
                                      Payment Info
                                    </h4>
                                    <p className="text-slate-600">
                                      Visa ending in 4242
                                    </p>
                                  </div>
                                </div>

                                <h4 className="font-bold text-slate-900 mb-4">
                                  Items Ordered
                                </h4>
                                <div className="space-y-4">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex gap-4 items-center"
                                    >
                                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
                                        <img
                                          src={item.image}
                                          alt={item.name}
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 line-clamp-1">
                                          {item.name}
                                        </h4>
                                        <p className="text-sm text-slate-500 mb-1">
                                          {item.category}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          SKU: {item.id}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-bold text-slate-900">
                                          $
                                          {(item.price * item.quantity).toFixed(
                                            2,
                                          )}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handlePreviewInvoice(order)
                                    }
                                  >
                                    <Eye size={14} className="mr-2" />
                                    Preview
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDownloadInvoice(order)
                                    }
                                  >
                                    <Download size={14} className="mr-2" />
                                    Download Invoice
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate("/support-chat")}
                                  >
                                    Need Help?
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}

            {activeTab === "addresses" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Saved Addresses
                  </h2>
                  <Button onClick={() => setShowAddressForm(!showAddressForm)}>
                    <Plus size={16} className="mr-2" />
                    Add Address
                  </Button>
                </div>

                {showAddressForm && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-lg mb-4">Add New Address</h3>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="First Name"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newAddress.firstName}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              firstName: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newAddress.lastName}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Address Label (e.g. Home, Office)"
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Street Address"
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            street: e.target.value,
                          })
                        }
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="text"
                          placeholder="City"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              city: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="State"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              state: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newAddress.zip}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              zip: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Address</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="text-slate-400" size={18} />
                          <span className="font-bold text-slate-900">
                            {address.name}
                          </span>
                          {address.isDefault && (
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeAddress(address.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-slate-600 font-medium">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-slate-500 text-sm mt-1">
                        {address.street}
                        <br />
                        {address.city}, {address.state} {address.zip}
                      </p>
                    </div>
                  ))}

                  {addresses.length === 0 && !showAddressForm && (
                    <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                      <p className="text-slate-500 mb-4">
                        No addresses saved yet
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddressForm(true)}
                      >
                        Add Your First Address
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "payments" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Payment Methods
                  </h2>
                  <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                    <Plus size={16} className="mr-2" />
                    Add Card
                  </Button>
                </div>

                {showPaymentForm && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-lg mb-4">Add New Card</h3>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newPayment.cardName}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              cardName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Card Number"
                          required
                          maxLength={19}
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newPayment.cardNumber}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              cardNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          required
                          maxLength={5}
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newPayment.expiry}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              expiry: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          required
                          maxLength={4}
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newPayment.cvc}
                          onChange={(e) =>
                            setNewPayment({
                              ...newPayment,
                              cvc: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPaymentForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Card</Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center relative group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-lg">
                          <CreditCard className="text-slate-600" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-2">
                            •••• •••• •••• {method.cardNumber.slice(-4)}
                            {method.isDefault && (
                              <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium uppercase">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500 text-sm">
                            Expires {method.expiry}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {method.cardName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removePaymentMethod(method.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {paymentMethods.length === 0 && !showPaymentForm && (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                      <p className="text-slate-500 mb-4">
                        No payment methods saved
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowPaymentForm(true)}
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "warranties" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    Registered Warranties
                  </h2>
                  <Button onClick={() => navigate("/warranty")}>
                    Register New Product
                  </Button>
                </div>

                {warranties.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      No active warranties
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Register your products to activate 2-year coverage.
                    </p>
                    <Button onClick={() => navigate("/warranty")}>
                      Register Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {warranties.map((warranty) => (
                      <div
                        key={warranty.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-slate-900">
                              {warranty.productName ||
                                `Order #${warranty.orderNumber}`}
                            </h3>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                warranty.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {warranty.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            Registered on{" "}
                            {new Date(
                              warranty.registrationDate,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Ref: {warranty.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">
                            Valid until
                          </p>
                          <p className="text-[#4567a4] font-bold">
                            {new Date(
                              new Date(warranty.registrationDate).setFullYear(
                                new Date(
                                  warranty.registrationDate,
                                ).getFullYear() + 2,
                              ),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "quotes" && (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Quote History
                </h2>

                {quotes.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      No quotes yet
                    </h3>
                    <p className="text-slate-500 mb-6">
                      You haven't requested any quotes yet.
                    </p>
                    <Button onClick={() => navigate("/catalog")}>
                      Browse Catalog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quotes.map((quote) => {
                      const isExpanded = expandedQuoteId === quote.id;
                      return (
                        <div
                          key={quote.id}
                          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200"
                        >
                          <div
                            className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() =>
                              setExpandedQuoteId(isExpanded ? null : quote.id)
                            }
                          >
                            <div className="flex gap-8 text-sm items-center">
                              <div className="transition-transform duration-200">
                                {isExpanded ? (
                                  <ChevronUp
                                    size={20}
                                    className="text-slate-400"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={20}
                                    className="text-slate-400"
                                  />
                                )}
                              </div>
                              <div>
                                <span className="block text-slate-500">
                                  Requested On
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {new Date(quote.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="block text-slate-500">
                                  Quote ID
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {quote.id}
                                </span>
                              </div>
                              <div>
                                <span className="block text-slate-500">
                                  Items
                                </span>
                                <span className="font-semibold text-slate-900">
                                  {quote.items.length}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-sm px-3 py-1 rounded-full ${
                                  quote.status === "Pending"
                                    ? "bg-slate-100 text-slate-700"
                                    : quote.status === "Approved"
                                      ? "bg-green-100 text-green-700"
                                      : quote.status === "Rejected"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-[#4567a4]/10 text-[#4567a4]"
                                }`}
                              >
                                {quote.status}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                              <div className="mb-6 text-sm border-b border-slate-100 pb-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-bold text-slate-900 mb-1">
                                      Quote Details
                                    </h4>
                                    <p className="text-slate-600">
                                      Valid until:{" "}
                                      {new Date(
                                        new Date(quote.date).setDate(
                                          new Date(quote.date).getDate() + 30,
                                        ),
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-slate-500">
                                      Estimated Total
                                    </p>
                                    <p className="text-xl font-bold text-slate-900">
                                      $
                                      {quote.total
                                        ? quote.total.toFixed(2)
                                        : "Calculating..."}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <h4 className="font-bold text-slate-900 mb-4">
                                Requested Items
                              </h4>
                              <div className="space-y-4">
                                {quote.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex gap-4 items-center"
                                  >
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-slate-100 border border-slate-200">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-slate-900 line-clamp-1">
                                        {item.name}
                                      </h4>
                                      <p className="text-sm text-slate-500 mb-1">
                                        {item.category}
                                      </p>
                                      <div className="flex text-xs space-x-3 text-slate-500">
                                        <span>SKU: {item.id}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="bg-slate-100 px-3 py-1 rounded text-sm font-medium text-slate-700">
                                        Qty: {item.quantity}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                {quote.status === "Approved" ? (
                                  <Button className="bg-[#F5F5F5] text-black hover:bg-black hover:text-white">
                                    Accept & Checkout
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" disabled>
                                    Checkout Unavailable (Pending)
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  Cancel Request
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
