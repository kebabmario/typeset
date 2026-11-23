import { ImageResponse } from "next/og";
import { MARK } from "@/components/logo-paths";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Full-bleed version of the mark; iOS applies its own corner mask. */
export default function AppleIcon() {
  const c = MARK.caret;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1d1d1f"/><path fill="#fff" transform="${MARK.tTransform}" d="${MARK.t}"/><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.w / 2}" fill="#4c9bff"/></svg>`;
  return new ImageResponse(
    <img src={`data:image/svg+xml,${encodeURIComponent(svg)}`} width={180} height={180} alt="" />,
    size,
  );
}
