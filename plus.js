/* Signature Cut by Tracy – le jeu · nouveautés V6 (chargé après app.js, dont il partage les variables).
   Concours, bonus du jour et roue, gains hors ligne, franchise, événements, coup parfait, trophées,
   équipe nommée, décoration, partage, installation sur l'écran d'accueil. */
'use strict';

/* =====================================================================
   1. DONNÉES
   ===================================================================== */
const CITIES = ['Pau', 'Biarritz', 'Bayonne', 'Toulouse', 'Bordeaux', 'Lyon', 'Marseille', 'Paris']; // franchise : un salon par ville
const presMult = (p) => 1 + 2 * p; // tarifs x3, x5, x7… définitifs
// Équipe : prénoms inventés. Un coiffeur par fauteuil, à former (5 niveaux, +25 % par niveau).
const STAFF = [
  { n: 'Léo', sp: 'Rapide', d: '20 % plus rapide que les autres' },
  { n: 'Inès', sp: 'Vendeuse', d: 'vend parfois un produit toute seule' },
  { n: 'Samir', sp: 'Barbier', d: '+30 % par client' },
  { n: 'Chloé', sp: 'Coloriste', d: '+50 % par client' },
];
const STAFF_MAX = 5;
// Décoration : visible dans le salon, +3 % sur les tarifs par objet, conservée d'un salon à l'autre.
const DECO = [
  { id: 'plant', n: 'Plante verte', cost: 1500 },
  { id: 'frames', n: 'Cadres dorés', cost: 8000 },
  { id: 'carpet', n: 'Tapis rouge', cost: 40000 },
  { id: 'vip', n: 'Néon « VIP »', cost: 200000 },
  { id: 'checker', n: 'Sol en damier', cost: 1000000 },
  { id: 'cup', n: 'Vitrine à trophée', cost: 5000000 },
];
const st = (k) => S.stat[k] || 0;
// Trophées, du plus simple au plus prestigieux : le dernier obtenu sert de titre dans le classement.
const TROPHIES = [
  { id: 's10', n: 'Apprenti', d: 'Coiffer 10 clients', ok: () => S.served >= 10 },
  { id: 'v10', n: 'Bon vendeur', d: 'Vendre 10 produits', ok: () => S.salesN >= 10 },
  { id: 'p10', n: 'Main sûre', d: 'Réussir 10 coups parfaits', ok: () => st('perfect') >= 10 },
  { id: 't10k', n: 'Premier pactole', d: 'Encaisser 10 000 Ŧ', ok: () => S.total >= 1e4 },
  { id: 'd3', n: 'Fidèle', d: 'Jouer 3 jours de suite', ok: () => S.streak >= 3 },
  { id: 's100', n: 'Coiffeur confirmé', d: 'Coiffer 100 clients', ok: () => S.served >= 100 },
  { id: 'tb10', n: 'Pile électrique', d: 'Déclencher 10 Turbo', ok: () => st('turbo') >= 10 },
  { id: 'c15', n: 'Styliste', d: 'Découvrir 15 coupes', ok: () => S.cuts.length >= 15 },
  { id: 'st5', n: 'Ami des stars', d: 'Coiffer 5 personnalités différentes', ok: () => S.stars.length >= 5 },
  { id: 'ev10', n: 'Toujours prêt', d: 'Réussir 10 événements', ok: () => st('events') >= 10 },
  { id: 'sv', n: 'Carte complète', d: 'Débloquer toutes les prestations', ok: () => S.svc.length >= SERVICES.length },
  { id: 'se4', n: 'Salon complet', d: 'Ouvrir tous les fauteuils', ok: () => S.seats >= SEATS.length },
  { id: 't1m', n: 'Millionnaire', d: 'Encaisser 1 million', ok: () => S.total >= 1e6 },
  { id: 'v50', n: 'Roi du gel', d: 'Vendre 50 produits', ok: () => S.salesN >= 50 },
  { id: 'd7', n: 'Inséparable', d: 'Jouer 7 jours de suite', ok: () => S.streak >= 7 },
  { id: 's500', n: 'Maître barbier', d: 'Coiffer 500 clients', ok: () => S.served >= 500 },
  { id: 'c30', n: 'Encyclopédie', d: 'Découvrir toutes les coupes', ok: () => S.cuts.length >= CUTS.length },
  { id: 'f1', n: 'Franchisé', d: 'Ouvrir un deuxième salon', ok: () => S.pres >= 1 },
  { id: 'p100', n: 'Précision d\'orfèvre', d: 'Réussir 100 coups parfaits', ok: () => st('perfect') >= 100 },
  { id: 'dc', n: 'Décorateur', d: 'Acheter toute la décoration', ok: () => S.deco.length >= DECO.length },
  { id: 'st14', n: 'Carnet d\'adresses', d: 'Coiffer toutes les personnalités', ok: () => S.stars.length >= STARS.length },
  { id: 't100m', n: 'Empire capillaire', d: 'Encaisser 100 millions', ok: () => S.total >= 1e8 },
  { id: 's2000', n: 'Légende du peigne', d: 'Coiffer 2 000 clients', ok: () => S.served >= 2000 },
  { id: 'dy', n: 'Coloriste', d: 'Trouver toutes les teintes', ok: () => S.dyes.length >= DYES.length },
  { id: 'my', n: 'Chasseur de mythes', d: 'Coiffer une personnalité Mythique', ok: () => S.stars.some((i) => STARS[i] && STARS[i].r === 3) },
  { id: 'f3', n: 'Magnat', d: 'Ouvrir un quatrième salon', ok: () => S.pres >= 3 },
];
const OFFLINE_MAX = 4 * 3600, OFFLINE_RATE = 0.5; // gains hors ligne : 4 h au plus, à moitié régime
// Roue du jour : [libellé, poids, type, valeur]
const WHEEL = [
  ['Petit lot', 26, 'cash', 5], ['Turbo 30 s', 12, 'turbo', 30], ['Joli lot', 22, 'cash', 10], ['Une star arrive', 8, 'star', 0],
  ['Gros lot', 14, 'cash', 25], ['Gains x2 · 2 min', 8, 'boost', 120], ['Très gros lot', 8, 'cash', 50], ['JACKPOT', 2, 'cash', 200],
];

/* =====================================================================
   2. ÉTAT
   ===================================================================== */
for (const k of ['staff', 'deco', 'troph', 'dyes']) if (!Array.isArray(S[k])) S[k] = [];
S.base = S.base || 0; S.pres = S.pres || 0; S.streak = S.streak || 0;
if (!S.tuto) S.tuto = S.served ? 9 : 1; // premiers pas : seulement pour une nouvelle partie
let ev = null, evNext = 60 + rnd(50), boost = 0, starNext = false, avgT = 8, lastFin = 0, installEvt = null;
const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => dayStr(new Date());
const unit = () => Math.max(10, seatPay() * 4); // « un lot » : suit le niveau du salon

// Fenêtres en file d'attente : une seule à la fois
const waiting = [];
function later(fn) { if ($('modal').hidden) fn(); else waiting.push(fn); }
$('modal-ok').addEventListener('click', () => setTimeout(() => { if ($('modal').hidden && waiting.length) waiting.shift()(); }, 0));

X.mult = () => presMult(S.pres) * (1 + 0.03 * S.deco.length) * (1 + 0.01 * S.troph.length) * (1 + Math.min(0.25, 0.005 * st('perfect'))) * (1 + 0.01 * S.dyes.length);
X.payMult = () => (ev && ev.k === 'rush' ? 3 : 1) * (ev && ev.k === 'wed' ? 2 : 1) * (boost > 0 ? 2 : 1) * (S.client.tip || 1) * (S.client.dye !== undefined ? 1.5 : 1);
X.workMult = () => (ev && ev.k === 'rush' ? 2 : 1);
X.forceStar = () => { if (!starNext) return false; starNext = false; return true; };
X.title = () => { let t = ''; for (const x of TROPHIES) if (S.troph.includes(x.id)) t = x.n; return t; };

/* =====================================================================
   3. ÉQUIPE
   ===================================================================== */
const staffLvl = (i) => S.staff[i] || 0;
const staffCost = (i) => Math.floor(SEATS[i] * 0.6 * Math.pow(2.2, staffLvl(i)));
X.seatMult = (i) => (1 + 0.25 * staffLvl(i)) * (i === 2 ? 1.3 : i === 3 ? 1.5 : 1);
X.seatSpeed = (i) => (i === 0 ? 0.8 : 1);
X.seatName = (i) => STAFF[i].n;
X.seatDone = (i) => { // Inès vend parfois un produit
  if (i !== 1 || Math.random() > 0.1) return;
  const p = PRODUCTS[rnd(PRODUCTS.length)], price = Math.round(p[1] * TIERS[tierNow()].m);
  earn(price); S.salesN++; S.salesSum += price;
  S.sales.unshift({ t: Date.now(), n: p[0] + ' (Inès)', p: price, c: S.served }); S.sales.length = Math.min(S.sales.length, 40);
};
X.seatRow = (i) => {
  const s = STAFF[i], l = staffLvl(i), pay = Math.round(seatPay() * X.seatMult(i)), per = (seatPeriod() * X.seatSpeed(i)).toFixed(1).replace('.', ',');
  return `<div class="item owned"><div class="grow"><strong>${s.n} · ${s.sp}</strong><small>${s.d} · +${fmt(pay)} Ŧ toutes les ${per} s · formation ${l}/${STAFF_MAX}</small></div>` +
    (l >= STAFF_MAX ? '<span class="tag">MAX</span>' : `<button class="buy" data-staff="${i}" data-cost="${staffCost(i)}">Former · ${fmt(staffCost(i))} Ŧ</button>`) + '</div>';
};

/* =====================================================================
   4. ÉVÉNEMENTS
   ===================================================================== */
