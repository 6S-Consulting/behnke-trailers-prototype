// AI Utility Functions - Core helpers for AI predictions

export interface AIConfidence {
    level: 'high' | 'medium' | 'low';
    percentage: number;
}

export interface AIInsight {
    type: 'success' | 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    confidence: AIConfidence;
    metric?: string | number;
    trend?: 'up' | 'down' | 'stable';
}

// Generate simulated historical data based on current stock
export function generateHistoricalData(currentStock: number, days: number = 30): number[] {
    const data: number[] = [];
    let stock = currentStock + Math.floor(currentStock * 0.8); // Start with more stock in past

    for (let i = 0; i < days; i++) {
        // Simulate daily consumption with some variance
        const dailyChange = Math.floor(Math.random() * (stock * 0.05)) + 1;
        stock = Math.max(0, stock - dailyChange);
        data.push(stock);
    }

    return data;
}

// Calculate average daily usage from simulated history
export function calculateAvgDailyUsage(currentStock: number, productId: string): number {
    // Use product ID hash to create consistent but varied usage patterns
    const hash = productId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);

    const baseUsage = Math.abs(hash % 5) + 1; // 1-5 units base
    const variance = (Math.abs(hash % 30) / 100); // 0-30% variance

    return baseUsage * (1 + variance);
}

// Get confidence level based on data quality
export function getConfidenceLevel(dataPoints: number): AIConfidence {
    if (dataPoints >= 60) {
        return { level: 'high', percentage: 85 + Math.floor(Math.random() * 10) };
    } else if (dataPoints >= 30) {
        return { level: 'medium', percentage: 65 + Math.floor(Math.random() * 15) };
    }
    return { level: 'low', percentage: 45 + Math.floor(Math.random() * 15) };
}

// Format days to human readable
export function formatDaysToReadable(days: number): string {
    if (days <= 0) return 'Immediate attention needed';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 14) return `${Math.floor(days / 7)} week`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    if (days < 60) return `${Math.floor(days / 30)} month`;
    return `${Math.floor(days / 30)} months`;
}

// Calculate trend from data series
export function calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
}

// Generate seasonal pattern based on month
export function getSeasonalFactor(month: number): number {
    // Q1: slow, Q2-Q3: peak, Q4: moderate
    const factors: Record<number, number> = {
        0: 0.85, 1: 0.90, 2: 0.95,  // Jan-Mar
        3: 1.10, 4: 1.15, 5: 1.20,  // Apr-Jun
        6: 1.25, 7: 1.20, 8: 1.15,  // Jul-Sep
        9: 1.05, 10: 1.00, 11: 0.90 // Oct-Dec
    };
    return factors[month] || 1.0;
}

// Format currency
export function formatCurrency(amount: number, currency: string = '$'): string {
    if (amount >= 10000000) {
        return `${currency}${(amount / 10000000).toFixed(1)} Cr`;
    }
    if (amount >= 100000) {
        return `${currency}${(amount / 100000).toFixed(1)} L`;
    }
    if (amount >= 1000) {
        return `${currency}${(amount / 1000).toFixed(1)}K`;
    }
    return `${currency}${amount.toFixed(2)}`;
}

// Simulate typing delay for chat
export function simulateTypingDelay(text: string): number {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const baseDelay = (words / wordsPerMinute) * 60 * 1000;
    return Math.min(Math.max(baseDelay, 800), 3000);
}
