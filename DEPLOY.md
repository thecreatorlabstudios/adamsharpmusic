# Put the Fireworks site online: Vercel runs it, Hostinger holds the domain

The site is static files plus a login. On Vercel the login is a small middleware (checks every request) and two functions (`/api/login`, `/api/logout`). Nothing in `public/` is served without a valid sign-in. No build step, no dependencies.

## 1. Repo
Use its own private GitHub repo (for example `adam-sharp-fireworks-site`), not joshua-os. Vercel needs read access to whatever repo it builds from, and joshua-os holds personal and Green Lion files. Put the contents of this folder at the repo root.

## 2. Make the logins (on your computer)
```
node tools/hash.mjs joshua
node tools/hash.mjs adam
```
Each prints a password for that person and a long `name:salt:hash` line. Join the lines with a semicolon. Only the hash goes on Vercel.

## 3. Vercel
New Project > import the repo. Framework: Other. Leave build and output blank (`vercel.json` already sets output to `public`). Before the first deploy, add these Environment Variables (Production):

| Name | Value |
|---|---|
| `SITE_USERS` | the joined `name:salt:hash` lines |
| `SESSION_SECRET` | random text, 32+ characters (without it nobody can sign in, by design) |
| `REQUIRE_LOGIN` | `true` |
| `APPROVED` | `false` |
| `SESSION_HOURS` | `12` (optional) |

Deploy. Visiting the URL shows the login page. Also turn on **Deployment Protection > Standard Protection** for preview URLs so branch previews are not public.

## 4. Domain from Hostinger
In Vercel: Project > Settings > Domains > add `yourdomain.com` (and `www`). Vercel shows the records to set. In Hostinger: Domains > your domain > DNS / Nameservers > DNS records:
- `www`: CNAME to the value Vercel shows (looks like `xxxx.vercel-dns-0xx.com`)
- root `@`: A record to `76.76.21.21` (or the value Vercel shows)
- delete the old A record or parking CNAME on the same names first.
HTTPS is issued automatically once DNS resolves (minutes to a few hours).
If you keep the domain at Hostinger but also have a Hostinger hosting plan, you do not need it for this site. Vercel does the hosting.

## Approval day
1. Adam signs off on the photos, cover, promo, lyrics, quotes and Scripture references.
2. Set `APPROVED` = `true` (redeploy). The "draft for review" notes disappear.
3. To open the site to everyone: set `REQUIRE_LOGIN` = `false` and redeploy. Also delete the `X-Robots-Tag` header in `vercel.json` and the `Disallow: /` line in `public/robots.txt` so search engines can find it.
4. Swap in the final master audio, add the pre-save link and contact details.

## Test locally
`npm run dev` starts a local copy of how Vercel runs this (set `SITE_USERS` and `SESSION_SECRET` first, or use the example in `.env.example`). `npm test` runs 50+ checks against the login. Neither needs a Vercel account.

## What the login does
- Server-side check on every request, including images and audio. Unsigned requests get the login page (pages) or 401 (files).
- Passwords are stored only as scrypt hashes and compared in constant time. Unknown users take the same time as wrong passwords.
- Session cookie is signed (HMAC), HttpOnly, SameSite=Lax, Secure. Lasts 12 hours. Sign out is in the Connect panel.
- Cross-site form posts are refused. Open redirects are blocked.
- Fails closed: with no `SESSION_SECRET` or no users, nobody gets in.
- Not indexed (noindex header, robots.txt).

## Limits to know
- The wrong-password lockout (8 tries, 10 minutes) is per server instance, and Vercel can run several. The real protection is the long generated passwords from `tools/hash.mjs`. If you want a hard shared lockout later, add Vercel KV or Upstash Redis.
- This keeps casual and automated visitors out. Anyone with a password sees everything, so give one login per person and remove people by deleting their entry from `SITE_USERS`.
- The only outside request is Google Fonts. three.js is hosted on the site itself.
- I could not test on Vercel itself (no account was connected). The login logic is tested through a local copy of Vercel's request flow. Do one check after the first deploy: open the site in a private window, confirm you land on the login page, and confirm `https://yourdomain.com/assets/cover.jpg` also sends you to login.