const evEl = document.createElement('div');
evEl.id = 'event'; evEl.hidden = true; evEl.innerHTML = '<b></b><span></span><i><u></u></i>';
stage.appendChild(evEl);
function evText() {
  if (!ev) return;
  evEl.querySelector('b').textContent = ev.name;
  evEl.querySelector('span').textContent = ev.k === 'rush' ? 'Gains x3 · coupe 2 fois plus rapide' : ev.k === 'wed' ? `Encore ${ev.n} invité${ev.n > 1 ? 's' : ''} · x2 chacun` : `Encore ${ev.n} client${ev.n > 1 ? 's' : ''} pour le pourboire géant`;
}
function startEvent() {
  const k = ['rush', 'wed', 'influ'][rnd(3)];
  if (k === 'rush') ev = { k, name: 'Heure de pointe !', T: 20 };
  else if (k === 'wed') ev = { k, name: 'Un mariage !', n: 5, T: Math.max(45, avgT * 5 * 1.5) };
  else ev = { k, name: 'Un influenceur filme !', n: 2, T: Math.max(20, avgT * 2 * 1.5) };
  ev.t = ev.T;
  evEl.hidden = false; evEl.className = ev.k; evText();
  sfx('step'); floatText(ev.name, 180, 70, 'step');
}
function endEvent(win) {
  const e = ev; ev = null; evEl.hidden = true; evNext = 80 + rnd(80);
  if (e.k === 'rush') { bump('events'); toast('<b>Fin de l\'heure de pointe</b><br>Le salon reprend son souffle.'); return; }
  if (!win) { toast(`<b>${e.k === 'wed' ? 'Le cortège est reparti' : 'Le live est terminé'}</b><br>Trop tard pour cette fois. La prochaine sera la bonne.`); return; }
  const r = unit() * (e.k === 'wed' ? 3 : 5);
  earn(r); bump('events'); cash(26, CX, 220); sfx('level');
  toast(e.k === 'wed' ? `<b>Vive les mariés !</b><br>Bouquet final : +${fmt(r)} Ŧ` : `<b>Vidéo virale !</b><br>Pourboire géant : +${fmt(r)} Ŧ`);
  renderStats(); checkTier();
}
X.onFinish = (c) => {
  const now = nowMs();
  if (c.dye !== undefined && c.hair !== c.dye) { // la coloration est finie : la teinte reste
    c.hair = c.dye; buildClientLayer();
    if (!S.dyes.includes(c.dyeI)) { S.dyes.push(c.dyeI); toast(`<b>Nouvelle teinte : ${DYES[c.dyeI][0]}</b><br>Ajoutée à votre album · +1 % sur vos tarifs.`); if (tab === 'cuts') renderPanel(); }
  }
  if (lastFin && now - lastFin < 60000) avgT += ((now - lastFin) / 1000 - avgT) * 0.2; // durée moyenne d'un client
  lastFin = now;
  if (navigator.vibrate && simT === null) { try { navigator.vibrate([15, 30, 25]); } catch { /* rien */ } }
  if (ev && ev.n) { ev.n--; if (ev.n <= 0) endEvent(true); else evText(); }
};

/* =====================================================================
   5. GESTES : coup parfait, rasage au tracé, la bonne coupe, client difficile
   Un geste met le jeu en phase « mini » : en fin de coupe (parfait, tracé) ou à l'arrivée (bonne coupe, difficile).
   ===================================================================== */
let mini = null;
const pfPos = () => 0.5 + 0.5 * Math.sin(mini.ph + mini.t * 6);
const pickEl = document.createElement('div');
pickEl.id = 'pick'; pickEl.hidden = true;
stage.appendChild(pickEl);
function tracePts(kind) { // contour à suivre : front, mâchoire ou vague
  const pts = [], n = 9;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), a = Math.PI * ((kind === 0 ? 1.12 : 0.12) + 0.76 * u);
    pts.push(kind === 2 ? [CX - 72 + 144 * u, 250 + 34 * Math.sin(u * Math.PI * 2)] : kind === 0 ? [CX + Math.cos(a) * 74, 262 + Math.sin(a) * 78] : [CX + Math.cos(a) * 66, 262 + Math.sin(a) * 72]);
  }
  return pts;
}
// Fin de coupe : coup parfait ou rasage au tracé
X.perfect = (c) => {
  if (simT !== null || S.served < 3 || S.tuto < 9) return false;
  if (c.star === undefined && !c.vip && Math.random() > 0.4) return false;
  phase = 'mini';
  mini = Math.random() < 0.5 ? { k: 'perfect', t: 0, T: 1.9, ph: Math.random() * 6 } : { k: 'trace', t: 0, T: 5, i: 0, pts: tracePts(rnd(3)) };
  return true;
};
// Arrivée du client : il montre la coupe qu'il veut, ou il ne tient pas en place
X.arrive = (c) => {
  if (simT !== null || S.served < 8 || S.tuto < 9 || c.star !== undefined) return;
  const roll = Math.random();
  if (roll < 0.14 && svcOf(c.svc).cut && c.cut !== undefined) {
    const opts = [c.cut];
    while (opts.length < 3) { const x = rnd(CUTS.length); if (!opts.includes(x)) opts.push(x); }
    opts.sort(() => Math.random() - 0.5);
    mini = { k: 'pick', t: 0, T: 8, opts };
    pickEl.innerHTML = '<div class="pk-q"><canvas></canvas><span>« Je veux cette coupe ! »<small>Laquelle est-ce ?</small></span></div>' +
      opts.map((o) => `<button type="button" data-pick="${o}">${CUTS[o].n}</button>`).join('') + '<i><u></u></i>';
    portrait(pickEl.querySelector('canvas'), c.cut);
    pickEl.hidden = false; $('order-cut').textContent = 'Quelle coupe veut-il ?'; // le nom de la coupe est masqué le temps de la devinette
  } else if (roll > 0.93 && S.served >= 12) {
    mini = { k: 'boss', t: 0, T: 9, n: 8, hit: 0, zx: CX, zy: 240 };
    floatText('Client difficile !', 180, 150, 'step');
  } else return;
  phase = 'mini'; sfx('step');
};
function miniEnd(f, txt) { // f = pourboire (multiplie le paiement)
  const m = mini; mini = null; phase = 'cut'; pickEl.hidden = true;
  if (txt) floatText(txt, 180, 250, f > 1 ? 'crit' : 'step');
  if (f > 1) { sfx('coin'); bump(m.k === 'perfect' || m.k === 'trace' ? 'perfect' : 'gest'); }
  if (m.k === 'perfect' || m.k === 'trace') finishClient(f);
  else { S.client.tip = f; lastTap = nowMs(); renderOrder(); } // le pourboire sera versé à l'encaissement
}
function traceAt(p) {
  if (!mini || mini.k !== 'trace') return;
  while (mini.i < mini.pts.length && Math.hypot(p.x - mini.pts[mini.i][0], p.y - mini.pts[mini.i][1]) < 24) {
    spark(mini.pts[mini.i][0], mini.pts[mini.i][1]); mini.i++; sfx('buzz');
  }
  if (mini.i >= mini.pts.length) miniEnd(1.6, 'Contours parfaits ! x1,6');
}
X.miniMove = traceAt;
X.miniTap = (p, e) => {
  if (!mini) { phase = 'cut'; return; }
  if (mini.k === 'perfect') {
    if (mini.t < 0.25) return; // petit délai : un clic lancé trop tôt ne compte pas
    const d = Math.abs(pfPos() - 0.5);
    if (d < 0.06) miniEnd(2, 'PARFAIT ! ★★★★★ x2'); else if (d < 0.19) miniEnd(1.5, 'Bien joué ! ★★★★ x1,5'); else miniEnd(1, '');
  } else if (mini.k === 'trace') traceAt(p);
  else if (mini.k === 'pick') {
    const b = e && e.target.closest && e.target.closest('[data-pick]');
    if (!b) return;
    const good = +b.dataset.pick === S.client.cut;
    miniEnd(good ? 1.5 : 1, good ? 'Bonne coupe ! Pourboire x1,5' : `C'était : ${CUTS[S.client.cut].n}`);
  } else if (mini.k === 'boss') {
    if (Math.hypot(p.x - mini.zx - X.dx(), p.y - mini.zy) > 36) return;
    mini.hit++; for (let i = 0; i < 5; i++) spark(mini.zx + rnd(20) - 10, mini.zy + rnd(20) - 10); sfx('snip');
    if (mini.hit >= mini.n) { miniEnd(3, 'Dompté ! Il paiera x3'); return; }
    let nx, ny;
    do { nx = CX - 58 + rnd(117); ny = 196 + rnd(110); } while (Math.hypot(nx - mini.zx, ny - mini.zy) < 45);
    mini.zx = nx; mini.zy = ny;
  }
};
X.dx = () => (mini && mini.k === 'boss' ? Math.sin(mini.t * 5.5) * 13 : 0); // il gigote

X.frame = (dt) => {
  if (boost > 0) boost -= dt;
  if (S.client && S.client.hat > 0 && phase === 'cut') S.client.hat -= dt * 1.3;
  if (mini) {
    mini.t += dt;
    if (mini.k === 'pick') pickEl.querySelector('u').style.width = Math.max(0, 100 - mini.t / mini.T * 100) + '%';
    if (mini.t > mini.T) miniEnd(1, mini.k === 'boss' ? 'Il s\'est calmé tout seul' : mini.k === 'pick' ? `C'était : ${CUTS[S.client.cut].n}` : '');
  }
  if (ev) {
    ev.t -= dt; evEl.querySelector('u').style.width = Math.max(0, ev.t / ev.T * 100) + '%';
    if (ev.t <= 0) endEvent(false);
  } else if (S.served >= 5 && S.tuto >= 9 && phase === 'cut' && nowMs() - lastTap < 5000 && $('modal').hidden) {
    evNext -= dt; if (evNext <= 0) startEvent();
  }
  tutoTick();
};
function miniLabel(g, txt, frac) {
  g.fillStyle = 'rgba(0,0,0,.62)'; rr(g, 46, 346, 268, 40, 10); g.fill();
  g.fillStyle = '#f4ecdc'; g.font = '600 13px Outfit, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt, CX, 361);
  g.fillStyle = 'rgba(255,255,255,.18)'; rr(g, 60, 374, 240, 5, 2.5); g.fill();
  g.fillStyle = '#d9b85f'; rr(g, 60, 374, Math.max(5, 240 * frac), 5, 2.5); g.fill();
}
X.draw = (g) => {
  if (!mini) return;
  const left = Math.max(0, 1 - mini.t / mini.T);
  if (mini.k === 'perfect') {
    const x0 = 60, w = 240, y = 304, p = pfPos(); // sous le visage : le haut de la scène est pris par les messages
    g.fillStyle = 'rgba(0,0,0,.6)'; rr(g, x0 - 8, y - 26, w + 16, 54, 10); g.fill();
    g.fillStyle = '#f4ecdc'; g.font = '600 13px Outfit, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Coup parfait : touchez au bon moment', CX, y - 12);
    g.fillStyle = '#4a443c'; rr(g, x0, y, w, 16, 8); g.fill();
    g.fillStyle = '#7fc79a'; g.fillRect(x0 + w * 0.31, y, w * 0.38, 16);
    g.fillStyle = '#ffd36b'; g.fillRect(x0 + w * 0.44, y, w * 0.12, 16);
    g.fillStyle = '#fff'; rr(g, x0 + w * p - 3, y - 4, 6, 24, 3); g.fill();
  } else if (mini.k === 'trace') {
    const P = mini.pts;
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 9; g.beginPath(); P.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))); g.stroke();
    g.setLineDash([7, 9]); g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.stroke(); g.setLineDash([]);
    if (mini.i > 1) { g.strokeStyle = '#ffd36b'; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < mini.i; i++) (i ? g.lineTo(P[i][0], P[i][1]) : g.moveTo(P[i][0], P[i][1])); g.stroke(); }
    const q = P[Math.min(mini.i, P.length - 1)], pu = 1 + 0.25 * Math.sin(time * 9);
    g.fillStyle = 'rgba(255,211,107,.35)'; g.beginPath(); g.arc(q[0], q[1], 17 * pu, 0, 7); g.fill();
    g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(q[0], q[1], 8, 0, 7); g.fill();
    miniLabel(g, 'Rasage au tracé : glissez le doigt sur la ligne', left);
  } else if (mini.k === 'boss') {
    const x = mini.zx + X.dx(), y = mini.zy, pu = 1 + 0.18 * Math.sin(time * 10);
    g.fillStyle = 'rgba(255,211,107,.3)'; g.beginPath(); g.arc(x, y, 26 * pu, 0, 7); g.fill();
    g.strokeStyle = '#ffd36b'; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y, 20 * pu, 0, 7); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x + 9, y); g.moveTo(x, y - 9); g.lineTo(x, y + 9); g.stroke();
    miniLabel(g, `Il gigote ! Touchez la cible : ${mini.hit}/${mini.n}`, left);
  }
};

