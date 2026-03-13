import { useEffect } from "react";

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * SEO Meta Tags Component
 * Add this to your pages to improve SEO
 * Note: This uses document.title and manual meta tag updates
 * For SSR support, consider using react-helmet-async
 */
export function SEOMeta({
  title = "HYDRAULIC pumps - Premium Hydraulic Solutions",
  description = "Leading provider of hydraulic pumps, power units, and accessories. High-quality hydraulic solutions for industrial applications.",
  keywords = "hydraulic pumps, hydraulic power units, industrial hydraulics, gear pump, piston pump, vane pump",
  image = "/og-image.jpg",
  url = "https://yourdomain.com",
  type = "website",
}: SEOMetaProps) {
  const fullTitle = title.includes("HYDRAULIC")
    ? title
    : `${title} | HYDRAULIC pumps`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        const attrName = selector.includes("property") ? "property" : "name";
        const attrValue = selector.match(/["']([^"']+)["']/)?.[1];
        if (attrValue) {
          meta.setAttribute(attrName, attrValue);
          document.head.appendChild(meta);
        }
      }
      meta.setAttribute("content", content);
    };

    // Primary Meta Tags
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);

    // Open Graph
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:url"]', url);
    updateMetaTag('meta[property="og:title"]', fullTitle);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', image);

    // Twitter
    updateMetaTag('meta[property="twitter:card"]', "summary_large_image");
    updateMetaTag('meta[property="twitter:url"]', url);
    updateMetaTag('meta[property="twitter:title"]', fullTitle);
    updateMetaTag('meta[property="twitter:description"]', description);
    updateMetaTag('meta[property="twitter:image"]', image);
  }, [fullTitle, description, keywords, image, url, type]);

  return null;
}

/**
 * Example usage in a page:
 *
 * import { SEOMeta } from '@/components/SEOMeta';
 *
 * export function ProductPage() {
 *   return (
 *     <>
 *       <SEOMeta
 *         title="Hydraulic Pumps"
 *         description="Browse our selection of premium hydraulic pumps"
 *         url="https://yourdomain.com/catalog"
 *       />
 *       <div>Your page content</div>
 *     </>
 *   );
 * }
 */
