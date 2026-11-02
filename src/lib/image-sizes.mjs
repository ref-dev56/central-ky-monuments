// Shared by next.config.ts and scripts/optimize-images.mjs so the widths the
// pages ask for always match the files the build creates.

/** Widths for photos that span most of the screen. */
export const DEVICE_SIZES = [640, 828, 1200, 1600, 2048];
/** Smaller widths, for thumbnails and narrow images. */
export const IMAGE_SIZES = [96, 128, 256, 384];
export const ALL_SIZES = [...IMAGE_SIZES, ...DEVICE_SIZES];

/** Uploaded photos that get resized copies. SVGs and GIFs are used as-is. */
export const RESIZABLE = /\.(jpe?g|png|webp)$/i;

/** Where the resized copy of `src` at `width` lives: /_img/uploads/hero-1200.webp */
export function variantPath(src, width) {
  return `/_img${src.replace(/\.[^./]+$/, "")}-${width}.webp`;
}
