import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Switch } from "@/admin/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { cn } from "@/admin/lib/utils";
import { toast } from "@/admin/hooks/use-toast";
import { useMultiChannel } from "@/admin/context/MultiChannelContext";
import type { Channel } from "@/data/multiChannelData";
import {
  Package,
  Globe,
  Key,
  Settings2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

export default function AddCustomChannel() {
  const navigate = useNavigate();
  const { addChannelAndAutoUpgrade } = useMultiChannel();

  const [form, setForm] = useState({
    channelName: "",
    channelType: "",
    region: "",
    currency: "",
    apiUrl: "",
    apiKey: "",
    syncMode: "realtime",
    importOrders: true,
    syncInventory: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const updateField = useCallback((field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!form.channelName.trim()) e.channelName = "Channel name is required";
    if (!form.apiUrl.trim()) e.apiUrl = "API URL is required";
    if (!form.apiKey.trim()) e.apiKey = "API Key / Token is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSave = useCallback(() => {
    if (!validate()) return;
    setSaving(true);

    setTimeout(() => {
      const newId = "custom-" + Date.now();
      const newChannel: Channel = {
        id: newId,
        name: form.channelName,
        shortName: form.channelName,
        status: "syncing",
        lastSync: "Just now",
        ordersToday: 0,
        billedAmount: 0,
        syncAccuracy: 0,
        enabled: true,
      };

      addChannelAndAutoUpgrade(newChannel, form.channelName);

      toast({
        title: "Channel Connected",
        description: `${form.channelName} has been added and initial sync started.`,
      });

      navigate("/admin/multi-channel");
    }, 1500);
  }, [validate, form, addChannelAndAutoUpgrade, navigate]);

  const isSaveable = form.channelName.trim() && form.apiUrl.trim() && form.apiKey.trim();

  return (
    <AdminLayout
      title="Add Custom Channel"
      subtitle="Connect any external marketplace, ERP, or warehouse system"
    >
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-1 text-muted-foreground"
        onClick={() => navigate("/admin/multi-channel")}
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Multi-Channel
      </Button>

      <div className="max-w-2xl space-y-6">
        {/* ── Basic Information ──────────────────────────── */}
        <div className="form-section">
          <h3 className="flex items-center gap-2 form-section-title">
            <Package className="h-4 w-4 text-primary" /> Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5">
              <Label htmlFor="channelName" className="text-xs">Channel Name *</Label>
              <Input
                id="channelName"
                placeholder="e.g. My Marketplace"
                value={form.channelName}
                onChange={(e) => updateField("channelName", e.target.value)}
                className={cn(errors.channelName && "border-red-500")}
              />
              {errors.channelName && <p className="text-[11px] text-red-500">{errors.channelName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Channel Type</Label>
              <Select value={form.channelType} onValueChange={(v) => updateField("channelType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="erp">ERP</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Region</Label>
              <Select value={form.region} onValueChange={(v) => updateField("region", v)}>
                <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="sea">Southeast Asia</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Currency</Label>
              <Select value={form.currency} onValueChange={(v) => updateField("currency", v)}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Connection Info ────────────────────────────── */}
        <div className="form-section">
          <h3 className="flex items-center gap-2 form-section-title">
            <Key className="h-4 w-4 text-primary" /> Connection Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="apiUrl" className="text-xs">API URL *</Label>
              <Input
                id="apiUrl"
                placeholder="https://api.example.com/v1"
                value={form.apiUrl}
                onChange={(e) => updateField("apiUrl", e.target.value)}
                className={cn(errors.apiUrl && "border-red-500")}
              />
              {errors.apiUrl && <p className="text-[11px] text-red-500">{errors.apiUrl}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="apiKey" className="text-xs">API Key / Token *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk_live_••••••••"
                value={form.apiKey}
                onChange={(e) => updateField("apiKey", e.target.value)}
                className={cn(errors.apiKey && "border-red-500")}
              />
              {errors.apiKey && <p className="text-[11px] text-red-500">{errors.apiKey}</p>}
            </div>
          </div>
        </div>

        {/* ── Sync Settings ─────────────────────────────── */}
        <div className="form-section">
          <h3 className="flex items-center gap-2 form-section-title">
            <Settings2 className="h-4 w-4 text-primary" /> Sync Settings
          </h3>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Sync Mode</Label>
              <Select value={form.syncMode} onValueChange={(v) => updateField("syncMode", v)}>
                <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5">
                <span className="text-xs text-foreground">Import Orders</span>
                <Switch
                  checked={form.importOrders}
                  onCheckedChange={(v) => updateField("importOrders", v)}
                  className="scale-90"
                />
              </div>
              <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5">
                <span className="text-xs text-foreground">Sync Inventory</span>
                <Switch
                  checked={form.syncInventory}
                  onCheckedChange={(v) => updateField("syncInventory", v)}
                  className="scale-90"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={!isSaveable || saving}
          >
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting…</>
            ) : (
              <>Save & Connect</>
            )}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/multi-channel")} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
