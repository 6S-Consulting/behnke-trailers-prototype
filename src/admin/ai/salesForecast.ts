// AI Sales Forecasting - Demand prediction and trend analysis

import { Product } from '@/data/products';
import { Order } from '@/data/orders';
import { Quote } from '@/data/quotes';
import { Customer } from '@/data/customers';
import {
    getSeasonalFactor,
    getConfidenceLevel,
    calculateTrend,
    AIInsight,
    AIConfidence
} from './aiUtils';

export interface ProductForecast {
    productId: string;
    productName: string;
    category: string;
    currentMonthSales: number;
    previousMonthSales: number;
    growthRate: number;
    predictedNextMonth: number;
    predictedNextQuarter: number;
    seasonalTrend: string;
    demandLevel: 'high' | 'medium' | 'low' | 'declining';
    confidence: AIConfidence;
    insights: AIInsight[];
}

export interface CategoryForecast {
    category: string;
    currentRevenue: number;
    predictedRevenue: number;
    growthRate: number;
    productCount: number;
    topProduct: string;
    trend: 'up' | 'down' | 'stable';
}

export interface SalesForecastSummary {
    totalCurrentRevenue: number;
    predictedNextMonthRevenue: number;
    predictedNextQuarterRevenue: number;
    overallGrowthRate: number;
    highDemandProducts: number;
    decliningProducts: number;
    seasonalAlert: string | null;
    topGrowthCategory: string;
}

export interface MonthlyForecastPoint {
    month: string;
    actual: number;
    predicted: number;
    isPrediction: boolean;
}

// Generate sales data from orders
function getProductSalesData(productId: string, orders: Order[]): { current: number; previous: number } {
    // Simulate based on order data
    const productOrders = orders.flatMap(o =>
        o.items.filter(i => i.productId === productId)
    );

    const totalQuantity = productOrders.reduce((sum, item) => sum + item.quantity, 0);

    // Add variance for previous month
    const variance = 0.8 + Math.random() * 0.4; // 80-120%

    return {
        current: totalQuantity || Math.floor(Math.random() * 20) + 5,
        previous: Math.floor((totalQuantity || 10) * variance)
    };
}

export function predictProductDemand(
    product: Product,
    orders: Order[],
    quotes: Quote[]
): ProductForecast {
    const salesData = getProductSalesData(product.id, orders);

    // Calculate growth rate
    const growthRate = salesData.previous > 0
        ? ((salesData.current - salesData.previous) / salesData.previous)
        : 0;

    // Get seasonal factor
    const currentMonth = new Date().getMonth();
    const seasonalFactor = getSeasonalFactor(currentMonth);
    const nextMonthFactor = getSeasonalFactor((currentMonth + 1) % 12);

    // Predict next month demand
    const predictedNextMonth = Math.round(
        salesData.current * (1 + growthRate * 0.5) * nextMonthFactor
    );

    // Predict next quarter
    const predictedNextQuarter = Math.round(predictedNextMonth * 3 * 0.95);

    // Determine demand level
    let demandLevel: ProductForecast['demandLevel'] = 'medium';
    if (growthRate > 0.15) demandLevel = 'high';
    else if (growthRate < -0.1) demandLevel = 'declining';
    else if (salesData.current < 5) demandLevel = 'low';

    // Seasonal trend description
    let seasonalTrend = 'Stable demand pattern';
    if (seasonalFactor > 1.15) seasonalTrend = 'Peak season - High demand expected';
    else if (seasonalFactor < 0.9) seasonalTrend = 'Off-season - Lower demand expected';

    // Generate insights
    const insights: AIInsight[] = [];

    if (demandLevel === 'high') {
        insights.push({
            type: 'success',
            title: 'High Demand Trend',
            description: `${Math.round(growthRate * 100)}% growth detected. Consider increasing production.`,
            confidence: getConfidenceLevel(30),
            metric: `+${Math.round(growthRate * 100)}%`,
            trend: 'up'
        });
    }

    if (demandLevel === 'declining') {
        insights.push({
            type: 'warning',
            title: 'Demand Decline Detected',
            description: 'Sales trending downward. Review pricing or marketing strategy.',
            confidence: getConfidenceLevel(30),
            metric: `${Math.round(growthRate * 100)}%`,
            trend: 'down'
        });
    }

    if (seasonalFactor > 1.15) {
        insights.push({
            type: 'info',
            title: 'Seasonal Spike Expected',
            description: 'Historical data shows increased demand this period.',
            confidence: getConfidenceLevel(60),
            trend: 'up'
        });
    }

    return {
        productId: product.id,
        productName: product.name,
        category: product.category,
        currentMonthSales: salesData.current,
        previousMonthSales: salesData.previous,
        growthRate: Math.round(growthRate * 100) / 100,
        predictedNextMonth,
        predictedNextQuarter,
        seasonalTrend,
        demandLevel,
        confidence: getConfidenceLevel(30),
        insights
    };
}

