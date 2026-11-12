(function () {
  'use strict';
  /* To add new music: add an entry to the top of RELEASES. Set link to its page (or Spotify) and date to its release date. */
  var RELEASES = [
    { title: 'Fireworks', type: 'Single', date: '2026-11-22T00:00:00-08:00', blurb: 'A song about beholding the glory of God. Out Sunday, November 22, 2026.', cover: '/assets/cover.jpg', link: 'https://distrokid.com/hyperfollow/adamsharp3/fireworks', linkLabel: 'Pre-save' }
    ,{ title: 'Hold Onto Me', type: 'Single', length: '3:53', date: '2025-08-01T00:00:00-07:00', blurb: 'Adam wrote this one for his wife shortly after they met, to tell her he will be there for her no matter what they go through. She can hold onto him as he holds onto God.', cover: '/assets/hold-onto-me.jpg', link: 'https://open.spotify.com/artist/2xJgiwNjOqtVyBPJH6k14C', linkLabel: 'Listen on Spotify' }
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
      '<div class="actions" style="margin-top:14px">' + (r.page ? '<a class="btn btn-gold" href="' + r.page + '">' + esc(r.pageLabel) + '</a>' : '') + '<a class="btn ' + (r.page ? 'btn-ghost' : 'btn-gold') + '" href="' + r.link + '" target="_blank" rel="noopener">' + (r.linkLabel || 'Listen') + '</a></div></div></article>';
  }).join('') + '<div class="card soon mono">More music coming</div>';

  var also = document.getElementById('alsoOut');
  also.innerHTML = RELEASES.filter(function (r) { return new Date(r.date) <= new Date(); }).map(function (r) {
    return '<article class="card outnow"><img src="' + r.cover + '" alt="' + esc(r.title) + ' cover art" width="300" height="300" loading="lazy"><div>' +
      '<span class="tag mono">Out now</span><h3>' + esc(r.title) + '</h3>' +
      '<p class="dim">' + esc(r.type) + ' · ' + pretty(r.date).split(', ').slice(1).join(', ') + (r.length ? ' · ' + esc(r.length) : '') + '</p>' +
      '<p>' + esc(r.blurb) + '</p>' +
      '<div class="actions"><a class="btn btn-gold" href="' + r.link + '" target="_blank" rel="noopener">Listen on Spotify</a><a class="btn btn-ghost" href="#releases" data-tab="releases">All releases</a></div></div></article>';
  }).join('');
  also.parentNode.hidden = !also.innerHTML;

  /* tabs */
  var views = document.querySelectorAll('[data-view]'), links = document.querySelectorAll('nav.tabs a');
  function show() {
    var t = (location.hash || '#home').slice(1); if (t === 'about') t = 'story'; if (!document.getElementById('view-' + t)) t = 'home';
    Array.prototype.forEach.call(views, function (v) { v.hidden = v.getAttribute('data-view') !== t; });
    Array.prototype.forEach.call(links, function (a) { if (a.getAttribute('data-tab') === t) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = (t === 'home' ? 'Adam Sharp | Worship Artist' : t.charAt(0).toUpperCase() + t.slice(1) + ' | Adam Sharp');
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', show); show();


  /* Get to know Adam: tap to open a card */
  Array.prototype.forEach.call(document.querySelectorAll('#know .kcard'), function (b) {
    b.addEventListener('click', function () { var open = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', open ? 'false' : 'true'); });
  });

  /* countdown to the lead release */
  var target = new Date(RELEASES[0].date).getTime(), box = document.getElementById('count');
  function tick() {
    var ms = target - Date.now(); if (ms <= 0) { box.hidden = true; return; }
    var s = Math.floor(ms / 1000), v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    Object.keys(v).forEach(function (k) { box.querySelector('[data-cd="' + k + '"]').textContent = k === 'd' ? v[k] : String(v[k]).padStart(2, '0'); });
  }
  tick(); setInterval(tick, 1000);

})();
