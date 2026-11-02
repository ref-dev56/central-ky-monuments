import { RESIZABLE, variantPath } from "./image-sizes.mjs";

/**
 * Tells next/image which file to use for each width in an image's srcset.
 * The files are made by scripts/optimize-images.mjs during the build.
 * In local development the original photo is used, so photos uploaded in
 * the editor show up straight away.
 */
export default function imageLoader({ src, width }: { src: string; width: number }) {
  if (!src.startsWith("/uploads/") || !RESIZABLE.test(src)) return src;
  if (process.env.NODE_ENV === "development") return `${src}?w=${width}`;
  return variantPath(src, width);
}
