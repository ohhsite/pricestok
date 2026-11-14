import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { databaseConfigured } from "./config";
import type { Offer } from "./data";
import { offerVisualAssets } from "./offer-visual";
import { photoName } from "./photos";
import { getSupabase } from "./supabase";

const imageHosts = new Set([
  "a.storyblok.com",
  "galeriazielonewzgorze.pl",
  "pikpodlaskie.pl",
  "serwer442167.lh.pl",
  "www.biesiadna-bialystok.pl",
]);

async function fetchImage(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(2500),
    redirect: "error",
  });
  const limit = 3 * 1024 * 1024;
  if (!response.ok || !response.body || Number(response.headers.get("content-length")) > limit) {
    await response.body?.cancel();
    throw new Error("Image unavailable");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return Buffer.concat(chunks);
      size += value.length;
      if (size > limit) throw new Error("Image too large");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

function readImage(asset: string) {
  if (/^\/brands\/[a-zA-Z0-9_.-]+$/.test(asset))
    return readFile(path.join(process.cwd(), "public", asset));
  if (!asset.startsWith("https://")) throw new Error("Unsupported image");
  const url = new URL(asset);
  if (!imageHosts.has(url.hostname) || url.port || url.username || url.password)
    throw new Error("Unsupported image host");
  return fetchImage(url.href);
}

export async function shareImage(offer: Offer) {
  const { photo, logo } = offerVisualAssets(offer);
  const uploaded = photoName.test(offer.image) && databaseConfigured()
    ? getSupabase().storage.from("bnp-offer-images").getPublicUrl(offer.image).data.publicUrl
    : "";
  for (const asset of [uploaded || photo, logo]) {
    if (!asset) continue;
    try {
      const bytes = asset === uploaded ? await fetchImage(asset) : await readImage(asset);
      const photo = asset !== logo;
      const png = await sharp(bytes, { limitInputPixels: 12_000_000 }).rotate()
        .resize(430, 340, { fit: photo ? "cover" : "contain", background: "#ffffff00" })
        .png().toBuffer();
      return { src: "data:image/png;base64," + png.toString("base64"), photo };
    } catch {
      // Try the next asset, or render the offer without an image.
    }
  }
  return null;
}
