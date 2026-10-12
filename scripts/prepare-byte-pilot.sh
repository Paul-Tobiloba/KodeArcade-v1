#!/bin/sh
# Run as the non-admin pilot user, in the uploaded deployment directory.
# Creates credentials without printing them. Never starts Docker or edits n8n.
set -eu
if [ "$(id -u)" = 0 ]; then
  printf '%s\n' 'Run this preparation step as the non-admin pilot user.' >&2
  exit 1
fi
cd -- "$(dirname -- "$0")"
test -f byte-gateway.mjs
test -f compose.yml
command -v openssl >/dev/null
umask 077
for file in gateway.env .env; do
  if [ -L "$file" ] || { [ -e "$file" ] && [ ! -f "$file" ]; }; then
    printf '%s\n' 'Refusing a non-regular configuration file.' >&2
    exit 1
  fi
done
if [ ! -e gateway.env ]; then
  (
    set -C
    { printf 'BYTE_GATEWAY_TOKEN='; openssl rand -hex 32; printf 'BYTE_MODEL=qwen3.5:2b\n'; } > gateway.env
  )
fi
if [ ! -e .env ]; then
  (
    set -C
    printf 'BYTE_GATEWAY_UID=%s\nBYTE_GATEWAY_GID=%s\n' "$(id -u)" "$(id -g)" > .env
  )
fi
chmod 600 gateway.env .env
docker compose -f compose.yml config --quiet
printf '%s\n' 'Byte files prepared; Docker startup still requires the VPS administrator.'
