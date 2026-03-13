import { useState } from "react";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { useWarranty } from "@/context/WarrantyContext";
import { toast } from "sonner";

export function Warranty() {
  const { navigate } = useRouter();
  const { addWarranty } = useWarranty();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+1",
    phone: "",
    orderNumber: "",
    orderedFrom: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWarranty({
      ...formData,
      // In a real app, we'd lookup the product name from the order number
      productName: "PVP16 Hydraulic Piston Pump (Example)",
    });

    toast.success("Warranty Registered Successfully", {
      description: "You will receive a confirmation email shortly.",
    });

    navigate("/account?tab=warranties");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-5 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
      
          <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Warranty Registration
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            Activate your 2-year manufacturer's warranty today. <br />
            Need help? Call{" "}
            <span className="font-bold text-slate-900">(515) 309-1469</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="h-1 
bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100%  w-full"></div>
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="warrantyFirstName"
                    className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                  >
                    First Name
                  </label>
                  <input
                    id="warrantyFirstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="warrantyLastName"
                    className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                  >
                    Last Name
                  </label>
                  <input
                    id="warrantyLastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="warrantyEmail"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="warrantyEmail"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="warrantyCountryCode"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="w-18 flex-shrink-0">
                    <div className="relative">
                      <select
                        id="warrantyCountryCode"
                        className="w-full appearance-none pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                        value={formData.countryCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countryCode: e.target.value,
                          })
                        }
                      >
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+91">+91</option>
                      </select>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                        {formData.countryCode === "+1"
                          ? "🇺🇸"
                          : formData.countryCode === "+44"
                            ? "🇬🇧"
                            : "🇮🇳"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <input
                      id="warrantyPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="warrantyOrderNumber"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Order Number
                </label>
                <input
                  id="warrantyOrderNumber"
                  type="text"
                  required
                  value={formData.orderNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, orderNumber: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="warrantyOrderedFrom"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                >
                  Ordered From
                </label>
                <select
                  id="warrantyOrderedFrom"
                  required
                  value={formData.orderedFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, orderedFrom: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all outline-none"
                >
                  <option value="" disabled>
                    Select Marketplace
                  </option>
                  <option value="Website">Official Website</option>
                  <option value="Amazon">Amazon</option>
                  <option value="eBay">eBay</option>
                  <option value="Retailer">Authorized Retailer</option>
                  <option value="Distributor">Distributor</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-11 text-sm bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all rounded-lg"
              >
                Submit Registration
              </Button>
            </div>

            <p className="text-[10px] text-center text-slate-400 leading-tight max-w-xs mx-auto">
              Protected by reCAPTCHA.{" "}
              <a href="/privacy" className="hover:text-slate-600 underline">
                Privacy
              </a>{" "}
              &{" "}
              <a href="/terms" className="hover:text-slate-600 underline">
                Terms
              </a>{" "}
              apply.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
