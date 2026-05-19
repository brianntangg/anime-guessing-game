/**
 * Resolves a media path to an absolute URL.
 * In production, NEXT_PUBLIC_MEDIA_BASE_URL points to the R2 bucket.
 * In development, paths are served from /public (no prefix needed).
 *
 * Pack files store paths like /media/audio/naruto-op1.mp3 — this function
 * strips the leading /media/ prefix because R2 stores files at the root.
 */
export function getMediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (!base) return path; // dev: serve from /public as-is

  // path = "/media/audio/naruto-op1.mp3"
  // R2 key = "audio/naruto-op1.mp3"
  const key = path.replace(/^\/media\//, '');
  return `${base.replace(/\/$/, '')}/${key}`;
}
