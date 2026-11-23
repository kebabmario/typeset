import { cacheLife } from "next/cache";
import { CURATED_FONTS } from "@/lib/typography/catalog";
import { isValidFamily } from "@/lib/typography/config";
import type { FontCategory, FontFamily } from "@/lib/typography/types";

interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
}

const CATEGORY_MAP: Record<string, FontCategory> = {
  "sans-serif": "sans-serif",
  serif: "serif",
  display: "display",
  handwriting: "display",
  monospace: "monospace",
};

/**
 * The key stays on the server. Without GOOGLE_FONTS_API_KEY the app serves the curated catalog,
 * which covers every preset and around 120 well-made families.
 */
async function getCatalog(): Promise<{ source: "google" | "curated"; fonts: FontFamily[] }> {
  "use cache";
  cacheLife("days");

  const key = process.env.GOOGLE_FONTS_API_KEY;
  if (!key) return { source: "curated", fonts: CURATED_FONTS };

  try {
    const res = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=${encodeURIComponent(key)}`,
    );
    if (!res.ok) throw new Error(`Google Fonts API responded ${res.status}`);
    const data = (await res.json()) as { items?: GoogleFont[] };
    const fonts = (data.items ?? []).flatMap((item): FontFamily[] => {
      const weights = item.variants
        .map((v) => (v === "regular" ? 400 : /^\d{3}$/.test(v) ? Number(v) : NaN))
        .filter((w) => Number.isFinite(w))
        .sort((a, b) => a - b);
      const category = CATEGORY_MAP[item.category];
      if (!category || weights.length === 0 || !isValidFamily(item.family)) return [];
      return [{ family: item.family, category, weights }];
    });
    return fonts.length > 0 ? { source: "google", fonts } : { source: "curated", fonts: CURATED_FONTS };
  } catch (error) {
    console.error("Falling back to curated fonts:", error);
    return { source: "curated", fonts: CURATED_FONTS };
  }
}

export async function GET() {
  return Response.json(await getCatalog());
}
