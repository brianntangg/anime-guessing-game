#!/usr/bin/env bash
# Upload all local media files to a Cloudflare R2 bucket.
#
# Prerequisites:
#   npm install -g wrangler
#   wrangler login
#
# Usage:
#   ./scripts/upload-to-r2.sh <bucket-name>
#
# Example:
#   ./scripts/upload-to-r2.sh anime-game-media
#
# After running, set NEXT_PUBLIC_MEDIA_BASE_URL in Railway to your bucket's
# public URL: https://pub-<id>.r2.dev  (enable "Public access" in R2 dashboard)

set -euo pipefail

BUCKET="${1:-}"
if [[ -z "$BUCKET" ]]; then
  echo "Usage: $0 <r2-bucket-name>"
  exit 1
fi

MEDIA_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/media"

if ! command -v wrangler &>/dev/null; then
  echo "wrangler not found. Install it with: npm install -g wrangler"
  exit 1
fi

echo "Uploading media to R2 bucket: $BUCKET"
echo ""

upload_dir() {
  local local_dir="$1"
  local r2_prefix="$2"
  local count=0

  for file in "$local_dir"/*; do
    [[ -f "$file" ]] || continue
    filename="$(basename "$file")"
    [[ "$filename" == placeholder.* ]] && continue  # skip placeholders

    r2_key="${r2_prefix}/${filename}"
    echo "  → $r2_key"
    wrangler r2 object put "$BUCKET/$r2_key" --file="$file" --remote 2>/dev/null
    ((count++)) || true
  done

  echo "  ✓ $count files uploaded from $local_dir"
}

upload_dir "$MEDIA_DIR/audio"  "audio"
upload_dir "$MEDIA_DIR/ost"    "ost"
upload_dir "$MEDIA_DIR/images" "images"

echo ""
echo "Done. Set NEXT_PUBLIC_MEDIA_BASE_URL to your bucket's public URL in Railway."
echo "Enable public access at: https://dash.cloudflare.com → R2 → $BUCKET → Settings"