/* =====================================================================
   6. DÉCORATION (dessinée dans le décor fixe)
   ===================================================================== */
const has = (id) => S.deco.includes(id);
X.bg = (g, W, Hh, fy) => {
  if (has('checker')) { // damier au sol, en pixels écran
    g.setTransform(1, 0, 0, 1, 0, 0);
    const s = 16 * k;
    for (let r = 0; r * s < Hh - fy; r++) for (let c = 0; c * s < W; c++) if ((r + c) & 1) { g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(c * s, fy + 1 + r * s, s, s); }
    g.setTransform(k, 0, 0, k, ox, oy);
  }
  if (has('carpet')) {
    g.fillStyle = '#8e1f2b'; rr(g, CX - 125, 412, 250, 34, 6); g.fill();
    g.strokeStyle = '#d9b85f'; g.lineWidth = 2; rr(g, CX - 119, 416, 238, 40, 4); g.stroke();
  }
  if (has('frames')) for (const [x, y, w, h] of [[8, 98, 27, 35], [41, 104, 24, 29]]) {
    g.fillStyle = '#d9b85f'; rr(g, x, y, w, h, 2); g.fill();
    g.fillStyle = '#26221e'; g.fillRect(x + 3, y + 3, w - 6, h - 6);
    g.fillStyle = '#8d7f6a'; g.beginPath(); g.arc(x + w / 2, y + h * 0.42, w * 0.2, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x + w / 2, y + h - 3, w * 0.3, h * 0.24, 0, Math.PI, 0); g.fill();
  }
  if (has('vip')) {
    g.strokeStyle = 'rgba(110,220,255,.25)'; g.lineWidth = 7; rr(g, 258, 106, 52, 26, 8); g.stroke();
    g.strokeStyle = '#7fe0ff'; g.lineWidth = 1.8; rr(g, 258, 106, 52, 26, 8); g.stroke();
    g.fillStyle = '#d8f6ff'; g.font = '700 14px Outfit, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('VIP', 284, 119.5);
  }
  if (has('cup')) {
    g.fillStyle = '#231f1b'; rr(g, 6, 300, 64, 6, 2); g.fill();
    g.fillStyle = '#ffd36b'; g.beginPath(); g.moveTo(26, 268); g.lineTo(50, 268); g.quadraticCurveTo(50, 288, 38, 290); g.quadraticCurveTo(26, 288, 26, 268); g.fill();
    g.fillRect(36, 289, 4, 7); rr(g, 30, 295, 16, 5, 1.5); g.fill();
    g.strokeStyle = '#ffd36b'; g.lineWidth = 2.2; g.beginPath(); g.arc(25, 275, 5, 1.2, 4.9); g.stroke(); g.beginPath(); g.arc(51, 275, 5, -1.75, 1.95); g.stroke();
  }
  if (has('plant')) {
    g.fillStyle = '#3d7a5c';
    for (const [a, l] of [[-0.9, 40], [-0.4, 52], [0.05, 58], [0.5, 50], [0.95, 38]]) { g.save(); g.translate(34, 372); g.rotate(a); g.beginPath(); g.ellipse(0, -l / 2, 7, l / 2, 0, 0, 7); g.fill(); g.restore(); }
    g.fillStyle = '#2f6048'; g.save(); g.translate(34, 372); g.rotate(-0.2); g.beginPath(); g.ellipse(0, -22, 5, 22, 0, 0, 7); g.fill(); g.restore();
    g.fillStyle = '#a5633c'; g.beginPath(); g.moveTo(18, 370); g.lineTo(50, 370); g.lineTo(45, 408); g.lineTo(23, 408); g.closePath(); g.fill();
    g.fillStyle = '#c07a4c'; rr(g, 16, 366, 36, 8, 2); g.fill();
  }
};

/* =====================================================================
   7. CONCOURS, PARTAGE, INSTALLATION
   ===================================================================== */
X.contest = () => {
  let when = 'dates annoncées bientôt au salon';
  if (CONTEST.start && CONTEST.end) {
    const a = new Date(CONTEST.start + 'T00:00:00'), b = new Date(CONTEST.end + 'T23:59:59'), n = Date.now();
    const left = (ms) => { const h = Math.floor(ms / 36e5); return h >= 48 ? Math.floor(h / 24) + ' jours' : h >= 1 ? h + ' h' : 'moins d\'une heure'; };
    const fr = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    when = n < a ? `début le ${fr(a)}, dans ${left(a - n)}` : n <= b ? `jusqu'au ${fr(b)} · encore ${left(b - n)}` : `terminé depuis le ${fr(b)}`;
  }
  return `<div class="contest"><b>Concours</b> · ${when}<ul>${CONTEST.prizes.map((p) => `<li>${p}</li>`).join('')}</ul><small>Le classement compte les gains cumulés. Lots à retirer au salon.</small></div>`;
};
X.share = async () => {
  const text = `J'ai gagné ${fmt(S.total)} Tracy coins au jeu ${SALON.name}. Tu fais mieux ?`, url = location.origin + '/';
  try {
    if (navigator.share) await navigator.share({ title: SALON.name, text, url });
    else { await navigator.clipboard.writeText(text + ' ' + url); toast('<b>Copié !</b><br>Collez le message où vous voulez.'); }
  } catch { /* partage annulé */ }
};
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (tab === 'salon') renderPanel(); });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { /* pas grave */ });

/* =====================================================================
   8. BONUS DU JOUR, ROUE, HORS LIGNE, FRANCHISE
   ===================================================================== */
function checkDay() {
  const t = today();
  if (S.day === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = S.day === dayStr(y) ? S.streak + 1 : 1, r = unit() * 2 * Math.min(streak, 7);
  S.day = t; S.streak = streak; save(); // noté tout de suite : le bonus ne peut pas être pris deux fois
  later(() => modal(`<h3>Bonus du jour</h3><p>${streak > 1 ? `<b>${streak} jours de suite !</b> ` : ''}Tracy vous offre <b>${fmt(r)} Ŧ</b> pour bien démarrer.</p>` +
    `<p class="muted">Revenez demain : le bonus grossit chaque jour, jusqu'au 7e. Et la roue du jour vous attend dans l'onglet Outils.</p>`, () => {
    earn(r); cash(18, CX, 240); sfx('level'); renderStats(); checkTier(); save(); if (tab === 'tools') renderPanel();
  }, 'Encaisser'));
}
function showWheel() {
  if (S.spin === today()) return;
  let state = 0;
  modal('<h3>Roue du jour</h3><div class="wheel"><canvas id="wh" width="520" height="520"></canvas><i></i></div><p id="wh-r" class="muted">Un lancer par jour.</p>', () => {
    if (state === 2) return undefined;
    if (state === 1) return false;
    state = 1;
    let tot = 0, x = 0, pick = 0;
    for (const w of WHEEL) tot += w[1];
    const roll = Math.random() * tot;
    for (let i = 0; i < WHEEL.length; i++) { x += WHEEL[i][1]; if (roll < x) { pick = i; break; } }
    S.spin = today(); save();
    $('wh').style.transform = `rotate(${360 * 5 - (pick + 0.5) * 360 / WHEEL.length}deg)`;
    $('modal-ok').textContent = '…';
    sfx('bills');
    setTimeout(() => {
      const [label, , type, v] = WHEEL[pick];
      let msg = label;
      if (type === 'cash') { const r = unit() * v; earn(r); cash(v >= 50 ? 40 : 16, CX, 240); msg = `${label} : +${fmt(r)} Ŧ`; }
      else if (type === 'turbo') { fever = v; msg = 'Turbo pendant 30 secondes : gains x2 !'; }
      else if (type === 'boost') { boost = v; msg = 'Tous vos encaissements x2 pendant 2 minutes !'; }
      else { starNext = true; msg = 'Une personnalité sera votre prochain client !'; }
      sfx('level'); state = 2;
      if ($('wh-r')) { $('wh-r').innerHTML = `<b>${msg}</b>`; $('modal-ok').textContent = 'Super !'; }
      renderStats(); checkTier(); save(); if (tab === 'tools') renderPanel();
    }, 4300);
    return false;
  }, 'Lancer la roue');
  const g = $('wh').getContext('2d'), n = WHEEL.length, cols = ['#d9b85f', '#2f2b26', '#7fc79a', '#2f2b26'];
  g.translate(260, 260);
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
    g.fillStyle = i === n - 1 ? '#c8372f' : cols[i % 4]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 250, a0, a1); g.closePath(); g.fill();
    g.save(); g.rotate((a0 + a1) / 2); g.fillStyle = cols[i % 4] === '#2f2b26' || i === n - 1 ? '#f4ecdc' : '#1c1a17';
    g.font = '600 25px Outfit, system-ui, sans-serif'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(WHEEL[i][0], 236, 0); g.restore();
  }
  g.strokeStyle = '#f4ecdc'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 252, 0, 7); g.stroke();
  g.fillStyle = '#1c1a17'; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill();
}
function checkOffline() {
  if (!S.last || !S.seats) return;
  const away = (Date.now() - S.last) / 1000;
  if (away < 120) return;
  let per = 0;
  for (let i = 0; i < S.seats; i++) per += seatPay() * X.seatMult(i) / (seatPeriod() * X.seatSpeed(i));
  const r = Math.round(per * Math.min(away, OFFLINE_MAX) * OFFLINE_RATE);
  if (r < 1) return;
  const h = Math.floor(away / 3600), m = Math.floor(away % 3600 / 60);
  earn(r); S.last = Date.now(); save();
  later(() => { modal(`<h3>Pendant votre absence…</h3><p>Vous êtes parti ${h ? h + ' h ' : ''}${m} min. Votre équipe a continué à coiffer : <b>+${fmt(r)} Ŧ</b>.</p>` +
    `<p class="muted">L'équipe tourne à moitié régime sans vous, pendant 4 heures au plus. Formez-la dans « Mon salon » pour gagner plus.</p>`); cash(20, CX, 240); sfx('cash'); renderStats(); checkTier(); });
}
function askPrestige() {
  const next = CITIES[S.pres + 1];
  modal(`<h3>Ouvrir un salon à ${next} ?</h3><p>Vous repartez de zéro dans une nouvelle ville : argent, outils, prestations, fauteuils et univers sont remis à zéro.</p>` +
    `<p>En échange, tous vos tarifs passent à <b>x${presMult(S.pres + 1)}</b>, pour toujours. Vous gardez votre niveau, votre score, vos albums, vos trophées et votre décoration.</p>` +
    '<button class="link" id="pres-no">Pas maintenant</button>', () => {
    S.pres++; S.base = S.total; S.money = 0; S.tools = {}; S.svc = ['simple']; S.seats = 0; S.staff = []; S.tier = 0;
    if (ev) { ev = null; evEl.hidden = true; }
    newClient(); phase = 'cut'; buildBg(); renderSeats(); save(); renderPanel();
    cash(40, CX, 220); sfx('level');
    toast(`<b>Bienvenue à ${CITIES[S.pres]} !</b><br>Tarifs x${presMult(S.pres)} dans ce nouveau salon.`);
  }, `Ouvrir à ${next}`);
  $('pres-no').addEventListener('click', () => { modalOk = null; $('modal').hidden = true; });
}
function checkTrophies() {
  if (simT !== null) return;
  for (const t of TROPHIES) if (!S.troph.includes(t.id) && t.ok()) {
    S.troph.push(t.id); sfx('level'); lastPush = -1;
    toast(`<b>Trophée : ${t.n}</b><br>${t.d} · +1 % sur vos tarifs. Votre titre s'affiche dans le classement.`);
    if (tab === 'cuts') renderPanel();
    break; // un à la fois
  }
}

