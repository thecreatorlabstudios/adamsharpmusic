# Adam Sharp: artist site and Fireworks experience
Status: ready to go live. Pages: `/` (landing with the featured release, Spotify embed and socials, tabs for Home, Releases, About, Connect) and `/fireworks` (the 3D song experience).
Adding new music: add an entry to `RELEASES` at the top of `public/site.js` (the Releases tab and featured release update from it). Pre-save link: https://distrokid.com/hyperfollow/adamsharp3/fireworks
Preview (private artifact): https://claude.ai/artifact/Cnj932bVVsAkq5qx37v999
The site lives in `public/` (`index.html`, `styles.css`, `app.js`, `assets/`, `vendor/three.r128.min.js` self-hosted, `login.html`). `middleware.js` and `api/` are the login for Vercel. See `DEPLOY.md` (Vercel + Hostinger domain). `npm run dev` runs a local copy of Vercel's request flow, `npm test` runs the login checks.

## The experience
- One full-screen night world. The Fireworks cover (Drive `Artist Photos/IMG_0004.png`, resized to `assets/cover.jpg`) is rebuilt as a floating cloud of light, sampled from its own pixels. It reacts to the pointer and to the promo audio.
- Eight glowing particle galaxies (some with rings) are locked in place around the robed figure. The camera flies around everything: drag left and right to go all the way round, up and down to see from above and below. Scroll or pinch to zoom. The figure has volume, so it holds up from every angle.
- The galaxies are generated procedurally to look like real ones: a Whirlpool-style grand-design spiral, a tilted Andromeda with dust lanes and companion galaxies, a Pinwheel, a dusty cream Hubble-style spiral, and an illustrated purple Milky Way. Each has a glowing core, blue arms, pink star-forming regions, dust lanes, and thousands of individual stars placed where the galaxy is bright. No invented planets or moons.
- Fly around the cosmos and scroll or pinch toward a galaxy to zoom into it.
- Click or tap a galaxy to fly into it: a large, detailed version with a field of stars and diffraction-spike foreground stars, plus the scene's lyric and story. Drag to look around, scroll or pinch to zoom, click or tap a spot to zoom into it (tap again to pull back). From a galaxy you can go back to the cosmos or step to the next galaxy (Verse 1, Verse 2, chorus, Moses, Lazarus, sea, fire, storm). Arrow keys also step.
- The face of the robed figure keeps the album's own colors (pink, yellow, green, purple) instead of washing out to white.
- Galaxy names come from the lyrics: The rooster (Verse 1), Bread and wine (Verse 2), Lifted up (chorus), Moses, Lazarus, The sea, The fire, The storm (the build), The Holy Place (closing). Names are CreatorLab's wording, not Adam's. Each unlocked galaxy's panel shows "Where it is in the song": the section (verse, chorus, bridge, closing) with that galaxy's lines highlighted.
- Visited planets get a gold ring. Visit all 8 and the sealed Holy Place planet and gate unlock, with a finale when you return to the cosmos.
- Menu: Explore, Story, Release (cover, countdown, Spotify, promo, lyrics), Connect.
- Computer: mouse stirs the light, drag spins the island, scroll goes closer, hover shows a hint, content opens in a side panel.
- Phone: drag spins the island, the light nearest the middle shows a hint, tap to open, content slides up as a bottom sheet, bottom tab dock. Same world.
- If WebGL is unavailable, a 2D fallback shows the cover with the same menu and content.

## Needs Adam's OK before launch
- Use of the photos, cover art, promo clip, lyrics and his own quotes on a public site.
- Scripture references are our suggestions from the lyrics, especially "the fire" (Daniel 3). They show with a review note.
- Wording that is our paraphrase of his answers.
- Left out on purpose: his dad and favorite artists, coffee, anime.

## Still open
Pre-save link (button disabled), other streaming links, contact/booking details, domain and hosting, final full-song audio, scope and budget.
Ideas not built yet: tap-the-face firework, hidden story sparks, line timing from the final master, gyroscope tilt on phones (not allowed inside Claude artifacts, fine on a real site).
