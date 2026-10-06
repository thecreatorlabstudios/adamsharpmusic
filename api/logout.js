// Vercel Function (Node runtime): clears the session cookie.
export default function handler(req, res) {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method not allowed'); }
  const sfs = req.headers['sec-fetch-site'];
  if (sfs && sfs !== 'same-origin' && sfs !== 'none') { res.statusCode = 403; return res.end('Forbidden'); }
  const secure = process.env.COOKIE_SECURE === '0' ? '' : '; Secure';
  res.statusCode = 303; res.setHeader('Location', '/login'); res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', `as_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  res.end();
}