/* =====================================================================
   9 bis. V7 : personnalités rares (accessoires et effets), coloration, Noël, premiers pas
   ===================================================================== */
const accOf = (c) => (c.star !== undefined && STARS[c.star] ? STARS[c.star].acc : []);
const glow = (g, x, y, r, col0, col1) => { const gr = g.createRadialGradient(x, y, r * 0.1, x, y, r); gr.addColorStop(0, col0); gr.addColorStop(1, col1); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };

// Accessoires dessinés avec le visage. under = sous les yeux et la bouche ; sinon par-dessus.
X.acc = (g, c, s, under) => {
  const A = (a) => s.acc.includes(a);
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (under) {
    if (A('clown')) {
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(CX, 298, 27, 15, 0, 0, 7); g.fill();
      g.fillStyle = '#2a6cf0'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX + sx * 24, 226); g.lineTo(CX + sx * 24 - 5, 236); g.lineTo(CX + sx * 24 + 5, 236); g.closePath(); g.fill(); g.beginPath(); g.moveTo(CX + sx * 24, 272); g.lineTo(CX + sx * 24 - 5, 262); g.lineTo(CX + sx * 24 + 5, 262); g.closePath(); g.fill(); }
    }
    if (A('mime')) {
      g.fillStyle = '#17171a'; g.beginPath(); g.moveTo(CX - 24, 262); g.lineTo(CX - 28, 272); g.lineTo(CX - 24, 284); g.lineTo(CX - 20, 272); g.closePath(); g.fill();
      for (const sx of [-1, 1]) glow(g, CX + sx * 38, 280, 12, 'rgba(240,90,110,.55)', 'rgba(240,90,110,0)');
    }
    if (A('fangs')) for (const sx of [-1, 1]) glow(g, CX + sx * 24, 252, 20, 'rgba(90,40,110,.4)', 'rgba(90,40,110,0)'); // cernes
    if (A('scales')) {
      g.strokeStyle = c.skin === 10 ? 'rgba(255,200,170,.6)' : 'rgba(60,220,210,.75)'; g.lineWidth = 1.6;
      for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - (r > 1); i++) { g.beginPath(); g.arc(CX + sx * (34 + i * 8 + (r & 1) * 4), 266 + r * 7, 4, 0.1, Math.PI - 0.1); g.stroke(); }
    }
    if (A('galaxy')) { // la peau est un ciel étoilé
      g.save(); headPath(g); g.clip();
      glow(g, CX - 30, 228, 46, 'rgba(230,90,200,.5)', 'rgba(230,90,200,0)'); glow(g, CX + 34, 290, 50, 'rgba(70,200,255,.45)', 'rgba(70,200,255,0)');
      g.fillStyle = '#fff';
      for (let i = 0; i < 26; i++) { g.globalAlpha = 0.45 + 0.5 * Math.sin(time * 2 + i * 1.9); g.beginPath(); g.arc(CX - 56 + (i * 37) % 112, 200 + (i * 53) % 128, 0.8 + (i % 3) * 0.5, 0, 7); g.fill(); }
      g.globalAlpha = 1; g.restore();
      twinkle(g, CX - 38, 226, 7, 0.4); twinkle(g, CX + 40, 306, 6, 2.2);
    }
    if (A('gold')) { // reflet qui balaie le visage
      g.save(); headPath(g); g.clip();
      const x = CX - 110 + ((time * 70) % 260), gr = g.createLinearGradient(x, 0, x + 46, 30);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(CX - 70, 190, 140, 150); g.restore();
    }
    return;
  }
  if (A('clown')) { g.fillStyle = '#e02b2b'; g.beginPath(); g.arc(CX, 278, 9.5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(CX - 3, 275, 2.6, 0, 7); g.fill(); }
  if (A('fangs')) { g.fillStyle = '#fff'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX + sx * 9, 298); g.lineTo(CX + sx * 6.5, 308); g.lineTo(CX + sx * 4, 298); g.closePath(); g.fill(); } }
  if (A('collar')) for (const sx of [-1, 1]) { // grand col de cape
    g.fillStyle = '#141216'; g.beginPath(); g.moveTo(CX + sx * 46, 338); g.lineTo(CX + sx * 92, 258); g.lineTo(CX + sx * 84, 352); g.closePath(); g.fill();
    g.fillStyle = '#8e1f2b'; g.beginPath(); g.moveTo(CX + sx * 54, 338); g.lineTo(CX + sx * 86, 276); g.lineTo(CX + sx * 80, 346); g.closePath(); g.fill();
  }
  if (A('mime')) {
    g.strokeStyle = '#17171a'; g.lineWidth = 2; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX + sx * 34, 226); g.quadraticCurveTo(CX + sx * 24, 216, CX + sx * 14, 226); g.stroke(); }
    g.fillStyle = '#d42a3c'; g.beginPath(); g.ellipse(CX, 297, 7, 4, 0, 0, 7); g.fill();
  }
  if (A('bubble')) { // casque bulle
    g.fillStyle = '#c9ced6'; rr(g, CX - 54, 324, 108, 18, 8); g.fill(); g.fillStyle = '#8b929c'; g.fillRect(CX - 54, 334, 108, 3);
    const gr = g.createRadialGradient(CX - 30, 200, 10, CX, 238, 100); gr.addColorStop(0, 'rgba(255,255,255,.28)'); gr.addColorStop(0.6, 'rgba(160,210,255,.07)'); gr.addColorStop(1, 'rgba(160,210,255,.2)');
    g.fillStyle = gr; g.beginPath(); g.arc(CX, 236, 98, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.stroke();
    g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(CX, 236, 84, 3.5, 4.3); g.stroke();
  }
  if (A('shell')) { star(g, CX - 52, 216, 10, '#ff9c6b'); g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(CX - 52, 216, 2.5, 0, 7); g.fill(); }
  if (A('alien')) {
    for (const sx of [-1, 1]) {
      g.fillStyle = '#0b0d12'; g.beginPath(); g.ellipse(CX + sx * 25, 250, 17, 11.5, sx * -0.38, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(CX + sx * 25 - 5, 246, 4, 2.4, -0.5, 0, 7); g.fill();
      const ax = CX + sx * 36, ay = 150 + Math.sin(time * 3 + sx) * 5;
      g.strokeStyle = '#5e9a4d'; g.lineWidth = 3; g.beginPath(); g.moveTo(CX + sx * 22, 202); g.quadraticCurveTo(CX + sx * 24, 170, ax, ay); g.stroke();
      glow(g, ax, ay, 14, 'rgba(160,255,120,.8)', 'rgba(160,255,120,0)'); g.fillStyle = '#d6ffc4'; g.beginPath(); g.arc(ax, ay, 4.5, 0, 7); g.fill();
    }
  }
  if (A('ghost')) { g.fillStyle = '#1b2230'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 24, 250, 9.5, 12, 0, 0, 7); g.fill(); } g.beginPath(); g.ellipse(CX, 300, 7, 9 + Math.sin(time * 2) * 2, 0, 0, 7); g.fill(); }
  if (A('horns')) for (const sx of [-1, 1]) {
    g.fillStyle = '#e8dcc0'; g.strokeStyle = '#a8946a'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(CX + sx * 30, 206); g.quadraticCurveTo(CX + sx * 40, 170, CX + sx * 66, 150); g.quadraticCurveTo(CX + sx * 58, 186, CX + sx * 50, 210); g.closePath(); g.fill(); g.stroke();
  }
  if (A('smoke')) for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const p = (time * 0.7 + i / 3 + (sx > 0 ? 0.17 : 0)) % 1; g.fillStyle = `rgba(200,200,205,${(1 - p) * 0.5})`; g.beginPath(); g.arc(CX + sx * (5 + p * 16) + Math.sin(time * 3 + i) * 2, 284 - p * 44, 3 + p * 8, 0, 7); g.fill(); }
  if (A('crown')) { // couronne qui flotte au-dessus des cheveux
    const y = 132 + Math.sin(time * 2) * 4;
    glow(g, CX, y + 6, 60, 'rgba(255,220,120,.4)', 'rgba(255,220,120,0)');
    g.fillStyle = '#ffd36b'; g.strokeStyle = '#a8842a'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(CX - 36, y + 20); g.lineTo(CX - 40, y - 8); g.lineTo(CX - 22, y + 6); g.lineTo(CX - 12, y - 14); g.lineTo(CX, y + 6); g.lineTo(CX + 12, y - 14); g.lineTo(CX + 22, y + 6); g.lineTo(CX + 40, y - 8); g.lineTo(CX + 36, y + 20); g.closePath(); g.fill(); g.stroke();
    for (const [dx, col] of [[-22, '#c8372f'], [0, '#2a6cf0'], [22, '#c8372f']]) { g.fillStyle = col; g.beginPath(); g.arc(CX + dx, y + 12, 3.6, 0, 7); g.fill(); }
    twinkle(g, CX + 12, y - 12, 8, 1.1);
  }
  if (A('santa')) { // grande barbe blanche
    g.fillStyle = '#f6f6f2'; g.strokeStyle = '#d5d5cf'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(CX - 58, 270); g.quadraticCurveTo(CX - 64, 340, CX - 30, 368); g.quadraticCurveTo(CX, 392, CX + 30, 368); g.quadraticCurveTo(CX + 64, 340, CX + 58, 270);
    g.quadraticCurveTo(CX + 40, 300, CX + 20, 308); g.quadraticCurveTo(CX, 316, CX - 20, 308); g.quadraticCurveTo(CX - 40, 300, CX - 58, 270); g.closePath(); g.fill(); g.stroke();
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX, 284); g.quadraticCurveTo(CX + sx * 16, 278, CX + sx * 32, 290); g.quadraticCurveTo(CX + sx * 16, 298, CX, 290); g.closePath(); g.fill(); g.stroke(); }
    for (const sx of [-1, 1]) glow(g, CX + sx * 38, 272, 12, 'rgba(235,90,80,.5)', 'rgba(235,90,80,0)');
  }
  if (A('galaxy')) for (const sx of [-1, 1]) { glow(g, CX + sx * 24, 250, 18, 'rgba(255,255,255,.9)', 'rgba(170,200,255,0)'); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(CX + sx * 24, 250, 9, 6, 0, 0, 7); g.fill(); }
};

