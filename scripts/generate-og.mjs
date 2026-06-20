import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public", "og-source.svg");
const outputPath = path.join(root, "public", "og-default.png");
const source = await readFile(sourcePath);
const nextImage = await sharp(source).png({ compressionLevel: 9, palette: true }).toBuffer();

let currentImage;
try {
  currentImage = await readFile(outputPath);
} catch {
  currentImage = null;
}

if (!currentImage || !currentImage.equals(nextImage)) {
  await writeFile(outputPath, nextImage);
  console.log("OG image: public/og-default.png generated from the tracked SVG source.");
} else {
  console.log("OG image: existing PNG already matches the SVG source.");
}

