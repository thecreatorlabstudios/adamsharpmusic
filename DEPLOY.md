# Deploy: Vercel + Hostinger domain
The site is static: everything in `public/` is served as is, with the security headers from `vercel.json`. There is no login and no build step.

## Vercel
1. Vercel > Add New > Project > import the GitHub repo `adamsharpmusic`.
2. Framework preset: Other. Leave build and install commands empty. Output directory: `public` (already set in `vercel.json`).
3. Every push to `main` redeploys.
4. The old login settings (`SITE_USERS`, `SESSION_SECRET`, `REQUIRE_LOGIN`, `SESSION_HOURS`) are no longer used. They can be deleted under Settings > Environment Variables.

## Domain from Hostinger
In Vercel: Project > Settings > Domains > add `adamsharpmusic.com` (and `www`). Vercel shows the records to set. In Hostinger: Domains > your domain > DNS / Nameservers > DNS records:
- `www`: CNAME to the value Vercel shows
- root `@`: A record to `76.76.21.21` (or the value Vercel shows)
- delete the old A record or parking CNAME on the same names first.
HTTPS is issued automatically once DNS resolves.

## Test locally
`npm run dev` serves a local copy (http://localhost:3000). `npm test` runs the checks.

## History
The password login and the 3D Fireworks world were removed in November 2026. They are in git history (last version with both: commit `54a605a`).