// Effets derrière le personnage (auras)
X.back = (g, c) => {
  const a = accOf(c);
  if (a.includes('clock')) { // cadran qui tourne à l'envers
    glow(g, CX, 244, 150, 'rgba(110,220,255,.28)', 'rgba(110,220,255,0)');
    g.save(); g.translate(CX, 244); g.strokeStyle = 'rgba(160,235,255,.85)'; g.lineCap = 'round';
    g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 118, 0, 7); g.stroke(); g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 126, 0, 7); g.stroke();
    g.save(); g.rotate(-time * 0.25); for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.lineWidth = i % 3 === 2 ? 4 : 2; g.beginPath(); g.moveTo(0, -116); g.lineTo(0, i % 3 === 2 ? -98 : -106); g.stroke(); } g.restore();
    g.lineWidth = 4; g.save(); g.rotate(-time * 2.2); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -104); g.stroke(); g.restore();
    g.lineWidth = 6; g.save(); g.rotate(-time * 0.3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -80); g.stroke(); g.restore();
    g.restore();
  }
  if (a.includes('galaxy')) for (let i = 0; i < 3; i++) { const an = time * 0.5 + i * 2.1; glow(g, CX + Math.cos(an) * 60, 240 + Math.sin(an) * 50, 95, ['rgba(190,80,255,.4)', 'rgba(255,90,170,.35)', 'rgba(70,190,255,.38)'][i], 'rgba(0,0,0,0)'); }
  if (a.includes('flames')) glow(g, CX, 220, 150 + Math.sin(time * 9) * 10, 'rgba(255,150,40,.55)', 'rgba(255,90,20,0)');
  if (a.includes('ghost')) glow(g, CX, 250 + Math.sin(time * 1.6) * 5, 140, `rgba(190,225,255,${0.3 + 0.12 * Math.sin(time * 2.3)})`, 'rgba(190,225,255,0)');
  if (a.includes('gold')) { // rayons dorés qui tournent
    g.save(); g.translate(CX, 248); g.rotate(time * 0.35); g.fillStyle = 'rgba(255,214,110,.2)';
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(0, 0); g.lineTo(-18, -190); g.lineTo(18, -190); g.closePath(); g.fill(); }
    g.restore(); glow(g, CX, 248, 120, 'rgba(255,230,150,.4)', 'rgba(255,230,150,0)');
  }
};
// Effets devant le personnage
X.front = (g, c) => {
  const a = accOf(c);
  if (a.includes('flames')) for (let i = 0; i < 9; i++) { // chevelure de flammes
    const x = CX - 56 + i * 14, y0 = 200 + Math.pow((i - 4) / 4, 2) * 34, h = 44 + 16 * Math.sin(time * 8 + i * 1.7) + (i % 2) * 10, sw = Math.sin(time * 5 + i) * 7;
    const gr = g.createLinearGradient(0, y0, 0, y0 - h); gr.addColorStop(0, 'rgba(255,90,20,.95)'); gr.addColorStop(0.5, 'rgba(255,170,40,.9)'); gr.addColorStop(1, 'rgba(255,240,150,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 11, y0); g.quadraticCurveTo(x - 9 + sw, y0 - h * 0.6, x + sw, y0 - h); g.quadraticCurveTo(x + 9 + sw, y0 - h * 0.6, x + 11, y0); g.closePath(); g.fill();
  }
  if (a.includes('gold')) for (let i = 0; i < 7; i++) twinkle(g, CX + Math.cos(i * 0.9 + 0.3) * (82 + (i % 3) * 14), 250 + Math.sin(i * 0.9 + 0.3) * (86 + (i % 2) * 12), 7 + (i % 3) * 2, i * 1.3);
  if (a.includes('galaxy')) for (let i = 0; i < 2; i++) { const an = time * 1.6 + i * Math.PI; star(g, CX + Math.cos(an) * 92, 236 + Math.sin(an) * 26, 5, '#fff3c4'); }
  if (c.hat > 0) { // bonnet de Noël qui s'envole au début de la coupe
    g.save(); g.globalAlpha = Math.min(1, c.hat * 1.6); g.translate(0, (1 - c.hat) * -70); g.translate(CX, 200); g.rotate((1 - c.hat) * 0.5);
    g.fillStyle = '#c8372f'; g.beginPath(); g.moveTo(-62, 4); g.quadraticCurveTo(-30, -70, 54, -64); g.quadraticCurveTo(30, -30, 62, 4); g.closePath(); g.fill();
    g.fillStyle = '#f6f6f2'; rr(g, -68, -4, 136, 20, 10); g.fill(); g.beginPath(); g.arc(58, -62, 12, 0, 7); g.fill();
    g.restore();
  }
};

/* ---------- Coloration (propre au jeu) ---------- */
const COLBAR_COST = 2500, layer2 = document.createElement('canvas');
let dyeKey = '';
X.newClient = (c, svc) => {
  if (X.noel && c.star === undefined && c.seed % 3 === 0) c.hat = 1;
  if (!S.colbar || !svc.cut || c.star !== undefined || Math.random() > 0.22) return;
  const n = Math.min(DYES.length, 2 + 2 * tierNow()), news = [];
  for (let i = 0; i < n; i++) if (!S.dyes.includes(i)) news.push(i);
  c.dyeI = news.length && Math.random() < 0.6 ? news[rnd(news.length)] : rnd(n);
  c.dye = DYES[c.dyeI][1];
};
X.over = (g, c) => { // les cheveux prennent la teinte au fil de l'étape « Coloration »
  if (c.dye === undefined || c.hair === c.dye || !layer.width) return;
  const key = c.seed + ':' + layer.width;
  if (key !== dyeKey) {
    dyeKey = key; layer2.width = layer.width; layer2.height = layer.height;
    const h = layer2.getContext('2d'), nat = c.hair;
    h.setTransform(k, 0, 0, k, 0, 0); c.hair = c.dye; drawCharacter(h, c, k, true); c.hair = nat;
  }
  const q = stepQ('color');
  if (q <= 0) return;
  g.globalAlpha = q; g.drawImage(layer2, 0, 0, V.w, V.h); g.globalAlpha = 1;
};

/* ---------- Noël : en décembre et jusqu'au 5 janvier (ou ?noel=1 pour voir) ---------- */
{ const d = new Date(); X.noel = /[?&]noel=1/.test(location.search) || d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 5); }
X.live = (g) => {
  if (!X.noel) return;
  const top = -oy / k, cols = ['#ff5e62', '#ffd36b', '#7fc79a', '#7fe0ff'];
  g.fillStyle = '#fff';
  for (let i = 0; i < 40; i++) { // neige
    const x = ((i * 53.7 + Math.sin(time * 0.6 + i) * 14 + time * 6) % 520) - 80, y = top + ((i * 71.3 + time * (22 + (i % 5) * 7)) % (440 - top));
    g.globalAlpha = 0.5 + (i % 3) * 0.2; g.beginPath(); g.arc(x, y, 1.3 + (i % 3) * 0.7, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.lineWidth = 2;
  for (let s = -2; s < 5; s++) { // guirlande lumineuse
    const x0 = -40 + s * 110, y0 = top + 6;
    g.strokeStyle = '#1f3d2b'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + 55, y0 + 34, x0 + 110, y0); g.stroke();
    for (let j = 1; j <= 5; j++) {
      const u = j / 6, x = x0 + 110 * u, y = y0 + 2 * u * (1 - u) * 34, on = 0.55 + 0.45 * Math.sin(time * 3 + s * 2 + j * 1.7), col = cols[(j + s + 8) % 4];
      g.globalAlpha = on * 0.35; g.fillStyle = col; g.beginPath(); g.arc(x, y + 5, 9, 0, 7); g.fill();
      g.globalAlpha = 0.5 + on * 0.5; g.beginPath(); g.ellipse(x, y + 5, 3.4, 4.6, 0, 0, 7); g.fill();
    }
  }
  g.globalAlpha = 1;
};

/* ---------- Premiers pas : 5 bulles pour les nouveaux joueurs ---------- */
const COACH = [null,
  ['Touchez les cheveux du client pour le coiffer.', '', () => st('taps') >= 8],
  ['Continuez jusqu\'au bout de la barre dorée pour encaisser.', '#order .bar', () => S.served >= 1],
  ['Vous avez de l\'argent ! Achetez « Ciseaux affûtés » juste en dessous.', '[data-tool="ciseaux"]', () => lvl('ciseaux') >= 1],
  ['Ouvrez l\'onglet « Carte » pour débloquer de nouvelles prestations.', '#tabs [data-tab="menu"]', () => tab === 'menu'],
  ['Le 🏆 en haut ouvre le classement. À vous de jouer !', '#rank', () => tutoT > 6],
];
const coachEl = document.createElement('div');
coachEl.id = 'coach'; coachEl.hidden = true; stage.appendChild(coachEl);
let tutoShown = 0, tutoT = 0, tutoTarget = null;
function tutoTick() {
  if (S.tuto >= 9 || simT !== null) return;
  const stp = COACH[S.tuto];
  if (!stp) { S.tuto = 9; coachEl.hidden = true; if (tutoTarget) tutoTarget.classList.remove('coach-on'); save(); return; }
  tutoT += 1 / 60;
  coachEl.hidden = !$('modal').hidden;
  if (tutoShown !== S.tuto) { tutoShown = S.tuto; coachEl.textContent = stp[0]; $('hint').hidden = true; }
  if (stp[1] && (!tutoTarget || !tutoTarget.isConnected)) { tutoTarget = document.querySelector(stp[1]); if (tutoTarget) tutoTarget.classList.add('coach-on'); }
  if (stp[2]()) { if (tutoTarget) tutoTarget.classList.remove('coach-on'); tutoTarget = null; S.tuto++; tutoT = 0; sfx('step'); }
}

/* =====================================================================
   9. PANNEAU
   ===================================================================== */
X.panel = (t, h) => {
  if (t === 'tools') {
    const can = S.spin !== today();
    let top = `<div class="item ${can ? 'can' : ''}"><div class="grow"><strong>Roue du jour</strong><small>Série en cours : ${S.streak} jour${S.streak > 1 ? 's' : ''} · un lancer par jour</small></div>` +
      (can ? '<button class="buy" id="wheel" data-cost="0">Lancer</button>' : '<span class="tag">À demain</span>') + '</div>';
    if (boost > 0) top += `<p class="muted">Encaissements x2 encore ${Math.ceil(boost)} s.</p>`;
    return top + h;
  }
  if (t === 'biz') {
    const next = CITIES[S.pres + 1], ready = tierNow() >= TIERS.length - 1;
    let top = `<h2>Salon de ${CITIES[S.pres]}</h2><p class="muted">Salon n° ${S.pres + 1} de votre enseigne · tarifs x${presMult(S.pres)} grâce à la franchise · bonus total x${X.mult().toFixed(2).replace('.', ',')}.</p>`;
    if (next) top += ready
      ? `<div class="item can"><div class="grow"><strong>Ouvrir un salon à ${next}</strong><small>Repartir de zéro avec des tarifs x${presMult(S.pres + 1)} définitifs.</small></div><button class="buy" id="pres" data-cost="0">Voir</button></div>`
      : `<p class="muted">Atteignez l'univers <b>${TIERS[TIERS.length - 1].n}</b> pour ouvrir un salon à ${next} (tarifs x${presMult(S.pres + 1)}).</p>`;
    let deco = `<h2>Décoration ${S.deco.length}/${DECO.length}</h2><p class="muted">Chaque objet apparaît dans le salon et ajoute +3 % à vos tarifs. La décoration vous suit de ville en ville.</p>`;
    for (const d of DECO) deco += `<div class="item ${has(d.id) ? 'owned' : ''}"><div class="grow"><strong>${d.n}</strong><small>+3 % sur les tarifs</small></div>` +
      (has(d.id) ? '<span class="tag">Installé</span>' : `<button class="buy" data-deco="${d.id}" data-cost="${d.cost}">${fmt(d.cost)} Ŧ</button>`) + '</div>';
    const bar = '<h2>Bar à couleurs</h2>' + (S.colbar
      ? `<div class="item owned"><div class="grow"><strong>Coloration</strong><small>Certains clients demandent une teinte : une étape de plus, paiement x1,5 · ${S.dyes.length}/${DYES.length} teintes trouvées</small></div><span class="tag">Ouvert</span></div>`
      : `<div class="item"><div class="grow"><strong>Ouvrir le bar à couleurs</strong><small>Des clients demanderont une coloration : paiement x1,5 et des teintes à collectionner. Propre au jeu.</small></div><button class="buy" data-colbar="1" data-cost="${COLBAR_COST}">${fmt(COLBAR_COST)} Ŧ</button></div>`);
    return top + h.replace('<h2>Ventes de produits</h2>', bar + deco + '<h2>Ventes de produits</h2>');
  }
  if (t === 'cuts') {
    const title = X.title();
    return `<h2>Trophées ${S.troph.length}/${TROPHIES.length}</h2><p class="muted">${title ? `Votre titre : <b>${title}</b>. ` : ''}Chaque trophée ajoute +1 % à vos tarifs.</p><div class="trophies">` +
      TROPHIES.map((x) => `<div class="${S.troph.includes(x.id) ? 'on' : ''}" data-tip="${esc(`<b>${x.n}</b>${x.d}<br>+1 % sur vos tarifs`)}">🏆</div>`).join('') + '</div>' + h +
      `<h2>Teintes ${S.dyes.length}/${DYES.length}</h2><p class="muted">${S.colbar ? 'Chaque teinte trouvée ajoute +1 % à vos tarifs. De nouvelles teintes arrivent avec chaque univers.' : 'Ouvrez le bar à couleurs dans « Mon salon » pour proposer des colorations.'}</p><div class="dyes">` +
      DYES.map((x, i) => (S.dyes.includes(i) ? `<span><i style="background:linear-gradient(135deg,${HAIRS[x[1]][1]},${HAIRS[x[1]][0]} 55%,${HAIRS[x[1]][2]})"></i>${x[0]}</span>` : '<span class="off"><i></i>???</span>')).join('') + '</div>';
  }
  if (t === 'salon') {
    return X.contest() + '<button class="btn cta" id="share2">Partager mon score</button>' +
      (installEvt ? '<button class="btn cta ghost" id="install">Installer le jeu sur mon téléphone</button>' : '<p class="muted">Astuce : ajoutez le jeu à votre écran d\'accueil depuis le menu de votre navigateur (« Ajouter à l\'écran d\'accueil »).</p>') + h;
  }
  return h;
};
X.click = (b) => {
  if (b.dataset.staff) {
    const i = +b.dataset.staff, c = staffCost(i);
    if (S.money < c || staffLvl(i) >= STAFF_MAX) return true;
    S.money -= c; S.staff[i] = staffLvl(i) + 1; sfx('coin');
  } else if (b.dataset.deco) {
    const d = DECO.find((x) => x.id === b.dataset.deco);
    if (!d || has(d.id) || S.money < d.cost) return true;
    S.money -= d.cost; S.deco.push(d.id); buildBg(); sfx('level');
    toast(`<b>${d.n}</b><br>Installé dans le salon : +3 % sur vos tarifs.`);
  } else if (b.dataset.colbar) {
    if (S.colbar || S.money < COLBAR_COST) return true;
    S.money -= COLBAR_COST; S.colbar = 1; sfx('level');
    toast('<b>Bar à couleurs ouvert</b><br>Certains clients demanderont une coloration.');
  } else if (b.id === 'wheel') showWheel();
  else if (b.id === 'pres') askPrestige();
  else if (b.id === 'share2') X.share();
  else if (b.id === 'install') { if (installEvt) { installEvt.prompt(); installEvt = null; } }
  else return false;
  return true;
};

/* =====================================================================
   9 ter. V8 : panneaux en icônes + infobulles, rendez-vous Planity, coordonnées, décor enrichi
   ===================================================================== */
const TOOL_IC = { ciseaux: '✂️', apprenti: '🧑‍🎓', lotion: '🧴', tondeuse: '🪒', bouche: '📣', hold: '👆', presentoir: '🛍️', formation: '🎓' };
const SVC_IC = { simple: '✂️', express: '⚡', enfant: '👦', militaire: '🪖', ado: '🧑', americaine: '🗽', barbe: '🧔', pere: '👨‍👦', massage: '💆', visage: '🧖', coupebarbe: '💈', complete: '👑' };
const MIS_IC = { served: '💇', taps: '👆', crits: '⭐', sales: '🛍️', turbo: '⚡', stars: '🌟' };
const DECO_IC = { plant: '🪴', frames: '🖼️', carpet: '🟥', vip: '💡', checker: '🏁', cup: '🏆' };
const STAFF_IC = ['👨‍🦱', '👩', '🧔', '👩‍🎨'];
const STEP_IC = { shampoo: '🧼', cut: '✂️', beard: '🧔', massage: '💆', soin: '🧖', finish: '💈', color: '🎨' };
const coin = (n) => `<i class="tc">T</i>${fmt(n)}`;
// Une tuile : grande icône, pastille (niveau), pied (prix ou état). L'explication est dans l'infobulle (appui long).
function tile(o) {
  return `<button type="button" class="ic ${o.cls || ''}" ${o.attrs || ''} data-tip="${esc(o.tip || '')}"><span class="em">${o.ic}</span>` +
    (o.badge !== undefined && o.badge !== '' ? `<span class="lv">${o.badge}</span>` : '') + `<span class="ft">${o.foot || ''}</span></button>`;
}
const HINT = '<p class="hintline">👆 Restez appuyé sur une icône pour voir à quoi elle sert</p>';
const RDV_BTN = () => `<a class="rdvbtn" href="${SALON.planity}" target="_blank" rel="noopener">📅 Prendre rendez-vous</a>`;

const panelV7 = X.panel;
X.panel = (t, h) => {
  if (t === 'tools') {
    const can = S.spin !== today();
    let o = HINT + '<div class="icg">' + tile(can
      ? { cls: 'buy', attrs: 'id="wheel" data-cost="0"', ic: '🎡', foot: '🎁', tip: `<b>Roue du jour</b>Un lancer gratuit par jour : pièces, Turbo, visite d'une personnalité…<br>Série en cours : ${S.streak} jour${S.streak > 1 ? 's' : ''}.` }
      : { cls: 'done', ic: '🎡', foot: '⏳', tip: '<b>Roue du jour</b>Déjà lancée aujourd\'hui. Revenez demain !' });
    S.mis.forEach((m, i) => {
      const M = MISSIONS[m.m], p = misProg(m), tip = `<b>Défi : ${M.t(m.n)}</b>Récompense : ${fmt(misReward())} ${COIN}`;
      o += p >= m.n
        ? tile({ cls: 'buy mq', attrs: `data-mis="${i}" data-cost="0"`, ic: MIS_IC[M.k], badge: '✓', foot: '🎁', tip })
        : tile({ cls: 'mq', attrs: `data-mq="${i}" style="--p:${p / m.n}"`, ic: MIS_IC[M.k], foot: `${p}/${m.n}`, tip });
    });
    o += `</div><p class="statline">✂️ ${power()} · 🧑‍🎓 ${autoRate()}/s · <i class="tc">T</i> x${mult().toFixed(2).replace('.', ',')}` + (boost > 0 ? ` · ⏱️ x2 ${Math.ceil(boost)} s` : '') + '</p><div class="icg">';
    for (const tl of TOOLS) {
      const l = lvl(tl.id), max = tl.max && l >= tl.max, tip = `<b>${tl.n}</b>${tl.d}<br>Niveau ${l}${max ? ' (maximum)' : ''}`;
      o += max ? tile({ cls: 'done', ic: TOOL_IC[tl.id], badge: l, foot: 'MAX', tip })
        : tile({ cls: 'buy', attrs: `data-tool="${tl.id}" data-cost="${toolCost(tl)}"`, ic: TOOL_IC[tl.id], badge: l || '', foot: coin(toolCost(tl)), tip });
    }
    return o + '</div>';
  }
  if (t === 'menu') {
    let o = HINT + '<div class="icg">';
    for (const s of SERVICES) {
      const own = S.svc.includes(s.id), tip = `<b>${s.n}</b>Au salon : ${fmtPrice(s)}${s.note ? ' · ' + s.note : ''}<br>${own ? 'Débloquée : vos clients la demandent.' : 'À débloquer pour que vos clients la demandent.'}`;
      o += own ? tile({ cls: 'done', ic: SVC_IC[s.id], foot: `${s.price} €`, tip })
        : tile({ cls: 'buy', attrs: `data-svc="${s.id}" data-cost="${s.cost}"`, ic: SVC_IC[s.id], badge: '🔒', foot: coin(s.cost), tip });
    }
    return o + '</div><p class="statline">La vraie carte du salon : les prix en € sont ceux de Tracy.</p>' + RDV_BTN();
  }
  if (t === 'biz') {
    const tn = tierNow(), nx = TIERS[tn + 1], next = CITIES[S.pres + 1], ready = tn >= TIERS.length - 1;
    let o = `<p class="statline big">🏙️ <b>${CITIES[S.pres]}</b> · ${TIERS[tn].n} · <i class="tc">T</i> x${X.mult().toFixed(2).replace('.', ',')}</p>`;
    if (nx) o += `<div class="bar big"><i style="width:${Math.min(100, (runTotal() - tierAt(tn)) / (tierAt(tn + 1) - tierAt(tn)) * 100)}%"></i></div>`;
    o += '<div class="tiers">' + TIERS.map((x, i) => `<span class="${i <= tn ? 'on' : ''}" data-tip="${esc(i <= tn ? `<b>${x.n}</b>${x.d}` : `<b>Univers à découvrir</b>À ${fmt(tierAt(i))} ${COIN} de gains dans ce salon.`)}">${i <= tn ? x.n : '?'}<small>x${String(x.m).replace('.', ',')}</small></span>`).join('') + '</div>';
    o += HINT + '<div class="icg">';
    if (next) o += ready
      ? tile({ cls: 'buy', attrs: 'id="pres" data-cost="0"', ic: '🏙️', badge: '+', foot: next, tip: `<b>Ouvrir un salon à ${next}</b>Vous repartez de zéro, avec des tarifs x${presMult(S.pres + 1)} pour toujours.` })
      : tile({ cls: 'done off', ic: '🏙️', badge: '🔒', foot: next, tip: `<b>Salon de ${next}</b>Atteignez l'univers ${TIERS[TIERS.length - 1].n} pour l'ouvrir (tarifs x${presMult(S.pres + 1)}).` });
    o += tile({ cls: 'done', ic: '💺', foot: 'Vous', tip: '<b>Fauteuil 1</b>Le vôtre : c\'est ici que vous coiffez.' });
    for (let i = 0; i < S.seats; i++) {
      const s = STAFF[i], l = staffLvl(i), pay = Math.round(seatPay() * X.seatMult(i)), per = (seatPeriod() * X.seatSpeed(i)).toFixed(1).replace('.', ',');
      const tip = `<b>${s.n} · ${s.sp}</b>${s.d}<br>+${fmt(pay)} ${COIN} toutes les ${per} s, sans clic.<br>Formation ${l}/${STAFF_MAX} (+25 % par niveau).`;
      o += l >= STAFF_MAX ? tile({ cls: 'done', ic: STAFF_IC[i], badge: l, foot: 'MAX', tip })
        : tile({ cls: 'buy', attrs: `data-staff="${i}" data-cost="${staffCost(i)}"`, ic: STAFF_IC[i], badge: l || '', foot: coin(staffCost(i)), tip });
    }
    if (S.seats < SEATS.length) o += tile({ cls: 'buy', attrs: `data-seat="1" data-cost="${SEATS[S.seats]}"`, ic: '💺', badge: '+', foot: coin(SEATS[S.seats]), tip: `<b>Ouvrir un fauteuil</b>${STAFF[S.seats].n} rejoint l'équipe et encaisse tout seul, sans clic.` });
    o += S.colbar ? tile({ cls: 'done', ic: '🎨', foot: `${S.dyes.length}/${DYES.length}`, tip: '<b>Bar à couleurs</b>Certains clients demandent une coloration : paiement x1,5. Teintes à retrouver dans l\'album.' })
      : tile({ cls: 'buy', attrs: `data-colbar="1" data-cost="${COLBAR_COST}"`, ic: '🎨', badge: '🔒', foot: coin(COLBAR_COST), tip: '<b>Bar à couleurs</b>Des clients demanderont une coloration : paiement x1,5 et 12 teintes à collectionner.' });
    for (const d of DECO) o += has(d.id) ? tile({ cls: 'done', ic: DECO_IC[d.id], foot: '✓', tip: `<b>${d.n}</b>Installé : +3 % sur vos tarifs.` })
      : tile({ cls: 'buy', attrs: `data-deco="${d.id}" data-cost="${d.cost}"`, ic: DECO_IC[d.id], foot: coin(d.cost), tip: `<b>${d.n}</b>Décore le salon et ajoute +3 % à vos tarifs. Vous suit de ville en ville.` });
    o += `</div><p class="statline">🛍️ ${S.salesN} vente${S.salesN > 1 ? 's' : ''} · <i class="tc">T</i>${fmt(S.salesSum)} · ${Math.round(offerChance() * 100)} % de chances par client</p>`;
    if (S.sales.length) o += '<table>' + S.sales.slice(0, 12).map((s) => `<tr><td>${new Date(s.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${s.n}</td><td>+${s.p} ${COIN}</td></tr>`).join('') + '</table>';
    return o;
  }
  h = panelV7(t, h);
  if (t === 'salon') h = RDV_BTN() + h;
  return h;
};
X.stats = () => { // progression des défis, sans reconstruire le panneau
  if (tab !== 'tools') return;
  panel.querySelectorAll('[data-mq]').forEach((el) => {
    const m = S.mis[+el.dataset.mq]; if (!m) return;
    const p = misProg(m);
    el.style.setProperty('--p', p / m.n); el.querySelector('.ft').textContent = `${p}/${m.n}`;
  });
};

/* ---------- Infobulles : appui long (tactile) ou survol (souris) ---------- */
const tipEl = document.createElement('div');
tipEl.id = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl);
let tipTimer = 0, tipKill = false, tipHide = 0, tipXY = null;
function showTip(el) {
  if (!el.dataset.tip) return;
  tipEl.innerHTML = el.dataset.tip; tipEl.hidden = false; clearTimeout(tipHide);
  const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, hh = tipEl.offsetHeight;
  tipEl.style.left = clamp(r.left + r.width / 2 - w / 2, 6, window.innerWidth - w - 6) + 'px';
  tipEl.style.top = (r.top - hh - 10 > 4 ? r.top - hh - 10 : r.bottom + 10) + 'px';
}
const hideTip = () => { tipEl.hidden = true; };
document.addEventListener('pointerdown', (e) => {
  clearTimeout(tipTimer); tipKill = false; hideTip();
  const el = e.target.closest('[data-tip]');
  if (!el || e.pointerType === 'mouse') return;
  tipXY = [e.clientX, e.clientY];
  tipTimer = setTimeout(() => { showTip(el); tipKill = true; if (navigator.vibrate) { try { navigator.vibrate(12); } catch { /* rien */ } } }, 380);
}, true);
document.addEventListener('pointermove', (e) => { if (tipXY && Math.hypot(e.clientX - tipXY[0], e.clientY - tipXY[1]) > 12) clearTimeout(tipTimer); }, true);
for (const evn of ['pointerup', 'pointercancel']) document.addEventListener(evn, () => { clearTimeout(tipTimer); tipXY = null; if (!tipEl.hidden) tipHide = setTimeout(hideTip, 2200); }, true);
document.addEventListener('click', (e) => { if (tipKill) { tipKill = false; e.stopPropagation(); e.preventDefault(); } }, true); // l'appui long n'achète pas
document.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-tip]')) e.preventDefault(); });
document.addEventListener('pointerover', (e) => { if (e.pointerType !== 'mouse') return; const el = e.target.closest('[data-tip]'); if (el) showTip(el); else hideTip(); });

