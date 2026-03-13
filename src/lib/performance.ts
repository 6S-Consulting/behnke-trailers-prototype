/**
 * Web Vitals Performance Monitoring
 *
 * Tracks Core Web Vitals and reports them for monitoring
 */

// Type definitions for Web Vitals
interface Metric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Send metric to analytics service
 * Replace this with your actual analytics endpoint
 */
function sendToAnalytics(metric: Metric) {
  // Example: Send to Google Analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Console log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 * Import this in your main.tsx
 */
export async function initWebVitals() {
  if (typeof window === "undefined") return;

  try {
    const { onCLS, onFCP, onLCP, onTTFB, onINP } =
      await import("web-vitals");

    // Cumulative Layout Shift
    onCLS(sendToAnalytics);

    // First Contentful Paint
    onFCP(sendToAnalytics);

    // Largest Contentful Paint
    onLCP(sendToAnalytics);

    // Time to First Byte
    onTTFB(sendToAnalytics);

    // Interaction to Next Paint
    onINP(sendToAnalytics);
  } catch (error) {
    console.error("Failed to load web-vitals:", error);
  }
}

/**
 * Performance observer for custom metrics
 */
export function observePerformance() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window))
    return;

  // Observe long tasks (blocking the main thread)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn("[Performance] Long task detected:", {
            duration: Math.round(entry.duration),
            startTime: Math.round(entry.startTime),
          });
        }
      }
    });
    observer.observe({ entryTypes: ["longtask"] });
  } catch {
    // Long tasks not supported
  }

  // Observe layout shifts
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
          sources?: Array<{ node?: Node }>;
        };
        if (!layoutShift.hadRecentInput && layoutShift.value && layoutShift.value > 0.1) {
          console.warn("[Performance] Large layout shift detected:", {
            value: layoutShift.value.toFixed(4),
            sources: layoutShift.sources?.map((s) => s.node),
          });
        }
      }
    });
    observer.observe({ entryTypes: ["layout-shift"] });
  } catch {
    // Layout shift not supported
  }
}

/**
 * Log resource timing information
 */
export function logResourceTiming() {
  if (typeof window === "undefined") return;

  window.addEventListener("load", () => {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const largeResources = resources
      .map((r) => ({
        name: r.name,
        size: r.transferSize,
        duration: r.duration,
      }))
      .filter((r) => r.size > 100000) // > 100KB
      .sort((a, b) => b.size - a.size);

    if (largeResources.length > 0 && import.meta.env.DEV) {
      console.table(largeResources);
    }
  });
}
