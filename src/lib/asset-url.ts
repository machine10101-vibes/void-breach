/** Prefix public files so GitHub Pages (`/void-breach/`) and the root preview both resolve. */
export function assetUrl(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  const rel = path.startsWith("/") ? path.slice(1) : path;
  return `${base.endsWith("/") ? base : `${base}/`}${rel}`;
}
