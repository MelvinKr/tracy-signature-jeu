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
  { id: 't10k', n: 'Premier pactole', d: 'Encaisser 10 000 €', ok: () => S.total >= 1e4 },
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
for (const k of ['staff', 'deco', 'troph']) if (!Array.isArray(S[k])) S[k] = [];
S.base = S.base || 0; S.pres = S.pres || 0; S.streak = S.streak || 0;
let ev = null, evNext = 60 + rnd(50), boost = 0, starNext = false, pf = null, avgT = 8, lastFin = 0, installEvt = null;
const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => dayStr(new Date());
const unit = () => Math.max(10, seatPay() * 4); // « un lot » : suit le niveau du salon

// Fenêtres en file d'attente : une seule à la fois
const waiting = [];
function later(fn) { if ($('modal').hidden) fn(); else waiting.push(fn); }
$('modal-ok').addEventListener('click', () => setTimeout(() => { if ($('modal').hidden && waiting.length) waiting.shift()(); }, 0));

X.mult = () => presMult(S.pres) * (1 + 0.03 * S.deco.length) * (1 + 0.01 * S.troph.length) * (1 + Math.min(0.25, 0.005 * st('perfect')));
X.payMult = () => (ev && ev.k === 'rush' ? 3 : 1) * (ev && ev.k === 'wed' ? 2 : 1) * (boost > 0 ? 2 : 1);
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
  return `<div class="item owned"><div class="grow"><strong>${s.n} · ${s.sp}</strong><small>${s.d} · +${fmt(pay)} € toutes les ${per} s · formation ${l}/${STAFF_MAX}</small></div>` +
    (l >= STAFF_MAX ? '<span class="tag">MAX</span>' : `<button class="buy" data-staff="${i}" data-cost="${staffCost(i)}">Former · ${fmt(staffCost(i))} €</button>`) + '</div>';
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
  toast(e.k === 'wed' ? `<b>Vive les mariés !</b><br>Bouquet final : +${fmt(r)} €` : `<b>Vidéo virale !</b><br>Pourboire géant : +${fmt(r)} €`);
  renderStats(); checkTier();
}
X.onFinish = () => {
  const now = nowMs();
  if (lastFin && now - lastFin < 60000) avgT += ((now - lastFin) / 1000 - avgT) * 0.2; // durée moyenne d'un client
  lastFin = now;
  if (navigator.vibrate && simT === null) { try { navigator.vibrate([15, 30, 25]); } catch { /* rien */ } }
  if (ev && ev.n) { ev.n--; if (ev.n <= 0) endEvent(true); else evText(); }
};

/* =====================================================================
   5. COUP PARFAIT
   ===================================================================== */
const pfPos = () => 0.5 + 0.5 * Math.sin(pf.ph + pf.t * 6);
X.perfect = (c) => {
  if (simT !== null || S.served < 3) return false;
  if (c.star === undefined && !c.vip && Math.random() > 0.4) return false;
  phase = 'perfect'; pf = { t: 0, T: 1.9, ph: Math.random() * 6 };
  return true;
};
function pfEnd(f, txt) {
  pf = null; phase = 'cut';
  if (f > 1) { bump('perfect'); floatText(txt, 180, 250, 'crit'); sfx('coin'); }
  finishClient(f);
}
X.perfectTap = () => {
  if (!pf || pf.t < 0.25) return; // petit délai : un clic lancé trop tôt ne compte pas
  const d = Math.abs(pfPos() - 0.5);
  if (d < 0.06) pfEnd(2, 'PARFAIT ! ★★★★★ x2');
  else if (d < 0.19) pfEnd(1.5, 'Bien joué ! ★★★★ x1,5');
  else pfEnd(1, '');
};

