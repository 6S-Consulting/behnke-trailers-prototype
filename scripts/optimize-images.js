#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG images to WebP format for better compression
 *
 * Usage:
 *   node scripts/optimize-images.js
 *
 * Requires ImageMagick or FFmpeg to be installed:
 *   brew install imagemagick  # macOS
 *   apt-get install imagemagick  # Linux
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const imagesDir = path.join(publicDir, "images");

const QUALITY = 85; // WebP quality (0-100)
const SKIP_EXTENSIONS = [".webp", ".svg"];

function getAllImages(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllImages(fullPath, files);
    } else if (
      /\.(png|jpg|jpeg)$/i.test(item) &&
      !SKIP_EXTENSIONS.some((ext) => item.endsWith(ext))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function convertToWebP(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, ".webp");

  if (fs.existsSync(outputPath)) {
    console.log(`✓ Skipping ${path.basename(inputPath)} (WebP exists)`);
    return;
  }

  try {
    // Try using ImageMagick first (better quality)
    try {
      execSync(`convert "${inputPath}" -quality ${QUALITY} "${outputPath}"`, {
        stdio: "pipe",
      });
      console.log(`✓ Converted ${path.basename(inputPath)} → WebP`);
      return;
    } catch {
      // Fallback to ffmpeg
      execSync(
        `ffmpeg -i "${inputPath}" -q:v ${Math.round(15 - (QUALITY / 100) * 8)} "${outputPath}"`,
        { stdio: "pipe" },
      );
      console.log(`✓ Converted ${path.basename(inputPath)} → WebP (ffmpeg)`);
    }
  } catch (error) {
    console.error(
      `✗ Failed to convert ${path.basename(inputPath)}: ${error.message}`,
    );
  }
}

function optimizePNG(inputPath) {
  try {
    // Try using pngquant for better optimization
    try {
      execSync(
        `pngquant --quality=80-90 --strip --force --output "${inputPath}" "${inputPath}"`,
        {
          stdio: "pipe",
        },
      );
      console.log(`✓ Optimized ${path.basename(inputPath)} with pngquant`);
      return;
    } catch {
      // Fallback to ImageMagick
      execSync(
        `convert "${inputPath}" -strip -quality 85 -define png:compression-level=9 "${inputPath}"`,
        { stdio: "pipe" },
      );
      console.log(`✓ Optimized ${path.basename(inputPath)} with ImageMagick`);
    }
  } catch (error) {
    console.error(
      `✗ Failed to optimize ${path.basename(inputPath)}: ${error.message}`,
    );
  }
}

// Main execution
console.log("🖼️  Starting image optimization...\n");

if (!fs.existsSync(imagesDir)) {
  console.log(
    `No images directory found at ${imagesDir}. Creating placeholder...`,
  );
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log("Please add images to the public/images directory.");
  process.exit(0);
}

const images = getAllImages(imagesDir);

if (images.length === 0) {
  console.log("No PNG/JPG images found in public/images directory.");
  process.exit(0);
}

console.log(`Found ${images.length} image(s) to process\n`);

// First optimize existing PNGs
console.log("Step 1: Optimizing PNG files...");
images.filter((f) => /\.png$/i.test(f)).forEach(optimizePNG);

// Then convert to WebP
console.log("\nStep 2: Converting to WebP...");
images.forEach(convertToWebP);

const webpImages = images.filter((f) => {
  const webpPath = f.replace(/\.[^.]+$/, ".webp");
  return fs.existsSync(webpPath);
});

console.log(`\n✨ Optimization complete!`);
console.log(`   • Processed: ${images.length} images`);
console.log(`   • WebP versions: ${webpImages.length}`);
console.log(`\nNext steps:`);
console.log(`1. Review converted images in public/images/ to ensure quality`);
console.log(
  `2. Update references in src/pages/Home.tsx to use ResponsiveImage component`,
);
console.log(
  `3. Add sizes attribute for responsive images: sizes="(max-width: 640px) 100vw, 640px"`,
);