export function getCategoryForecasts(
    products: Product[],
    orders: Order[]
): CategoryForecast[] {
    const categoryMap = new Map<string, {
        products: Product[];
        revenue: number;
        predictedRevenue: number;
    }>();

    products.forEach(product => {
        const existing = categoryMap.get(product.category) || {
            products: [],
            revenue: 0,
            predictedRevenue: 0
        };

        const salesData = getProductSalesData(product.id, orders);
        const growthRate = salesData.previous > 0
            ? ((salesData.current - salesData.previous) / salesData.previous)
            : 0;

        existing.products.push(product);
        existing.revenue += salesData.current * product.price;
        existing.predictedRevenue += salesData.current * (1 + growthRate * 0.5) * product.price;

        categoryMap.set(product.category, existing);
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => {
        const growthRate = data.revenue > 0
            ? ((data.predictedRevenue - data.revenue) / data.revenue)
            : 0;

        return {
            category,
            currentRevenue: Math.round(data.revenue),
            predictedRevenue: Math.round(data.predictedRevenue),
            growthRate: Math.round(growthRate * 100) / 100,
            productCount: data.products.length,
            topProduct: data.products.sort((a, b) => b.stock - a.stock)[0]?.name || '',
            trend: (growthRate > 0.05 ? 'up' : growthRate < -0.05 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
        };
    }).sort((a, b) => b.predictedRevenue - a.predictedRevenue);
}

export function getSalesForecastSummary(
    forecasts: ProductForecast[],
    categoryForecasts: CategoryForecast[]
): SalesForecastSummary {
    const currentMonth = new Date().getMonth();
    const seasonalFactor = getSeasonalFactor(currentMonth);

    const totalCurrent = categoryForecasts.reduce((sum, c) => sum + c.currentRevenue, 0);
    const totalPredicted = categoryForecasts.reduce((sum, c) => sum + c.predictedRevenue, 0);

    const topGrowthCategory = categoryForecasts.reduce((max, c) =>
        c.growthRate > max.growthRate ? c : max
        , categoryForecasts[0]);

    let seasonalAlert: string | null = null;
    if (seasonalFactor > 1.15) {
        seasonalAlert = 'Peak season detected - Q2/Q3 historically shows 15-25% higher demand';
    } else if (seasonalFactor < 0.9) {
        seasonalAlert = 'Off-season period - Consider promotional campaigns';
    }

    return {
        totalCurrentRevenue: totalCurrent,
        predictedNextMonthRevenue: totalPredicted,
        predictedNextQuarterRevenue: Math.round(totalPredicted * 3 * 0.95),
        overallGrowthRate: totalCurrent > 0
            ? Math.round(((totalPredicted - totalCurrent) / totalCurrent) * 100)
            : 0,
        highDemandProducts: forecasts.filter(f => f.demandLevel === 'high').length,
        decliningProducts: forecasts.filter(f => f.demandLevel === 'declining').length,
        seasonalAlert,
        topGrowthCategory: topGrowthCategory?.category || ''
    };
}

export function generateMonthlyForecastData(): MonthlyForecastPoint[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
        const seasonalFactor = getSeasonalFactor(index);
        const baseValue = 50000 + Math.random() * 20000;
        const actual = Math.round(baseValue * seasonalFactor);
        const predicted = Math.round(baseValue * seasonalFactor * (1 + (Math.random() * 0.1 - 0.05)));

        return {
            month,
            actual: index <= currentMonth ? actual : 0,
            predicted: index >= currentMonth ? predicted : 0,
            isPrediction: index > currentMonth
        };
    });
}
