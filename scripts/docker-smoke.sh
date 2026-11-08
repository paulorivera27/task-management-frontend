#!/usr/bin/env bash
# usage: scripts/docker-smoke.sh <image>
# Runs the image on its own (no API) and checks serving, caching, headers and the runtime user.
set -euo pipefail

image="${1:?image}"
name="frontend-smoke-$$"
trap 'docker rm -f "$name" >/dev/null 2>&1 || true' EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }
ok() { echo "ok:   $*"; }

docker run -d --name "$name" -p 127.0.0.1::3000 "$image" >/dev/null
base="http://$(docker port "$name" 3000/tcp | head -1)"

for _ in $(seq 1 30); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$name")" = healthy ] && break
  sleep 1
done
[ "$(docker inspect -f '{{.State.Health.Status}}' "$name")" = healthy ] || fail "container did not become healthy"
ok "healthy without an API"

[ "$(docker exec "$name" id -u)" != 0 ] || fail "runs as root"
ok "runs as a non-root user"

curl -fsS "$base/" | grep -q '<div id="root">' || fail "/ does not serve the app"
ok "/ serves index.html"

curl -fsS -o /dev/null "$base/tasks/1/edit" || fail "client-side route is not served"
ok "client-side routes fall back to index.html"

[ "$(curl -s -o /dev/null -w '%{http_code}' "$base/assets/does-not-exist.js")" = 404 ] || fail "missing asset is not a 404"
ok "missing asset returns 404"

headers="$(curl -sS -D - -o /dev/null "$base/")"
for h in content-security-policy x-content-type-options x-frame-options referrer-policy permissions-policy; do
  grep -qi "^$h:" <<<"$headers" || fail "missing header $h on /"
done
ok "security headers on /"
grep -qi '^cache-control: no-cache' <<<"$headers" || fail "/ is cacheable"
grep -qi '^server: nginx/' <<<"$headers" && fail "server version disclosed"
ok "/ is revalidated and the server version is hidden"

asset="$(curl -fsS "$base/" | grep -o '/assets/[^"]*\.js' | head -1)"
[ -n "$asset" ] || fail "no script asset found in index.html"
aheaders="$(curl -sS -D - -o /dev/null -H 'Accept-Encoding: gzip' "$base$asset")"
grep -qi '^content-encoding: gzip' <<<"$aheaders" || fail "$asset is not compressed"
grep -qi '^cache-control: .*immutable' <<<"$aheaders" || fail "$asset is not cached as immutable"
grep -qi '^content-security-policy:' <<<"$aheaders" || fail "security headers missing on assets"
ok "assets are gzip-compressed, immutable and carry security headers"

code="$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$base/graphql")"
case "$code" in 502|503|504) ok "proxy answers $code while the API is down" ;; *) fail "unexpected /graphql status $code without an API" ;; esac

echo "all smoke checks passed"
