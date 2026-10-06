(function () {
  'use strict';
  var ASSET = { cover: 'assets/cover.jpg', suit: 'assets/suit.jpg', smile: 'assets/smile.jpg', audio: 'assets/fireworks-promo.mp3' };
  var $ = function (id) { return document.getElementById(id); };
  /* private preview: the server says whether a login is active and whether Adam has approved */
  try { fetch('/api/config', { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) { if (!c) return; if (c.auth) document.body.setAttribute('data-auth', '1'); if (c.approved) document.body.setAttribute('data-review', 'false'); }).catch(function () {}); } catch (e) {}
  var html = document.documentElement;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function phoneMode() { var coarse = false; try { coarse = window.matchMedia('(pointer: coarse)').matches; } catch (e) {} return innerWidth < 760 || (coarse && innerWidth < 1024); }
  var phone = phoneMode();
  html.className = phone ? 'mode-phone' : 'mode-desk';

  /* ================= CONTENT ================= */
  var SCENES = [
    { part: 'Verse 1', short: 'The rooster', title: 'Peter denies Jesus', lyric: 'I denied you three times / I heard the rooster crow', body: 'Peter swears he does not know Jesus, three times, before the rooster crows. The first verse is sung from his side of that night.', ref: 'Luke 22:54–62', motif: 'brazier' },
    { part: 'Verse 2', short: 'Bread and wine', title: 'The table and the garden', lyric: 'I ate the bread and drank the wine / Then fell asleep during prayer', body: 'Jesus shares bread and wine with his disciples. Hours later in Gethsemane they cannot stay awake while he prays.', ref: 'Matthew 26:26–46', motif: 'table' },
    { part: 'Chorus', short: 'Lifted up', title: 'Falling down, being lifted', lyric: 'So I’ll fall down / I’ll cry out / You’ll lift me up / Take me in your arms', body: 'The chorus turns from failure to rescue: fall down, cry out, be lifted and held.', ref: 'James 4:10 · Psalm 40:1–2', motif: 'beam', lift: true },
    { part: 'The build', short: 'Moses', title: 'Moses asks to see God’s glory', lyric: 'If you shone upon Moses / Would you shine upon me?', body: 'Moses asks to see God’s glory and is sheltered in the rock as it passes by. The song asks for the same.', ref: 'Exodus 33:18–23', motif: 'mountain' },
    { part: 'The build', short: 'Lazarus', title: 'Lazarus walks out of the tomb', lyric: 'Like when you gave life to Lazarus', body: 'Jesus calls a man four days dead out of the grave.', ref: 'John 11:38–44', motif: 'tomb' },
    { part: 'The build', short: 'The sea', title: 'The sea parts', lyric: 'When you parted the sea', body: 'Israel crosses on dry ground with water standing like walls on both sides.', ref: 'Exodus 14:21–22', motif: 'sea' },
    { part: 'The build', short: 'The fire', title: 'Standing in the fire', lyric: 'When you stood in the fire', body: 'Three men are thrown into a furnace and a fourth figure walks with them in the flames.', ref: 'Daniel 3:19–27', motif: 'fire' },
    { part: 'The build', short: 'The storm', title: 'The storm obeys', lyric: 'Calmed the storm with a word', body: 'Jesus speaks to the wind and the sea, and the storm goes still.', ref: 'Mark 4:35–41', motif: 'storm' },
    { part: 'Closing', short: 'The Holy Place', title: 'Past the outer courts', lyric: 'Take me past the outer courts / Into the Holy Place', body: 'The tabernacle moves from the outer court to the Holy Place, nearer to God. The song asks to be taken the whole way in, clothed in His majesty. Fireworks is the picture for that glory.', ref: 'Hebrews 10:19–22 · Exodus 26:33', motif: 'gate', holy: true }
  ];
  var HOLY = 8, GOAL = 8;
  /* the real galaxy each scene is drawn after (pairings are CreatorLab's, based on each galaxy's name or look) */
  var REAL = [
    { name: 'Sunflower Galaxy', id: 'M63', note: 'A golden spiral with many short, feathery arms, named for its likeness to a sunflower. Paired with the first light of day when the rooster crows.' },
    { name: 'Sombrero Galaxy', id: 'M104', note: 'A glowing round bulge cut across by a dark lane of dust, like a loaf broken in two.' },
    { name: 'Andromeda Galaxy', id: 'M31', note: 'Named for the princess in Greek myth who was chained and then rescued. It is the nearest large galaxy to ours.' },
    { name: 'NGC 1300', id: '', note: 'A barred spiral with a straight bar of stars through its center, like the staff of Moses.' },
    { name: 'Black Eye Galaxy', id: 'M64', note: 'Also called the Sleeping Beauty galaxy, for the dark band of dust across its bright core. Paired with Lazarus, called out of sleep.' },
    { name: 'Whirlpool Galaxy', id: 'M51', note: 'A grand spiral swirling like water, with a smaller galaxy beside it.' },
    { name: 'Cigar Galaxy', id: 'M82', note: 'A starburst galaxy making stars at a furious pace, with red glowing gas streaming out from its center.' },
    { name: 'Cartwheel Galaxy', id: '', note: 'A ring galaxy shaped by a collision about 400 million years ago, with ripples spreading outward like a storm.' },
    { name: 'Fireworks Galaxy', id: 'NGC 6946', note: 'Nicknamed for its supernovae: ten have been seen in about 50 years. It is about 22 million light-years away, and it shares its name with the song.' }
  ];
  /* where each galaxy sits in the song: index into FULL, the label shown, and the lines to highlight */
  var SONGPOS = [
    { sec: 0, label: 'Verse 1', hl: ['I denied you three times', 'I heard the rooster crow'] },
    { sec: 2, label: 'Verse 2', hl: ['I ate the bread and drank the wine', 'Then fell asleep during prayer'] },
    { sec: 1, label: 'Chorus', hl: ['So I\u2019ll fall down', 'I\u2019ll cry out', 'You\u2019ll lift me up', 'Take me in your arms'] },
    { sec: 4, label: 'The build (bridge)', hl: ['If you shone upon Moses', 'Would you shine upon me?'] },
    { sec: 4, label: 'The build (bridge)', hl: ['Like when you gave life to Lazarus'] },
    { sec: 4, label: 'The build (bridge)', hl: ['When you parted the sea'] },
    { sec: 4, label: 'The build (bridge)', hl: ['When you stood in the fire'] },
    { sec: 4, label: 'The build (bridge)', hl: ['Calmed the storm with a word'] },
    { sec: 5, label: 'Closing', hl: ['Take me past the outer courts (Into the Holy Place)', 'I long to see the fireworks (That shine upon your face)'] }
  ];
  var FULL = [
    ['Verse 1', ['I denied you three times', 'I heard the rooster crow', 'I’m always one step behind', 'How am I supposed to know?']],
    ['Chorus', ['So I’ll fall down', 'I’ll cry out', 'You’ll lift me up', 'Take me in your arms']],
    ['Verse 2', ['I ate the bread and drank the wine', 'Then fell asleep during prayer', 'I thought I had it all right', 'Then I sunk in despair']],
    ['Chorus', ['So I’ll fall down', 'I’ll cry out', 'You’ll lift me up', 'Take me in your arms']],
    ['The build', ['If you shone upon Moses', 'Would you shine upon me?', 'Like when you gave life to Lazarus', 'When you parted the sea', '', 'When you stood in the fire', 'Calmed the storm with a word', 'If you shone upon Moses', 'I wanna see your fireworks']],
    ['Closing', ['Take me past the outer courts (Into the Holy Place)', 'I long to see the fireworks (That shine upon your face)', 'I’m clothed in your majesty (Protection for my Soul)', 'Protection for my Soul']]
  ];
  function realHTML(i) {
    var r = REAL[i]; if (!r) return '';
    return '<div class="realgal"><p class="eyebrow mono">The real galaxy</p><p class="realgal-name">' + r.name + (r.id ? ' <span class="mono">' + r.id + '</span>' : '') + '</p><p>' + r.note + '</p><p class="fine">This art is drawn by CreatorLab in the style of that galaxy. It is not a photograph.</p></div>';
  }
  function inSongHTML(i) {
    var sp = SONGPOS[i], sec = FULL[sp.sec];
    var lines = sec[1].map(function (l) { if (l === '') return '<br>'; var on = sp.hl.indexOf(l) >= 0; return on ? '<mark>' + l + '</mark>' : l; });
    return '<div class="insong"><p class="eyebrow mono">Where it is in the song</p><p class="insong-part mono">' + sp.label + '</p><p class="insong-text">' + lines.join('<br>').replace(/<br><br>/g, '<br>') + '</p></div>';
  }
  function lyricsHTML() {
    return '<div class="lyr">' + FULL.map(function (s) { return '<h4>' + s[0] + '</h4><p>' + s[1].join('<br>') + '</p>'; }).join('') + '</div>';
  }
  var SPOTIFY = 'https://open.spotify.com/artist/2xJgiwNjOqtVyBPJH6k14C';
  var INSTA = 'https://www.instagram.com/theadamsharp/';
  function countHTML() {
    return '<div class="count" role="timer" aria-label="Time until release"><div><b data-cd="d">--</b><span class="mono">Days</span></div><div><b data-cd="h">--</b><span class="mono">Hours</span></div><div><b data-cd="m">--</b><span class="mono">Min</span></div><div><b data-cd="s">--</b><span class="mono">Sec</span></div></div>';
  }

  /* ================= STATE ================= */
  var found = {}, foundCount = 0, unlocked = false, pendingFinale = false, panelKind = null, selected = -1;
  var world = null; // set when 3D starts

  /* ================= PANELS ================= */
  var panel = $('panel'), panelBody = $('panelBody'), nav = $('nav'), toastEl = $('toast');
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('show'); }, 2600); }
  function setNav(kind) { Array.prototype.forEach.call(nav.children, function (b) { if (b.getAttribute('data-open') === kind) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }); }
  function navHTML(i) {
    var prev = i > 0 ? SCENES[i - 1] : null, next = i < SCENES.length - 1 ? SCENES[i + 1] : null;
    var nextSealed = next && SCENES[i + 1].holy && !unlocked;
    var h = '<div class="gnav"><button class="btn btn-gold" type="button" data-gal="back">Back to the cosmos</button>';
    if (prev) h += '<button class="btn btn-ghost" type="button" data-gal="' + (i - 1) + '">← ' + prev.short + '</button>';
    if (next) h += nextSealed ? '<button class="btn btn-ghost" type="button" disabled>' + next.short + ' is sealed</button>' : '<button class="btn btn-ghost" type="button" data-gal="' + (i + 1) + '">' + next.short + ' →</button>';
    return h + '</div>';
  }
  function sceneHTML(i) {
    var s = SCENES[i];
    if (s.holy && !unlocked) {
      return '<p class="eyebrow mono">' + s.part + '</p><h2>The inner court is sealed</h2><p>Visit the other eight galaxies first. Each one is a scene from the song, and each one opens a little more of the way in.</p><p class="prog mono">' + foundCount + ' of ' + GOAL + ' visited</p><div class="gnav"><button class="btn btn-gold" type="button" data-gal="back">Back to the cosmos</button></div>';
    }
    var h = '<p class="eyebrow mono">Galaxy ' + (i + 1) + ' of 9 · ' + s.part + '</p><h2>' + s.title + '</h2><p class="lyric">“' + s.lyric.replace(/ \/ /g, '<br>') + '”</p><p>' + s.body + '</p><span class="ref mono">' + s.ref + '</span>' + inSongHTML(i) + realHTML(i);
    h += navHTML(i);
    if (s.holy) {
      h += '<p style="margin-top:26px">This is where Adam’s prayer ends: past the outer courts, into the Holy Place. The fireworks are the glory of God.</p><div class="actions"><button class="btn btn-gold" type="button" data-go="release">See the release</button><a class="btn btn-ghost" href="' + SPOTIFY + '" target="_blank" rel="noopener">Listen on Spotify</a></div>' + lyricsHTML();
    } else {
      h += '<p class="prog mono">' + foundCount + ' of ' + GOAL + ' galaxies visited</p>';
    }
    h += '<p class="review-only">Review: Scripture references are CreatorLab’s suggestions based on the lyrics. Adam confirms them before launch.</p>';
    return h;
  }
  var PANELS = {
    story: function () {
      return '<p class="eyebrow mono">Story</p><h2>I’ve always been a musician. <em>I love music.</em></h2>' +
        '<p>Adam Sharp has been making music for as long as he can remember. He started leading worship in high school, and that calling took him on mission trips with YWAM.</p>' +
        '<p>Two things sit at the center of his work. One is multilingual worship, singing to God in more than one language. The other is identity renewal within Christians.</p>' +
        '<p class="quote">“My heart is that all will come to know Christ as I have known Him, so that they can experience the same love that I have.”<small>Adam Sharp</small></p>' +
        '<p>His audience is broad on purpose. Some people are hearing his music for the first time and some have followed him for years.</p>' +
        '<div class="pics"><img src="' + ASSET.suit + '" alt="Adam Sharp in a navy suit leaning in a barn doorway"><img src="' + ASSET.smile + '" alt="Adam Sharp laughing, seated against a gray wall"></div>' +
        '<ul class="chips"><li>Worship music</li><li>Multilingual worship</li><li>Identity renewal</li><li>Leading worship</li><li>YWAM mission trips</li></ul>' +
        '<h3 style="font:400 1.5rem/1.2 var(--f-display);margin:30px 0 8px">Behind <em>Fireworks</em></h3>' +
        '<p class="quote" style="font-size:1.25rem">“Through this song, I want people to feel moved to seek God, so that they can experience Him in His fullness.”<small>Adam Sharp</small></p>' +
        '<div class="actions"><button class="btn btn-gold" type="button" data-go="release">Hear the new single</button></div>';
    },
    release: function () {
      return '<img class="cover" src="' + ASSET.cover + '" alt="Fireworks single cover art by Adam Sharp"><p class="eyebrow mono">New single · Christian worship</p><h2>Fireworks</h2><p class="dim">Adam Sharp · Out Sunday, November 22, 2026</p>' + countHTML() +
        '<div class="actions"><a class="btn btn-gold" href="' + SPOTIFY + '" target="_blank" rel="noopener">Listen on Spotify</a><button class="btn btn-ghost" type="button" data-sound-toggle>' + (soundOn ? 'Pause the promo' : 'Play the promo') + '</button><button class="btn btn-ghost" type="button" disabled>Pre-save link coming</button></div>' +
        '<details><summary class="mono">Read the lyrics</summary>' + lyricsHTML() + '</details>';
    },
    connect: function () {
      return '<p class="eyebrow mono">Connect</p><h2>Stay close to <em>the music</em></h2><p>Follow Adam for release news, behind-the-scenes moments and new songs.</p><div class="actions"><a class="btn btn-gold" href="' + INSTA + '" target="_blank" rel="noopener">Instagram @theadamsharp</a><a class="btn btn-ghost" href="' + SPOTIFY + '" target="_blank" rel="noopener">Spotify</a></div><p class="dim" style="margin-top:22px;font-size:.88rem">Booking and contact details will be added once Adam confirms them.</p>' + (document.body.getAttribute('data-auth') === '1' ? '<form method="post" action="/api/logout" style="margin-top:26px"><button class="btn btn-ghost" type="submit">Sign out</button></form>' : '');
    }
  };
  function openPanel(kind, idx) {
    panelKind = kind;
    panelBody.innerHTML = kind === 'scene' ? sceneHTML(idx) : PANELS[kind]();
    panel.scrollTop = 0;
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false');
    setNav(kind === 'scene' ? 'explore' : kind);
    tickCountdown();
  }
  function hidePanel() { panelKind = null; panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); setNav('explore'); }
  function closePanel() {
    if (world && world.inGalaxy()) { world.exitGalaxy(); return; }
    selected = -1; hidePanel();
  }
  function gotoScene(j) {
    if (world) world.goGalaxy(j);
    else { markFound(j); selected = j; openPanel('scene', j); }
  }
  Array.prototype.forEach.call(nav.children, function (b) {
    b.addEventListener('click', function () { var k = b.getAttribute('data-open'); if (k === 'explore') closePanel(); else openPanel(k); });
  });
  $('close').addEventListener('click', closePanel);
  $('brand').addEventListener('click', function (e) { e.preventDefault(); closePanel(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePanel();
    if (world && world.inGalaxy() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) world.step(e.key === 'ArrowRight' ? 1 : -1);
  });
  panelBody.addEventListener('click', function (e) {
    var g = e.target.closest('[data-gal]');
    if (g) { var v = g.getAttribute('data-gal'); if (v === 'back') closePanel(); else gotoScene(+v); return; }
    var go = e.target.closest('[data-go]'); if (go) { openPanel(go.getAttribute('data-go')); return; }
    if (e.target.closest('[data-sound-toggle]')) { setSound(!soundOn); var b = panelBody.querySelector('[data-sound-toggle]'); if (b) b.textContent = soundOn ? 'Pause the promo' : 'Play the promo'; }
  });

  /* ================= COUNTDOWN ================= */
  var target = new Date(2026, 10, 22, 0, 0, 0).getTime();
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function setAll(k, v) { Array.prototype.forEach.call(document.querySelectorAll('[data-cd="' + k + '"]'), function (n) { n.textContent = v; }); }
  function tickCountdown() {
    var d = target - Date.now();
    if (d <= 0) { Array.prototype.forEach.call(document.querySelectorAll('.count'), function (c) { c.innerHTML = '<div><b style="font-size:1.4rem">Out now</b></div>'; }); return; }
    var s = Math.floor(d / 1000);
    setAll('d', Math.floor(s / 86400)); setAll('h', pad(Math.floor(s % 86400 / 3600))); setAll('m', pad(Math.floor(s % 3600 / 60))); setAll('s', pad(s % 60));
  }
  setInterval(tickCountdown, 1000);

  /* ================= AUDIO ================= */
  var audio = new Audio(); audio.src = ASSET.audio; audio.loop = true; audio.preload = 'auto';
  var soundOn = false, actx = null, an = null, bins = null, audioE = 0, ema = 0, lastBeat = 0;
  var soundBtn = $('sound');
  function paintSound() { soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off'; soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); }
  function setupAnalyser() {
    if (an) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext; actx = new AC();
      var src = actx.createMediaElementSource(audio); an = actx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.6;
      src.connect(an); an.connect(actx.destination); bins = new Uint8Array(an.frequencyBinCount);
    } catch (e) { an = null; }
  }
  function setSound(on) {
    soundOn = on; paintSound();
    if (on) { setupAnalyser(); if (actx && actx.state === 'suspended') actx.resume(); var p = audio.play(); if (p && p.catch) p.catch(function () { soundOn = false; paintSound(); }); }
    else audio.pause();
  }
  soundBtn.addEventListener('click', function () { setSound(!soundOn); });
  paintSound();

  /* ================= INTRO ================= */
  var entered = false;
  function enter(withSound) {
    if (entered) return; entered = true;
    $('intro').classList.add('out'); setTimeout(function () { $('intro').hidden = true; }, 950);
    if (withSound) setSound(true);
    if (world) world.onEnter();
  }
  $('enterSound').addEventListener('click', function () { enter(true); });
  $('enterQuiet').addEventListener('click', function () { enter(false); });
  $('how').textContent = phone ? 'Drag to fly around the robed figure, above and below. Tap a planet to fly into its galaxy.' : 'Move to stir the light. Drag to fly around the robed figure, above and below. Scroll to go closer, and click a planet to fly into its galaxy.';
  var hintEl = $('hint');
  hintEl.textContent = phone ? 'Drag to look around. Pinch to zoom. Tap a planet.' : 'Drag to fly around. Scroll to go closer. Click a planet.';
  var ticksEl = $('ticks');
  for (var ti = 0; ti < GOAL; ti++) ticksEl.appendChild(document.createElement('i'));
  function paintMeter() {
    Array.prototype.forEach.call(ticksEl.children, function (t, i) { t.className = i < foundCount ? 'on' : ''; });
    $('meterText').textContent = unlocked ? 'The inner court is open' : 'Galaxies visited ' + foundCount + ' of ' + GOAL;
  }
  paintMeter();
  function markFound(i) {
    if (found[i] || (SCENES[i].holy && !unlocked)) return false;
    found[i] = true;
    if (!SCENES[i].holy) foundCount++;
    if (foundCount >= GOAL && !unlocked) { unlocked = true; pendingFinale = true; }
    paintMeter();
    return true;
  }
  var kb = $('kb');
  SCENES.forEach(function (s, i) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = s.short + ': fly into this galaxy';
    b.addEventListener('click', function () { if (world) world.openPlanet(i); else gotoScene(i); });
    kb.appendChild(b);
  });

  /* ================= 3D WORLD ================= */
  function fallbackMode() { $('fallback').hidden = false; $('gl').hidden = true; $('meter').hidden = true; hintEl.hidden = true; }
  if (!window.THREE) { fallbackMode(); return; }
  var img = new Image();
  img.onload = function () { try { startWorld(img); } catch (err) { if (window.console) console.error(err); fallbackMode(); } };
  img.onerror = fallbackMode;
  img.src = ASSET.cover;

  function startWorld(img) {
    var THREE = window.THREE, canvas = $('gl'), warpEl = $('warp');
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
    catch (e) { fallbackMode(); return; }
    var DPR = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
    renderer.setPixelRatio(DPR); renderer.setClearColor(0x05060c, 1);
    var scene = new THREE.Scene(), gScene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
    var root = new THREE.Group(); scene.add(root);
    var orbit = new THREE.Group(); root.add(orbit);
    var island = new THREE.Group(); root.add(island);
    var gateGroup = new THREE.Group(); gateGroup.position.set(0, 0, -1.4); root.add(gateGroup);
    var figure = new THREE.Group(); root.add(figure);
    var GROUND = -1.85, FIG = 4.2, RR = 3.3, RP = phone ? 3.15 : 3.8;
    var GOLD = [1, 0.82, 0.48], EMBER = [1, 0.54, 0.24], WHITE = [1, 0.96, 0.85], ROCK = [0.55, 0.5, 0.46], BLUE = [0.55, 0.65, 0.95], DIM = [0.36, 0.34, 0.42];
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
    var R = Math.random;
    var tU = { value: 0 }, audU = { value: 0 }; // shared time and audio uniforms
    var FRAG = 'varying vec3 vColor; varying float vA; void main(){ float r=length(gl_PointCoord-0.5); float al=smoothstep(0.5,0.0,r); al*=al; gl_FragColor=vec4(vColor, al*vA); }';

    /* ---------- Dust (island, landmarks, gate, embers, stars) ---------- */
    var DUST_VS = [
      'attribute vec3 aColor; attribute float aSize; attribute float aMotion; attribute vec3 aC; attribute float aPh;',
      'uniform float uTime; uniform float uPx; uniform float uAudio; uniform float uGate;',
      'varying vec3 vColor; varying float vA;',
      'void main(){',
      '  vec3 p = position; float a = 1.0; float t = uTime; float m = aMotion;',
      '  if (m>0.5 && m<1.5){ float H=aC.x; float sp=aC.y; float f=fract(t*sp*0.25+aPh); p.y += f*H; p.x += sin(t*1.7+aPh*40.0)*0.06*f; p.z += cos(t*1.3+aPh*31.0)*0.06*f; a=(1.0-f)*smoothstep(0.0,0.08,f); }',
      '  else if (m>1.5 && m<2.5){ vec2 c=aC.xy; vec2 r=p.xz-c; float ang=t*aC.z*(0.6+aPh); float cs=cos(ang), sn=sin(ang); p.xz = c + vec2(r.x*cs-r.y*sn, r.x*sn+r.y*cs); p.y += sin(t*2.0+aPh*20.0)*0.04; }',
      '  else if (m>2.5 && m<3.5){ p.y += sin(t*1.6+p.x*2.5+p.z*2.0+aPh*6.28)*0.12 + 0.04*sin(t*3.0+aPh*40.0); }',
      '  else if (m>4.5){ p.y += sin(t*1.0+aPh*30.0)*0.02*uGate; a=0.9; }',
      '  float tw = 0.72+0.28*sin(t*(1.5+aPh*3.0)+aPh*50.0);',
      '  vColor = aColor; if (m>4.5) vColor = mix(aColor*0.55, vec3(1.0,0.84,0.52), uGate);',
      '  vA = a*tw*(0.85+uAudio*0.7);',
      '  vec4 mv = modelViewMatrix*vec4(p,1.0);',
      '  gl_PointSize = min(aSize*uPx*(9.0/-mv.z)*(1.0+uAudio*0.4)*(m>4.5?(1.0+uGate*0.6):1.0), 16.0*uPx);',
      '  gl_Position = projectionMatrix*mv;',
      '}'
    ].join('\n');
    var dustU = { uTime: tU, uPx: { value: DPR }, uAudio: audU, uGate: { value: 0 } };
    var dustMat = new THREE.ShaderMaterial({ uniforms: dustU, vertexShader: DUST_VS, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    var SZ = phone ? 1.9 : 1.45, sc = phone ? 0.75 : 1;
    function Dust() { this.p = []; this.c = []; this.s = []; this.m = []; this.q = []; this.h = []; }
    Dust.prototype.add = function (x, y, z, col, size, mot, a, b, c) { this.p.push(x, y, z); this.c.push(col[0], col[1], col[2]); this.s.push(size * SZ); this.m.push(mot || 0); this.q.push(a || 0, b || 0, c || 0); this.h.push(R()); };
    Dust.prototype.build = function (mat) {
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('aColor', new THREE.Float32BufferAttribute(this.c, 3));
      g.setAttribute('aSize', new THREE.Float32BufferAttribute(this.s, 1));
      g.setAttribute('aMotion', new THREE.Float32BufferAttribute(this.m, 1));
      g.setAttribute('aC', new THREE.Float32BufferAttribute(this.q, 3));
      g.setAttribute('aPh', new THREE.Float32BufferAttribute(this.h, 1));
      var pts = new THREE.Points(g, mat || dustMat); pts.frustumCulled = false; return pts;
    };
    function ring(d, ox, oz, rad, y, n, col, size) { for (var i = 0; i < n; i++) { var a = i / n * 6.2832; d.add(ox + Math.cos(a) * rad, GROUND + y, oz + Math.sin(a) * rad, col, size, 0); } }

    /* island floor */
    var isl = new Dust(), edge = RR + 0.95, k, a, r;
    for (k = 0; k < 900 * sc; k++) { r = Math.sqrt(R()) * edge; a = R() * 6.2832; isl.add(Math.cos(a) * r, GROUND - Math.pow(r / edge, 3) * 0.18 + (R() - 0.5) * 0.04, Math.sin(a) * r, mix([0.5, 0.48, 0.62], [0.8, 0.62, 0.5], R()), 1.5, 0); }
    ring(isl, 0, 0, edge, -0.05, 360, mix(GOLD, DIM, 0.1), 2.0);
    ring(isl, 0, 0, RR, 0, 260, mix(GOLD, DIM, 0.3), 1.6);
    ring(isl, 0, 0, RR * 0.52, 0, 140, mix(GOLD, DIM, 0.35), 1.5);
    island.add(isl.build());

    /* landmarks: built big inside each galaxy */
    var MOTIFS = {
      brazier: function (d, ox, oz) { ring(d, ox, oz, 0.26, 0.05, 36, EMBER, 1.9); for (var i = 0; i < 130 * sc; i++) d.add(ox + (R() - 0.5) * 0.3, GROUND + 0.08, oz + (R() - 0.5) * 0.3, mix(EMBER, GOLD, R()), 2.6, 1, 0.95, 1.0); },
      table: function (d, ox, oz) { var i, a2, r2; for (i = 0; i < 70 * sc; i++) { a2 = R() * 6.2832; r2 = Math.sqrt(R()) * 0.5; d.add(ox + Math.cos(a2) * r2, GROUND + 0.36, oz + Math.sin(a2) * r2, GOLD, 1.9, 0); } for (var l = 0; l < 4; l++) for (i = 0; i < 8; i++) d.add(ox + Math.cos(l * 1.5708 + 0.8) * 0.38, GROUND + i * 0.045, oz + Math.sin(l * 1.5708 + 0.8) * 0.38, mix(GOLD, DIM, 0.4), 1.6, 0); for (var c = -1; c <= 1; c += 2) for (i = 0; i < 16; i++) { a2 = i / 16 * 6.2832; d.add(ox + c * 0.18 + Math.cos(a2) * 0.07, GROUND + 0.43, oz + Math.sin(a2) * 0.07, WHITE, 1.7, 0); } },
      beam: function (d, ox, oz) { ring(d, ox, oz, 0.3, 0.02, 40, GOLD, 1.8); for (var i = 0; i < 170 * sc; i++) { var a2 = R() * 6.2832, r2 = R() * 0.2; d.add(ox + Math.cos(a2) * r2, GROUND + 0.02, oz + Math.sin(a2) * r2, mix(WHITE, GOLD, R()), 2.4, 1, 2.6, 0.8); } },
      mountain: function (d, ox, oz) { for (var i = 0; i < 260 * sc; i++) { var h = R(), r2 = 0.85 * (1 - h) * (0.8 + R() * 0.2), a2 = R() * 6.2832; d.add(ox + Math.cos(a2) * r2, GROUND + h * 1.15, oz + Math.sin(a2) * r2, mix(ROCK, GOLD, h * h), 1.9, 0); } for (var j = 0; j < 40; j++) { var a3 = j / 40 * 6.2832; d.add(ox + Math.cos(a3) * 0.28, GROUND + 1.18 + Math.sin(a3) * 0.28, oz - 0.1, GOLD, 1.7, 0); } },
      tomb: function (d, ox, oz) { var i, a2, r2; for (i = 0; i < 90 * sc; i++) { a2 = R() * 3.1416; d.add(ox + Math.cos(a2) * 0.5, GROUND + 0.16 + Math.sin(a2) * 0.55, oz + (R() - 0.5) * 0.2, ROCK, 1.9, 0); } for (var s = -1; s <= 1; s += 2) for (i = 0; i < 14; i++) d.add(ox + s * 0.5, GROUND + i * 0.012, oz + (R() - 0.5) * 0.2, ROCK, 1.8, 0); for (i = 0; i < 44 * sc; i++) { a2 = R() * 6.2832; r2 = Math.sqrt(R()) * 0.28; d.add(ox + 0.85 + Math.cos(a2) * r2 * 0.4, GROUND + 0.1 + R() * 0.6, oz + Math.sin(a2) * 0.2, mix(ROCK, DIM, 0.4), 1.6, 0); } for (i = 0; i < 50 * sc; i++) d.add(ox + (R() - 0.5) * 0.5, GROUND + 0.1, oz + (R() - 0.5) * 0.1, mix(WHITE, GOLD, R()), 2.3, 1, 0.8, 0.9); },
      sea: function (d, ox, oz) { for (var s = -1; s <= 1; s += 2) for (var i = 0; i < 120 * sc; i++) d.add(ox + s * 0.5 + (R() - 0.5) * 0.07, GROUND + R() * 0.95, oz + (R() - 0.5) * 0.95, mix(BLUE, WHITE, R() * 0.5), 1.9, 3); for (var j = 0; j < 36; j++) d.add(ox + (R() - 0.5) * 0.7, GROUND + 0.01, oz + (R() - 0.5) * 0.95, mix(GOLD, DIM, 0.5), 1.4, 0); },
      fire: function (d, ox, oz) { var i, c; for (c = -1; c <= 1; c++) for (i = 0; i < 70 * sc; i++) d.add(ox + c * 0.3 + (R() - 0.5) * 0.15, GROUND + 0.05, oz + (R() - 0.5) * 0.15, mix(EMBER, GOLD, R()), 2.6, 1, 1.15, 1.2 + R() * 0.3); for (i = 0; i < 36; i++) d.add(ox + (R() - 0.5) * 0.06, GROUND + 0.05 + i * 0.02, oz + (R() - 0.5) * 0.05, WHITE, 2.0, 0); },
      storm: function (d, ox, oz) { var radii = [0.55, 0.42, 0.28], ys = [0.95, 1.2, 1.45], ns = [75, 58, 42], spd = [1.1, -1.6, 2.1]; for (var q = 0; q < 3; q++) for (var i = 0; i < ns[q] * sc; i++) { var a2 = R() * 6.2832; d.add(ox + Math.cos(a2) * radii[q], GROUND + ys[q], oz + Math.sin(a2) * radii[q], mix(BLUE, WHITE, R() * 0.6), 2.2, 2, ox, oz, spd[q]); } },
      gate: function (d, ox, oz) { var i; for (i = 0; i < 70 * sc; i++) { var y = GROUND + i / (70 * sc) * 1.45; d.add(ox - 0.9 + (R() - 0.5) * 0.06, y, oz, GOLD, 2.2, 0); d.add(ox + 0.9 + (R() - 0.5) * 0.06, y, oz, GOLD, 2.2, 0); } for (i = 0; i < 150 * sc; i++) { var an2 = i / (150 * sc) * 3.1416; d.add(ox + Math.cos(an2) * 0.9, GROUND + 1.45 + Math.sin(an2) * 0.9, oz, GOLD, 2.2, 0); } for (i = 0; i < 140 * sc; i++) d.add(ox + (R() - 0.5) * 1.6, GROUND + 0.05, oz + (R() - 0.5) * 0.3, mix(WHITE, GOLD, R()), 2.3, 1, 2.2, 0.7); }
    };

    /* gate (the Holy Place) behind the figure */
    var gd = new Dust(), gi;
    for (gi = 0; gi < 80 * sc; gi++) { var gy = GROUND + gi / (80 * sc) * 2.75; gd.add(-2.3 + (R() - 0.5) * 0.08, gy, (R() - 0.5) * 0.08, GOLD, 2.2, 5, 0, 0, 0); gd.add(2.3 + (R() - 0.5) * 0.08, gy, (R() - 0.5) * 0.08, GOLD, 2.2, 5, 0, 0, 0); }
    for (gi = 0; gi < 190 * sc; gi++) { var ga = gi / (190 * sc) * 3.1416; gd.add(Math.cos(ga) * 2.3, 0.9 + Math.sin(ga) * 2.3, (R() - 0.5) * 0.08, GOLD, 2.2, 5, 0, 0, 0); }
    for (gi = 0; gi < 140 * sc; gi++) { var gx = (R() - 0.5) * 4.4, gyy = GROUND + R() * 5.0; if (gyy > 0.9 && Math.hypot(gx, gyy - 0.9) > 2.1) continue; gd.add(gx, gyy, (R() - 0.5) * 0.5, [1, 0.9, 0.7], 1.4, 5, 0, 0, 0); }
    gateGroup.add(gd.build());

    /* embers in the sky */
    var em = new Dust(), ei;
    for (ei = 0; ei < 1500 * sc; ei++) em.add((R() - 0.5) * 22, -4 + R() * 1, (R() - 0.5) * 16 - 3, mix(GOLD, EMBER, R()), 1.0 + R() * 1.2, 1, 9, 0.3 + R() * 0.5);
    scene.add(em.build());

    /* ---------- The cover, rebuilt from its own pixels ---------- */
    var FIG_VS = [
      'attribute vec3 aColor; attribute float aFace; attribute vec3 aR;',
      'uniform float uBright; uniform float uPhone; uniform float uTime; uniform float uPx; uniform float uAudio; uniform float uAssemble; uniform float uBurst; uniform float uPointPow; uniform vec3 uBurstC; uniform vec3 uPointer;',
      'varying vec3 vColor; varying float vA;',
      'float eo(float x){ return 1.0-pow(1.0-x,3.0); }',
      'void main(){',
      '  vec3 p = position;',
      '  float d = eo(clamp(uAssemble*1.7 - aR.x*0.7, 0.0, 1.0));',
      '  vec3 sc = (aR-0.5)*vec3(16.0,12.0,16.0); p = mix(sc, p, d);',
      '  float t = uTime;',
      '  p.z += sin(t*0.7+p.y*2.2+aR.y*6.283)*0.035; p.x += sin(t*0.5+p.y*1.7)*0.02;',
      '  if (aFace>0.5){ p += vec3(sin(t*1.3+aR.y*6.283), cos(t*1.1+aR.z*6.283), sin(t*0.9+aR.x*6.283))*(0.05+uAudio*0.22); }',
      '  vec3 dp = p-uPointer; float dist=length(dp); float f=uPointPow*smoothstep(1.0,0.0,dist);',
      '  p += normalize(dp+vec3(0.0001))*f*0.55; p.z += f*0.35;',
      '  vec3 dir = normalize(p-uBurstC+(aR-0.5)*0.9);',
      '  p += dir*uBurst*(0.5+aR.z*2.4)*(aFace>0.5?2.2:0.8);',
      '  float tw = 0.8+0.2*sin(t*2.0+aR.x*40.0);',
      '  vColor = aColor*(aFace>0.5?1.0:uBright)*(1.0+uAudio*0.4+uBurst*0.6); vA = (0.8-aFace*0.1)*tw*(0.3+0.7*d);',
      '  vec4 mv = modelViewMatrix*vec4(p,1.0);',
      '  gl_PointSize = min((aFace>0.5?2.6:2.5)*uPhone*(0.75+aR.y*0.9)*uPx*(9.0/-mv.z)*(1.0+uAudio*0.4+uBurst*0.6), 9.0*uPx);',
      '  gl_Position = projectionMatrix*mv;',
      '}'
    ].join('\n');
    var figU = { uBright: { value: 1.7 }, uPhone: { value: phone ? 1.55 : 1.1 }, uTime: tU, uPx: { value: DPR }, uAudio: audU, uAssemble: { value: 0 }, uBurst: { value: 0 }, uPointPow: { value: 0 }, uBurstC: { value: new THREE.Vector3(0.08, 1.26, 0.2) }, uPointer: { value: new THREE.Vector3(99, 99, 99) } };
    (function () {
      var N = 200, cv = document.createElement('canvas'); cv.width = cv.height = N;
      var cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, N, N);
      var data = cx.getImageData(0, 0, N, N).data;
      var SPILL = [[1, 0.3, 0.7], [0.75, 0.35, 1], [1, 0.85, 0.2], [0.35, 0.95, 0.45], [1, 0.5, 0.2]];
      var pos = [], col = [], face = [], rr = [];
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var i = (y * N + x) * 4, r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), lum = 0.3 * r + 0.59 * g + 0.11 * b, sat = mx > 0 ? (mx - mn) / mx : 0;
        if (lum < 0.1 && sat < 0.25) continue;
        var isFace = (sat > 0.3 && lum > 0.2) || (y / N < 0.34 && x / N > 0.33 && x / N < 0.7 && lum > 0.5);
        var vein = isFace && sat <= 0.3;
        var reps = isFace ? 2 : 2;
        for (var k2 = 0; k2 < reps; k2++) {
          pos.push(((x + R()) / N - 0.5) * FIG, (0.5 - (y + R()) / N) * FIG, (lum - 0.4) * 0.4 + (isFace ? (R() - 0.5) * 0.7 + 0.2 : (R() - 0.5) * 0.85));
          if (isFace) {
            /* keep the album's own colors: normalise, push saturation, never boost toward white */
            var cm = Math.max(mx, 0.001), sr = r / cm, sg = g / cm, sb = b / cm, lm = 0.3 * sr + 0.59 * sg + 0.11 * sb, br = vein ? 0.5 : Math.min(0.6 + mx * 0.35, 0.92);
            var cr = Math.max(0, Math.min(1, lm + (sr - lm) * 1.95)), cg = Math.max(0, Math.min(1, lm + (sg - lm) * 1.95)), cb2 = Math.max(0, Math.min(1, lm + (sb - lm) * 1.95));
            if (vein) { cr = 1; cg = 0.78; cb2 = 0.95; }
            col.push(cr * br, cg * br, cb2 * br);
          } else {
            /* the robe glows with color instead of white: amber at the hem, and the face's pinks, violets and greens spill into it */
            var fx = x / N - 0.5, fy = y / N - 0.2, spill = Math.max(0, 1 - Math.sqrt(fx * fx + fy * fy) * 1.5), lv = Math.min(1, lum * 1.15), pickC = SPILL[(R() * SPILL.length) | 0];
            var base = [1.0, 0.5 + 0.2 * (1 - y / N), 0.14], mixA = Math.min(0.85, spill * 0.9 * (0.5 + 0.6 * R()));
            col.push((base[0] + (pickC[0] - base[0]) * mixA) * lv, (base[1] + (pickC[1] - base[1]) * mixA) * lv, (base[2] + (pickC[2] - base[2]) * mixA) * lv);
          }
          face.push(isFace ? 1 : 0); rr.push(R(), R(), R());
        }
      }
      var g2 = new THREE.BufferGeometry();
      g2.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g2.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
      g2.setAttribute('aFace', new THREE.Float32BufferAttribute(face, 1));
      g2.setAttribute('aR', new THREE.Float32BufferAttribute(rr, 3));
      var m2 = new THREE.ShaderMaterial({ uniforms: figU, vertexShader: FIG_VS, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      var pts = new THREE.Points(g2, m2); pts.frustumCulled = false; figure.add(pts);
    })();

    /* ---------- Fireworks pool (one per scene) ---------- */
    function makeFW(parent) {
      var B = 40, P = 110, total = B * P, slot = 0;
      var origin = new Float32Array(total * 3), vel = new Float32Array(total * 3), birth = new Float32Array(total).fill(-1000), cl = new Float32Array(total * 3), lift = new Float32Array(total);
      var g = new THREE.BufferGeometry();
      var aO = new THREE.BufferAttribute(origin, 3), aV = new THREE.BufferAttribute(vel, 3), aB = new THREE.BufferAttribute(birth, 1), aCc = new THREE.BufferAttribute(cl, 3), aL = new THREE.BufferAttribute(lift, 1);
      g.setAttribute('position', aO); g.setAttribute('aVel', aV); g.setAttribute('aBirth', aB); g.setAttribute('aCol', aCc); g.setAttribute('aLift', aL);
      var u = { uTime: tU, uPx: { value: DPR } };
      var vs = ['attribute vec3 aVel; attribute float aBirth; attribute vec3 aCol; attribute float aLift; uniform float uTime; uniform float uPx; varying vec3 vColor; varying float vA;',
        'void main(){ float t=uTime-aBirth; float life=2.2; if(t<0.0||t>life){ gl_Position=vec4(2.0,2.0,2.0,1.0); gl_PointSize=0.0; vA=0.0; vColor=vec3(0.0); return; }',
        ' float k=(1.0-exp(-2.2*t))/2.2; vec3 p=position+aVel*k; p.y += (aLift>0.5? 0.17 : -0.45)*t*t; vA=pow(1.0-t/life,1.4); vColor=aCol;',
        ' vec4 mv=modelViewMatrix*vec4(p,1.0); gl_PointSize=min(3.4*uPx*(9.0/-mv.z)*(0.6+vA*0.7), 12.0*uPx); gl_Position=projectionMatrix*mv; }'].join('\n');
      var pts = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      pts.frustumCulled = false; parent.add(pts);
      return {
        burst: function (x, y, z, power, pal, up) {
          var base = slot * P, now = tU.value; slot = (slot + 1) % B;
          var n = reduce ? 40 : P;
          for (var i = 0; i < P; i++) {
            var j = base + i;
            origin[j * 3] = x; origin[j * 3 + 1] = y; origin[j * 3 + 2] = z;
            if (i >= n) { birth[j] = -1000; continue; }
            var th = R() * 6.2832, ph = Math.acos(2 * R() - 1), rg = R() < 0.5 ? 1 : 0.4 + R() * 0.6, sp = (0.9 + R() * 1.7) * rg * power;
            vel[j * 3] = Math.sin(ph) * Math.cos(th) * sp; vel[j * 3 + 1] = Math.sin(ph) * Math.sin(th) * sp + (up ? 0.5 : 0); vel[j * 3 + 2] = Math.cos(ph) * sp * 0.6;
            var c = pal[(R() * pal.length) | 0]; cl[j * 3] = c[0]; cl[j * 3 + 1] = c[1]; cl[j * 3 + 2] = c[2];
            birth[j] = now + R() * 0.04; lift[j] = up ? 1 : 0;
          }
          aO.needsUpdate = aV.needsUpdate = aB.needsUpdate = aCc.needsUpdate = aL.needsUpdate = true;
        }
      };
    }
    var FW = makeFW(scene), FWg = makeFW(gScene);
    var PAL_GOLD = ['#ffd27d', '#fff4d6', '#ff9d4a', '#ffea9e'].map(hex);
    var PAL_COVER = ['#ff5fb0', '#ffe45c', '#9be84a', '#ffffff', '#ff9a3c', '#c26bff'].map(hex);

    /* ---------- Planets on a 3D globe around the figure ---------- */
    var PLN = [
      { a: '#ff7a45', b: '#7a1f2e', bands: 9, ring: false },
      { a: '#ffd27d', b: '#8a4a1e', bands: 7, ring: true },
      { a: '#fff4d6', b: '#5a7be0', bands: 11, ring: false },
      { a: '#ffc27a', b: '#6a4630', bands: 6, ring: false },
      { a: '#b8ffb0', b: '#1f6a5a', bands: 8, ring: true },
      { a: '#9ae0ff', b: '#1b3fa0', bands: 10, ring: false },
      { a: '#ffe08a', b: '#d4401a', bands: 5, ring: false },
      { a: '#d0c8ff', b: '#3a2a7a', bands: 12, ring: false },
      { a: '#fff4d6', b: '#ffd27d', bands: 6, ring: true }
    ];
    var glowTex = (function () { var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'); var g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    var ringTex = (function () { var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'); x.strokeStyle = 'rgba(255,225,150,0.95)'; x.lineWidth = 3; x.beginPath(); x.arc(64, 64, 52, 0, 6.2832); x.stroke(); var g = x.createRadialGradient(64, 64, 40, 64, 64, 64); g.addColorStop(0, 'rgba(255,225,150,0)'); g.addColorStop(0.8, 'rgba(255,225,150,0.25)'); g.addColorStop(1, 'rgba(255,225,150,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
    var labelsEl = $('labels');
    var lights = [];
    /* ---------- Real-looking galaxies, generated procedurally ---------- */
    function hash2(x, y, s) { var n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
    function vnoise(x, y, s) { var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); var a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
    function fbm(x, y, s) { return vnoise(x, y, s) * 0.5 + vnoise(x * 2.03, y * 2.03, s + 1.7) * 0.27 + vnoise(x * 4.1, y * 4.1, s + 3.1) * 0.15 + vnoise(x * 8.3, y * 8.3, s + 5.3) * 0.08; }
    function sstep(a, b, x) { x = (x - a) / (b - a); x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
    /* one parameter set per scene, modelled on real galaxies: M51, Andromeda, Pinwheel, a dusty Hubble spiral, an illustrated Milky Way */
    var GX = [
      { arms: 5, pitch: 0.55, sharp: 1.1, brk: 0.8, bulgeR: 0.08, bulgeAmp: 1.2, diskAmp: 0.85, armAmp: 1.35, dust: 0.3, dustOff: 0.6, dustSharp: 1.5, hii: 0.5, core: [1, 0.84, 0.55], arm: [0.78, 0.82, 1], hiiCol: [1, 0.6, 0.5], incl: 0.3, roll: 0.2, phase: 0, fog: 0.3, comps: [] },
      { arms: 2, pitch: 0.3, sharp: 2, bulgeR: 0.22, bulgeAmp: 2.4, diskAmp: 1.2, armAmp: 0.25, dust: 0.1, dustOff: 0.5, dustSharp: 2, dustBand: 1.7, dustBandR: 0.36, dustBandW: 0.05, hii: 0.05, core: [1, 0.95, 0.85], arm: [1, 0.92, 0.8], hiiCol: [1, 0.7, 0.5], incl: 1.36, roll: 0.35, phase: 0, fog: 0.7, comps: [] },
      { arms: 2, pitch: 0.21, sharp: 2.0, bulgeR: 0.12, bulgeAmp: 1.5, diskAmp: 0.6, armAmp: 0.9, dust: 1.0, dustOff: 0.5, dustSharp: 2.0, hii: 0.6, core: [1, 0.88, 0.66], arm: [0.55, 0.66, 0.95], hiiCol: [1, 0.45, 0.5], incl: 1.15, roll: 0.9, phase: 0.3, fog: 0.1, comps: [{ x: 0.55, y: -0.9, s: 0.14, col: [0.85, 0.92, 1] }, { x: -0.75, y: 0.45, s: 0.12, col: [1, 0.95, 0.85] }] },
      { arms: 2, pitch: 0.4, sharp: 1.7, armIn: 0.2, bar: 1.7, barLen: 0.4, barAngle: 0.5, bulgeR: 0.07, bulgeAmp: 1.1, diskAmp: 0.5, armAmp: 1.35, dust: 0.65, dustOff: 0.8, dustSharp: 2, hii: 1.1, core: [1, 0.82, 0.55], arm: [0.6, 0.72, 1], hiiCol: [1, 0.4, 0.6], incl: 0.45, roll: -0.5, phase: 0.55, fog: 0.15, comps: [] },
      { arms: 2, pitch: 0.22, sharp: 1.8, bulgeR: 0.17, bulgeAmp: 2.1, diskAmp: 0.85, armAmp: 0.45, dust: 0.7, dustOff: 0.4, dustSharp: 1.8, dustBand: 1.3, dustBandR: 0.22, dustBandW: 0.07, hii: 0.3, core: [1, 0.9, 0.7], arm: [0.8, 0.82, 0.95], hiiCol: [1, 0.55, 0.5], incl: 0.85, roll: -0.4, phase: 0.3, fog: 0.4, comps: [] },
      { arms: 2, pitch: 0.38, sharp: 2.4, bulgeR: 0.09, bulgeAmp: 1.3, diskAmp: 0.55, armAmp: 1.0, dust: 0.8, dustOff: 0.75, dustSharp: 2.5, hii: 1.0, core: [1, 0.88, 0.68], arm: [0.55, 0.72, 1], hiiCol: [1, 0.35, 0.45], incl: 0.25, roll: 0.5, phase: 0, fog: 0.15, comps: [{ x: 0.95, y: 0.55, s: 0.34, col: [1, 0.86, 0.6] }] },
      { arms: 2, pitch: 0.3, sharp: 1.2, brk: 0.7, bulgeR: 0.07, bulgeAmp: 1.1, diskAmp: 1.1, armAmp: 0.6, dust: 0.9, dustOff: 0.3, dustSharp: 1.5, hii: 2.8, core: [1, 0.78, 0.62], arm: [0.95, 0.72, 0.72], hiiCol: [1, 0.28, 0.3], incl: 1.5, roll: 0.9, phase: 1, fog: 0.3, plume: true, comps: [] },
      { kind: 'ring', bulgeR: 0.05, bulgeAmp: 1.3, core: [1, 0.85, 0.6], arm: [0.55, 0.72, 1], hiiCol: [1, 0.45, 0.72], hii: 1.6, dust: 0, incl: 0.55, roll: 0.3, phase: 0, fog: 0.1, comps: [{ x: -0.9, y: -0.55, s: 0.1, col: [0.9, 0.95, 1] }, { x: 0.85, y: 0.6, s: 0.08, col: [1, 0.92, 0.8] }] },
      { arms: 3, pitch: 0.3, sharp: 1.5, brk: 0.45, bulgeR: 0.08, bulgeAmp: 1.2, diskAmp: 0.65, armAmp: 1.15, dust: 0.6, dustOff: 0.55, dustSharp: 2, hii: 2.8, core: [1, 0.9, 0.75], arm: [0.6, 0.75, 1], hiiCol: [1, 0.35, 0.55], incl: 0.2, roll: 0, phase: 0.9, fog: 0.25, comps: [] }
    ];
    function galaxyTexture(X, size, seed) {
      var cv = document.createElement('canvas'); cv.width = cv.height = size;
      var cx = cv.getContext('2d'), id = cx.createImageData(size, size), d = id.data, tp = X.pitch, isRing = X.kind === 'ring';
      var ba = X.barAngle || 0, ca = Math.cos(ba), sa = Math.sin(ba), armIn = X.armIn === undefined ? 0.05 : X.armIn;
      for (var py = 0; py < size; py++) for (var px = 0; px < size; px++) {
        var x = (px + 0.5) / size * 2 - 1, y = (py + 0.5) / size * 2 - 1, r = Math.sqrt(x * x + y * y), o = (py * size + px) * 4, cr = 0, cg = 0, cb = 0;
        if (r < 1) {
          var th = Math.atan2(y, x);
          var n1 = fbm(x * 3.2 + seed, y * 3.2 + seed * 0.7, seed), n2 = fbm(x * 11 + seed * 2, y * 11 - seed, seed + 9);
          if (isRing) {
            var rg = Math.exp(-Math.pow((r - 0.58) / 0.055, 2)) * (0.55 + 0.9 * n1), rin = Math.exp(-Math.pow((r - 0.2) / 0.035, 2)) * (0.6 + 0.6 * n2);
            var spk = Math.pow(0.5 + 0.5 * Math.cos(9 * th + 4 * n1), 3) * sstep(0.2, 0.32, r) * (1 - sstep(0.5, 0.57, r)) * 0.45;
            var nuc = X.bulgeAmp * Math.exp(-Math.pow(r / X.bulgeR, 0.8) * 2.2), haze = 0.1 * Math.exp(-r / 0.4) * (0.7 + 0.5 * n1) * (1 - sstep(0.6, 0.66, r));
            var oldR = nuc + rin * 0.9 + haze, armsR = rg * 1.4 + spk, knotR = rg * sstep(0.55, 0.75, n2) * X.hii * 1.8 + spk * 0.2, fadeR = 1 - sstep(0.78, 1, r);
            cr = (X.core[0] * oldR + X.arm[0] * armsR + X.hiiCol[0] * knotR) * fadeR; cg = (X.core[1] * oldR + X.arm[1] * armsR + X.hiiCol[1] * knotR) * fadeR; cb = (X.core[2] * oldR + X.arm[2] * armsR + X.hiiCol[2] * knotR) * fadeR;
          } else {
            var ph = X.arms * (th - Math.log(r + 0.035) / tp) + X.phase;
            var as = Math.pow(0.5 + 0.5 * Math.cos(ph), X.sharp), env = sstep(armIn, armIn + 0.33, r) * (1 - sstep(0.78, 1, r));
            if (X.brk) as *= (1 - X.brk) + X.brk * sstep(0.35, 0.75, n2);
            var bulge = X.bulgeAmp * Math.exp(-Math.pow(r / X.bulgeR, 0.75) * 2.4), disk = X.diskAmp * Math.exp(-r / 0.33) * (0.75 + 0.5 * n1), old = bulge + disk;
            if (X.bar) { var xb = x * ca + y * sa, yb = -x * sa + y * ca; old += X.bar * Math.exp(-Math.pow(Math.abs(xb) / X.barLen, 3)) * Math.exp(-Math.pow(yb / (X.barLen * 0.2), 2)) * (0.8 + 0.4 * n1); }
            var arms = as * env * (0.45 + 0.9 * n1) * X.armAmp;
            var dw = Math.pow(0.5 + 0.5 * Math.cos(ph - X.dustOff), X.dustSharp);
            var dust = X.dust * dw * sstep(0.06, 0.32, r) * (1 - sstep(0.72, 1, r)) * (0.35 + 1.1 * n2);
            if (X.dustBand) dust += X.dustBand * Math.exp(-Math.pow((r - X.dustBandR) / X.dustBandW, 2)) * (0.6 + 0.8 * n2);
            dust = Math.min(1, dust);
            var knots = Math.pow(as, 2.5) * env * sstep(0.6, 0.8, n2) * X.hii, blueK = as * env * sstep(0.58, 0.74, n1 + 0.1 * n2) * 0.9;
            var fog = X.fog * Math.exp(-r / 0.55) * 0.32;
            cr = X.core[0] * (old + fog) + X.arm[0] * (arms + blueK * 0.6) + X.hiiCol[0] * knots * 1.7;
            cg = X.core[1] * (old + fog) + X.arm[1] * (arms + blueK * 0.6) + X.hiiCol[1] * knots * 1.7;
            cb = X.core[2] * (old + fog) + X.arm[2] * (arms + blueK * 0.6) + X.hiiCol[2] * knots * 1.7;
            var dk = 1 - dust * (X.dustBand ? 0.97 : 0.8), fade = 1 - sstep(0.66, 1, r);
            cr *= dk * fade; cg *= dk * fade * 0.97; cb *= dk * fade * 0.92;
          }
          cr = 1 - Math.exp(-cr * 1.45); cg = 1 - Math.exp(-cg * 1.45); cb = 1 - Math.exp(-cb * 1.45);
        }
        d[o] = cr * 255; d[o + 1] = cg * 255; d[o + 2] = cb * 255; d[o + 3] = 255;
      }
      cx.putImageData(id, 0, 0);
      var tex = new THREE.CanvasTexture(cv); tex.generateMipmaps = false; tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    }
    /* individual stars in true 3D: a round bulge, a thick disc that follows the arms (or the ring), a halo and star clusters */
    function galaxyStars(X, N, D, thick, dust) {
      var n = 0, tries = 0, isRing = X.kind === 'ring', armIn = X.armIn === undefined ? 0.05 : X.armIn, ba = X.barAngle || 0, ca = Math.cos(ba), sa = Math.sin(ba);
      while (n < N && tries < N * 60) {
        tries++;
        var col, size, r, th = R() * 6.2832, as = 0;
        if (R() < (X.bulgeR > 0.2 ? 0.3 : 0.24)) {
          var br = Math.abs(R() + R() + R() - 1.5) * X.bulgeR * 1.8 * D, a1 = R() * 6.2832, c1 = R() * 2 - 1, s1 = Math.sqrt(1 - c1 * c1);
          col = [X.core[0] * (0.8 + 0.3 * R()), X.core[1] * (0.8 + 0.3 * R()), X.core[2] * (0.75 + 0.3 * R())];
          dust.add(Math.cos(a1) * s1 * br, Math.sin(a1) * s1 * br, c1 * br * 0.85, col, R() < 0.03 ? 2.8 + R() * 2.2 : 0.7 + R() * 1.2, 0); n++; continue;
        }
        if (isRing) {
          var pick = R();
          if (pick < 0.6) r = 0.58 + (R() + R() + R() - 1.5) * 0.07; else if (pick < 0.75) r = 0.2 + (R() + R() - 1) * 0.05; else r = 0.2 + R() * 0.38;
          if (pick >= 0.75 && R() > Math.pow(0.5 + 0.5 * Math.cos(9 * th), 3) + 0.15) continue;
          col = pick < 0.6 ? (R() < 0.18 * X.hii ? X.hiiCol : mix(X.arm, [1, 1, 1], 0.3 + 0.4 * R())) : mix(X.core, [1, 0.95, 0.9], 0.3 + 0.4 * R());
        } else {
          r = Math.min(0.98, -0.33 * Math.log(1 - R() * 0.97));
          var ph = X.arms * (th - Math.log(r + 0.035) / X.pitch) + X.phase, env = sstep(armIn, armIn + 0.33, r) * (1 - sstep(0.78, 1, r));
          as = Math.pow(0.5 + 0.5 * Math.cos(ph), X.sharp);
          var dens = 0.22 + 0.95 * as * env, barHere = 0;
          if (X.bar) { var xb = Math.cos(th) * r * ca + Math.sin(th) * r * sa, yb = -Math.cos(th) * r * sa + Math.sin(th) * r * ca; barHere = Math.exp(-Math.pow(Math.abs(xb) / X.barLen, 3)) * Math.exp(-Math.pow(yb / (X.barLen * 0.2), 2)); dens += X.bar * barHere * 0.9; }
          if (R() * 1.2 > dens) continue;
          var u = R();
          if (barHere > 0.3) col = mix(X.core, [1, 0.95, 0.85], 0.3 * R());
          else if (u < 0.06 * X.hii + 0.02 && as > 0.4) col = [X.hiiCol[0], X.hiiCol[1], X.hiiCol[2]];
          else if (as * env > 0.25) col = mix(X.arm, [1, 1, 1], 0.35 + 0.4 * R());
          else col = mix(X.core, [1, 0.95, 0.9], 0.3 + 0.4 * R());
        }
        dust.add(Math.cos(th) * r * D, Math.sin(th) * r * D, (R() + R() - 1) * thick * (0.4 + Math.exp(-r * 3.5) * 1.5), col, R() < 0.03 ? 2.8 + R() * 2.2 : 0.7 + R() * 1.2, 0); n++;
      }
    }
    function haloStars(X, N, D, dust) {
      for (var k = 0; k < N; k++) {
        var rr = D * (0.18 + 0.75 * Math.pow(R(), 1.6)), a1 = R() * 6.2832, c1 = R() * 2 - 1, s1 = Math.sqrt(1 - c1 * c1);
        dust.add(Math.cos(a1) * s1 * rr, Math.sin(a1) * s1 * rr, c1 * rr * 0.8, mix(X.core, [0.8, 0.8, 0.9], 0.4 + 0.3 * R()), 0.6 + R() * 0.9, 0);
      }
      for (var g = 0; g < 7; g++) { /* globular clusters */
        var gr = D * (0.4 + 0.45 * R()), ga = R() * 6.2832, gc = R() * 2 - 1, gs = Math.sqrt(1 - gc * gc), gx = Math.cos(ga) * gs * gr, gy = Math.sin(ga) * gs * gr, gz = gc * gr * 0.8;
        for (var q = 0; q < 26; q++) dust.add(gx + (R() + R() - 1) * D * 0.025, gy + (R() + R() - 1) * D * 0.025, gz + (R() + R() - 1) * D * 0.025, [1, 0.9, 0.7], 0.8 + R() * 1.4, 0);
      }
    }
    function plumeStars(N, D, dust) { /* gas streaming out above and below a starburst galaxy */
      for (var k = 0; k < N; k++) {
        var sg = R() < 0.5 ? -1 : 1, u = Math.pow(R(), 0.8), w = (0.03 + u * 0.14) * D;
        dust.add((R() + R() + R() - 1.5) * w * 1.3, (R() + R() + R() - 1.5) * w * 0.5, sg * (0.06 + u * 0.85) * D, mix([1, 0.3, 0.35], [1, 0.72, 0.62], R() * (1 - u)), 1.1 + R() * 2.4, 0);
      }
    }
    /* each galaxy dims and brightens through one gain value: planes and glows through their color, stars through a uniform */
    function makeGainMat(gainU) {
      return new THREE.ShaderMaterial({ uniforms: { uTime: tU, uPx: { value: DPR }, uAudio: audU, uGate: { value: 0 }, uGain: gainU },
        vertexShader: DUST_VS.replace('uniform float uGate;', 'uniform float uGate; uniform float uGain;').replace('vA = a*tw*(0.85+uAudio*0.7);', 'vA = a*tw*(0.85+uAudio*0.7)*uGain;'),
        fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    }
    function applyGain(list, g, tint) {
      var t0 = tint ? tint[0] : 1, t1 = tint ? tint[1] : 1, t2 = tint ? tint[2] : 1;
      for (var q = 0; q < list.length; q++) list[q].m.color.setRGB(list[q].b[0] * g * t0, list[q].b[1] * g * t1, list[q].b[2] * g * t2);
    }
    /* a stack of translucent discs gives real depth: they separate as you orbit, like a thick spiral disc */
    function addLayers(spin, tex, D, count, halfT, gl) {
      var ws = [], sum = 0, k, tt;
      for (k = 0; k < count; k++) { tt = count === 1 ? 0 : (k / (count - 1)) * 2 - 1; ws.push(Math.exp(-tt * tt * 1.5)); sum += ws[k]; }
      for (k = 0; k < count; k++) {
        tt = count === 1 ? 0 : (k / (count - 1)) * 2 - 1;
        var m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), kk = 1.1 * ws[k] / sum;
        gl.push({ m: m, b: [kk, kk, kk] });
        var pl = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m); pl.scale.setScalar(D * (1 - 0.04 * Math.abs(tt))); pl.position.z = tt * halfT; pl.rotation.z = tt * 0.035; spin.add(pl);
      }
    }
    function addGlows(spin, X, D, gl, bulgeOpacity) {
      var bm = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      gl.push({ m: bm, b: [X.core[0] * bulgeOpacity, X.core[1] * bulgeOpacity, X.core[2] * bulgeOpacity] });
      var bs = new THREE.Sprite(bm); bs.scale.setScalar(D * (X.bulgeR * 3 + 0.3)); spin.add(bs);
      if (X.plume) [-1, 1].forEach(function (sg) { var pm = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); gl.push({ m: pm, b: [0.34, 0.09, 0.12] }); var ps = new THREE.Sprite(pm); ps.position.set(0, 0, sg * D * 0.38); ps.scale.setScalar(D * 0.55); spin.add(ps); });
      X.comps.forEach(function (c) {
        var cm = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        gl.push({ m: cm, b: [c.col[0] * 0.85, c.col[1] * 0.85, c.col[2] * 0.85] });
        var cs = new THREE.Sprite(cm); cs.position.set(c.x * D, c.y * D, 0); cs.scale.setScalar(c.s * D * 1.6); spin.add(cs);
      });
    }
    function addPlanet(i, parent, pos, radius) {
      var P = PLN[i], X = GX[i], gainU = { value: 1 }, gl = [];
      var grp = new THREE.Group(); grp.position.copy(pos); parent.add(grp); parent.updateMatrixWorld(true); grp.lookAt(0, 3, 13);
      var DISC = radius * 1.75, halfT = DISC * 0.07;
      var tiltG = new THREE.Group(); tiltG.rotation.set(X.incl, 0, X.roll, 'ZXY'); grp.add(tiltG);
      var spin = new THREE.Group(); tiltG.add(spin);
      addLayers(spin, galaxyTexture(X, phone ? 192 : 256, i * 7.3 + 1), DISC, phone ? 2 : 3, halfT, gl);
      addGlows(spin, X, DISC, gl, 0.4);
      var sd = new Dust(); galaxyStars(X, phone ? 520 : 900, DISC, halfT * 1.4, sd); haloStars(X, phone ? 140 : 260, DISC, sd); if (X.plume) plumeStars(phone ? 420 : 800, DISC, sd);
      spin.add(sd.build(makeGainMat(gainU)));
      var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(P.a), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }));
      halo.scale.setScalar(radius * 3.8); grp.add(halo);
      var mark = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 }));
      mark.scale.setScalar(radius * 3.4); grp.add(mark);
      var lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.innerHTML = '<b></b><span class="mono nm">' + SCENES[i].short + '</span><span class="mono real">' + REAL[i].name + '</span>'; labelsEl.appendChild(lbl);
      var L = { i: i, grp: grp, mesh: tiltG, spin: spin, gl: gl, gainU: gainU, halo: halo, mark: mark, lbl: lbl, link: null, r: DISC * 0.8, ph: R() * 6.28, hover: 0, sx: 0, sy: 0, rpx: 30, vis: false, depth: 0, dir: pos.clone().normalize() };
      if (i !== HOLY) { /* a thread of light from the robed figure, shown once this galaxy has been visited */
        var ld = new Dust(); for (var q = 1; q < 40; q++) { var f = q / 40; ld.add(pos.x * f, 0.7 + (pos.y - 0.7) * f, pos.z * f, mix(GOLD, DIM, 0.25), 1.1, 0); }
        L.link = ld.build(); L.link.visible = false; parent.add(L.link);
      }
      lights.push(L); return L;
    }
    for (var pi = 0; pi < 8; pi++) {
      var yy = 1 - (pi + 0.5) / 8 * 2, rad = Math.sqrt(1 - yy * yy), th = pi * 2.399963;
      addPlanet(pi, orbit, new THREE.Vector3(Math.cos(th) * rad, yy, Math.sin(th) * rad).multiplyScalar(RP), (0.52 + 0.07 * Math.sin(pi * 2.1)) * (phone ? 0.82 : 1));
    }
    addPlanet(HOLY, gateGroup, new THREE.Vector3(0, 3.1, 0), phone ? 0.6 : 0.7);
    /* the robed figure is the source of light: a warm glow, and a beam of power that flows into a galaxy you choose */
    var fglow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe2a8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.3 }));
    fglow.scale.setScalar(phone ? 7 : 8.5); fglow.position.set(0, 0.5, -0.5); scene.add(fglow);
    var BN = 160, beamGeo = new THREE.BufferGeometry(), beamOff = [], beamSrc = new THREE.Vector3(0, 0.9, 0.25);
    beamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BN * 3), 3));
    for (var bq = 0; bq < BN; bq++) beamOff.push(0.15 + R() * 0.5);
    var beam = new THREE.Points(beamGeo, new THREE.PointsMaterial({ size: 0.22, map: glowTex, color: 0xffd27d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    beam.frustumCulled = false; beam.visible = false; scene.add(beam);

    /* globe lattice: great circles and dots so the turning sphere reads in 3D */
    var lat = new Dust(), li;
    [[0, 0], [1.0472, 0.5], [2.0944, -0.4]].forEach(function (tt) {
      for (li = 0; li < 340 * sc; li++) { var an3 = li / (340 * sc) * 6.2832, v = new THREE.Vector3(Math.cos(an3), Math.sin(an3), 0).multiplyScalar(RP); v.applyAxisAngle(new THREE.Vector3(0, 1, 0), tt[0]); v.applyAxisAngle(new THREE.Vector3(1, 0, 0), tt[1]); lat.add(v.x, v.y, v.z, mix(GOLD, DIM, 0.35), 1.2, 0); }
    });
    for (li = 0; li < 420 * sc; li++) { var v2 = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(RP * 1.01); lat.add(v2.x, v2.y, v2.z, mix(DIM, WHITE, R() * 0.5), 1.0, 0); }
    orbit.add(lat.build());

    /* ---------- Galaxies (one per scene) ---------- */
    var GAL_VS = [
      'attribute float aR; attribute float aA; attribute float aH; attribute float aS;',
      'uniform float uTime; uniform float uPx; uniform float uAudio; uniform vec3 uCore; uniform vec3 uRim; varying vec3 vColor; varying float vA;',
      'void main(){',
      '  float ang = aA + uTime*0.16/(0.5+aR*0.35);',
      '  vec3 p = vec3(cos(ang)*aR, (aH-0.5)*0.6*(1.0-aR/6.8), sin(ang)*aR);',
      '  float k = clamp(aR/6.2,0.0,1.0);',
      '  vColor = mix(uCore, uRim, pow(k,0.65))*(0.9+(1.0-k)*0.8);',
      '  vA = (0.62+0.22*(1.0-k))*(0.8+0.2*sin(uTime*2.0+aH*60.0));',
      '  vec4 mv = modelViewMatrix*vec4(p,1.0);',
      '  gl_PointSize = min(aS*uPx*(9.0/-mv.z)*(1.0+(1.0-k)*0.5+uAudio*0.4), 10.0*uPx);',
      '  gl_Position = projectionMatrix*mv;',
      '}'
    ].join('\n');
    var galaxies = {}, curG = -1;
    var SPIKE = (function () { var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d'); var g = x.createRadialGradient(64, 64, 0, 64, 64, 22); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); [[0, 1], [1, 0]].forEach(function (a) { var l = x.createLinearGradient(64 - a[0] * 64, 64 - a[1] * 64, 64 + a[0] * 64, 64 + a[1] * 64); l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, 'rgba(255,255,255,0.9)'); l.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = l; x.fillRect(a[1] ? 0 : 62, a[0] ? 0 : 62, a[1] ? 128 : 4, a[0] ? 128 : 4); }); return new THREE.CanvasTexture(c); })();
    function buildGalaxy(i) {
      var P = PLN[i], X = GX[i], DI = 7.2, gainU = { value: 0.2 }, gl = [];
      var grp = new THREE.Group(); grp.visible = false; gScene.add(grp);
      var tiltG = new THREE.Group(); tiltG.rotation.set(X.incl, 0, X.roll, 'ZXY'); grp.add(tiltG);
      var spin = new THREE.Group(); tiltG.add(spin);
      var halfT = DI * 0.05;
      addLayers(spin, galaxyTexture(X, phone ? 512 : 768, i * 7.3 + 1), DI, phone ? 6 : 9, halfT, gl);
      addGlows(spin, X, DI, gl, 0.5);
      var sd = new Dust(); galaxyStars(X, phone ? 5500 : 11000, DI, halfT * 2.0, sd); haloStars(X, phone ? 900 : 1800, DI, sd); if (X.plume) plumeStars(phone ? 3500 : 7000, DI, sd);
      spin.add(sd.build(makeGainMat(gainU)));
      /* distant field stars with diffraction spikes, like a telescope image */
      var STAR_COLS = [[1, 0.95, 0.8], [0.72, 0.82, 1], [1, 0.72, 0.62], [0.88, 1, 0.9], [1, 0.82, 0.95]];
      var field = new Dust();
      for (var fs = 0; fs < 1100 * sc; fs++) { var v = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(16 + R() * 14); field.add(v.x, v.y, v.z, STAR_COLS[(R() * 5) | 0], 0.7 + R() * 1.6, 0); }
      grp.add(field.build());
      for (var fl = 0; fl < (phone ? 14 : 24); fl++) { var cc = STAR_COLS[(R() * 5) | 0], v2 = new THREE.Vector3(R() - 0.5, (R() - 0.5) * 0.7, R() - 0.5).normalize().multiplyScalar(9 + R() * 14), sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SPIKE, color: new THREE.Color(cc[0], cc[1], cc[2]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45 + R() * 0.4 })); sp.position.copy(v2); sp.scale.setScalar(0.35 + R() * 0.75); grp.add(sp); }
      var wave = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, color: 0xffe2a8, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); grp.add(wave);
      return (galaxies[i] = { grp: grp, tiltG: tiltG, spin: spin, DI: DI, gl: gl, gainU: gainU, gain: 0.2, wave: wave, waveT: 0, pal: [hex(P.a), hex(P.b), [1, 1, 1], hex('#ffe9b0')] });
    }
    function getGalaxy(i) { return galaxies[i] || buildGalaxy(i); }

    /* ---------- Camera, layout and controls ---------- */
    var W = 1, H = 1, worldScale = 1, distBase = 12.4, elBase = 0.27, targetY = -0.1, zoom = 1, zoomT = 1, offX = 0, offY = 0;
    function layout() {
      phone = phoneMode(); html.className = phone ? 'mode-phone' : 'mode-desk';
      W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); camera.aspect = W / H;
      if (phone) { worldScale = 1; distBase = 14.5; elBase = 0.4; targetY = -0.3; }
      else { worldScale = 1; distBase = (W / H < 1.45) ? 13.5 : 12.4; elBase = 0.27; targetY = -0.1; }
      camera.updateProjectionMatrix();
    }
    layout(); window.addEventListener('resize', layout);

    var mode = 'cosmos', tr = null, zi = 0, trIdx = -1;
    var camAz = 0, camEl = elBase, azVel = 0, elVel = 0, idleAt = performance.now(), fa = { dAz: 0, dEl: 0 };
    var gAz = 0, gEl = 0.34, gVel = reduce ? 0 : 0.07, gDist = phone ? 19 : 15.5, gZoom = 1, gZoomT = 1;
    var gTarget = new THREE.Vector3(), gGoal = new THREE.Vector3(), gFocusOn = false, zf = -1;
    var cosmosHint = hintEl.textContent, galaxyHint = phone ? 'Drag to look around. Tap to zoom into a spot. Pinch to zoom.' : 'Drag to look around. Click to zoom into a spot. Scroll to zoom.';
    var focusAmt = 0, focusPos = new THREE.Vector3(), curTarget = new THREE.Vector3();
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3(), v3 = new THREE.Vector3(), v4 = new THREE.Vector3();
    var down = null, dragging = false, hoverIdx = -1, pointerIn = false, pxn = 0.5, pyn = 0.5, ptrs = {}, pinch0 = 0;
    function wrapPi(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }

    function pickLight(x, y, minRad) {
      var best = -1, bd = 1e9;
      for (var i = 0; i < lights.length; i++) {
        var L = lights[i]; if (!L.vis) continue; var rad = Math.max(L.rpx * 1.25, minRad), dx = L.sx - x, dy = L.sy - y, d2 = dx * dx + dy * dy;
        if (d2 < rad * rad && d2 / (rad * rad) < bd) { bd = d2 / (rad * rad); best = i; }
      }
      return best;
    }
    function worldOf(L, out) { return out.setFromMatrixPosition(L.grp.matrixWorld); }
    function paintLight(L) {
      var f = !!found[L.i];
      L.lbl.querySelector('b').textContent = f ? SCENES[L.i].title : '';
      L.lbl.className = 'lbl' + (f ? ' found' : '');
      L.mark.material.opacity = f ? 0.95 : 0;
    }
    function ease(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    function setWarp(i) { var P = PLN[i]; warpEl.style.setProperty('--w1', P.a); warpEl.style.setProperty('--w2', P.b); }
    function closeOther() { if (panelKind && panelKind !== 'scene') hidePanel(); }

    function openPlanet(i) {
      if (tr) return;
      var s = SCENES[i];
      if (mode === 'galaxy') { goGalaxy(i); return; }
      if (s.holy && !unlocked) { selected = i; openPanel('scene', i); return; }
      closeOther(); selected = -1; trIdx = i; setWarp(i); azVel = elVel = 0;
      /* swing the camera round to face the planet from outside while flying in */
      var d = lights[i].dir, azT = Math.atan2(d.x, d.z), elT = Math.max(-1.0, Math.min(1.0, Math.asin(Math.max(-1, Math.min(1, d.y)))));
      fa.dAz = wrapPi(azT - camAz); fa.dEl = elT - camEl;
      tr = { type: 'enter', i: i, t0: performance.now(), sw: false };
    }
    function showGalaxy(i) {
      curG = i; mode = 'galaxy';
      Object.keys(galaxies).forEach(function (k) { galaxies[k].grp.visible = false; });
      var G = getGalaxy(i); G.grp.visible = true; setWarp(i); G.gain = reduce ? 1 : 0.18; G.waveT = performance.now();
      var first = markFound(i); selected = i; openPanel('scene', i); paintLight(lights[i]); labelsEl.style.display = 'none';
      gAz = 0; gEl = 0.12; gZoomT = gZoom = 1; gFocusOn = false; gGoal.set(0, 0, 0); gTarget.set(0, 0, 0);
      hintEl.textContent = galaxyHint; hintEl.classList.remove('gone'); clearTimeout(showGalaxy.h); showGalaxy.h = setTimeout(function () { hintEl.classList.add('gone'); }, 7000);
      if (first) { FWg.burst(0, 2.2, 0, 1.3, PAL_COVER, !!SCENES[i].lift); try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {} toast(SCENES[i].holy ? 'You are in the Holy Place' : 'The light fills this galaxy'); }
      else toast(SCENES[i].short);
    }
    function showCosmos() { mode = 'cosmos'; hintEl.textContent = cosmosHint; hintEl.classList.add('gone'); labelsEl.style.display = ''; if (curG >= 0 && galaxies[curG]) galaxies[curG].grp.visible = false; }
    function exitGalaxy() {
      if (tr || mode !== 'galaxy') return;
      hidePanel(); trIdx = curG; setWarp(curG);
      tr = { type: 'exit', i: curG, t0: performance.now(), sw: false };
    }
    function goGalaxy(j) {
      if (tr || j < 0 || j > HOLY) return;
      if (mode !== 'galaxy') { openPlanet(j); return; }
      if (SCENES[j].holy && !unlocked) { toast('The Holy Place is sealed'); return; }
      if (j === curG) return;
      setWarp(j); tr = { type: 'swap', i: j, t0: performance.now(), sw: false };
    }
    function step(d) { if (mode !== 'galaxy') return; var j = curG + d; if (j >= 0 && j <= HOLY) goGalaxy(j); }
    function finale() {
      pendingFinale = false; gateT = 1;
      setTimeout(function () { toast('The inner court is open'); }, 700);
      burstT = tU.value; figU.uBurstC.value.set(0.08, 1.26, 0.2);
      for (var k = 0; k < 9; k++) (function (k) { setTimeout(function () { FW.burst((R() - 0.5) * 7, 0.2 + R() * 3.4, (R() - 0.7) * 2.5, 1.5, k % 2 ? PAL_COVER : PAL_GOLD, false); }, 300 + k * 330); })(k);
    }
    world = {
      openPlanet: openPlanet, goGalaxy: goGalaxy, exitGalaxy: exitGalaxy, step: step,
      inGalaxy: function () { return mode === 'galaxy' || (tr && tr.type === 'enter'); },
      onEnter: function () { idleAt = performance.now(); setTimeout(function () { hintEl.classList.add('gone'); }, 9000); }
    };

    function galaxyTap(x, y) {
      if (gFocusOn) { gFocusOn = false; gGoal.set(0, 0, 0); gZoomT = 1; return; }
      var G = galaxies[curG]; if (!G) return;
      var q = new THREE.Quaternion(); G.tiltG.getWorldQuaternion(q);
      var n = new THREE.Vector3(0, 0, 1).applyQuaternion(q), pl = new THREE.Plane(n, 0), hp = new THREE.Vector3();
      ray.setFromCamera(new THREE.Vector2(x / W * 2 - 1, -(y / H * 2 - 1)), camera);
      if (ray.ray.intersectPlane(pl, hp) && hp.length() < G.DI * 1.15) { gGoal.copy(hp); gFocusOn = true; gZoomT = 0.28; }
    }
    function pdist() { var k = Object.keys(ptrs); if (k.length < 2) return 0; var a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; }
    canvas.addEventListener('pointerdown', function (e) {
      if (!entered || tr) return;
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; idleAt = performance.now(); hintEl.classList.add('gone');
      if (Object.keys(ptrs).length === 2) { pinch0 = pdist(); down = null; dragging = false; return; }
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY }; dragging = false; azVel = elVel = 0; gVel = 0; pointerIn = true; pxn = e.clientX / W; pyn = e.clientY / H;
    });
    canvas.addEventListener('pointermove', function (e) {
      if (ptrs[e.pointerId]) { ptrs[e.pointerId].x = e.clientX; ptrs[e.pointerId].y = e.clientY; }
      pxn = e.clientX / W; pyn = e.clientY / H; pointerIn = true; idleAt = performance.now();
      if (Object.keys(ptrs).length === 2) {
        var d = pdist(); var f = pinch0 / d; pinch0 = d;
        if (mode === 'cosmos') zoomT = Math.max(0.12, Math.min(1.3, zoomT * f)); else gZoomT = Math.max(0.1, Math.min(1.3, gZoomT * f));
        return;
      }
      if (down) {
        if (!dragging && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { dragging = true; canvas.classList.add('drag'); }
        if (dragging) {
          var dx = e.clientX - down.lx, dy = e.clientY - down.ly;
          if (mode === 'cosmos') { camAz -= dx * 0.0062; camEl = Math.max(-1.35, Math.min(1.35, camEl + dy * 0.0052)); azVel = -dx * 0.0062 * 50; elVel = dy * 0.0052 * 50; }
          else { gAz -= dx * 0.006; gEl = Math.max(-1.1, Math.min(1.25, gEl + dy * 0.004)); gVel = -dx * 0.006 * 50; }
          down.lx = e.clientX; down.ly = e.clientY;
        }
      } else if (e.pointerType === 'mouse' && entered && mode === 'cosmos' && !tr) {
        hoverIdx = pickLight(e.clientX, e.clientY, 30); canvas.classList.toggle('hover', hoverIdx >= 0);
      }
    });
    function up(e) {
      delete ptrs[e.pointerId];
      if (!down) return;
      var wasDrag = dragging; down = null; dragging = false; canvas.classList.remove('drag');
      if (e.type === 'pointerup' && !wasDrag && mode === 'cosmos' && !tr) { var i = pickLight(e.clientX, e.clientY, phone ? 40 : 30); if (i >= 0) openPlanet(i); }
      else if (e.type === 'pointerup' && !wasDrag && mode === 'galaxy' && !tr) galaxyTap(e.clientX, e.clientY);
      if (e.pointerType !== 'mouse') pointerIn = false;
    }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', function () { if (!down) { pointerIn = false; hoverIdx = -1; canvas.classList.remove('hover'); } });
    canvas.addEventListener('wheel', function (e) { e.preventDefault(); idleAt = performance.now(); if (mode === 'cosmos') zoomT = Math.max(0.12, Math.min(1.3, zoomT * Math.exp(e.deltaY * 0.0014))); else gZoomT = Math.max(0.1, Math.min(1.3, gZoomT * Math.exp(e.deltaY * 0.0014))); }, { passive: false });
    window.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'BUTTON' || mode !== 'cosmos' || tr) return; idleAt = performance.now();
      if (e.key === 'ArrowLeft') azVel = -1.2; if (e.key === 'ArrowRight') azVel = 1.2; if (e.key === 'ArrowUp') elVel = 1.0; if (e.key === 'ArrowDown') elVel = -1.0;
    });

    /* ---------- Frame loop ---------- */
    var dtSm = 0.016, magKeep = -1, t0 = performance.now(), last = t0, assemble0 = t0, gateT = 0, burstT = -1e9, warpA = 0, lastG = 0;
    function frame(nowMs) {
      requestAnimationFrame(frame);
      if (document.hidden) return;
      var dt = Math.min((nowMs - last) / 1000, 0.05); last = nowMs; dtSm += (dt - dtSm) * 0.2; dt = dtSm; var t = (nowMs - t0) / 1000; tU.value = t;
      var hasPanel = panelKind !== null;

      /* audio */
      var e = 0;
      if (soundOn && an) {
        an.getByteFrequencyData(bins); var n = 10; for (var bi = 1; bi <= n; bi++) e += bins[bi]; e = e / n / 255;
        if (e > ema * 1.22 + 0.05 && nowMs - lastBeat > 260) {
          lastBeat = nowMs;
          if (mode === 'cosmos') FW.burst((R() - 0.5) * 6, 0.4 + R() * 3, (R() - 0.5) * 3, 0.8 + e, PAL_GOLD, false);
          else FWg.burst((R() - 0.5) * 9, 0.5 + R() * 4, (R() - 0.5) * 6, 0.9 + e, galaxies[curG] ? galaxies[curG].pal : PAL_GOLD, false);
        }
        ema = ema * 0.94 + e * 0.06;
      }
      audioE += (e - audioE) * 0.25; audU.value = audioE;
      if (mode === 'galaxy' && nowMs - lastG > 2800 && !reduce) { lastG = nowMs; FWg.burst((R() - 0.5) * 8, 0.8 + R() * 4, (R() - 0.5) * 5, 1.0, galaxies[curG].pal, !!SCENES[curG].lift); }

      var trS = (tr && tr.type === 'enter' && !tr.sw) ? (nowMs - tr.t0) / 1000 : -1;
      /* transitions */
      if (tr) {
        var s = (nowMs - tr.t0) / 1000;
        if (tr.type === 'enter') {
          zi = ease(s / 0.95); warpA = ease((s - 0.6) / 0.35);
          if (s >= 0.95 && !tr.sw) { tr.sw = true; showGalaxy(tr.i); zi = 0; }
          if (tr.sw) { warpA = 1 - ease((s - 0.95) / 0.7); if (s >= 1.65) { tr = null; warpA = 0; } }
        } else if (tr.type === 'exit') {
          if (!tr.sw) { warpA = ease(s / 0.55); if (s >= 0.55) { tr.sw = true; showCosmos(); zi = 1; } }
          if (tr.sw) { zi = 1 - ease((s - 0.55) / 1.0); warpA = 1 - ease((s - 0.55) / 0.55); if (s >= 1.6) { tr = null; warpA = 0; zi = 0; selected = -1; trIdx = -1; if (pendingFinale) finale(); } }
        } else if (tr.type === 'swap') {
          if (!tr.sw) { warpA = ease(s / 0.4); if (s >= 0.4) { tr.sw = true; showGalaxy(tr.i); } }
          if (tr.sw) { warpA = 1 - ease((s - 0.4) / 0.5); if (s >= 0.95) { tr = null; warpA = 0; } }
        }
      }
      warpEl.style.opacity = warpA.toFixed(3);

      /* panel offsets for both modes */
      var tOffX = 0, tOffY = 0;
      if (hasPanel) { if (phone) tOffY = Math.min(innerHeight * 0.64, 560) * 0.6; else tOffX = Math.min(460, W * 0.4) / 2; }
      offX += (tOffX - offX) * Math.min(1, dt * 4); offY += (tOffY - offY) * Math.min(1, dt * 4);

      if (mode === 'galaxy') {
        gAz += gVel * dt; gVel *= Math.pow(0.15, dt); if (!down && Math.abs(gVel) < 0.07 && !reduce) gVel += (0.07 - gVel) * Math.min(1, dt * 0.5);
        gZoom += (gZoomT - gZoom) * Math.min(1, dt * 4);
        var Gg = galaxies[curG];
        gTarget.lerp(gGoal, Math.min(1, dt * 4));
        if (Gg) {
          Gg.spin.rotation.z += dt * 0.012;
          Gg.gain += (1 - Gg.gain) * Math.min(1, dt * 1.3); applyGain(Gg.gl, Gg.gain); Gg.gainU.value = Gg.gain;
          var wt = (nowMs - Gg.waveT) / 1800;
          if (wt >= 0 && wt < 1) { Gg.wave.material.opacity = (1 - wt) * 0.7; Gg.wave.scale.setScalar(1 + wt * 34); } else Gg.wave.material.opacity = 0;
        }
        var d2 = gDist * gZoom;
        camera.position.set(gTarget.x + Math.sin(gAz) * Math.cos(gEl) * d2, gTarget.y + Math.sin(gEl) * d2, gTarget.z + Math.cos(gAz) * Math.cos(gEl) * d2);
        camera.up.set(0, 1, 0); camera.lookAt(gTarget);
        if (Math.abs(offX) + Math.abs(offY) > 0.5) camera.setViewOffset(W, H, offX, offY, W, H); else camera.clearViewOffset();
        camera.updateProjectionMatrix();
        renderer.render(gScene, camera);
        return;
      }

      /* ---- cosmos: the camera flies around the figure and its planets ---- */
      camAz += azVel * dt; camEl = Math.max(-1.35, Math.min(1.35, camEl + elVel * dt));
      if (Math.abs(camEl) >= 1.35) elVel = 0;
      azVel *= Math.pow(0.1, dt); elVel *= Math.pow(0.1, dt);
      if (!down && !hasPanel && !tr && !reduce && nowMs - idleAt > 3500) azVel += (0.07 - azVel) * Math.min(1, dt * 0.6);
      zoom += (zoomT - zoom) * Math.min(1, dt * 4);
      var wantFocus = (hasPanel && selected >= 0) ? 1 : 0; focusAmt += (wantFocus - focusAmt) * Math.min(1, dt * 3);
      var base = new THREE.Vector3(0, targetY, 0);
      if (selected >= 0 && lights[selected] && !tr) { worldOf(lights[selected], v3); focusPos.lerp(v3, Math.min(1, dt * 5)); curTarget.copy(base).lerp(focusPos, focusAmt * 0.5); }
      else curTarget.copy(base);
      var dist = distBase * zoom * (1 - focusAmt * 0.15);
      var zc = ease((0.55 - zoom) / 0.43);
      if (zc > 0.03 && !tr) {
        if (zf < 0 || zc < 0.3) {
          var cx0 = (phone || !pointerIn) ? W / 2 : pxn * W, cy0 = (phone || !pointerIn) ? H * 0.5 : pyn * H, bi0 = -1, bd0 = 1e18;
          for (var qi = 0; qi < lights.length; qi++) { var Lq = lights[qi]; if (!Lq.vis) continue; var dq = (Lq.sx - cx0) * (Lq.sx - cx0) + (Lq.sy - cy0) * (Lq.sy - cy0); if (dq < bd0) { bd0 = dq; bi0 = qi; } }
          if (bi0 >= 0) zf = bi0;
        }
        if (zf >= 0) { worldOf(lights[zf], v3); curTarget.lerp(v3, zc * 0.93); dist = Math.max(dist, lights[zf].r * 2.1); }
      } else if (zc <= 0.03) zf = -1;
      if ((tr && trIdx >= 0) || zi > 0) {
        var Lz = lights[trIdx >= 0 ? trIdx : 0]; scene.updateMatrixWorld(true); worldOf(Lz, v3);
        curTarget.lerp(v3, zi); dist = dist * (1 - zi) + Lz.r * 3.6 * zi;
      }
      var eAz = camAz + fa.dAz * zi, eEl = Math.max(-1.35, Math.min(1.35, camEl + fa.dEl * zi));
      camera.position.set(curTarget.x + Math.sin(eAz) * Math.cos(eEl) * dist, curTarget.y + Math.sin(eEl) * dist, curTarget.z + Math.cos(eAz) * Math.cos(eEl) * dist);
      camera.up.set(0, 1, 0); camera.lookAt(curTarget);
      if (Math.abs(offX) + Math.abs(offY) > 0.5) camera.setViewOffset(W, H, offX * (1 - zi), offY * (1 - zi), W, H); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      scene.updateMatrixWorld(true);

      /* figure uniforms */
      figU.uAssemble.value = reduce ? 1 : Math.min(1, (nowMs - assemble0) / 3600);
      var bt = t - burstT; figU.uBurst.value = bt < 0 ? 0 : (bt < 0.3 ? bt / 0.3 : Math.exp(-(bt - 0.3) * 1.5)) * (bt < 6 ? 1 : 0);
      dustU.uGate.value += (gateT - dustU.uGate.value) * Math.min(1, dt * 1.2);
      var figPulse = trS >= 0 ? ease(trS / 0.35) * (1 - ease((trS - 0.6) / 0.35)) : 0;
      figU.uBright.value = 1.7 + 0.9 * figPulse + audioE * 0.4;
      fglow.material.opacity = 0.24 + 0.35 * figPulse + audioE * 0.25;
      var pp = 0;
      if (pointerIn && entered && !tr && !dragging) {
        plane.normal.copy(camera.position).sub(curTarget).normalize(); plane.constant = -plane.normal.dot(v3.set(0, 0, 0));
        ray.setFromCamera(new THREE.Vector2(pxn * 2 - 1, -(pyn * 2 - 1)), camera);
        if (ray.ray.intersectPlane(plane, hit)) { figure.worldToLocal(hit); figU.uPointer.value.copy(hit); pp = 1; }
      }
      figU.uPointPow.value += (pp - figU.uPointPow.value) * Math.min(1, dt * 6);

      /* planets (locked to the figure) */
      var halfH = Math.tan(22.5 * Math.PI / 180), magnet = -1, md = 1e9;
      for (var i = 0; i < lights.length; i++) {
        var L = lights[i]; worldOf(L, v3); var dcam = v3.distanceTo(camera.position); v4.copy(v3).project(camera);
        L.vis = v4.z < 1 && v4.z > -1; L.sx = (v4.x * 0.5 + 0.5) * W; L.sy = (-v4.y * 0.5 + 0.5) * H; L.rpx = L.r / (halfH * dcam) * (H / 2); L.depth = v4.z;
        L.spin.rotation.z += dt * 0.05 * (L.i % 2 ? 1 : -1);
        var isF = !!found[L.i], holy = SCENES[L.i].holy, sealed = holy && !unlocked;
        var hv = (i === hoverIdx || (i === selected && !tr)) ? 1 : 0; L.hover += (hv - L.hover) * Math.min(1, dt * 8);
        var pulse = 1 + 0.035 * Math.sin(t * 2 + L.ph);
        var sc2 = pulse * (1 + L.hover * 0.16) * (1 + audioE * 0.1);
        L.mesh.scale.setScalar(sc2);
        L.halo.material.opacity = (sealed ? 0.2 : 0.14 + 0.3 * Math.min(gain, 1.5)) + audioE * 0.2; L.halo.scale.setScalar(L.r * (sealed ? 3.4 : 4.6) * sc2);
        var gain = (sealed ? 0.42 : (holy ? 1.5 : (isF ? 1.25 : 0.5))) + L.hover * 0.4 + audioE * 0.25;
        if (trS >= 0 && tr.i === L.i) gain += ease(trS / 0.9) * 0.9;
        L.gainU.value = gain; applyGain(L.gl, gain, sealed ? [0.62, 0.72, 1] : null);
        if (L.link) L.link.visible = !!isF;
        L.mark.scale.setScalar(L.r * 3.1 * sc2);
        if (!L.lbl._init) { paintLight(L); L.lbl._init = true; }
        if (phone && L.vis && !hasPanel && !tr) { var cdx = L.sx - W / 2, cdy = L.sy - H * 0.5, dd = cdx * cdx + cdy * cdy; L.dd = dd; if (dd < md && dd < 170 * 170) { md = dd; magnet = i; } }
      }
      if (magKeep >= 0 && magnet !== magKeep && lights[magKeep].vis && lights[magKeep].dd < md * 1.6 && lights[magKeep].dd < 170 * 170 && !hasPanel && !tr) magnet = magKeep; /* hold the current label until another is clearly closer */
      magKeep = magnet;
      for (var j = 0; j < lights.length; j++) {
        var Lj = lights[j]; var on = phone ? (j === magnet || (j === selected && !tr)) : (j === hoverIdx || (j === selected && !tr));
        var tx = Lj.sx, ty = Lj.sy - Lj.rpx * 0.9;
        if (Lj.lx === undefined || !Lj.lshow) { Lj.lx = tx; Lj.ly = ty; } else { var lk = Math.min(1, dt * 10); Lj.lx += (tx - Lj.lx) * lk; Lj.ly += (ty - Lj.ly) * lk; }
        Lj.lbl.style.transform = 'translate3d(' + Lj.lx.toFixed(1) + 'px,' + Lj.ly.toFixed(1) + 'px,0) translate(-50%,-100%)';
        v3.setFromMatrixPosition(Lj.grp.matrixWorld); var behind = v3.distanceTo(camera.position) > camera.position.distanceTo(curTarget) + 0.8;
        Lj.lshow = Lj.vis && !tr; Lj.lbl.style.visibility = Lj.lshow ? 'visible' : 'hidden';
        Lj.lbl.classList.toggle('on', on && Lj.vis); Lj.lbl.classList.toggle('back', behind);
      }
      if (trS >= 0 && lights[tr.i]) {
        worldOf(lights[tr.i], v4); var bp = beamGeo.attributes.position.array;
        for (var bk = 0; bk < BN; bk++) {
          var bu = (trS * 1.6 + bk / BN) % 1, eu = bu * bu * (3 - 2 * bu), wob = Math.sin(bu * 3.1416) * beamOff[bk];
          bp[bk * 3] = beamSrc.x + (v4.x - beamSrc.x) * eu + wob * Math.cos(bk); bp[bk * 3 + 1] = beamSrc.y + (v4.y - beamSrc.y) * eu + wob * Math.sin(bk * 1.7); bp[bk * 3 + 2] = beamSrc.z + (v4.z - beamSrc.z) * eu + wob * Math.cos(bk * 2.3);
        }
        beamGeo.attributes.position.needsUpdate = true; beam.visible = true; beam.material.opacity = Math.min(1, trS * 3) * (1 - ease((trS - 0.8) / 0.15));
      } else beam.visible = false;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);
    window.__world = { galaxies: galaxies, lights: lights, openPlanet: openPlanet, goGalaxy: goGalaxy, exitGalaxy: exitGalaxy, step: step, zoom: function (z) { zoomT = zoom = z; }, gFocus: function () { return gFocusOn; }, galaxyTap: galaxyTap, cam: function (a, b) { camAz = a; camEl = b; azVel = elVel = 0; idleAt = performance.now() + 1e6; }, mode: function () { return mode; }, tr: function () { return tr; } };
  }
})();
