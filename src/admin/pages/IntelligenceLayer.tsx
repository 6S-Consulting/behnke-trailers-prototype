import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { useAdmin, HEALTHY_MARGIN, CRITICAL_MARGIN, OPTIMAL_MARGIN } from "@/admin/context/AdminContext";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Package,
    DollarSign,
    Zap,
    Building2,
    User,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

export default function IntelligenceLayer() {
    const { quoteId } = useParams();
    const navigate = useNavigate();
    const { quotes, setQuotes, products, globalSteelIndex, setGlobalSteelIndex } = useAdmin();

    const quote = useMemo(() => quotes.find((q) => q.id === quoteId), [quotes, quoteId]);

    // Local slider value for smooth interaction
    const [sliderValue, setSliderValue] = useState((globalSteelIndex - 1) * 100);

    // Local state for manual price override (not persisted until save)
    const [manualPrice, setManualPrice] = useState<string>("");

    // Calculate costs and margins - now works even without quotedPrice for In Review phase
    const calculations = useMemo(() => {
        if (!quote) {
            return null;
        }

        let totalBaseCost = 0;
        const itemDetails = quote.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const baseCost = product?.baseCost || product?.price || 0;
            const realTimeCost = baseCost * globalSteelIndex;
            totalBaseCost += realTimeCost * item.quantity;

            return {
                ...item,
                baseCost,
                realTimeCost,
                totalCost: realTimeCost * item.quantity,
            };
        });

        // Calculate suggested prices at different margin levels
        const suggestedPrices = {
            minimum: totalBaseCost / (1 - CRITICAL_MARGIN), // 15% margin (minimum)
            healthy: totalBaseCost / (1 - HEALTHY_MARGIN),  // 20% margin (healthy)
            optimal: totalBaseCost / (1 - OPTIMAL_MARGIN),  // 25% margin (optimal)
        };

        // If quote has a price, calculate current margin
        const quotedPrice = quote.quotedPrice || 0;
        const hasQuotedPrice = quotedPrice > 0;
        const margin = hasQuotedPrice ? (quotedPrice - totalBaseCost) / quotedPrice : 0;
        const isHealthy = hasQuotedPrice && margin >= HEALTHY_MARGIN;
        const isCritical = hasQuotedPrice && margin < CRITICAL_MARGIN;

        return {
            itemDetails,
            totalBaseCost,
            quotedPrice,
            hasQuotedPrice,
            margin,
            marginPercent: (margin * 100).toFixed(1),
            isHealthy,
            isCritical,
            suggestedPrices,
            optimizedPrice: suggestedPrices.optimal,
        };
    }, [quote, products, globalSteelIndex]);

    // Update global state when slider changes
    useEffect(() => {
        const newIndex = 1 + sliderValue / 100;
        setGlobalSteelIndex(newIndex);
    }, [sliderValue, setGlobalSteelIndex]);

    const handleOptimizeQuote = () => {
        if (!quote || !calculations) return;

        setQuotes(
            quotes.map((q) =>
                q.id === quoteId
                    ? {
                        ...q,
                        quotedPrice: Math.round(calculations.optimizedPrice * 100) / 100,
                        updatedAt: new Date().toISOString().split("T")[0],
                    }
                    : q
            )
        );
    };

    // Apply a suggested price directly
    const handleApplyPrice = (price: number) => {
        if (!quote) return;

        setQuotes(
            quotes.map((q) =>
                q.id === quoteId
                    ? {
                        ...q,
                        quotedPrice: Math.round(price * 100) / 100,
                        status: q.status === "new" || q.status === "in-review" ? "quoted" : q.status,
                        updatedAt: new Date().toISOString().split("T")[0],
                    }
                    : q
            )
        );
    };

    return (
        <AdminLayout
            title="Intelligence Layer"
            subtitle="Real-time margin analysis and price optimization"
        >
            {/* Back Button */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate(quoteId ? `/admin/quotes/${quoteId}` : "/admin/quotes")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {quoteId ? "Back to Quote" : "Back to Quotes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: Simulator + Quote Info + Item Cost Analysis */}
                <div className="space-y-6">
                    {/* Global Simulator Widget */}
                    <div className="form-section">
                        <h3 className="form-section-title flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Global Simulator
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Global Steel Price Index</Label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step="1"
                                        value={sliderValue}
                                        onChange={(e) => setSliderValue(Number(e.target.value))}
                                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className={cn(
                                        "text-lg font-bold min-w-[60px] text-right",
                                        sliderValue > 30 ? "text-red-500" : sliderValue > 15 ? "text-yellow-500" : "text-green-500"
                                    )}>
                                        +{sliderValue}%
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Simulates steel price fluctuations from 0% to +50%
                                </p>
                            </div>

                            {/* Index Visualization */}
                            <div className="p-4 bg-muted/30 rounded-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Current Index</span>
                                    <span className="text-2xl font-bold">{globalSteelIndex.toFixed(2)}x</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className={cn(
                                            "h-2 rounded-full transition-all duration-300",
                                            sliderValue > 30 ? "bg-red-500" : sliderValue > 15 ? "bg-yellow-500" : "bg-green-500"
                                        )}
                                        style={{ width: `${(sliderValue / 50) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quote Info + Item Cost Analysis - Only when quote selected */}
                    {!quoteId ? (
                        <div className="form-section flex flex-col items-center justify-center h-48">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                                Select a quote from the Quotes page to analyze margins
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => navigate("/admin/quotes")}
                            >
                                Go to Quotes
                            </Button>
                        </div>
                    ) : !quote ? (
                        <div className="form-section flex flex-col items-center justify-center h-48">
                            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                            <p className="text-muted-foreground">Quote not found</p>
                        </div>
                    ) : (
                        <>
                            {/* Items Cost Analysis */}
                            {calculations && (
                                <div className="form-section">
                                    <h3 className="form-section-title">Item Cost Analysis</h3>
                                    <div className="space-y-2">
                                        {calculations.itemDetails.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium text-sm">{item.productName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Qty: {item.quantity} × ${item.realTimeCost.toFixed(2)} (base: ${item.baseCost.toFixed(2)})
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${item.totalCost.toFixed(2)}</p>
                                                    {globalSteelIndex > 1 && (
                                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            +{((globalSteelIndex - 1) * 100).toFixed(0)}%
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-sm border border-primary/20">
                                            <span className="font-semibold">Total Real-Time Cost</span>
                                            <span className="font-bold text-lg">${calculations.totalBaseCost.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* RIGHT COLUMN: Pricing Guide OR Margin Analysis */}
                <div className="space-y-6">
                    {/* Show placeholder when no quote selected */}
                    {!quoteId ? (
                        <div className="form-section flex flex-col items-center justify-center h-64">
                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                                Select a quote to see pricing recommendations
                            </p>
                        </div>
                    ) : !quote ? (
                        <div className="form-section flex flex-col items-center justify-center h-64">
                            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                            <p className="text-muted-foreground">Quote not found</p>
                        </div>
                    ) : (
                        <>
                            {/* Quote Info Header */}
                            <div className="form-section">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{quote.id}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="h-4 w-4" />
                                                {quote.companyName}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-4 w-4" />
                                                {quote.customerName}
                                            </span>
                                        </div>
                                    </div>
                                    {quote.quotedPrice && (
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Quoted Price</p>
                                            <p className="text-2xl font-bold">${quote.quotedPrice.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Margin Shield Analysis Box - Only shown when quote has a price */}
                            {calculations && calculations.hasQuotedPrice && (
                                <div
                                    className={cn(
                                        "form-section border-2 transition-all duration-300",
                                        calculations.isCritical
                                            ? "border-red-500 bg-red-500/5 animate-pulse"
                                            : calculations.isHealthy
                                                ? "border-green-500 bg-green-500/5"
                                                : "border-yellow-500 bg-yellow-500/5"
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {calculations.isCritical ? (
                                                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                                </div>
                                            ) : calculations.isHealthy ? (
                                                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                    <TrendingDown className="h-6 w-6 text-yellow-500" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    {calculations.isCritical
                                                        ? "CRITICAL ALERT"
                                                        : calculations.isHealthy
                                                            ? "Healthy Margin"
                                                            : "Margin Warning"}
                                                </h3>
                                                <p className={cn(
                                                    "text-sm",
                                                    calculations.isCritical
                                                        ? "text-red-500"
                                                        : calculations.isHealthy
                                                            ? "text-green-500"
                                                            : "text-yellow-500"
                                                )}>
                                                    {calculations.isCritical
                                                        ? "Material Cost Spike Detected"
                                                        : calculations.isHealthy
                                                            ? "Quote is profitable at current costs"
                                                            : "Margin approaching critical threshold"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Current Margin</p>
                                            <p className={cn(
                                                "text-3xl font-bold",
                                                calculations.isCritical
                                                    ? "text-red-500"
                                                    : calculations.isHealthy
                                                        ? "text-green-500"
                                                        : "text-yellow-500"
                                            )}>
                                                {calculations.marginPercent}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Optimize Button */}
                                    {calculations.isCritical && (
                                        <div className="mt-6 p-4 bg-background/80 rounded-sm border">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">Suggested Optimized Price</p>
                                                    <p className="text-2xl font-bold text-green-500">
                                                        ${calculations.optimizedPrice.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Restores margin to {(OPTIMAL_MARGIN * 100).toFixed(0)}%
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleOptimizeQuote}
                                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                                >
                                                    <Zap className="h-4 w-4" />
                                                    Optimize Quote
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Margin Details */}
                                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Quoted Price</p>
                                            <p className="font-bold">${calculations.quotedPrice.toLocaleString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Total Cost</p>
                                            <p className="font-bold">${calculations.totalBaseCost.toFixed(2)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Profit</p>
                                            <p className={cn(
                                                "font-bold",
                                                calculations.quotedPrice - calculations.totalBaseCost >= 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                ${(calculations.quotedPrice - calculations.totalBaseCost).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggested Pricing Guide - For In Review phase without quoted price */}
                            {!quote.quotedPrice && calculations && (
                                <div className="form-section border-2 border-blue-500 bg-blue-500/5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <DollarSign className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-blue-500">Suggested Pricing Guide</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Recommended quote prices based on current material costs
                                            </p>
                                        </div>
                                    </div>

                                    {/* Pricing Tiers */}
                                    <div className="space-y-3">
                                        {/* Optimal - 25% margin */}
                                        <div className="p-4 rounded-sm bg-green-500/10 border border-green-500/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-green-600">Optimal Price (25% Margin)</p>
                                                    <p className="text-xs text-muted-foreground">Recommended for best profitability</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-500">
                                                            ${calculations.suggestedPrices.optimal.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Profit: ${(calculations.suggestedPrices.optimal - calculations.totalBaseCost).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApplyPrice(calculations.suggestedPrices.optimal)}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Healthy - 20% margin */}
                                        <div className="p-4 rounded-sm bg-blue-500/10 border border-blue-500/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600">Healthy Price (20% Margin)</p>
                                                    <p className="text-xs text-muted-foreground">Standard competitive pricing</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-blue-500">
                                                            ${calculations.suggestedPrices.healthy.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Profit: ${(calculations.suggestedPrices.healthy - calculations.totalBaseCost).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                                        onClick={() => handleApplyPrice(calculations.suggestedPrices.healthy)}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Minimum - 15% margin */}
                                        <div className="p-4 rounded-sm bg-yellow-500/10 border border-yellow-500/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-yellow-600">Minimum Price (15% Margin)</p>
                                                    <p className="text-xs text-muted-foreground">For competitive bids only</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-yellow-500">
                                                            ${calculations.suggestedPrices.minimum.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Profit: ${(calculations.suggestedPrices.minimum - calculations.totalBaseCost).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                                                        onClick={() => handleApplyPrice(calculations.suggestedPrices.minimum)}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manual Price Override Section */}
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="space-y-2">
                                            <Label htmlFor="manualPrice" className="text-sm font-medium">Manual Quoted Price ($)</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        id="manualPrice"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={manualPrice}
                                                        onChange={(e) => setManualPrice(e.target.value)}
                                                        placeholder="Enter custom price"
                                                        className="pl-9"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        const price = parseFloat(manualPrice);
                                                        if (!isNaN(price) && price > 0) {
                                                            handleApplyPrice(price);
                                                            setManualPrice("");
                                                        }
                                                    }}
                                                    disabled={!manualPrice || parseFloat(manualPrice) <= 0}
                                                    className="gap-2"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                    Set Quote Price
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Enter a custom price to override suggested prices. Changes are saved to quote state only.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
