import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Textarea } from "@/admin/components/ui/textarea";
import { Switch } from "@/admin/components/ui/switch";
import { Save, Building2, Mail, Phone, MapPin, Bell, FileText } from "lucide-react";
import { toast } from "@/admin/hooks/use-toast";

export default function Settings() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "HYDRAULIC pumps Inc.",
    email: "sales@hydraulicpumps.com",
    phone: "(515) 309-1469",
    address: "5500 SW 6TH PL, Ocala, Florida 34474",
    taxId: "12-3456789",
  });

  const [quoteSettings, setQuoteSettings] = useState({
    autoAssign: true,
    notifyOnNew: true,
    expirationDays: 30,
    defaultTerms: "Quote valid for 30 days. Prices subject to change. FOB Origin.",
  });

  const [notifications, setNotifications] = useState({
    newQuoteEmail: true,
    lowStockAlert: true,
    orderStatusChange: true,
    dailySummary: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <AdminLayout title="Settings" subtitle="Configure your admin dashboard">
      <div className="max-w-3xl space-y-6">
        {/* Company Information */}
        <div className="form-section">
          <h3 className="form-section-title">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email
              </Label>
              <Input
                id="email"
                type="email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Business Address
              </Label>
              <Input
                id="address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={companyInfo.taxId}
                onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Quote Workflow Settings */}
        <div className="form-section">
          <h3 className="form-section-title">Quote Workflow</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-assign New Quotes</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically assign new quotes to available sales reps
                </p>
              </div>
              <Switch
                checked={quoteSettings.autoAssign}
                onCheckedChange={(checked) =>
                  setQuoteSettings({ ...quoteSettings, autoAssign: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notify on New Quote</Label>
                <p className="text-xs text-muted-foreground">
                  Send notification when a new quote request is received
                </p>
              </div>
              <Switch
                checked={quoteSettings.notifyOnNew}
                onCheckedChange={(checked) =>
                  setQuoteSettings({ ...quoteSettings, notifyOnNew: checked })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDays">Quote Expiration (days)</Label>
              <Input
                id="expirationDays"
                type="number"
                min="1"
                value={quoteSettings.expirationDays}
                onChange={(e) =>
                  setQuoteSettings({
                    ...quoteSettings,
                    expirationDays: parseInt(e.target.value) || 30,
                  })
                }
                className="w-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultTerms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Default Quote Terms
              </Label>
              <Textarea
                id="defaultTerms"
                value={quoteSettings.defaultTerms}
                onChange={(e) =>
                  setQuoteSettings({ ...quoteSettings, defaultTerms: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="form-section">
          <h3 className="form-section-title flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Quote Email</Label>
                <p className="text-xs text-muted-foreground">
                  Receive email for new quote requests
                </p>
              </div>
              <Switch
                checked={notifications.newQuoteEmail}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newQuoteEmail: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Low Stock Alert</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when products reach low stock levels
                </p>
              </div>
              <Switch
                checked={notifications.lowStockAlert}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, lowStockAlert: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Order Status Changes</Label>
                <p className="text-xs text-muted-foreground">
                  Notifications for order status updates
                </p>
              </div>
              <Switch
                checked={notifications.orderStatusChange}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, orderStatusChange: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Summary</Label>
                <p className="text-xs text-muted-foreground">
                  Receive daily digest of activity
                </p>
              </div>
              <Switch
                checked={notifications.dailySummary}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, dailySummary: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
