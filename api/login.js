// Vercel Function (Node runtime): checks the password and sets the session cookie.
import crypto from 'node:crypto';

const SCRYPT = { N: 16384, r: 8, p: 1 };
const DUMMY_SALT = crypto.randomBytes(16);
const misses = new Map(); // best effort per server instance; strong generated passwords are the real protection

function parseUsers() {
  const users = new Map();
  for (const entry of String(process.env.SITE_USERS || '').split(/[;\n\s]+/).filter(Boolean)) {
    const [name, salt, hash] = entry.split(':');
    if (name && /^[0-9a-f]+$/i.test(salt || '') && /^[0-9a-f]{64}$/i.test(hash || '')) users.set(name.toLowerCase(), { salt, hash });
  }
  return users;
}
function checkLogin(users, name, pass) {
  const u = users.get(String(name || '').toLowerCase().trim());
  const got = crypto.scryptSync(String(pass || '').slice(0, 256), u ? Buffer.from(u.salt, 'hex') : DUMMY_SALT, 32, SCRYPT);
  return !!u && crypto.timingSafeEqual(got, Buffer.from(u.hash, 'hex'));
}
const sign = (secret, s) => crypto.createHmac('sha256', secret).update(s).digest('base64url');
const safeNext = (n) => (typeof n === 'string' && /^\/(?![/\\])[\w\-./%?=&#]*$/.test(n) && !n.startsWith('/login') && !n.startsWith('/api/')) ? n : '/';
const limited = (ip) => { const r = misses.get(ip); if (!r) return 0; if (Date.now() > r.reset) { misses.delete(ip); return 0; } return r.n >= 8 ? Math.ceil((r.reset - Date.now()) / 1000) : 0; };
const miss = (ip) => { const r = misses.get(ip); if (!r || Date.now() > r.reset) misses.set(ip, { n: 1, reset: Date.now() + 600e3 }); else r.n++; };

function parseBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  return Object.fromEntries(new URLSearchParams(Buffer.isBuffer(req.body) ? req.body.toString() : String(req.body || '')));
}
function sameSite(req) {
  const sfs = req.headers['sec-fetch-site']; if (sfs) return sfs === 'same-origin' || sfs === 'none';
  const o = req.headers.origin || req.headers.referer; if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}
function redirect(res, to, cookie) {
  res.statusCode = 303; res.setHeader('Location', to); res.setHeader('Cache-Control', 'no-store');
  if (cookie) res.setHeader('Set-Cookie', cookie);
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method not allowed'); }
  const secret = process.env.SESSION_SECRET, users = parseUsers();
  if (!secret || secret.length < 24 || users.size === 0) { res.statusCode = 500; return res.end('Login is not configured. Set SITE_USERS and SESSION_SECRET.'); }
  if (!sameSite(req)) { res.statusCode = 403; return res.end('Forbidden'); }

  const form = parseBody(req), name = String(form.username || '').toLowerCase().trim().slice(0, 40), next = safeNext(form.next);
  const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const wait = limited(ip);
  const back = (code) => '/login?e=' + code + '&u=' + encodeURIComponent(name) + (next !== '/' ? '&next=' + encodeURIComponent(next) : '');
  if (wait) { res.setHeader('Retry-After', String(wait)); return redirect(res, back('limit')); }

  if (checkLogin(users, name, form.password)) {
    misses.delete(ip);
    console.log('[auth] sign-in ok user=' + name);
    const hours = Number(process.env.SESSION_HOURS || 12);
    const body = Buffer.from(JSON.stringify({ u: name, exp: Date.now() + hours * 3600e3 })).toString('base64url');
    const secure = process.env.COOKIE_SECURE === '0' ? '' : '; Secure';
    return redirect(res, next, `as_session=${body}.${sign(secret, body)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${hours * 3600}${secure}`);
  }
  miss(ip); console.warn('[auth] sign-in failed ip=' + ip);
  await new Promise((r) => setTimeout(r, 600));
  return redirect(res, back('bad'));
}
