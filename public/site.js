(function () {
  'use strict';
  /* To add new music: add an entry to the top of RELEASES. Set link to its page (or Spotify) and date to its release date. */
  var RELEASES = [
    { title: 'Fireworks', type: 'Single', date: '2026-11-22T00:00:00-08:00', blurb: 'A song about beholding the glory of God. Explore the song, find the lights and read the story behind it.', cover: '/assets/cover.jpg', page: '/fireworks', pageLabel: 'Step inside the song', link: 'https://distrokid.com/hyperfollow/adamsharp3/fireworks', linkLabel: 'Pre-save' }
    ,{ title: 'Hold Onto Me', type: 'Single', date: '2025-08-01T00:00:00-07:00', blurb: 'Adam’s 2025 single, out now on Spotify and everywhere you listen.', cover: '/assets/hold-onto-me.jpg', link: 'https://open.spotify.com/artist/2xJgiwNjOqtVyBPJH6k14C', linkLabel: 'Listen on Spotify' }
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
    return '<a class="card social" href="' + r.link + '" target="_blank" rel="noopener"><img src="' + r.cover + '" alt="' + esc(r.title) + ' cover art" width="72" height="72" style="border-radius:4px;flex:none"><div><b>' + esc(r.title) + '</b><span>' + esc(r.type) + ' · ' + pretty(r.date).split(', ').slice(1).join(', ') + ' · Listen on Spotify</span></div></a>';
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

  /* Inside the song: the galaxies and the moment each one stands for. Order follows the song. */
  var GAL = [
    ['The Rooster', 'Sunflower Galaxy', 'A golden spiral with many short, feathery arms, named for its likeness to a sunflower. Paired with the first light of day when the rooster crows.'],
    ['Bread and Wine', 'Sombrero Galaxy', 'A glowing round bulge cut across by a dark lane of dust, like a loaf broken in two.'],
    ['Lifted Up', 'Andromeda Galaxy', 'Named for the princess in Greek myth who was chained and then rescued. It is the nearest large galaxy to ours.'],
    ['Moses', 'NGC 1300', 'A barred spiral with a straight bar of stars through its center, like the staff of Moses.'],
    ['Lazarus', 'Black Eye Galaxy', 'Also called the Sleeping Beauty galaxy, for the dark band of dust across its bright core. Paired with Lazarus, called out of sleep.'],
    ['The Sea', 'Whirlpool Galaxy', 'A grand spiral swirling like water, with a smaller galaxy beside it.'],
    ['The Fire', 'Cigar Galaxy', 'A starburst galaxy making stars at a furious pace, with red glowing gas streaming out from its center.'],
    ['The Storm', 'Cartwheel Galaxy', 'A ring galaxy shaped by a collision about 400 million years ago, with ripples spreading outward like a storm.'],
    ['The Holy Place', 'Fireworks Galaxy', 'Nicknamed for its supernovae: ten have been seen in about 50 years. It is about 22 million light-years away, and it shares its name with the song.']
  ];
  var PART = ['Verse 1', 'Verse 2', 'Chorus', 'The build', 'The build', 'The build', 'The build', 'The build', 'Closing'];
  var gBox = document.getElementById('galaxies'), gOut = document.getElementById('gdetail');
  function pickG(i) {
    Array.prototype.forEach.call(gBox.children, function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    gOut.innerHTML = '<p class="mono" style="color:var(--gold)">' + esc(PART[i]) + ' · ' + esc(GAL[i][0]) + '</p><h3>' + esc(GAL[i][1]) + '</h3><p>' + esc(GAL[i][2]) + '</p>';
  }
  GAL.forEach(function (g, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = g[0]; b.addEventListener('click', function () { pickG(i); }); gBox.appendChild(b); });
  pickG(0);

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
