import { useState } from "react";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Globe,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export function Contact() {
  const { navigate } = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    toast.success("Message Sent Successfully", {
      description: "Our team will get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black mb-3 tracking-tight">
            Contact Us
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Have questions about our products or need a custom quote? <br />
            Our engineering team is ready to help.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 -mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Phone className="text-[#4567a4]" size={16} /> Phone Support
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    (515) 309-1469
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sales & Customer Support
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Hours
                  </p>
                  <div className="flex items-start gap-2 text-slate-600 text-sm">
                    <Clock size={14} className="text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        Mon - Fri:{" "}
                        <span className="text-slate-900">8AM - 6PM</span> CST
                      </p>
                      <p className="font-medium">
                        Sat: <span className="text-slate-900">9AM - 1PM</span>{" "}
                        CST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mail className="text-blue-500" size={16} /> Email Us
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    General Inquiries
                  </p>
                  <a
                    href="mailto:sales@hydraulicpumps.com"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    sales@hydraulicpumps.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Technical Support
                  </p>
                  <a
                    href="mailto:support@hydraulicpumps.com"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    support@hydraulicpumps.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="text-slate-500" size={16} /> Location
              </h3>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                <strong className="text-slate-900 block mb-1">
                  Hydraulic Pumps HQ
                </strong>
                <span className="text-slate-600">
                  5500 SW 6TH PL
                  <br />
                  Ocala, Florida 34474
                </span>
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-[#4567a4] transition-colors bg-slate-100 px-3 py-1.5 rounded-full"
              >
                <Globe size={12} /> Get Directions
              </a>
            </div>

            <div className="bg-gradient-to-br from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-30% to-[#00a1d0] to-100% p-6 rounded-2xl shadow-lg shadow-slate-900/20 border border-[#4567a4]/30 text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <MessageCircle size={16} /> Live Support Chat
              </h3>
              <p className="text-white/90 mb-4 text-sm leading-relaxed">
                Need instant help? Chat with our support team in real-time. Get
                answers to your questions about products, orders, and technical
                specifications.
              </p>
              <Button
                onClick={() => navigate("/support-chat")}
                className="w-full bg-white text-[#4567a4] hover:bg-slate-50 font-bold text-sm py-2.5 rounded-lg shadow-md transition-all"
              >
                <MessageCircle size={16} className="mr-2" />
                Start Live Chat
              </Button>
            </div>
          </div>

          {/* Get in Touch Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 h-full">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
                Get in Touch
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#4567a4]/20 focus:border-[#4567a4] bg-slate-50/50 focus:bg-white outline-none transition-all"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactEmail"
                      className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#4567a4]/20 focus:border-[#4567a4] bg-slate-50/50 focus:bg-white outline-none transition-all"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >
                      Phone (Optional)
                    </label>
                    <input
                      id="contactPhone"
                      type="tel"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#4567a4]/20 focus:border-[#4567a4] bg-slate-50/50 focus:bg-white outline-none transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contactSubject"
                      className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                    >
                      Subject
                    </label>
                    <select
                      id="contactSubject"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#4567a4]/20 focus:border-[#4567a4] bg-slate-50/50 focus:bg-white outline-none transition-all"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    >
                      <option value="" disabled>
                        Select a topic...
                      </option>
                      <option value="Quote Request">Quote Request</option>
                      <option value="Product Support">Product Support</option>
                      <option value="Warranty">Warranty Question</option>
                      <option value="Distribution">
                        Distribution / Partnership
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contactMessage"
                    className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="contactMessage"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-[#4567a4]/20 focus:border-[#4567a4] bg-slate-50/50 focus:bg-white outline-none transition-all h-32 resize-none"
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  ></textarea>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 h-11 px-8 text-sm font-bold rounded-lg transition-all"
                  >
                    <Send size={16} className="mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