X.frame = (dt) => {
  if (boost > 0) boost -= dt;
  if (pf) { pf.t += dt; if (pf.t > pf.T) pfEnd(1, ''); }
  if (ev) {
    ev.t -= dt; evEl.querySelector('u').style.width = Math.max(0, ev.t / ev.T * 100) + '%';
    if (ev.t <= 0) endEvent(false);
  } else if (S.served >= 5 && phase === 'cut' && nowMs() - lastTap < 5000 && $('modal').hidden) {
    evNext -= dt; if (evNext <= 0) startEvent();
  }
};
X.draw = (g) => {
  if (!pf) return;
  const x0 = 60, w = 240, y = 304, p = pfPos(); // sous le visage : le haut de la scène est pris par les messages
  g.fillStyle = 'rgba(0,0,0,.6)'; rr(g, x0 - 8, y - 26, w + 16, 54, 10); g.fill();
  g.fillStyle = '#f4ecdc'; g.font = '600 13px Outfit, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('Coup parfait : touchez au bon moment', CX, y - 12);
  g.fillStyle = '#4a443c'; rr(g, x0, y, w, 16, 8); g.fill();
  g.fillStyle = '#7fc79a'; g.fillRect(x0 + w * 0.31, y, w * 0.38, 16);
  g.fillStyle = '#ffd36b'; g.fillRect(x0 + w * 0.44, y, w * 0.12, 16);
  g.fillStyle = '#fff'; rr(g, x0 + w * p - 3, y - 4, 6, 24, 3); g.fill();
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
  const text = `J'ai encaissé ${fmt(S.total)} € au jeu ${SALON.name}. Tu fais mieux ?`, url = location.origin + '/';
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
  later(() => modal(`<h3>Bonus du jour</h3><p>${streak > 1 ? `<b>${streak} jours de suite !</b> ` : ''}Tracy vous offre <b>${fmt(r)} €</b> pour bien démarrer.</p>` +
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
      if (type === 'cash') { const r = unit() * v; earn(r); cash(v >= 50 ? 40 : 16, CX, 240); msg = `${label} : +${fmt(r)} €`; }
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
  later(() => { modal(`<h3>Pendant votre absence…</h3><p>Vous êtes parti ${h ? h + ' h ' : ''}${m} min. Votre équipe a continué à coiffer : <b>+${fmt(r)} €</b>.</p>` +
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
      (has(d.id) ? '<span class="tag">Installé</span>' : `<button class="buy" data-deco="${d.id}" data-cost="${d.cost}">${fmt(d.cost)} €</button>`) + '</div>';
    return top + h.replace('<h2>Ventes de produits</h2>', deco + '<h2>Ventes de produits</h2>');
  }
  if (t === 'cuts') {
    const title = X.title();
    return `<h2>Trophées ${S.troph.length}/${TROPHIES.length}</h2><p class="muted">${title ? `Votre titre : <b>${title}</b>. ` : ''}Chaque trophée ajoute +1 % à vos tarifs.</p><div class="trophies">` +
      TROPHIES.map((x) => `<div class="${S.troph.includes(x.id) ? 'on' : ''}"><b>${x.n}</b><small>${x.d}</small></div>`).join('') + '</div>' + h;
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
  } else if (b.id === 'wheel') showWheel();
  else if (b.id === 'pres') askPrestige();
  else if (b.id === 'share2') X.share();
  else if (b.id === 'install') { if (installEvt) { installEvt.prompt(); installEvt = null; } }
  else return false;
  return true;
};

/* =====================================================================
   10. DÉMARRAGE
   ===================================================================== */
buildBg(); renderSeats(); renderPanel();
checkOffline();
if (!S.seen6) {
  S.seen6 = 1;
  later(() => modal('<h3>Bienvenue au salon</h3>' + X.contest() +
    '<p>Coiffez, encaissez, faites grandir votre salon et grimpez dans le classement 🏆.</p>' +
    '<p class="muted">Nouveau : bonus et roue du jour, événements surprises, coup parfait, équipe à former, décoration, trophées, et des salons à ouvrir dans d\'autres villes.</p>', null, 'Jouer'));
}
checkDay();
setInterval(() => { checkDay(); checkTrophies(); }, 3000);
