// Makes resized WebP copies of every photo in public/uploads, at each width
// in src/lib/image-sizes.mjs, into public/_img (not committed).
// Runs at the start of `npm run build`. Unchanged photos are skipped.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ALL_SIZES, RESIZABLE, variantPath } from "../src/lib/image-sizes.mjs";

const PUBLIC = path.resolve("public");
const UPLOADS = path.join(PUBLIC, "uploads");

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (RESIZABLE.test(entry.name)) yield full;
  }
}

async function newer(a, b) {
  try {
    const [sa, sb] = await Promise.all([fs.stat(a), fs.stat(b)]);
    return sb.mtimeMs >= sa.mtimeMs;
  } catch {
    return false;
  }
}

const started = Date.now();
let made = 0;
let photos = 0;
for await (const file of walk(UPLOADS)) {
  photos++;
  const src = "/" + path.relative(PUBLIC, file).split(path.sep).join("/");
  for (const width of ALL_SIZES) {
    const out = path.join(PUBLIC, variantPath(src, width));
    if (await newer(file, out)) continue;
    await fs.mkdir(path.dirname(out), { recursive: true });
    await sharp(file)
      .rotate() // respect phone-camera orientation
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(out);
    made++;
  }
}
console.log(
  `optimize-images: ${photos} photos, ${made} new copies in ${((Date.now() - started) / 1000).toFixed(1)}s`,
);
