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
