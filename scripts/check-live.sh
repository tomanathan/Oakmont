#!/bin/bash
# Smoke check of the live site after a deploy: plain GETs, nothing signed in,
# nothing written. Run:  scripts/check-live.sh [https://oakmontsat.com]
#
# Two failures this exists to catch, both of which shipped once without any
# build error:
#   - /start throwing because a question the starter set names was reworded
#     in data/questions.ts (see STARTERS in lib/starter.ts);
#   - a build whose font class on <html> has no rule in its stylesheet, which
#     silently puts every page in fallback fonts.

BASE="${1:-https://oakmontsat.com}"
fail=0

# Public pages that must answer 200 signed out.
for path in / /start /login /parent/login /parents/sample /privacy /terms /sat /sat/transitions /sat/circles /daily /daily/embed /embed/daily /sat-study-plan /sat-study-plan/3-month /sat-test-dates /robots.txt /sitemap.xml; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")
  if [ "$code" = "200" ]; then
    echo "ok    $code $path"
  else
    echo "FAIL  $code $path"
    fail=1
  fi
done

# Short links redirect (temporarily) to /start with the source tagged.
go=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/go/check")
case "$go" in
  "307 "*"/start?utm_source=check") echo "ok    $go /go/check" ;;
  *) echo "FAIL  $go /go/check (want 307 to /start?utm_source=check)"; fail=1 ;;
esac

# The embeddable widget must be frameable; ordinary pages must not be.
if curl -s -D - -o /dev/null "$BASE/embed/daily" | grep -qi '^x-frame-options:'; then
  echo "FAIL  /embed/daily sends x-frame-options (it must be frameable)"
  fail=1
else
  echo "ok    /embed/daily has no x-frame-options"
fi
if curl -s -D - -o /dev/null "$BASE/daily" | grep -qi '^x-frame-options:'; then
  echo "ok    /daily sends x-frame-options"
else
  echo "FAIL  /daily has no x-frame-options"
  fail=1
fi

# Signed-in pages should bounce to login, never error.
for path in /dashboard /plan /review /settings; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")
  case "$code" in
    200|302|303|307|308) echo "ok    $code $path" ;;
    *) echo "FAIL  $code $path"; fail=1 ;;
  esac
done

# Every next/font class on <html> must be defined by a stylesheet the page loads.
html=$(curl -s "$BASE/start")
css=""
for f in $(echo "$html" | grep -o '/_next/static/css/[a-z0-9]*\.css' | sort -u); do
  css="$css$(curl -s "$BASE$f")"
done
classes=$(echo "$html" | grep -o '<html[^>]*>' | grep -o '__variable_[a-z0-9]*')
if [ -z "$classes" ]; then
  echo "FAIL  no font classes found on <html>"
  fail=1
fi
for c in $classes; do
  if echo "$css" | grep -q "\.$c{"; then
    echo "ok    font class $c"
  else
    echo "FAIL  font class $c has no rule in the page's CSS"
    fail=1
  fi
done

if [ "$fail" = "0" ]; then echo "All good."; else echo "Something is wrong (see FAIL lines)."; fi
exit $fail
