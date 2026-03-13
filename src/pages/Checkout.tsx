import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useAddress } from "@/context/AddressContext";
import { usePaymentMethods } from "@/context/PaymentMethodContext";
import { Button } from "@/components/ui/button";
import {
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Lock,
} from "lucide-react";

export function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { addresses } = useAddress();
  const { paymentMethods } = usePaymentMethods();
  const { isLoggedIn } = useAuth();
  const { navigate } = useRouter();

  const [step, setStep] = useState<"shipping" | "payment" | "confirmation">(
    "shipping",
  );
  const [loading, setLoading] = useState(false);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<"card" | "paypal" | "stripe">("card");

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    address: "123 Tech Avenue",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    cardNumber: "4111 1111 1111 1111",
    expiry: "12/26",
    cvc: "123",
    cardName: "John Smith",
  });

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login?redirect=/checkout");
    } else if (items.length === 0 && step !== "confirmation") {
      // If cart is empty and not on success page, go back to catalog
      navigate("/catalog");
    }
  }, [isLoggedIn, items, navigate, step]);

  if (!isLoggedIn) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create Order
    addOrder({
      items: [...items],
      total: cartTotal,
      shippingAddress: {
        name: `${formData.firstName} ${formData.lastName}`,
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
    });

    clearCart();
    setLoading(false);
    setStep("confirmation");
    window.scrollTo(0, 0);
  };

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-slate-500 mb-8">
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white hover:opacity-90 font-bold"
              onClick={() => navigate("/account")}
            >
              View My Orders
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/catalog")}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`flex items-center gap-2 font-bold ${step === "shipping" ? "text-[#4567a4]" : "text-green-600"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white" : "bg-green-100 text-green-600"}`}
                >
                  {step === "shipping" ? "1" : <Check size={16} />}
                </div>
                <span>Shipping</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-200"></div>
              <div
                className={`flex items-center gap-2 font-bold ${step === "payment" ? "text-[#4567a4]" : "text-slate-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "payment" ? "bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  2
                </div>
                <span>Payment</span>
              </div>
            </div>

            {/* Step 1: Shipping */}
            {step === "shipping" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-left-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="text-[#4567a4]" /> Shipping Address
                </h2>

                {addresses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Saved Addresses
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.firstName === addr.firstName &&
                            formData.address === addr.street
                              ? "border-[#4567a4]/50 bg-[#4567a4]/10 ring-1 ring-[#4567a4]/30"
                              : "border-slate-200 hover:border-[#4567a4]/30 hover:bg-slate-50"
                          }`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              firstName: addr.firstName,
                              lastName: addr.lastName,
                              address: addr.street,
                              city: addr.city,
                              state: addr.state,
                              zip: addr.zip,
                            });
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900">
                              {addr.name}
                            </span>
                            {formData.firstName === addr.firstName &&
                              formData.address === addr.street && (
                                <Check className="text-[#4567a4]" size={16} />
                              )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {addr.street}
                          </p>
                          <p className="text-sm text-slate-600">
                            {addr.city}, {addr.state} {addr.zip}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">
                          Or enter a new address
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-bold text-slate-700 mb-1"
                      >
                        First Name
                      </label>
                      <input
                        id="firstName"
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                        placeholder="John"
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-bold text-slate-700 mb-1"
                      >
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        required
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                        placeholder="Doe"
                      />
                    </div>
                    <div className="col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-bold text-slate-700 mb-1"
                      >
                        Address
                      </label>
                      <input
                        id="address"
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                        placeholder="123 Industrial Pkwy"
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="city"
                        className="block text-sm font-bold text-slate-700 mb-1"
                      >
                        City
                      </label>
                      <input
                        id="city"
                        required
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                        placeholder="New York"
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="state"
                        className="block text-sm font-bold text-slate-700 mb-1"
                      >
                        State
                      </label>
                      <input
                        id="state"
                        required
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                        placeholder="NY"
                      />
                    </div>
                    <div className="col-span-1">
                      <label
                        htmlFor="zip"
                        className="block text-sm font-bold text-slate-700 mb-1"
                      >
                        ZIP / Postal Code
                      </label>
                      <input
                        id="zip"
                        required
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-[#F5F5F5] text-black px-8 hover:bg-black hover:text-white"
                    >
                      Continue to Payment{" "}
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CreditCard className="text-[#4567a4]" /> Payment Details
                </h2>

                <div className="flex gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentProvider("card")}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedPaymentProvider === "card" ? "border-[#4567a4]/50 bg-[#4567a4]/10 text-[#4567a4]" : "border-slate-200 hover:border-[#4567a4]/30 text-slate-500"}`}
                  >
                    <CreditCard className="mb-2 h-6 w-6" />
                    <span className="font-bold text-sm">Credit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentProvider("paypal")}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedPaymentProvider === "paypal" ? "border-[#4567a4]/50 bg-[#4567a4]/10 text-[#4567a4]" : "border-slate-200 hover:border-[#4567a4]/30 text-slate-500"}`}
                  >
                    <div className="font-black text-xl italic mb-1 text-[#003087]">PayPal</div>
                    <span className="font-bold text-sm">PayPal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentProvider("stripe")}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedPaymentProvider === "stripe" ? "border-[#4567a4]/50 bg-[#4567a4]/10 text-[#4567a4]" : "border-slate-200 hover:border-[#4567a4]/30 text-slate-500"}`}
                  >
                    <div className="font-black text-lg mb-1 tracking-tighter text-[#635BFF]">stripe</div>
                    <span className="font-bold text-sm">Stripe</span>
                  </button>
                </div>

                {selectedPaymentProvider === "card" && paymentMethods.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Saved Cards
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            formData.cardNumber === method.cardNumber
                              ? "border-[#4567a4]/50 bg-[#4567a4]/10 ring-1 ring-[#4567a4]/30"
                              : "border-slate-200 hover:border-[#4567a4]/30 hover:bg-slate-50"
                          }`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              cardName: method.cardName,
                              cardNumber: method.cardNumber,
                              expiry: method.expiry,
                              cvc: method.cvc,
                            });
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900">
                              •••• {method.cardNumber.slice(-4)}
                            </span>
                            {formData.cardNumber === method.cardNumber && (
                              <Check className="text-[#4567a4]" size={16} />
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            {method.cardName}
                          </p>
                          <p className="text-sm text-slate-600">
                            Exp: {method.expiry}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">
                          Or enter new card details
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentProvider === "card" && (
                <div className="p-4 bg-[#4567a4]/10 border border-[#4567a4]/30 rounded-lg mb-6 flex items-start gap-3">
                  <Lock className="text-[#4567a4] mt-0.5" size={18} />
                  <p className="text-sm text-[#4567a4]/80">
                      Payments are secure and encrypted. We do not store your full
                      card details.
                    </p>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit}>
                  {selectedPaymentProvider === "card" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          required
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            required
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-300 p-2.5 pl-10 text-sm"
                            placeholder="0000 0000 0000 0000"
                          />
                          <CreditCard
                            className="absolute left-3 top-2.5 text-slate-400"
                            size={18}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            required
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">
                            CVC
                          </label>
                          <input
                            required
                            name="cvc"
                            value={formData.cvc}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border-slate-300 p-2.5 text-sm"
                            placeholder="123"
                            type="password"
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </div>
                  ) : selectedPaymentProvider === "paypal" ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center mb-6">
                      <p className="text-slate-600 mb-2 font-bold text-lg">Redirecting to PayPal...</p>
                      <div className="text-sm text-slate-500">You will be securely transferred. Your order will not be finalized until you confirm payment on PayPal.</div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center mb-6">
                      <p className="text-slate-600 mb-2 font-bold text-lg">Pay with Stripe</p>
                      <div className="text-sm text-slate-500">Securely supports Apple Pay, Google Pay, and additional payment modes via Stripe's gateway.</div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("shipping")}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-[#F5F5F5] text-black px-8 min-w-[160px] hover:bg-black hover:text-white"
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : selectedPaymentProvider === "paypal" ? "Continue to PayPal" 
                        : selectedPaymentProvider === "stripe" ? "Pay via Stripe"
                        : `Pay $${cartTotal.toFixed(2)}`}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">
                Order Summary
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-4 scrollbar-thin">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded border border-slate-100 flex-shrink-0">
                      <img
                        src={item.image}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium text-sm text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax (Estimated)</span>
                  <span>${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-3 mt-2">
                  <span>Total</span>
                  <span>${(cartTotal * 1.08).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} />
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
