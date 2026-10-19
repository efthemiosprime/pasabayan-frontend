# nginx config

Production nginx config for the static frontend, served from
`/var/www/pasabayan-frontend/build` on the production server
(`root@167.99.235.249`).

This file mirrors `/etc/nginx/sites-available/pasabayan.com` on the server.
It is kept here so the routing config is version-controlled — a server
rebuild or reprovision can restore it from this copy.

## Why `try_files $uri $uri/ /index.html`

Each static page is built as its own directory with an `index.html`
(e.g. `support/index.html`, `privacy-policy/index.html`). The `$uri/`
segment is what lets nginx serve a directory's `index.html`. Without it,
requests like `/support/` skip the directory index and fall through to the
root `/index.html` — so every subpage silently renders the home page.

## Deploying a config change

The `cert`/`ssl` lines are managed by Certbot on the server. If you copy
this file over, keep those lines in sync with whatever Certbot has written.

```bash
# from your machine
scp deploy/nginx/pasabayan.com.conf root@167.99.235.249:/etc/nginx/sites-available/pasabayan.com

# on the server
ssh root@167.99.235.249
nginx -t            # validate before reloading
systemctl reload nginx
```

The symlink `/etc/nginx/sites-enabled/pasabayan.com ->
/etc/nginx/sites-available/pasabayan.com` is already in place.

## Hero search relay (`location = /api/public/website-search`)

The hero search calls same-origin `/api/public/website-search`. This server
relays it to `https://api.pasabayan.com` and adds a shared relay key, so the
key never reaches the browser (pasabayan-api B39, pasabayan-specs ADR-20).
The block needs two files that live **only on the server** — never commit them:

```bash
# 1. Cloudflare ranges, so $remote_addr is the visitor, not a Cloudflare edge.
#    Regenerate when Cloudflare publishes new ranges.
{ curl -fsS https://www.cloudflare.com/ips-v4; echo; curl -fsS https://www.cloudflare.com/ips-v6; } \
  | awk 'NF {print "set_real_ip_from " $1 ";"}' > /etc/nginx/snippets/cloudflare-realip.conf

# 2. The relay key — the same value as PUBLIC_WEBSITE_SEARCH_RELAY_KEY in the
#    production API .env. `read -s` keeps it out of shell history.
read -rsp "Relay key: " KEY; echo
printf 'proxy_set_header X-Pasabayan-Relay-Key "%s";\n' "$KEY" > /etc/nginx/snippets/pasabayan-relay-key.conf
chmod 600 /etc/nginx/snippets/pasabayan-relay-key.conf; unset KEY
```

On the production API: add this server's public IP (`167.99.235.249`) to
`DDOS_WHITELIST_IPS`. Every visitor's search arrives from that one address,
and the API's DDoS guard would otherwise block the whole website at busy times.

To rotate the key: change it in both places, `systemctl reload nginx` here, and
`optimize:clear && optimize` on the API.

Check after a reload (`<id>` is any active city id):

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://api.pasabayan.com/api/public/website-search?type=trips&to_city_id=<id>"  # 403 — direct call refused
curl -s "https://pasabayan.com/api/public/website-search?type=trips&to_city_id=<id>" | head -c 300                  # 200 JSON via the relay
```

There is deliberately **no** generic `location /api` block. The old one proxied
to `127.0.0.1:8000`, where nothing listens on this server (checked 2026-09-15),
and the site never used it — the waitlist and city search call
`api.pasabayan.com` directly. Keep the relay an **exact match**: a prefix
`location /api` relay would let anyone reach every public API GET through this
server, all appearing to come from its one IP (sharing rate limits, and
bypassing the API's DDoS guard once that IP is whitelisted).

## Share previews (`/app/trips/<n>`, `/app/packages/<n>`)

Shared trip and package links (`https://pasabayan.com/app/trips/<n>?s=<token>`) must
show a preview card to people without the app. The API renders that page
(pasabayan-api B51, phase 51D; iOS ios#1349), so this server relays exactly those two
path shapes to `https://api.pasabayan.com`. Every other `/app/*` path stays on the SPA,
and the AASA keeps claiming `/app/*` for the iOS app. Added on the server 2026-10-19.

- **Regex, not a prefix.** `location ~ ^/app/(trips|packages)/[0-9]+/?$` wins over
  `location /`. Never widen it to `location /app`: that would hand the whole `/app/*`
  space (including the SPA's own pages) to the API.
- **No relay key, no realip snippet.** The preview is a public page; the block only
  strips the visitor's identity, as the hero search relay does.
- **GET only.** `limit_except GET` makes anything else a 403.
- **It depends on the API server too.** On `api.pasabayan.com`, nginx sends
  `location /app` to Reverb (WebSockets), so the API server carries its own carve-out
  for these two shapes (pasabayan-api `docs/B51_SHAREABLE_LISTING_LINKS_SPEC.md` §4.7).
  Without it this relay gets Reverb's bare `Not found.`.
- Every preview reaches the API from this server's IP, so the `DDOS_WHITELIST_IPS`
  entry for the hero search relay (above) covers previews too.

Check after a reload:

```bash
curl -s -D- -o /dev/null https://pasabayan.com/app/trips/1 | grep -iE "^HTTP|x-robots-tag|set-cookie"
# HTTP 200, x-robots-tag: noindex..., and no set-cookie
curl -s https://pasabayan.com/app/matches/1 | grep -o "<title>[^<]*"
# still the SPA's title (the regex didn't widen)
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://pasabayan.com/app/trips/1
# 403 (limit_except)
```

All three passed on production on 2026-10-19.
