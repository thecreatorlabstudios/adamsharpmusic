// Checks the site the way Vercel serves it. Run:  node tools/selftest.mjs
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = await new Promise((r) => { const s = net.createServer().listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
const proc = spawn('node', ['tools/dev.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
await new Promise((r) => proc.stdout.on('data', (d) => /listening/.test(String(d)) && r()));
const get = (p, h = {}) => fetch(`http://127.0.0.1:${port}${p}`, { redirect: 'manual', headers: h });
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

let r = await get('/'); const home = await r.text();
ok(r.status === 200 && home.includes('id="releaseList"') && !/login|password/i.test(home), 'home page is open with no login');
ok(/default-src 'self'/.test(r.headers.get('content-security-policy')) && r.headers.get('x-frame-options') === 'DENY', 'security headers are set');
ok(!r.headers.get('x-robots-tag'), 'search engines are allowed');
for (const p of ['/assets/cover.jpg', '/assets/hold-onto-me.jpg', '/site.js', '/site.css', '/brand/logo-horizontal.svg', '/robots.txt', '/sitemap.xml']) { r = await get(p); ok(r.status === 200, `${p} loads (${r.status})`); }
r = await get('/assets/cover.jpg', { Range: 'bytes=0-99' }); ok(r.status === 206 && (await r.arrayBuffer()).byteLength === 100, 'byte ranges work');
for (const p of ['/fireworks', '/login', '/api/login', '/app.js', '/middleware.js', '/package.json', '/vercel.json', '/.env', '/..%2fpackage.json', '/%2e%2e/package.json', '/assets/%2e%2e/%2e%2e/package.json', '/%00']) { r = await get(p); const b = await r.text(); ok(r.status !== 200 || !/"name": "adam|vercel\.json/.test(b), `${p} is not served (${r.status})`); }
proc.kill();
console.log(fail ? `\n${fail} check(s) FAILED` : '\nAll checks passed');
process.exit(fail ? 1 : 0);
