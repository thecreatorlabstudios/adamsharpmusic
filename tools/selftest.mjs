// Checks the login the way Vercel will run it (middleware, then /api functions, then static files).
// Run:  node tools/selftest.mjs
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const salt = crypto.randomBytes(16), PASS = 'Correct-Horse-9';
const hash = crypto.scryptSync(PASS, salt, 32, { N: 16384, r: 8, p: 1 }).toString('hex');
const USERS = `tester:${salt.toString('hex')}:${hash}`;
const SECRET = 'x'.repeat(40);

async function boot(env) {
  const port = await new Promise((r) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
  const proc = spawn('node', ['tools/dev.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(port), SITE_USERS: USERS, SESSION_SECRET: SECRET, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((r) => proc.stdout.on('data', (d) => /listening/.test(String(d)) && r()));
  const base = `http://127.0.0.1:${port}`;
  return {
    proc,
    get: (p, h = {}) => fetch(base + p, { redirect: 'manual', headers: h }),
    post: (p, body, h = {}) => fetch(base + p, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...h }, body: new URLSearchParams(body).toString() }),
  };
}
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

/* ---------- login required (default) ---------- */
{
  const s = await boot({});
  let r = await s.get('/', { Accept: 'text/html' });
  ok(r.status === 303 && r.headers.get('location').startsWith('/login'), 'anonymous page request is sent to /login');
  for (const p of ['/assets/cover.jpg', '/assets/fireworks-promo.mp3', '/app.js', '/styles.css', '/vendor/three.r128.min.js', '/index.html', '/api/config']) { r = await s.get(p); ok(r.status === 401, `anonymous ${p} is blocked (${r.status})`); }
  r = await s.get('/login'); const loginHtml = await r.text();
  ok(r.status === 200 && loginHtml.includes('Sign in') && loginHtml.includes('/api/login'), 'login page loads without signing in');
  ok((await s.get('/login.js')).status === 200, 'login script loads without signing in');
  ok(/default-src 'self'/.test(r.headers.get('content-security-policy')) && r.headers.get('x-frame-options') === 'DENY' && /noindex/.test(r.headers.get('x-robots-tag')), 'security headers are set');
  ok((await (await s.get('/robots.txt')).text()).includes('Disallow: /'), 'robots.txt disallows everything');

  for (const p of ['/..%2f..%2fmiddleware.js', '/%2e%2e/middleware.js', '/.env', '/%00', '/..%5cmiddleware.js']) { r = await s.get(p); ok(r.status !== 200, `traversal ${p} does not leak while signed out (${r.status})`); }

  r = await s.post('/api/login', { username: 'tester', password: 'wrong' }); ok(r.status === 303 && r.headers.get('location').startsWith('/login?e=bad') && !r.headers.get('set-cookie'), 'wrong password goes back to the login with an error, no cookie');
  r = await s.post('/api/login', { username: 'nobody', password: PASS }); ok(r.headers.get('location')?.startsWith('/login?e=bad'), 'unknown user is refused');
  r = await s.post('/api/login', { username: 'tester', password: PASS }, { Origin: 'http://evil.example' }); ok(r.status === 403, 'cross-site login post is refused');
  r = await s.post('/api/login', { username: 'tester', password: PASS }, { 'Sec-Fetch-Site': 'cross-site' }); ok(r.status === 403, 'browser-marked cross-site login post is refused');
  r = await s.get('/api/login'); ok(r.status === 405, 'GET /api/login is refused');
  r = await s.post('/api/login', { username: 'TESTER', password: PASS, next: '//evil.example' }, { 'Sec-Fetch-Site': 'same-origin', Origin: 'null' });
  const setCookie = r.headers.get('set-cookie') || '';
  ok(r.status === 303 && r.headers.get('location') === '/', 'good login redirects home, never to an outside address');
  ok(/HttpOnly/.test(setCookie) && /SameSite=Lax/.test(setCookie), 'cookie is HttpOnly and SameSite');
  const session = setCookie.split(';')[0];

  r = await s.get('/', { Cookie: session, Accept: 'text/html' }); ok(r.status === 200 && (await r.text()).includes('<canvas id="gl"'), 'signed-in user gets the site');
  r = await s.get('/assets/cover.jpg', { Cookie: session }); ok(r.status === 200 && r.headers.get('content-type') === 'image/jpeg', 'signed-in user gets assets');
  r = await s.get('/api/config', { Cookie: session }); const cfg = await r.json(); ok(r.status === 200 && cfg.auth === true && cfg.approved === false, 'signed-in config says login is on and not yet approved');
  r = await s.get('/assets/fireworks-promo.mp3', { Cookie: session, Range: 'bytes=0-99' }); ok(r.status === 206 && r.headers.get('content-range').startsWith('bytes 0-99/') && (await r.arrayBuffer()).byteLength === 100, 'audio byte ranges work');
  r = await s.get('/assets/fireworks-promo.mp3', { Cookie: session, Range: 'bytes=99999999-' }); ok(r.status === 416, 'bad range gets 416');
  for (const p of ['/middleware.js', '/api/login.js', '/vercel.json', '/package.json', '/tools/hash.mjs', '/..%2fmiddleware.js', '/%2e%2e/package.json', '/assets/%2e%2e/%2e%2e/middleware.js', '/.env', '/%00']) {
    r = await s.get(p, { Cookie: session }); const b = await r.text(); ok(r.status !== 200 || !/REQUIRE_LOGIN|scryptSync|"name": "adam/.test(b), `signed-in ${p} leaks nothing (${r.status})`);
  }
  const flip = session.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));
  r = await s.get('/assets/cover.jpg', { Cookie: flip }); ok(r.status === 401, 'tampered cookie is rejected');
  const expired = (() => { const body = Buffer.from(JSON.stringify({ u: 'tester', exp: Date.now() - 1000 })).toString('base64url'); return `as_session=${body}.${crypto.createHmac('sha256', SECRET).update(body).digest('base64url')}`; })();
  r = await s.get('/assets/cover.jpg', { Cookie: expired }); ok(r.status === 401, 'expired session is rejected');
  const forged = (() => { const body = Buffer.from(JSON.stringify({ u: 'tester', exp: Date.now() + 1e6 })).toString('base64url'); return `as_session=${body}.${crypto.createHmac('sha256', 'wrong-secret-wrong-secret-wrong').update(body).digest('base64url')}`; })();
  r = await s.get('/assets/cover.jpg', { Cookie: forged }); ok(r.status === 401, 'cookie signed with the wrong secret is rejected');
  r = await s.post('/api/logout', {}, { Cookie: session }); ok(r.status === 303 && /Max-Age=0/.test(r.headers.get('set-cookie') || ''), 'sign out clears the cookie');
  r = await s.get('/api/logout'); ok(r.status === 405, 'GET /api/logout is refused');

  let limited = 0; for (let i = 0; i < 10; i++) { r = await s.post('/api/login', { username: 'tester', password: 'bad' + i }); if (r.headers.get('location')?.startsWith('/login?e=limit')) limited++; }
  ok(limited >= 1, `repeated wrong passwords get rate limited (${limited} blocked)`);
  r = await s.post('/api/login', { username: 'tester', password: PASS }); ok(r.headers.get('location')?.startsWith('/login?e=limit') && !r.headers.get('set-cookie'), 'even the right password is held during the lockout');
  s.proc.kill();
}