/* ---------- Étapes en icônes sur la barre, cadeau raccourci ---------- */
const orderV7 = renderOrder;
renderOrder = function () { // eslint-disable-line no-func-assign
  orderV7();
  $('ticks').innerHTML += steps.map((s) => `<em style="left:${((s.from + s.to) * 50).toFixed(1)}%">${STEP_IC[s.k] || ''}</em>`).join('');
};
const giftV7 = renderGift;
renderGift = function () { // eslint-disable-line no-func-assign
  giftV7();
  const l = levelInfo().l;
  if (!S.code && l < REWARD.level) $('gift').textContent = `🎁 ${REWARD.label} au salon · niveau ${l}/${REWARD.level}`;
};

/* ---------- Rendez-vous : bulle après chaque client, fenêtre à chaque niveau ---------- */
const rdvEl = document.createElement('div');
rdvEl.id = 'rdv'; rdvEl.hidden = true; stage.appendChild(rdvEl);
let rdvT = 0, burst = 0;
function showRdv(c) {
  if (S.noRdv || S.tuto < 9 || simT !== null) return;
  const s = svcOf(c.svc);
  rdvEl.innerHTML = `<a class="go" href="${SALON.planity}" target="_blank" rel="noopener"><span>📅</span><b>Prendre rendez-vous</b><small>${s.n} · ${s.price} € au salon</small></a>` +
    '<button type="button" class="x" aria-label="Fermer">✕</button><button type="button" class="never">Ne plus afficher</button>';
  rdvEl.hidden = false; clearTimeout(rdvT); rdvT = setTimeout(() => { rdvEl.hidden = true; }, 6000);
}
rdvEl.addEventListener('click', (e) => {
  if (e.target.closest('.never')) { S.noRdv = 1; save(); rdvEl.hidden = true; toast('<b>Rappels désactivés</b><br>Le bouton de rendez-vous reste dans les onglets Carte et Infos.'); }
  else if (e.target.closest('.x')) rdvEl.hidden = true;
});
X.levelUp = (l, bonus) => {
  if (S.noRdv || simT !== null) return;
  const rec = (S.recent || []).slice(0, 3);
  later(() => {
    modal(`<h3>Niveau ${l} !</h3><p>Bonus : <b>+${fmt(bonus)} ${COIN}</b></p>` +
      (rec.length ? '<div class="lvcuts">' + rec.map((i) => `<figure><canvas data-pc="${i}"></canvas><figcaption>${CUTS[i].n}</figcaption></figure>`).join('') + '</div>' : '') +
      '<p class="lvq">Envie de la même coupe, en vrai ?</p>' +
      `<div class="lvreal">${SALON.photos.slice(0, 3).map((p, i) => `<img src="${p}" alt="Réalisation ${i + 1} du salon" loading="lazy">`).join('')}</div>` +
      `<a class="rdvbtn big" href="${SALON.planity}" target="_blank" rel="noopener">📅 Prendre rendez-vous sur Planity</a>` +
      `<p class="muted"><a href="tel:${SALON.phone.replace(/ /g, '')}">📞 ${SALON.phone}</a> · 📍 ${SALON.address}</p>` +
      '<label class="lvnever"><input type="checkbox" id="lv-never"> Ne plus afficher</label>', () => {
      if ($('lv-never') && $('lv-never').checked) { S.noRdv = 1; save(); }
    }, 'Continuer à jouer');
    $('modal-body').querySelectorAll('canvas[data-pc]').forEach((cv2) => portrait(cv2, +cv2.dataset.pc));
  });
};

