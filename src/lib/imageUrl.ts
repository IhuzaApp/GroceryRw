/**
 * Resolves an image value from the database to a displayable URL.
 * Handles both:
 * - Full URLs (http/https) — used as-is.
 * - Internal/storage paths (e.g. Firebase Storage key) — converted to public URL when bucket is configured.
 * - Local paths starting with / — used as-is.
 */
export function resolveImageUrl(
  value: string | null | undefined
): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;

  // Full URL — use as-is
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  // Local path (e.g. /images/... or /assets/...) — use as-is
  if (raw.startsWith("/")) {
    return raw;
  }

  // Internal/storage path (no leading / or protocol) — try Firebase Storage public URL
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (bucket) {
    const encoded = encodeURIComponent(raw);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`;
  }

  // No bucket config — return as-is (e.g. relative path; may work in some contexts)
  return raw;
}