/* ---------- fails closed without a secret ---------- */
{
  const s = await boot({ SESSION_SECRET: '' });
  let r = await s.get('/assets/cover.jpg'); ok(r.status === 401, 'no SESSION_SECRET: files stay blocked');
  r = await s.post('/api/login', { username: 'tester', password: PASS }); ok(r.status === 500 && !r.headers.get('set-cookie'), 'no SESSION_SECRET: login refuses to issue sessions');
  s.proc.kill();
}
/* ---------- no users set ---------- */
{
  const s = await boot({ SITE_USERS: '' });
  const r = await s.post('/api/login', { username: 'tester', password: PASS }); ok(r.status === 500, 'no users configured: login refuses');
  s.proc.kill();
}
/* ---------- opened up after approval ---------- */
{
  const s = await boot({ REQUIRE_LOGIN: 'false' });
  const r = await s.get('/assets/cover.jpg'); ok(r.status === 200, 'REQUIRE_LOGIN=false opens the site');
  s.proc.kill();
}
/* ---------- approval flag ---------- */
{
  const s = await boot({ APPROVED: 'true' });
  const login = await s.post('/api/login', { username: 'tester', password: PASS }, { 'Sec-Fetch-Site': 'same-origin' });
  const cfg = await (await s.get('/api/config', { Cookie: login.headers.get('set-cookie').split(';')[0] })).json();
  ok(cfg.approved === true, 'APPROVED=true is reported to the site');
  s.proc.kill();
}

console.log(fail ? `\n${fail} check(s) FAILED` : '\nAll checks passed');
process.exit(fail ? 1 : 0);