/* ---------- Coordonnées du salon, toujours visibles en haut de la scène ---------- */
const infoEl = document.createElement('div');
infoEl.id = 'info';
infoEl.innerHTML = `<a href="tel:${SALON.phone.replace(/ /g, '')}">📞 ${SALON.phone}</a><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SALON.name + ' ' + SALON.address)}" target="_blank" rel="noopener">📍 ${SALON.address.replace(', 64000', ',')}</a>`;
stage.appendChild(infoEl);

/* ---------- Décor enrichi : briques, lambris, grand miroir éclairé ---------- */
X.wall = (g) => {
  g.strokeStyle = 'rgba(0,0,0,.13)'; g.lineWidth = 1; g.beginPath();
  for (let r = 0; r < 24; r++) { const y = -60 + r * 16; g.moveTo(-400, y); g.lineTo(760, y); for (let x = -400 + (r & 1) * 19; x < 760; x += 38) { g.moveTo(x, y); g.lineTo(x, y + 16); } }
  g.stroke();
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-400, 322, 1160, 90); // lambris
  g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 1.5;
  for (let x = -400; x < 760; x += 58) { rr(g, x + 5, 331, 48, 70, 3); g.stroke(); }
  g.fillStyle = 'rgba(217,184,95,.55)'; g.fillRect(-400, 320, 1160, 2.5);
  // miroir en arche derrière le fauteuil
  const arch = () => { g.beginPath(); g.moveTo(CX - 98, 408); g.lineTo(CX - 98, 222); g.arc(CX, 222, 98, Math.PI, 0); g.lineTo(CX + 98, 408); g.closePath(); };
  const gr = g.createLinearGradient(CX - 98, 120, CX + 98, 408);
  gr.addColorStop(0, 'rgba(210,228,240,.22)'); gr.addColorStop(0.5, 'rgba(210,228,240,.07)'); gr.addColorStop(1, 'rgba(210,228,240,.16)');
  arch(); g.fillStyle = gr; g.fill();
  g.save(); arch(); g.clip(); g.fillStyle = 'rgba(255,255,255,.07)';
  for (const x of [-70, -30]) { g.beginPath(); g.moveTo(CX + x, 110); g.lineTo(CX + x + 22, 110); g.lineTo(CX + x - 70, 420); g.lineTo(CX + x - 92, 420); g.closePath(); g.fill(); }
  g.restore();
  arch(); g.strokeStyle = '#b8963f'; g.lineWidth = 6; g.stroke(); g.strokeStyle = 'rgba(255,240,190,.5)'; g.lineWidth = 1.2; g.stroke();
  for (let i = 0; i <= 10; i++) { // ampoules de loge
    const a = Math.PI + i * Math.PI / 10, x = CX + Math.cos(a) * 108, y = 222 + Math.sin(a) * 108;
    const b = g.createRadialGradient(x, y, 0.5, x, y, 11); b.addColorStop(0, 'rgba(255,240,190,.75)'); b.addColorStop(1, 'rgba(255,240,190,0)');
    g.fillStyle = b; g.fillRect(x - 11, y - 11, 22, 22); g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill();
  }
};

