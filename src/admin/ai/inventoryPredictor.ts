// AI Inventory Predictor - Stock depletion and reorder predictions

import { Product } from '@/data/products';
import { Order } from '@/data/orders';
import {
    calculateAvgDailyUsage,
    getConfidenceLevel,
    formatDaysToReadable,
    AIInsight,
    AIConfidence
} from './aiUtils';

export interface StockPrediction {
    productId: string;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    avgDailyUsage: number;
    daysUntilStockout: number;
    daysUntilStockoutFormatted: string;
    recommendedReorderDate: Date;
    recommendedReorderDays: number;
    safeStockLevel: number;
    reorderQuantity: number;
    status: 'healthy' | 'warning' | 'critical' | 'dead-stock';
    confidence: AIConfidence;
    insights: AIInsight[];
}

export interface InventoryAISummary {
    totalProducts: number;
    healthyProducts: number;
    warningProducts: number;
    criticalProducts: number;
    deadStockProducts: number;
    upcomingReorders: number;
    estimatedReorderValue: number;
}

const DEFAULT_LEAD_TIME = 10; // days
const SAFETY_FACTOR = 1.3;
const DEAD_STOCK_THRESHOLD_DAYS = 90;

export function predictStockDepletion(
    product: Product,
    orders: Order[]
): StockPrediction {
    const avgDailyUsage = calculateAvgDailyUsage(product.stock, product.id);

    // Calculate days until stockout
    const daysUntilStockout = product.stock > 0
        ? Math.floor(product.stock / avgDailyUsage)
        : 0;

    // Calculate safe stock level
    const safeStockLevel = Math.ceil(avgDailyUsage * DEFAULT_LEAD_TIME * SAFETY_FACTOR);

    // Calculate recommended reorder date
    const reorderDays = Math.max(0, daysUntilStockout - DEFAULT_LEAD_TIME);
    const reorderDate = new Date();
    reorderDate.setDate(reorderDate.getDate() + reorderDays);

    // Calculate reorder quantity (bring stock to 2x safe level)
    const reorderQuantity = Math.ceil(safeStockLevel * 2 - product.stock);

    // Determine status
    let status: StockPrediction['status'] = 'healthy';
    if (avgDailyUsage < 0.1 && product.stock > 50) {
        status = 'dead-stock';
    } else if (daysUntilStockout <= 7 || product.stock === 0) {
        status = 'critical';
    } else if (daysUntilStockout <= 21) {
        status = 'warning';
    }

    // Generate insights
    const insights: AIInsight[] = [];

    if (status === 'critical') {
        insights.push({
            type: 'critical',
            title: 'Urgent Reorder Required',
            description: product.stock === 0
                ? 'Product is out of stock. Immediate reorder recommended.'
                : `Stock will run out in ${formatDaysToReadable(daysUntilStockout)}. Order now to avoid stockout.`,
            confidence: getConfidenceLevel(30),
            metric: daysUntilStockout,
            trend: 'down'
        });
    } else if (status === 'warning') {
        insights.push({
            type: 'warning',
            title: 'Reorder Soon',
            description: `Stock running low. Recommended reorder in ${formatDaysToReadable(reorderDays)}.`,
            confidence: getConfidenceLevel(30),
            metric: reorderDays,
            trend: 'down'
        });
    } else if (status === 'dead-stock') {
        insights.push({
            type: 'warning',
            title: 'Dead Stock Risk',
            description: 'Very low movement detected. Consider reducing stock or running promotions.',
            confidence: getConfidenceLevel(60),
            trend: 'stable'
        });
    }

    if (product.stock < safeStockLevel && status !== 'dead-stock') {
        insights.push({
            type: 'info',
            title: 'Below Safe Stock',
            description: `Current stock (${product.stock}) is below recommended safe level (${safeStockLevel}).`,
            confidence: getConfidenceLevel(30),
            metric: safeStockLevel
        });
    }

    return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        currentStock: product.stock,
        avgDailyUsage: Math.round(avgDailyUsage * 100) / 100,
        daysUntilStockout,
        daysUntilStockoutFormatted: formatDaysToReadable(daysUntilStockout),
        recommendedReorderDate: reorderDate,
        recommendedReorderDays: reorderDays,
        safeStockLevel,
        reorderQuantity: Math.max(0, reorderQuantity),
        status,
        confidence: getConfidenceLevel(30),
        insights
    };
}

export function getInventoryPredictions(
    products: Product[],
    orders: Order[]
): StockPrediction[] {
    return products
        .filter(p => p.status === 'active')
        .map(product => predictStockDepletion(product, orders))
        .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

export function getInventorySummary(predictions: StockPrediction[]): InventoryAISummary {
    const summary: InventoryAISummary = {
        totalProducts: predictions.length,
        healthyProducts: 0,
        warningProducts: 0,
        criticalProducts: 0,
        deadStockProducts: 0,
        upcomingReorders: 0,
        estimatedReorderValue: 0
    };

    predictions.forEach(pred => {
        switch (pred.status) {
            case 'healthy':
                summary.healthyProducts++;
                break;
            case 'warning':
                summary.warningProducts++;
                if (pred.recommendedReorderDays <= 14) {
                    summary.upcomingReorders++;
                }
                break;
            case 'critical':
                summary.criticalProducts++;
                summary.upcomingReorders++;
                break;
            case 'dead-stock':
                summary.deadStockProducts++;
                break;
        }

        // Estimate reorder value (simplified)
        if (pred.reorderQuantity > 0 && pred.status !== 'dead-stock') {
            summary.estimatedReorderValue += pred.reorderQuantity * 210; // Avg unit cost estimate for pumps
        }
    });

    return summary;
}
