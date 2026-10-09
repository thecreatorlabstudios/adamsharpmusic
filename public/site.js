(function () {
  'use strict';
  /* To add new music: add an entry to the top of RELEASES. Set link to its page (or Spotify) and date to its release date. */
  var RELEASES = [
    { title: 'Fireworks', type: 'Single', date: '2026-11-22T00:00:00-08:00', blurb: 'A song about beholding the glory of God. Explore the song, find the lights and read the story behind it.', cover: '/assets/cover.jpg', page: '/fireworks', pageLabel: 'Step inside the song', link: 'https://distrokid.com/hyperfollow/adamsharp3/fireworks', linkLabel: 'Pre-save' }
  ];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function pretty(iso) { var d = new Date(iso); return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var list = document.getElementById('releaseList');
  list.innerHTML = RELEASES.map(function (r) {
    var out = new Date(r.date) <= new Date();
    return '<article class="card rel"><img src="' + r.cover + '" alt="' + esc(r.title) + ' cover art" loading="lazy"><div>' +
      '<span class="tag mono">' + (out ? 'Out now' : 'Coming ' + pretty(r.date).split(', ').slice(1).join(', ')) + '</span>' +
      '<h3>' + esc(r.title) + '</h3><p class="dim">' + esc(r.type) + ' · ' + pretty(r.date) + '</p><p>' + esc(r.blurb) + '</p>' +
      '<div class="actions" style="margin-top:14px"><a class="btn btn-gold" href="' + r.page + '">' + esc(r.pageLabel) + '</a><a class="btn btn-ghost" href="' + r.link + '" target="_blank" rel="noopener">' + (r.linkLabel || 'Listen') + '</a></div></div></article>';
  }).join('') + '<div class="card soon mono">More music coming</div>';

  /* tabs */
  var views = document.querySelectorAll('[data-view]'), links = document.querySelectorAll('nav.tabs a');
  function show() {
    var t = (location.hash || '#home').slice(1); if (!document.getElementById('view-' + t)) t = 'home';
    Array.prototype.forEach.call(views, function (v) { v.hidden = v.getAttribute('data-view') !== t; });
    Array.prototype.forEach.call(links, function (a) { if (a.getAttribute('data-tab') === t) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = (t === 'home' ? 'Adam Sharp | Worship Artist' : t.charAt(0).toUpperCase() + t.slice(1) + ' | Adam Sharp');
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', show); show();

  /* countdown to the lead release */
  var target = new Date(RELEASES[0].date).getTime(), box = document.getElementById('count');
  function tick() {
    var ms = target - Date.now(); if (ms <= 0) { box.hidden = true; return; }
    var s = Math.floor(ms / 1000), v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    Object.keys(v).forEach(function (k) { box.querySelector('[data-cd="' + k + '"]').textContent = k === 'd' ? v[k] : String(v[k]).padStart(2, '0'); });
  }
  tick(); setInterval(tick, 1000);

  /* sign-out button only while a login is active */
  try { fetch('/api/config', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) { if (c && c.auth) document.getElementById('signout').hidden = false; }).catch(function () {}); } catch (e) {}
})();
