const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES_DIR = path.join(__dirname, "../public/images");
const ORIGINALS_DIR = path.join(__dirname, "../public/images_original");

// Supported image formats
const SUPPORTED_FORMATS = [".png", ".jpg", ".jpeg", ".webp"];

// Quality settings
const QUALITY_SETTINGS = {
  png: { quality: 80, compressionLevel: 9 },
  jpg: { quality: 85 },
  jpeg: { quality: 85 },
  webp: { quality: 85 },
};

async function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

async function compressImage(inputPath, outputPath, originalPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const format = ext.slice(1); // Remove the dot

  if (!SUPPORTED_FORMATS.includes(ext)) {
    console.log(`⚠ Skipping unsupported format: ${inputPath}`);
    return false;
  }

  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    // Read image into buffer first to avoid same file input/output issue
    // Always compress from the current file in images folder
    const imageBuffer = fs.readFileSync(inputPath);

    // Compress based on format
    let sharpInstance = sharp(imageBuffer);

    if (format === "png") {
      sharpInstance = sharpInstance.png({
        quality: QUALITY_SETTINGS.png.quality,
        compressionLevel: QUALITY_SETTINGS.png.compressionLevel,
      });
    } else if (format === "jpg" || format === "jpeg") {
      sharpInstance = sharpInstance.jpeg({
        quality: QUALITY_SETTINGS.jpg.quality,
        mozjpeg: true,
      });
    } else if (format === "webp") {
      sharpInstance = sharpInstance.webp({
        quality: QUALITY_SETTINGS.webp.quality,
      });
    }

    // Write to temporary file first, then replace original
    const tempPath = outputPath + ".tmp";
    await sharpInstance.toFile(tempPath);

    // Replace original with compressed version
    fs.renameSync(tempPath, outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const saved = originalSize - newSize;
    const percentSaved = ((saved / originalSize) * 100).toFixed(1);

    console.log(
      `✓ Compressed: ${path.basename(inputPath)} (${formatOriginalSize(originalSize)} → ${formatOriginalSize(newSize)}, saved ${percentSaved}%)`
    );

    return true;
  } catch (error) {
    console.error(`✗ Error compressing ${inputPath}:`, error.message);
    // Clean up temp file if exists
    const tempPath = outputPath + ".tmp";
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return false;
  }
}

function formatOriginalSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function main() {
  console.log("🖼️  Starting image compression...\n");

  // Ensure directories exist
  await ensureDirectory(ORIGINALS_DIR);

  // Read all files in images directory
  const files = fs.readdirSync(IMAGES_DIR);

  // Filter image files
  const imageFiles = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });

  if (imageFiles.length === 0) {
    console.log("⚠ No image files found to compress.");
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) to process:\n`);

  let successCount = 0;
  let skipCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(IMAGES_DIR, file);
    const originalPath = path.join(ORIGINALS_DIR, file);

    // Backup original first if it doesn't exist
    if (!fs.existsSync(originalPath)) {
      fs.copyFileSync(inputPath, originalPath);
      console.log(`✓ Backed up original: ${file}`);
    }

    // Always compress the file in images folder
    const success = await compressImage(inputPath, outputPath, originalPath);
    if (success) {
      successCount++;
    } else {
      skipCount++;
    }
  }

  console.log(`\n✅ Compression complete!`);
  console.log(`   - Compressed: ${successCount} image(s)`);
  console.log(`   - Skipped: ${skipCount} image(s)`);
  console.log(`   - Originals saved to: ${ORIGINALS_DIR}`);
}

main().catch((error) => {
  console.error("✗ Fatal error:", error);
  process.exit(1);
});

