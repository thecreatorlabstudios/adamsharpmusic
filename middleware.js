// Vercel Routing Middleware (Edge). Runs before every request, including static files and the cache.
// Without a valid sign-in cookie nothing in /public is served. Set REQUIRE_LOGIN=false to open the site.
const COOKIE = 'as_session';
const enc = new TextEncoder();

const OPEN_PATHS = new Set(['/login', '/login.html', '/login.js', '/robots.txt', '/api/login', '/api/logout',
  '/brand/logo-stacked.svg', '/brand/logo-horizontal.svg', '/brand/symbol.svg', '/brand/monogram.svg']); // the logos and favicon load on the sign-in page

function b64url(bytes) { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function b64urlToString(str) { const p = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4); return atob(p); }
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))));
}
function sameConstantTime(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

async function readSession(request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 24) return null; // no secret, no sessions: fail closed
  const m = /(?:^|;\s*)as_session=([^;]+)/.exec(request.headers.get('cookie') || '');
  if (!m) return null;
  const [body, sig] = m[1].split('.');
  if (!body || !sig || !sameConstantTime(await hmac(secret, body), sig)) return null;
  try { const s = JSON.parse(b64urlToString(body)); return s.exp > Date.now() ? s : null; } catch { return null; }
}

// Same thing Next.js' NextResponse.next() does: tell Vercel to carry on to the file or function.
const pass = () => new Response(null, { headers: { 'x-middleware-next': '1' } });
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default async function middleware(request) {
  if (process.env.REQUIRE_LOGIN === 'false') return pass();
  const url = new URL(request.url), p = url.pathname;
  if (OPEN_PATHS.has(p)) return pass();

  const session = await readSession(request);
  if (!session) {
    const wantsPage = request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html');
    if (wantsPage) {
      const next = /^\/(?![/\\])[\w\-./%?=&#]*$/.test(p + url.search) ? p + url.search : '/';
      return new Response(null, { status: 303, headers: { location: '/login?next=' + encodeURIComponent(next), 'cache-control': 'no-store' } });
    }
    return json(401, { error: 'Sign in required' });
  }
  if (p === '/api/config') return json(200, { auth: true, approved: process.env.APPROVED === 'true' });
  return pass();
}
