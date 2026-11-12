# Adam Sharp: artist site
Pages: one landing page (`public/index.html`) with tabs for Home, Releases, My Story and Connect. The featured release is Fireworks (cover, countdown, pre-save), with Hold Onto Me out now and a Spotify embed.

The 3D world, figure and galaxy experience was removed on 2026-11-12. It is still in the git history (last version at commit `54a605a`) if it is ever wanted back.

## Adding new music
Add an entry to `RELEASES` at the top of `public/site.js`. The Releases tab and the "Out now" section update from it. Pre-save link for Fireworks: https://distrokid.com/hyperfollow/adamsharp3/fireworks

## Files
`public/` is the site (`index.html`, `site.css`, `site.js`, `assets/`, `brand/`, `login.html`). `middleware.js` and `api/` are the login for Vercel. See `DEPLOY.md` (Vercel + Hostinger domain). `npm run dev` runs a local copy of Vercel's request flow, `npm test` runs the login checks.