/* ---------- Effets : vignette, éclat d'encaissement, confettis ; visages plus détaillés ---------- */
const drawV7 = X.draw, frontV7 = X.front, finV7 = X.onFinish, frameV7 = X.frame;
const CONF = ['#ff5e62', '#ffd36b', '#7fc79a', '#7fe0ff', '#c58bff', '#ffffff'];
X.draw = (g) => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const W = cv.width, H = cv.height, v = g.createRadialGradient(W / 2, H * 0.52, H * 0.3, W / 2, H * 0.52, H * 0.9);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.42)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.setTransform(k, 0, 0, k, ox, oy);
  if (burst > 0) { // onde dorée à l'encaissement
    const r = (1 - burst) * 190;
    g.strokeStyle = `rgba(255,214,110,${burst * 0.8})`; g.lineWidth = 10 * burst + 1; g.beginPath(); g.arc(CX, 270, r, 0, 7); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${burst * 0.5})`; g.lineWidth = 2; g.beginPath(); g.arc(CX, 270, r * 0.72, 0, 7); g.stroke();
  }
  drawV7(g);
};
X.frame = (dt) => {
  frameV7(dt);
  if (burst > 0) burst = Math.max(0, burst - dt * 1.8);
  if ((mini || ev) && !rdvEl.hidden) rdvEl.hidden = true; // ne gêne ni les gestes ni les événements
};
X.onFinish = (c, pay) => {
  finV7(c, pay);
  if (svcOf(c.svc).cut) { S.recent = [c.cut, ...(S.recent || []).filter((i) => i !== c.cut)].slice(0, 4); }
  if (simT !== null) return;
  burst = 1;
  for (let i = 0; i < 22 && parts.length < 190; i++) parts.push({ kind: 'bit', x: CX + rnd(120) - 60, y: 230 + rnd(40), a: Math.random() * 6, vx: (Math.random() - 0.5) * 420, vy: -260 - Math.random() * 260, va: (Math.random() - 0.5) * 16, life: 1.1 + Math.random() * 0.5, col: CONF[rnd(CONF.length)] });
  showRdv(c);
};
X.front = (g, c) => {
  if (c.star === undefined) { // petits détails propres à chaque client
    const sd = c.seed, sk = SKINS[c.skin];
    g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(CX + 4, 268, 2.6, 4, 0.3, 0, 7); g.fill(); // reflet du nez
    for (const sx of [-1, 1]) { g.fillStyle = 'rgba(255,255,255,.1)'; g.beginPath(); g.ellipse(CX + sx * 38, 268, 9, 5, sx * 0.4, 0, 7); g.fill(); }
    if (sd % 4 === 0) { g.fillStyle = 'rgba(120,70,40,.5)'; for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(CX + sx * (28 + (i * 7) % 17), 266 + (i * 5) % 11, 1.1, 0, 7); g.fill(); } }
    if (sd % 5 === 2) { g.fillStyle = sk[2]; g.beginPath(); g.arc(CX + 21, 291, 1.7, 0, 7); g.fill(); }
    if (sd % 3 === 0) { g.fillStyle = '#e8cc7c'; g.beginPath(); g.arc(CX - 64, 268, 2.6, 0, 7); g.fill(); }
    if (sd % 6 === 1) { // lunettes rondes
      g.strokeStyle = '#2a2826'; g.lineWidth = 2;
      for (const sx of [-1, 1]) { g.beginPath(); g.arc(CX + sx * 24, 250, 13.5, 0, 7); g.stroke(); g.fillStyle = 'rgba(255,255,255,.1)'; g.fill(); }
      g.beginPath(); g.moveTo(CX - 10.5, 249); g.quadraticCurveTo(CX, 245, CX + 10.5, 249); g.moveTo(CX - 37.5, 248); g.lineTo(CX - 58, 245); g.moveTo(CX + 37.5, 248); g.lineTo(CX + 58, 245); g.stroke();
    }
  }
  frontV7(g, c);
};

/* =====================================================================
   10. DÉMARRAGE
   ===================================================================== */
buildBg(); renderSeats(); renderPanel();
checkOffline();
if (!S.seen6) {
  S.seen6 = 1;
  later(() => modal('<h3>Bienvenue au salon</h3>' + X.contest() +
    '<p>Coiffez, gagnez des <b>Tracy coins</b> <i class="tc">T</i>, faites grandir votre salon et grimpez dans le classement 🏆.</p>' +
    '<p class="muted">Nouveau : bonus et roue du jour, événements surprises, coup parfait, équipe à former, décoration, trophées, salons à ouvrir dans d\'autres villes, nouveaux gestes, coloration et personnalités rares à collectionner.</p>', null, 'Jouer'));
}
checkDay();
setInterval(() => { checkDay(); checkTrophies(); }, 3000);
