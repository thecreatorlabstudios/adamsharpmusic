// Make a login for the site.   node tools/hash.mjs <username> [password]
// With no password, a strong one is generated. Give the person the password, put the SITE_USERS line in the host's settings.
import crypto from 'node:crypto';
const [name, given] = process.argv.slice(2);
if (!name || !/^[A-Za-z0-9._-]{2,32}$/.test(name)) { console.error('Usage: node tools/hash.mjs <username> [password]   (username: 2-32 letters, numbers, . _ -)'); process.exit(1); }
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generated = !given;
const password = given || Array.from(crypto.randomBytes(18), (b) => ALPHABET[b % ALPHABET.length]).join('').replace(/(.{6})(?!$)/g, '$1-');
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
console.log(`username: ${name.toLowerCase()}`);
if (generated) console.log(`password: ${password}   (share this with them; it is not stored anywhere else)`);
console.log(`\nAdd this to SITE_USERS (separate several people with a semicolon):\n${name.toLowerCase()}:${salt.toString('hex')}:${hash.toString('hex')}`);
