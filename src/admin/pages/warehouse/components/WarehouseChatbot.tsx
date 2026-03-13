/**
 * AI Warehouse Assistant Chatbot
 * Provides insights on inventory, warehouse space, shipping, and optimization
 */

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  X,
  TrendingDown,
  TrendingUp,
  Package,
  Warehouse,
  Truck,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { cn } from "@/admin/lib/utils";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface WarehouseChatbotProps {
  warehouseData: any;
  inventoryData: any;
  onQuery?: (query: string) => void;
}

export function WarehouseChatbot({
  warehouseData,
  inventoryData,
}: WarehouseChatbotProps) {
  const totalStock = inventoryData.inventory.reduce((sum: any, item: any) => sum + item.onHand, 0);
  // Estimate value using a fixed base cost for aesthetic purposes (pumps avg cost $210)
  const totalValue = inventoryData.inventory.reduce((sum: any, item: any) => sum + (item.onHand * 210), 0);
  const totalWarehouses = warehouseData.warehouses.length;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        `👋 Hi! I'm your warehouse assistant.\n\n📊 Current Network Status:\n• Total Stock: ${totalStock.toLocaleString()} units\n• Active Warehouses: ${totalWarehouses}\n• Est. Value: $${totalValue.toLocaleString()}\n\nI can help you with:\n• Low stock alerts and recommendations\n• Warehouse space availability\n• Optimal shipping locations\n• Cost optimization insights\n• Pallet allocation suggestions\n\nAsk me anything!`,
      timestamp: new Date(),
      suggestions: [
        "Show low stock items",
        "Which warehouse has space?",
        "Optimize shipping costs",
        "Check pallet utilization",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeQuery = (query: string): Message => {
    const lowerQuery = query.toLowerCase();

    // Low stock queries
    if (lowerQuery.includes("low stock") || lowerQuery.includes("shortage")) {
      const lowStockItems = inventoryData.inventory
        .filter((item: any) => item.available < item.reorderPoint)
        .slice(0, 5);

      if (lowStockItems.length > 0) {
        const itemsList = lowStockItems
          .map(
            (item: any) =>
              `\n• ${item.sku} at ${warehouseData.warehouses.find((w: any) => w.id === item.warehouseId)?.name || item.warehouseId}: ${item.available} units (reorder at ${item.reorderPoint})`,
          )
          .join("");

        return {
          id: Date.now().toString(),
          type: "assistant",
          content: `🚨 Found ${lowStockItems.length} items below reorder point:${itemsList}\n\n💡 Recommendation: Initiate reorder for these items from India manufacturing facility.`,
          timestamp: new Date(),
          suggestions: [
            "Show warehouse space",
            "Calculate reorder quantity",
            "Check shipping costs",
            "Show pump demand",
          ],
        };
      }
    }

    // Warehouse space queries
    if (
      lowerQuery.includes("space") ||
      lowerQuery.includes("available") ||
      lowerQuery.includes("free")
    ) {
      const warehouseSpace = warehouseData.warehouses
        .map((wh: any) => {
          const utilization =
            (wh.capacity.usedPallets / wh.capacity.totalPallets) * 100;
          return {
            name: wh.name,
            free: wh.capacity.freePallets,
            utilization: utilization.toFixed(1),
            cost: wh.costs.storagePerPalletMonth,
          };
        })
        .sort((a: any, b: any) => b.free - a.free);

      const spaceInfo = warehouseSpace
        .map(
          (wh: any) =>
            `\n• ${wh.name}: ${wh.free} pallets free (${wh.utilization}% used, $${wh.cost}/pallet)`,
        )
        .join("");

      const bestWarehouse = warehouseSpace[0];

      return {
        id: Date.now().toString(),
        type: "assistant",
        content: `📦 Warehouse Space Availability:${spaceInfo}\n\n💡 Best option: ${bestWarehouse.name} has the most space (${bestWarehouse.free} pallets available).`,
        timestamp: new Date(),
        suggestions: [
          "Where should new stock go?",
          "Optimize pallet costs",
          "Show surplus items",
        ],
      };
    }

    // Shipping optimization queries
    if (
      lowerQuery.includes("shipping") ||
      lowerQuery.includes("ship") ||
      lowerQuery.includes("deliver")
    ) {
      return {
        id: Date.now().toString(),
        type: "assistant",
        content: `🚚 Shipping Optimization Strategy:\n\n• North Carolina Warehouse: Best for East Coast & Southeast states\n• California Warehouse: Optimal for West Coast & Pacific states\n• Texas Warehouse: Ideal for South & South Central states\n• Las Vegas Warehouse: Best for Mountain & Southwest states\n\n💡 Tip: Select warehouse closest to customer's state to minimize shipping costs ($8-12 per order vs $15-25 for cross-country).`,
        timestamp: new Date(),
        suggestions: [
          "Calculate shipping for TX order",
          "Show coverage map",
          "Compare warehouse costs",
        ],
      };
    }

    // Pallet optimization queries
    if (lowerQuery.includes("pallet") || lowerQuery.includes("optimize cost")) {
      const palletCosts = warehouseData.warehouses
        .map((wh: any) => ({
          name: wh.name,
          cost: wh.costs.storagePerPalletMonth,
          used: wh.capacity.usedPallets,
          monthlyCost: wh.costs.storagePerPalletMonth * wh.capacity.usedPallets,
        }))
        .sort((a: any, b: any) => a.cost - b.cost);

      const costInfo = palletCosts
        .map(
          (wh: any) =>
            `\n• ${wh.name}: $${wh.cost}/pallet/month (${wh.used} pallets = $${wh.monthlyCost.toFixed(0)}/month)`,
        )
        .join("");

      const totalMonthlyCost = palletCosts.reduce(
        (sum: number, wh: any) => sum + wh.monthlyCost,
        0,
      );
      const cheapest = palletCosts[0];

      return {
        id: Date.now().toString(),
        type: "assistant",
        content: `💰 Pallet Cost Analysis:${costInfo}\n\nTotal monthly storage: $${totalMonthlyCost.toFixed(0)}\n\n💡 Recommendation: ${cheapest.name} has lowest storage cost at $${cheapest.cost}/pallet. Consider moving slow-moving inventory here to reduce costs.`,
        timestamp: new Date(),
        suggestions: [
          "Show slow-moving stock",
          "Calculate transfer savings",
          "Check surplus items",
        ],
      };
    }

    // Surplus/excess stock queries
    if (lowerQuery.includes("surplus") || lowerQuery.includes("excess")) {
      const surplusItems = inventoryData.inventory
        .filter((item: any) => item.daysOfSupply > 120)
        .slice(0, 5);

      if (surplusItems.length > 0) {
        const itemsList = surplusItems
          .map(
            (item: any) =>
              `\n• ${item.sku} at ${warehouseData.warehouses.find((w: any) => w.id === item.warehouseId)?.name || item.warehouseId}: ${item.onHand} units (${Math.floor(item.daysOfSupply)} days supply)`,
          )
          .join("");

        return {
          id: Date.now().toString(),
          type: "assistant",
          content: `📊 Surplus Stock Items (>4 months supply):${itemsList}\n\n💡 Actions:\n• Consider transferring to higher-demand warehouses\n• Review reorder quantities\n• Reduce next manufacturing batch`,
          timestamp: new Date(),
          suggestions: [
            "Where to transfer surplus?",
            "Show demand forecast",
            "Calculate holding costs",
          ],
        };
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: "assistant",
      content: `I can help you with:\n\n• "Show low stock items" - Items below reorder points\n• "Which warehouse has space?" - Available pallet capacity\n• "Optimize shipping costs" - Best warehouse by location\n• "Check pallet utilization" - Storage cost analysis\n• "Show surplus items" - Overstock situations\n\nWhat would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        "Show low stock items",
        "Which warehouse has space?",
        "Optimize shipping costs",
        "Check pallet utilization",
      ],
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI processing and response
    setTimeout(() => {
      const response = analyzeQuery(inputValue);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 800);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105"
        >
          <Warehouse className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          <div className="absolute right-full mr-3 px-3 py-1.5 bg-card border border-border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <span className="text-sm font-medium">Warehouse Assistant</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 bg-card border border-border rounded-lg shadow-2xl flex flex-col transition-all duration-300",
            isExpanded
              ? "bottom-4 right-4 w-[500px] h-[600px]"
              : "bottom-6 right-6 w-[380px] h-[500px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-purple-600/10 to-blue-600/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Warehouse Assistant</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI-powered insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={cn(
                    "flex",
                    message.type === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap",
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border",
                    )}
                  >
                    {message.type === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Warehouse className="h-3 w-3 text-purple-500" />
                        <span className="text-xs font-medium text-purple-500">AI Insight</span>
                      </div>
                    )}
                    {message.content}
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && message.type === "assistant" && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-3 w-3 text-purple-500 animate-pulse" />
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about inventory, space, shipping..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              AI responses are estimates based on available data
            </p>
          </div>
        </div>
      )}
    </>
  );
}
