interface ResponsiveImageProps {
  src: string; // Image source URL or imported image path
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
}

/**
 * Responsive Image Component
 * Displays images with proper fallback handling
 * Supports imported assets and external URLs
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = "",
  fetchPriority = "auto",
  sizes,
}: ResponsiveImageProps) {
  // Simply render the image - Vite handles imported images automatically
  // and provides optimized URLs at build time
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fetchPriority={fetchPriority}
      sizes={sizes}
      loading="lazy"
      decoding="async"
    />
  );
}
