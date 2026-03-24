import { execSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const TARGET_DIRS = ['src', 'public'];
const MAX_SIZE_MB = 1.0; 
const JPEG_QUALITY =50;

function optimizeImage(filePath) {
  const stats = statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);

  if (sizeMB < MAX_SIZE_MB) return;

  const ext = extname(filePath).toLowerCase();
  
  try {
    if (ext === '.png') {
      // Check if it has alpha channel (transparency)
      const hasAlpha = execSync(`sips -g hasAlpha "${filePath}"`).toString().includes('yes');
      
      if (!hasAlpha) {
        // No transparency? Convert to JPG as it is much smaller for photos
        const outPath = filePath.replace(/\.png$/i, '.jpg');
        console.log(`🚀 Optimizing ${filePath} (PNG -> JPG, No Alpha)...`);
        execSync(`sips -s format jpeg -s formatOptions ${JPEG_QUALITY} "${filePath}" --out "${outPath}"`);
        // We'll leave the PNG for now to avoid breaking imports in other files
        // But we recommend the user to use JPG if they want truly small builds.
      } else {
        // Has transparency, just re-save with sips (limited optimization but safe)
        console.log(`🚀 Compressing ${filePath} (PNG with Alpha)...`);
        execSync(`sips -s format png "${filePath}" --out "${filePath}"`);
      }
    } else if (ext === '.jpg' || ext === '.jpeg') {
      console.log(`🚀 Optimizing ${filePath} (JPG, Quality ${JPEG_QUALITY})...`);
      execSync(`sips -s formatOptions ${JPEG_QUALITY} "${filePath}" --out "${filePath}"`);
    }
  } catch (err) {
    console.error(`❌ Error optimizing ${filePath}:`, err.message);
  }
}

function walkDir(dir) {
  if (!existsSync(dir)) return;
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      walkDir(filePath);
    } else {
      const ext = extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        optimizeImage(filePath);
      }
    }
  }
}

console.log('📦 Starting image optimization scan...');
TARGET_DIRS.forEach(walkDir);
console.log('✅ Optimization complete!');
