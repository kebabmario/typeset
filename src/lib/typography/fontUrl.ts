const API = "https://fonts.googleapis.com/css2";

const familyParam = (family: string) => family.trim().replace(/ /g, "+");

/** One stylesheet for one family at the given weights, e.g. Inter:wght@400;700. */
export function familyUrl(family: string, weights: number[], text?: string): string {
  const unique = [...new Set(weights)].sort((a, b) => a - b);
  const axis = unique.length === 1 && unique[0] === 400 ? "" : `:wght@${unique.join(";")}`;
  const textParam = text ? `&text=${encodeURIComponent(text)}` : "";
  return `${API}?family=${familyParam(family)}${axis}&display=swap${textParam}`;
}

/** Combined stylesheet for export. */
export function stylesheetUrl(styles: { family: string; weight: number }[]): string {
  const byFamily = new Map<string, Set<number>>();
  for (const s of styles) {
    byFamily.set(s.family, (byFamily.get(s.family) ?? new Set()).add(s.weight));
  }
  const families = [...byFamily].map(([family, w]) => {
    const weights = [...w].sort((a, b) => a - b);
    const axis = weights.length === 1 && weights[0] === 400 ? "" : `:wght@${weights.join(";")}`;
    return `family=${familyParam(family)}${axis}`;
  });
  return `${API}?${families.join("&")}&display=swap`;
}
