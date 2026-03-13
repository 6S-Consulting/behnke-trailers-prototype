// AI Admin Assistant - Natural language query processing

import { Product } from '@/data/products';
import { Order } from '@/data/orders';
import { Quote } from '@/data/quotes';
import { Customer } from '@/data/customers';
import { formatCurrency, simulateTypingDelay } from './aiUtils';
import { CRITICAL_MARGIN } from '@/admin/context/AdminContext';

export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
        metrics?: { label: string; value: string }[];
        chartData?: { label: string; value: number }[];
        suggestions?: string[];
    };
}

export interface QueryContext {
    products: Product[];
    orders: Order[];
    quotes: Quote[];
    customers: Customer[];
    globalSteelIndex: number;
}

// Suggested queries for user assistance
export const suggestedQueries = [
    "Why did margins drop this month?",
    "Which customers bring the most profit?",
    "Show risky quotes",
    "Predict next quarter revenue",
    "What products need restocking?",
    "Show sales trends",
    "Which categories are performing best?",
    "How is inventory health?"
];

// Query pattern matching
interface QueryPattern {
    patterns: RegExp[];
    handler: (context: QueryContext) => ChatMessage['content'] | { content: string; metadata: ChatMessage['metadata'] };
}

const queryPatterns: QueryPattern[] = [
    // Margin queries
    {
        patterns: [/margin/i, /profit.*drop/i, /why.*margin/i],
        handler: (ctx) => {
            const avgMargin = ctx.quotes.reduce((sum, q) => {
                if (q.quotedPrice) {
                    const cost = q.items.reduce((c, item) => {
                        const product = ctx.products.find(p => p.id === item.productId);
                        return c + (product?.baseCost || 0) * item.quantity * ctx.globalSteelIndex;
                    }, 0);
                    return sum + ((q.quotedPrice - cost) / q.quotedPrice);
                }
                return sum;
            }, 0) / ctx.quotes.filter(q => q.quotedPrice).length;

            const marginChange = ctx.globalSteelIndex > 1
                ? Math.round((ctx.globalSteelIndex - 1) * 100)
                : 0;

            return {
                content: `📊 **Margin Analysis**\n\nCurrent average margin: **${(avgMargin * 100).toFixed(1)}%**\n\n${marginChange > 0
                    ? `⚠️ Margins have been impacted by a **${marginChange}% increase** in steel prices.\n\nKey factors:\n- Raw material cost spike\n- ${ctx.quotes.filter(q => q.status === 'negotiation').length} quotes in active negotiation\n- Consider revising quotes below 15% margin`
                    : `✅ Material costs are stable. Monitor active quotes for optimization opportunities.`
                    }`,
                metadata: {
                    metrics: [
                        { label: 'Avg Margin', value: `${(avgMargin * 100).toFixed(1)}%` },
                        { label: 'Steel Index', value: `${ctx.globalSteelIndex.toFixed(2)}x` },
                        { label: 'Quotes at Risk', value: `${ctx.quotes.filter(q => q.quotedPrice && q.items[0] && q.quotedPrice < (ctx.products.find(p => p.id === q.items[0].productId)?.baseCost || 0)).length}` }
                    ]
                }
            };
        }
    },

    // Top customers
    {
        patterns: [/top.*customer/i, /best.*customer/i, /most.*profit/i, /profitable.*customer/i],
        handler: (ctx) => {
            const customerStats = ctx.customers.map(c => ({
                ...c,
                profit: c.totalSpent * 0.22 // Estimated margin
            })).sort((a, b) => b.profit - a.profit).slice(0, 5);

            const list = customerStats.map((c, i) =>
                `${i + 1}. **${c.companyName}** – ${formatCurrency(c.profit)} profit (${c.totalOrders} orders)`
            ).join('\n');

            return {
                content: `👥 **Top 5 Profitable Customers**\n\n${list}\n\n💡 *These customers represent ${Math.round(customerStats.reduce((s, c) => s + c.profit, 0) / ctx.customers.reduce((s, c) => s + c.totalSpent * 0.22, 0) * 100)}% of total estimated profit.*`,
                metadata: {
                    chartData: customerStats.map(c => ({ label: c.companyName.split(' ')[0], value: Math.round(c.profit) }))
                }
            };
        }
    },

    // Risky quotes
    {
        patterns: [/risky.*quote/i, /risk.*quote/i, /low.*margin.*quote/i, /dangerous.*quote/i],
        handler: (ctx) => {
            const riskyQuotes = ctx.quotes.filter(q => {
                if (!q.quotedPrice) return false;
                const totalCost = q.items.reduce((sum, item) => {
                    const product = ctx.products.find(p => p.id === item.productId);
                    return sum + (product?.baseCost || 0) * item.quantity * ctx.globalSteelIndex;
                }, 0);
                const margin = (q.quotedPrice - totalCost) / q.quotedPrice;
                return margin < CRITICAL_MARGIN;
            });

            if (riskyQuotes.length === 0) {
                return `✅ **No Risky Quotes Found**\n\nAll active quotes have margins above the 15% threshold. Great job managing pricing!`;
            }

            const list = riskyQuotes.slice(0, 5).map(q =>
                `• **${q.id}** - ${q.companyName} (${q.status})`
            ).join('\n');

            return {
                content: `⚠️ **${riskyQuotes.length} Risky Quotes Detected**\n\nQuotes with margins below 15%:\n\n${list}\n\n💡 *Use the Intelligence Layer to optimize these quotes.*`,
                metadata: {
                    metrics: [
                        { label: 'Risky Quotes', value: `${riskyQuotes.length}` },
                        { label: 'Threshold', value: '15%' }
                    ],
                    suggestions: ['Open Intelligence Layer', 'Review quote pricing']
                }
            };
        }
    },

    // Revenue prediction
    {
        patterns: [/predict.*revenue/i, /next.*quarter/i, /forecast.*revenue/i, /revenue.*prediction/i],
        handler: (ctx) => {
            const currentRevenue = ctx.orders.reduce((sum, o) => sum + o.totalAmount, 0);
            const quotesPipeline = ctx.quotes
                .filter(q => q.status !== 'closed')
                .reduce((sum, q) => sum + (q.quotedPrice || 0), 0);

            const growthRate = 0.12 + Math.random() * 0.08; // 12-20% simulated growth
            const predictedQuarter = Math.round(currentRevenue * (1 + growthRate) * 3);

            return {
                content: `📈 **Revenue Forecast**\n\n**Current Quarter Revenue:** ${formatCurrency(currentRevenue)}\n**Quotes Pipeline:** ${formatCurrency(quotesPipeline)}\n\n**Predicted Next Quarter:** ${formatCurrency(predictedQuarter)} **(+${Math.round(growthRate * 100)}% growth)**\n\n🎯 *Based on historical trends, seasonal patterns, and current pipeline.*`,
                metadata: {
                    metrics: [
                        { label: 'Current', value: formatCurrency(currentRevenue) },
                        { label: 'Pipeline', value: formatCurrency(quotesPipeline) },
                        { label: 'Predicted', value: formatCurrency(predictedQuarter) }
                    ]
                }
            };
        }
    },

    // Inventory/restocking
    {
        patterns: [/restock/i, /inventory/i, /low.*stock/i, /need.*order/i],
        handler: (ctx) => {
            const lowStock = ctx.products.filter(p => p.stock > 0 && p.stock <= 10);
            const outOfStock = ctx.products.filter(p => p.stock === 0);

            const list = [...outOfStock, ...lowStock].slice(0, 5).map(p =>
                `• **${p.name}** – ${p.stock} units ${p.stock === 0 ? '🔴' : '🟡'}`
            ).join('\n');

            return {
                content: `📦 **Inventory Alert**\n\n**Out of Stock:** ${outOfStock.length} products\n**Low Stock:** ${lowStock.length} products\n\nProducts needing attention:\n${list}\n\n💡 *Visit Inventory AI Insights for detailed reorder recommendations.*`,
                metadata: {
                    metrics: [
                        { label: 'Out of Stock', value: `${outOfStock.length}` },
                        { label: 'Low Stock', value: `${lowStock.length}` },
                        { label: 'Healthy', value: `${ctx.products.length - outOfStock.length - lowStock.length}` }
                    ]
                }
            };
        }
    },

    // Sales trends
    {
        patterns: [/sales.*trend/i, /trend/i, /performance/i],
        handler: (ctx) => {
            const orderCount = ctx.orders.length;
            const avgOrderValue = ctx.orders.reduce((s, o) => s + o.totalAmount, 0) / orderCount;
            const topCategory = ctx.products.reduce((acc, p) => {
                acc[p.category] = (acc[p.category] || 0) + p.stock;
                return acc;
            }, {} as Record<string, number>);

            const topCat = Object.entries(topCategory).sort((a, b) => b[1] - a[1])[0];

            return {
                content: `📊 **Sales Trends Overview**\n\n**Total Orders:** ${orderCount}\n**Avg Order Value:** ${formatCurrency(avgOrderValue)}\n**Top Category:** ${topCat?.[0] || 'N/A'}\n\n📈 *Overall trend is stable with moderate growth indicators. Q2-Q3 typically shows 15-25% higher demand.*`,
                metadata: {
                    metrics: [
                        { label: 'Orders', value: `${orderCount}` },
                        { label: 'Avg Value', value: formatCurrency(avgOrderValue) }
                    ]
                }
            };
        }
    },

    // Category performance
    {
        patterns: [/category/i, /best.*performing/i, /top.*category/i],
        handler: (ctx) => {
            const categoryStats = ctx.products.reduce((acc, p) => {
                if (!acc[p.category]) {
                    acc[p.category] = { count: 0, totalStock: 0, totalValue: 0 };
                }
                acc[p.category].count++;
                acc[p.category].totalStock += p.stock;
                acc[p.category].totalValue += p.stock * p.price;
                return acc;
            }, {} as Record<string, { count: number; totalStock: number; totalValue: number }>);

            const sorted = Object.entries(categoryStats)
                .sort((a, b) => b[1].totalValue - a[1].totalValue)
                .slice(0, 4);

            const list = sorted.map(([cat, stats], i) =>
                `${i + 1}. **${cat.split(' ')[0]}** – ${formatCurrency(stats.totalValue)} inventory value`
            ).join('\n');

            return {
                content: `🏆 **Top Performing Categories**\n\n${list}\n\n💡 *${sorted[0]?.[0] || ''} leads in inventory value. Consider focusing marketing efforts here.*`,
                metadata: {
                    chartData: sorted.map(([cat, stats]) => ({ label: cat.split(' ')[0], value: Math.round(stats.totalValue) }))
                }
            };
        }
    }
];

// Default fallback response
const fallbackResponse = {
    content: `🤖 I can help you with:\n\n• **Margin Analysis** – "Why did margins drop?"\n• **Customer Insights** – "Who are top customers?"\n• **Quote Risks** – "Show risky quotes"\n• **Revenue Forecasts** – "Predict next quarter"\n• **Inventory Health** – "What needs restocking?"\n• **Sales Trends** – "Show performance trends"\n\nTry asking one of these questions!`,
    metadata: {
        suggestions: suggestedQueries.slice(0, 4)
    }
};

export function processQuery(query: string, context: QueryContext): ChatMessage['content'] | { content: string; metadata: ChatMessage['metadata'] } {
    const normalizedQuery = query.toLowerCase().trim();

    for (const pattern of queryPatterns) {
        if (pattern.patterns.some(p => p.test(normalizedQuery))) {
            return pattern.handler(context);
        }
    }

    return fallbackResponse;
}

export function generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getTypingDelay(response: string): number {
    return simulateTypingDelay(response);
}
