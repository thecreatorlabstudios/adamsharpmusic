// Local copy of how Vercel runs this project: middleware first, then /api functions or static files from ./public.
// Run:  SITE_USERS=... SESSION_SECRET=... node tools/dev.mjs     (http://localhost:3000)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
process.env.COOKIE_SECURE ??= '0'; // plain http locally
const { default: middleware } = await import('../middleware.js');
const { default: login } = await import('../api/login.js');
const { default: logout } = await import('../api/logout.js');
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const rules = (vercel.headers || []).map((r) => ({ re: new RegExp('^' + r.source + '$'), headers: r.headers }));
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain' };

function applyHeaders(pathname, headers) { for (const r of rules) if (r.re.test(pathname)) for (const h of r.headers) headers[h.key] = h.value; return headers; }
function end(res, pathname, status, headers, body) { res.writeHead(status, applyHeaders(pathname, headers)); res.end(body); }

function serveStatic(req, res, pathname) {
  let rel; try { rel = decodeURIComponent(pathname); } catch { return end(res, pathname, 400, {}, 'Bad request'); }
  if (rel === '/') rel = '/index.html'; else if (!path.extname(rel)) rel += '.html'; // cleanUrls
  if (rel.includes('\0') || rel.split('/').some((s) => s.startsWith('.') && s)) return end(res, pathname, 404, {}, 'Not found');
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) return end(res, pathname, 404, {}, 'Not found');
  let st; try { st = fs.statSync(file); } catch { return end(res, pathname, 404, {}, 'Not found'); }
  if (!st.isFile()) return end(res, pathname, 404, {}, 'Not found');
  const type = MIME[path.extname(file)] || 'application/octet-stream', h = { 'Content-Type': type, 'Accept-Ranges': 'bytes' };
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (m && (m[1] || m[2])) {
    const start = m[1] ? Number(m[1]) : st.size - Number(m[2]); let stop = m[1] && m[2] ? Number(m[2]) : st.size - 1;
    if (!(start >= 0 && start < st.size && stop >= start)) return end(res, pathname, 416, { 'Content-Range': `bytes */${st.size}` }, '');
    stop = Math.min(stop, st.size - 1);
    res.writeHead(206, applyHeaders(pathname, { ...h, 'Content-Range': `bytes ${start}-${stop}/${st.size}`, 'Content-Length': stop - start + 1 }));
    return fs.createReadStream(file, { start, end: stop }).pipe(res);
  }
  res.writeHead(200, applyHeaders(pathname, { ...h, 'Content-Length': st.size }));
  fs.createReadStream(file).pipe(res);
}

function readBody(req) { return new Promise((r) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => r(Buffer.concat(c).toString())); }); }

export function start(port) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'), pathname = url.pathname;
      const request = new Request(url, { method: req.method, headers: Object.fromEntries(Object.entries(req.headers).filter(([, v]) => typeof v === 'string')) });
      const mw = await middleware(request);
      if (mw.headers.get('x-middleware-next') !== '1') { // middleware answered itself
        const h = {}; mw.headers.forEach((v, k) => { h[k] = v; });
        return end(res, pathname, mw.status, h, Buffer.from(await mw.arrayBuffer()));
      }
      if (pathname === '/api/login' || pathname === '/api/logout') {
        const raw = req.method === 'POST' ? await readBody(req) : '';
        req.body = Object.fromEntries(new URLSearchParams(raw));
        const origEnd = res.end.bind(res); res.end = (...a) => { applyHeaders(pathname, {}); return origEnd(...a); };
        return (pathname === '/api/login' ? login : logout)(req, res);
      }
      if (pathname.startsWith('/api/')) return end(res, pathname, 404, {}, 'Not found');
      return serveStatic(req, res, pathname);
    } catch (e) { console.error('[dev error]', e); if (!res.headersSent) res.writeHead(500); res.end('Server error'); }
  }).listen(port);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { const port = Number(process.env.PORT || 3000); start(port).on('listening', () => console.log(`dev server listening on http://localhost:${port}`)); }
