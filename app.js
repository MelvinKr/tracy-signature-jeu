/* Signature Cut by Tracy – le jeu (clicker) · V2
   Rendu vectoriel lisse sur canvas, net sur tous les écrans. Tout est local (localStorage).
   Données du salon : fiche Planity « Signature cut by Tracy », consultée le 12/11/2026. */
'use strict';

/* =====================================================================
   1. DONNÉES
   ===================================================================== */
const SALON = {
  name: 'Signature Cut by Tracy',
  address: '4 rue Beaumarchais, 64000 Pau',
  phone: '06 49 11 13 10',
  planity: 'https://www.planity.com/signaturec-cut-by-tracy-64000-pau',
  rating: '5/5 sur Planity (14 avis)',
  offer: '-10 % sur votre première prestation (sur appel au salon)',
  siret: 'à compléter',
  photos: ['img/real1.jpg', 'img/real2.jpg', 'img/real3.jpg', 'img/real4.jpg', 'img/real5.jpg'],
  hours: [
    ['Lundi', '09:00 - 19:00'], ['Mardi', '09:00 - 19:00'], ['Mercredi', '09:00 - 15:00'],
    ['Jeudi', '09:00 - 19:00'], ['Vendredi', '09:00 - 19:00'], ['Samedi', '09:00 - 12:00'],
    ['Dimanche', 'Fermé'],
  ],
};

// Récompense : code de réduction. À VALIDER avec Tracy (montant, conditions).
// Il faut atteindre le niveau ET avoir joué activement au moins minMinutes.
const REWARD = { level: 12, minMinutes: 15, label: '-10 %', terms: 'Valable une fois, sur présentation au salon.' };
const XP0 = 75; // vitesse des niveaux (voir xpNeed) : réglé pour ~15 min au niveau 12 en jouant vite

// La vraie carte du salon : prix et durées Planity. "cost" = prix de déblocage dans le jeu.
const SERVICES = [
  { id: 'simple', n: 'Coupe simple', price: 15, min: 10, cost: 0, cut: true },
  { id: 'express', n: 'Taille express (sans lame)', price: 15, min: 15, cost: 40, cut: false, beard: 1 },
  { id: 'enfant', n: 'Coupe enfant garçon (-10 ans)', price: 12, min: 20, cost: 60, cut: true, kid: true },
  { id: 'militaire', n: 'Coupe militaire', price: 15, min: 30, cost: 100, cut: true, force: 2, note: 'sur justificatif militaire' },
  { id: 'ado', n: 'Coupe ado garçon', price: 17, min: 20, cost: 150, cut: true, kid: true },
  { id: 'americaine', n: 'Coupe américaine', price: 20, min: 30, cost: 300, cut: true, force: 9 },
  { id: 'barbe', n: 'Taille de barbe', price: 20, min: 20, cost: 500, cut: false, beard: 2 },
  { id: 'pere', n: 'Pack Père & Fils', price: 30, min: 60, cost: 900, cut: true, note: "jusqu'à 30 €" },
  { id: 'massage', n: 'Coupe + massage crânien', price: 35, min: 30, cost: 1500, cut: true, massage: true },
  { id: 'visage', n: 'Coupe + soin visage', price: 35, min: 30, cost: 2500, cut: true },
  { id: 'coupebarbe', n: 'Coupe + barbe', price: 45, min: 50, cost: 4000, cut: true, beard: 2 },
  { id: 'complete', n: 'Coupe + massage crânien + barbe + soin visage', price: 65, min: 60, cost: 8000, cut: true, beard: 2, massage: true },
];

const TOOLS = [
  { id: 'ciseaux', n: 'Ciseaux affûtés', d: '+1 de puissance par clic', base: 20, g: 1.45 },
  { id: 'apprenti', n: 'Apprenti', d: 'Coupe tout seul : +2 par seconde', base: 90, g: 1.5 },
  { id: 'lotion', n: 'Lotion & soin', d: '+10 % sur chaque prestation', base: 150, g: 1.6 },
  { id: 'tondeuse', n: 'Tondeuse pro', d: '+4 de puissance par clic', base: 220, g: 1.5 },
  { id: 'bouche', n: 'Bouche-à-oreille', d: '+5 % de clients généreux (x3)', base: 400, g: 1.7, max: 10 },
];

/* 30 coupes. t = forme du dessus, H = hauteur, sd = côtés (0 rasé … 3 plein),
   fade = [début, fin, opacité restante] du dégradé, hl = ligne du front, tex = texture. */
const F = { taper: [246, 264, 0.3], low: [236, 258, 0], mid: [220, 250, 0], high: [200, 238, 0] };
const CUTS = [
  { n: 'Coupe simple', t: 'round', H: 16, sd: 2, d: 'Courte et nette aux ciseaux : la base de tout.' },
  { n: 'Buzz cut', t: 'round', H: 5, sd: 1, tex: 'buzz', alpha: 0.8, d: 'Tout à la tondeuse, même longueur partout.' },
  { n: 'Coupe militaire', t: 'flat', H: 8, sd: 1, tex: 'buzz', fade: F.high, d: 'Très court dessus, côtés rasés. Réglementaire.' },
  { n: 'Crew cut', t: 'round', H: 13, sd: 2, fade: [232, 262, 0.45], d: 'Court dessus, encore plus court sur les côtés.' },
  { n: 'Taper', t: 'round', H: 22, sd: 3, fade: F.taper, d: 'Fondu discret, seulement aux pattes et à la nuque.' },
  { n: 'Low fade', t: 'round', H: 22, sd: 2, fade: F.low, d: 'Dégradé bas : le fondu démarre juste au-dessus de l\'oreille.' },
  { n: 'Mid fade', t: 'round', H: 22, sd: 2, fade: F.mid, d: 'Dégradé à mi-hauteur, le plus demandé.' },
  { n: 'High fade', t: 'flat', H: 20, sd: 2, fade: F.high, d: 'Dégradé haut : le fondu monte jusqu\'aux tempes.' },
  { n: 'Dégradé à blanc', t: 'round', H: 18, sd: 2, fade: [206, 246, 0], d: 'Le fondu descend jusqu\'à la peau, à la tondeuse sans sabot.' },
  { n: 'Coupe américaine', t: 'flat', H: 18, sd: 2, fade: [222, 262, 0.3], d: 'Dégradé progressif et dessus structuré.' },
  { n: 'Drop fade', t: 'spiky', H: 22, sd: 2, tex: 'spiky', fade: [226, 254, 0], d: 'Le dégradé plonge derrière l\'oreille.' },
  { n: 'Burst fade', t: 'curly', H: 24, sd: 2, tex: 'curly', fade: [232, 256, 0], bk: 1, d: 'Fondu en arc de cercle autour de l\'oreille.' },
  { n: 'French crop', t: 'round', H: 14, sd: 2, hl: 'crop', fade: F.mid, d: 'Frange courte et droite, côtés dégradés.' },
  { n: 'Crop texturé', t: 'spiky', H: 18, sd: 2, hl: 'zig', tex: 'spiky', fade: F.mid, d: 'Frange effilée et mèches travaillées.' },
  { n: 'Caesar', t: 'round', H: 10, sd: 2, hl: 'crop', d: 'Courte, frange horizontale ramenée vers l\'avant.' },
  { n: 'Edgar', t: 'flat', H: 14, sd: 2, hl: 'crop', fade: [204, 238, 0], d: 'Frange droite très nette et dégradé haut.' },
  { n: 'Ivy League', t: 'round', H: 18, sd: 2, hl: 'part', fade: [234, 262, 0.4], d: 'Crew cut plus long, coiffé sur le côté.' },
  { n: 'Raie sur le côté', t: 'round', H: 18, sd: 3, hl: 'part', d: 'Classique : raie marquée et finitions soignées.' },
  { n: 'Slick back', t: 'round', H: 14, sd: 2, tex: 'slick', hl: 'high', d: 'Cheveux plaqués vers l\'arrière.' },
  { n: 'Undercut', t: 'round', H: 24, sd: 1, tex: 'slick', hl: 'high', fade: [206, 211, 0.4], d: 'Dessus long, côtés très courts, sans fondu.' },
  { n: 'Pompadour', t: 'pomp', H: 46, sd: 2, tex: 'slick', hl: 'high', fade: [224, 254, 0.2], d: 'Volume relevé sur le devant.' },
  { n: 'Quiff', t: 'quiff', H: 40, sd: 2, hl: 'high', fade: F.mid, d: 'Mèche avant brossée vers le haut.' },
  { n: 'Faux hawk', t: 'round', H: 8, sd: 2, hawk: { w: 27, H: 34 }, fade: F.mid, d: 'Crête douce, côtés courts.' },
  { n: 'Crête', t: 'none', H: 0, sd: 0, hawk: { w: 14, H: 58 }, tex: 'spiky', d: 'Côtés rasés, bande centrale dressée.' },
  { n: 'Flat top', t: 'flat', H: 36, sd: 2, fade: F.mid, d: 'Dessus coupé parfaitement à plat.' },
  { n: 'Curly top fade', t: 'curly', H: 32, sd: 2, tex: 'curly', fade: [214, 246, 0], d: 'Boucles gardées dessus, dégradé sur les côtés.' },
  { n: 'Afro taper', t: 'afro', H: 44, sd: 2, wx: 22, tex: 'curly', fade: [244, 266, 0.2], d: 'Volume afro, contours fondus.' },
  { n: 'Waves 360', t: 'round', H: 7, sd: 2, tex: 'waves', fade: F.mid, d: 'Ondulations brossées tout autour du crâne.' },
  { n: 'Mullet moderne', t: 'spiky', H: 22, sd: 2, tex: 'spiky', bk: 2, fade: [222, 250, 0], d: 'Court devant, long sur la nuque.' },
  { n: 'Man bun', t: 'round', H: 10, sd: 2, tex: 'slick', hl: 'high', bun: true, fade: [236, 262, 0.4], d: 'Cheveux longs attachés en chignon.' },
];

// [base, clair, ombre]
const SKINS = [
  ['#f1c9a5', '#fbe0c6', '#d49f78'], ['#e2b188', '#f2cba6', '#bf8a5e'],
  ['#b98253', '#d19c6c', '#925d37'], ['#7b4c2f', '#96623f', '#57331d'],
];
const HAIRS = [
  ['#26201f', '#5a4c4a', '#0f0c0c'], ['#4b2f20', '#7d5236', '#2a180f'], ['#7c5230', '#a97a4c', '#52341b'],
  ['#d6ae56', '#f4d98f', '#a07a2c'], ['#b3552d', '#dd8250', '#7c3516'], ['#a3a3aa', '#d6d6dc', '#6d6d75'],
];
const EYES = ['#5b3a21', '#3d6b8c', '#4d7a4a', '#2e2a26'];

const fmtPrice = (s) => `${s.price} € · ${s.min} min`;
const FACTS = [
  `Le salon est au <b>${SALON.address}</b>.`,
  'Réservation en ligne <b>24h/24 sur Planity</b>.',
  `Offre du moment : <b>${SALON.offer}</b>.`,
  `Le salon est noté <b>${SALON.rating}</b>.`,
  'Ouvert du lundi au vendredi dès <b>9h</b>, le samedi matin aussi.',
  'Le mercredi, le salon ferme à <b>15h</b>.',
  'Taille de barbe : à la <b>tondeuse ou traditionnelle</b>.',
  ...SERVICES.map((s) => `Au salon : <b>${s.n}</b>, ${fmtPrice(s)}.`),
];

/* =====================================================================
   2. ÉTAT ET SAUVEGARDE
   ===================================================================== */
const KEY = 'tsj-v2';
const fresh = () => ({ money: 0, total: 0, served: 0, xp: 0, playSec: 0, tools: {}, svc: ['simple'], cuts: [], client: null, work: 0, code: '', sound: true });
let S = fresh();
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { /* stockage indisponible */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* rien */ } };

const lvl = (id) => S.tools[id] || 0;
const power = () => 1 + lvl('ciseaux') + 4 * lvl('tondeuse');
const autoRate = () => 2 * lvl('apprenti');
const mult = () => 1 + 0.1 * lvl('lotion') + 0.02 * S.cuts.length;
const toolCost = (t) => Math.floor(t.base * Math.pow(t.g, lvl(t.id)));
const svcOf = (id) => SERVICES.find((s) => s.id === id);
const xpNeed = (n) => Math.floor(XP0 * Math.pow(n, 2.2));
function levelInfo() {
  let l = 1, x = S.xp;
  while (x >= xpNeed(l)) { x -= xpNeed(l); l++; }
  return { l, x, need: xpNeed(l) };
}

function fmt(n) {
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('fr-FR');
  if (n < 1e6) return (n / 1e3).toFixed(1).replace('.', ',') + ' k';
  if (n < 1e9) return (n / 1e6).toFixed(2).replace('.', ',') + ' M';
  return (n / 1e9).toFixed(2).replace('.', ',') + ' Md';
}
const rnd = (n) => Math.floor(Math.random() * n);
function rng(seed) { // générateur reproductible : même client, même dessin
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ---------- Code de réduction ---------- */
const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function checksum(body) {
  let h = 2166136261;
  for (const ch of 'tracy-pau-64' + body) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return ALPHA[(h >>> 3) % 32] + ALPHA[(h >>> 11) % 32];
}
function makeCode() { let b = ''; for (let i = 0; i < 4; i++) b += ALPHA[rnd(32)]; return `TS-${b}-${checksum(b)}`; }
function codeValid(code) {
  const m = /^TS-([A-Z2-9]{4})-([A-Z2-9]{2})$/.exec(code.trim().toUpperCase());
  return !!m && checksum(m[1]) === m[2];
}

/* =====================================================================
   3. CLIENTS
   ===================================================================== */
let tufts = [], cutCount = 0, lastPt = { x: 180, y: 190 };

function newClient() {
  const owned = SERVICES.filter((s) => S.svc.includes(s.id));
  const top = owned.slice(-3);
  const svc = Math.random() < 0.7 ? top[rnd(top.length)] : owned[rnd(owned.length)];
  const avail = Math.min(CUTS.length, 1 + Math.floor(S.served / 2));
  let cut;
  if (svc.force !== undefined) cut = svc.force;
  else {
    const news = [];
    for (let i = 0; i < avail; i++) if (!S.cuts.includes(i)) news.push(i);
    cut = news.length && Math.random() < 0.6 ? news[0] : rnd(avail);
  }
  const hasBeard = svc.beard !== undefined;
  const stubble = svc.kid ? 0 : rnd(2);
  S.client = {
    svc: svc.id, cut, skin: rnd(SKINS.length), hair: rnd(HAIRS.length), eye: rnd(EYES.length), seed: rnd(1e9),
    b0: hasBeard ? 3 : stubble, b1: hasBeard ? svc.beard : stubble,
    need: 20 + svc.min, vip: Math.random() < 0.05 * lvl('bouche'),
  };
  S.work = 0;
  setupClient();
}

function setupClient() {
  buildTufts();
  cutCount = Math.floor(S.work / S.client.need * tufts.length);
  for (let i = 0; i < cutCount; i++) tufts[i].gone = true;
  buildClientLayer();
  renderOrder();
}

function finishClient() {
  const c = S.client, svc = svcOf(c.svc);
  const pay = Math.round(svc.price * mult() * (c.vip ? 3 : 1));
  const before = levelInfo().l;
  S.money += pay; S.total += pay; S.served++; S.xp += c.need;
  floatText(`+${fmt(pay)} €`, 180, 150, c.vip ? 'pay vip' : 'pay');
  for (const t of tufts) if (!t.gone) dropTuft(t);
  for (let i = 0; i < 26; i++) spark(110 + rnd(140), 130 + rnd(160));
  shake = 1; sfx('coin');

  const after = levelInfo().l;
  if (after > before) levelUp(after);
  else if (svc.cut && !S.cuts.includes(c.cut)) {
    S.cuts.push(c.cut);
    toast(`<b>Nouvelle coupe : ${CUTS[c.cut].n}</b><br>${CUTS[c.cut].d}`);
    if (tab === 'cuts') renderPanel();
  } else if (S.served % 3 === 0) toast(`<b>Le saviez-vous ?</b><br>${FACTS[rnd(FACTS.length)]}`);
  if (svc.cut && !S.cuts.includes(c.cut)) S.cuts.push(c.cut);

  phase = 'done'; phaseT = 0.45;
  renderStats(); checkReward(); save();
}

function levelUp(l) {
  const bonus = l * 15;
  S.money += bonus;
  sfx('level');
  const left = REWARD.level - l;
  toast(`<b>Niveau ${l} !</b> Bonus : +${bonus} €<br>` + (S.code ? 'Continuez, la collection vous attend.' : left > 0 ? `Code de réduction dans ${left} niveau${left > 1 ? 'x' : ''}.` : 'Votre code de réduction est tout proche !'));
}

function checkReward() {
  if (S.code || levelInfo().l < REWARD.level || S.playSec < REWARD.minMinutes * 60) return;
  S.code = makeCode();
  save(); renderGift(); showCode(true);
}

function showCode(first) {
  modal(`<h3>${first ? 'Bravo !' : 'Votre code'}</h3>` +
    `<p>${first ? `Niveau ${REWARD.level} atteint. ` : ''}Votre réduction de <b>${REWARD.label}</b> chez ${SALON.name} :</p>` +
    `<div class="code">${S.code}</div><p class="muted">${REWARD.terms}<br>Faites une capture d'écran et montrez-la à Tracy.</p>`);
  if (first) sfx('level');
}

function addWork(w) {
  if (phase !== 'cut') return;
  S.work += w;
  const c = S.client;
  if (S.work >= c.need) { S.work = c.need; finishClient(); return; }
  const target = Math.floor(S.work / c.need * tufts.length);
  while (cutCount < target) {
    let best = null, bd = 1e9;
    for (const t of tufts) {
      if (t.gone) continue;
      const d = (t.mx - lastPt.x) ** 2 + (t.my - lastPt.y) ** 2;
      if (d < bd) { bd = d; best = t; }
    }
    if (!best) break;
    dropTuft(best); cutCount++;
  }
}

/* =====================================================================
   4. DESSIN
   ===================================================================== */
const V = { w: 360, h: 440 }, CX = 180, SKY = 225, RX = 60, RY = 55;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const bg = document.createElement('canvas'), layer = document.createElement('canvas'), scratch = document.createElement('canvas');
let k = 1, ox = 0, oy = 0, dpr = 1;
const logoImg = new Image();
logoImg.onload = () => buildBg();
logoImg.src = 'img/logo.jpg';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function smooth(g, pts) {
  g.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]);
}
function headPath(g) {
  g.beginPath(); g.moveTo(CX, 170);
  g.bezierCurveTo(CX + 40, 170, CX + 60, 195, CX + 60, 228);
  g.bezierCurveTo(CX + 60, 264, CX + 54, 294, CX + 34, 314);
  g.bezierCurveTo(CX + 20, 328, CX - 20, 328, CX - 34, 314);
  g.bezierCurveTo(CX - 54, 294, CX - 60, 264, CX - 60, 228);
  g.bezierCurveTo(CX - 60, 195, CX - 40, 170, CX, 170);
  g.closePath();
}

/* ---------- Cheveux ---------- */
const HL = {
  std: [[47, 222], [45, 202], [32, 187], [0, 181], [-32, 187], [-45, 202], [-47, 222]],
  high: [[47, 222], [45, 200], [30, 182], [0, 176], [-30, 182], [-45, 200], [-47, 222]],
  crop: [[47, 222], [47, 200], [20, 196], [-20, 196], [-47, 200], [-47, 222]],
  part: [[47, 222], [45, 202], [30, 187], [-8, 183], [-30, 190], [-44, 203], [-47, 222]],
};
function hairShape(g, c) {
  const sT = [0, 3, 6, 10][c.sd];
  g.beginPath();
  if (c.t !== 'none') {
    const pts = [], n = 40, a0 = c.t === 'afro' ? -0.45 : 0;
    for (let i = 0; i <= n; i++) {
      const th = Math.PI - a0 - (Math.PI - 2 * a0) * i / n;
      const u = Math.cos(th), s = Math.sin(th);
      let H = c.H, fx = u, fy = s;
      if (c.t === 'flat') { fx = clamp(u * 1.3, -1, 1); fy = Math.min(1, s * 1.35); }
      else if (c.t === 'spiky') H = c.H * (i % 2 ? 1 : 0.68);
      else if (c.t === 'curly' || c.t === 'afro') H = c.H * (0.84 + 0.16 * Math.abs(Math.sin(th * 10)));
      else if (c.t === 'quiff') H = c.H * (0.45 + 0.55 * (1 + u) / 2);
      else if (c.t === 'pomp') H = c.H * (1 - 0.3 * u * u);
      const rx = RX + sT + (c.wx || 0), ry = RY + sT + (H - sT) * Math.pow(Math.max(0, s), 0.85);
      pts.push([CX + rx * fx, s < 0 ? SKY - 50 * s : SKY - ry * fy]);
    }
    const bx = RX + sT * 0.4 - 1;
    g.moveTo(CX - bx, 264);
    if (c.t === 'spiky') pts.forEach((p) => g.lineTo(p[0], p[1])); else smooth(g, pts);
    g.lineTo(CX + bx, 264); g.lineTo(CX + 50, 264);
    if (c.hl === 'zig') {
      g.lineTo(CX + 47, 222); g.lineTo(CX + 47, 198);
      for (let x = 40, i = 0; x >= -40; x -= 10, i++) g.lineTo(CX + x, i % 2 ? 193 : 204);
      g.lineTo(CX - 47, 198); g.lineTo(CX - 47, 222);
    } else smooth(g, (HL[c.hl] || HL.std).map((p) => [CX + p[0], p[1]]));
    g.lineTo(CX - 50, 264); g.closePath();
  }
  if (c.hawk) {
    const w = c.hawk.w, top = 170 - c.hawk.H;
    g.moveTo(CX - w, 190);
    g.bezierCurveTo(CX - w, top + 14, CX - w * 0.6, top, CX, top - 4);
    g.bezierCurveTo(CX + w * 0.6, top, CX + w, top + 14, CX + w, 190);
    g.quadraticCurveTo(CX, 180, CX - w, 190);
  }
  if (c.bun) { g.moveTo(CX + 19, 150 - c.H); g.arc(CX, 150 - c.H, 19, 0, Math.PI * 2); }
}

function hairTexture(g, c, pal, r) {
  const tex = c.tex || 'radial';
  g.lineCap = 'round';
  const pick = (i) => { g.strokeStyle = i % 2 ? pal[1] : pal[2]; g.globalAlpha = i % 2 ? 0.34 : 0.5; };
  if (tex === 'buzz') {
    for (let i = 0; i < 700; i++) { g.fillStyle = i % 3 ? pal[2] : pal[1]; g.globalAlpha = 0.5; g.fillRect(CX - 80 + r() * 160, 150 + r() * 120, 1.3, 1.3); }
  } else if (tex === 'waves') {
    g.lineWidth = 2.6;
    for (let rad = 12, i = 0; rad < 120; rad += 8, i++) { pick(i); g.beginPath(); g.arc(CX, 208, rad, Math.PI, Math.PI * 2); g.stroke(); }
  } else if (tex === 'curly') {
    g.lineWidth = 2;
    for (let i = 0; i < 170; i++) {
      pick(i); const x = CX - 95 + r() * 190, y = 100 + r() * 170, a = r() * 6.3;
      g.beginPath(); g.arc(x, y, 3.5 + r() * 4, a, a + 3.6); g.stroke();
    }
  } else if (tex === 'slick') {
    for (let x = -66, i = 0; x <= 66; x += 3.5, i++) {
      pick(i); g.lineWidth = 1.2 + r() * 1.6;
      g.beginPath(); g.moveTo(CX + x, 226); g.quadraticCurveTo(CX + x * 1.02, 180, CX + x * 0.55, 90); g.stroke();
    }
  } else {
    const spiky = tex === 'spiky', nb = spiky ? 70 : 95;
    for (let i = 0; i < nb; i++) {
      pick(i); g.lineWidth = spiky ? 1.6 + r() * 2.2 : 1 + r() * 1.8;
      const a = Math.PI + r() * Math.PI, len = 30 + r() * 100, x0 = CX - 10 + r() * 20, y0 = (spiky ? 214 : 192) + r() * 10;
      const x1 = x0 + Math.cos(a) * len * 1.05, y1 = y0 + Math.sin(a) * len;
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 16, (y0 + y1) / 2 - (spiky ? 0 : 8), x1, y1); g.stroke();
    }
  }
  g.globalAlpha = 1;
}

// Dessine la coupe dans un calque à part pour pouvoir fondre le dégradé vers la peau.
function renderHair(g, c, pal, kk, seed) {
  scratch.width = Math.ceil(V.w * kk); scratch.height = Math.ceil(V.h * kk);
  const h = scratch.getContext('2d');
  h.setTransform(kk, 0, 0, kk, 0, 0);
  hairShape(h, c); h.fillStyle = pal[0]; h.fill();
  h.save(); hairShape(h, c); h.clip();
  hairTexture(h, c, pal, rng(seed));
  if (c.hl === 'part') { h.strokeStyle = pal[2]; h.globalAlpha = 0.8; h.lineWidth = 2.5; h.beginPath(); h.moveTo(CX - 22, 190); h.quadraticCurveTo(CX - 30, 170, CX - 22, 140); h.stroke(); h.globalAlpha = 1; }
  const top = 170 - c.H - (c.hawk ? c.hawk.H : 0);
  const gl = h.createRadialGradient(CX - 26, top + 22, 2, CX - 26, top + 22, 78);
  gl.addColorStop(0, 'rgba(255,255,255,.3)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  h.fillStyle = gl; h.fillRect(0, 0, V.w, V.h);
  const sh = h.createLinearGradient(CX, 0, CX + 80, 0);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)');
  h.fillStyle = sh; h.fillRect(0, 0, V.w, V.h);
  h.restore();
  hairShape(h, c); h.strokeStyle = pal[2]; h.lineWidth = 1.6; h.lineJoin = 'round'; h.stroke();
  // liseré clair : détache la coupe du décor, même en cheveux noirs
  h.save(); hairShape(h, c); h.clip(); h.translate(1.5, 2.5); hairShape(h, c); h.strokeStyle = 'rgba(255,240,205,.5)'; h.lineWidth = 2; h.stroke(); h.restore();
  h.globalCompositeOperation = 'destination-in';
  if (c.alpha) { h.fillStyle = `rgba(0,0,0,${c.alpha})`; h.fillRect(0, 0, V.w, V.h); }
  if (c.fade) {
    const gr = h.createLinearGradient(0, c.fade[0], 0, c.fade[1]);
    gr.addColorStop(0, '#000'); gr.addColorStop(1, `rgba(0,0,0,${c.fade[2]})`);
    h.fillStyle = gr; h.fillRect(0, 0, V.w, V.h);
  }
  h.globalCompositeOperation = 'source-over';
  g.drawImage(scratch, 0, 0, V.w, V.h);
}

function renderBeard(g, level, pal, kk) {
  if (!level) return;
  scratch.width = Math.ceil(V.w * kk); scratch.height = Math.ceil(V.h * kk);
  const h = scratch.getContext('2d');
  h.setTransform(kk, 0, 0, kk, 0, 0);
  h.save(); h.beginPath(); h.rect(0, 262, V.w, 100); h.clip();
  headPath(h); h.fillStyle = pal[0]; h.fill(); h.lineWidth = 4; h.strokeStyle = pal[0]; h.stroke();
  h.restore();
  h.globalCompositeOperation = 'destination-out';
  h.beginPath(); h.ellipse(CX, 262, 44, 30, 0, 0, Math.PI * 2); h.fill();
  h.globalCompositeOperation = 'source-over';
  h.fillStyle = pal[0];
  h.beginPath(); h.moveTo(CX - 22, 292); h.quadraticCurveTo(CX, 276, CX + 22, 292); h.quadraticCurveTo(CX, 286, CX - 22, 292); h.fill();
  h.beginPath(); h.ellipse(CX, 311, 7, 5, 0, 0, Math.PI * 2); h.fill();
  h.globalCompositeOperation = 'source-atop';
  const r = rng(7);
  for (let i = 0; i < 260; i++) { h.strokeStyle = i % 2 ? pal[1] : pal[2]; h.globalAlpha = 0.45; h.lineWidth = 1.2; const x = CX - 62 + r() * 124, y = 262 + r() * 68; h.beginPath(); h.moveTo(x, y); h.lineTo(x + (r() - 0.5) * 3, y + 5); h.stroke(); }
  h.globalAlpha = 1;
  h.globalCompositeOperation = 'destination-in';
  const gr = h.createLinearGradient(0, 262, 0, 284);
  gr.addColorStop(0, 'rgba(0,0,0,.15)'); gr.addColorStop(1, `rgba(0,0,0,${level === 1 ? 0.42 : 1})`);
  h.fillStyle = gr; h.fillRect(0, 0, V.w, V.h);
  h.globalCompositeOperation = 'source-over';
  g.drawImage(scratch, 0, 0, V.w, V.h);
}

/* ---------- Personnage ---------- */
function drawChair(g) {
  let gr = g.createLinearGradient(CX - 90, 0, CX + 90, 0);
  gr.addColorStop(0, '#6b3327'); gr.addColorStop(0.5, '#4d2219'); gr.addColorStop(1, '#2c120d');
  g.fillStyle = gr; rr(g, CX - 92, 236, 184, 230, 30); g.fill();
  g.strokeStyle = '#d9b85f'; g.lineWidth = 2.5; rr(g, CX - 84, 244, 168, 230, 24); g.stroke();
  g.fillStyle = gr; rr(g, CX - 48, 196, 96, 64, 22); g.fill();
  g.strokeStyle = 'rgba(217,184,95,.8)'; g.lineWidth = 2; rr(g, CX - 42, 202, 84, 52, 17); g.stroke();
  for (const sx of [-1, 1]) {
    gr = g.createLinearGradient(0, 384, 0, 400);
    gr.addColorStop(0, '#f1f1f4'); gr.addColorStop(1, '#8b8b94');
    g.fillStyle = gr; rr(g, CX + sx * 118 - 34, 384, 68, 15, 7); g.fill();
  }
}

function drawBody(g, c) {
  const sk = SKINS[c.skin];
  // cou
  let gr = g.createLinearGradient(0, 312, 0, 350);
  gr.addColorStop(0, sk[2]); gr.addColorStop(1, sk[0]);
  g.fillStyle = gr; g.fillRect(CX - 25, 300, 50, 54);
  // cape noire à liseré doré
  g.beginPath(); g.moveTo(CX - 32, 336);
  g.bezierCurveTo(CX - 70, 346, CX - 128, 362, CX - 142, 440);
  g.lineTo(CX + 142, 440);
  g.bezierCurveTo(CX + 128, 362, CX + 70, 346, CX + 32, 336);
  g.quadraticCurveTo(CX, 352, CX - 32, 336); g.closePath();
  gr = g.createLinearGradient(CX - 140, 340, CX + 140, 440);
  gr.addColorStop(0, '#34312d'); gr.addColorStop(0.45, '#1b1917'); gr.addColorStop(1, '#0c0b0a');
  g.fillStyle = gr; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 3;
  for (const x of [-62, -14, 44]) { g.beginPath(); g.moveTo(CX + x, 372); g.quadraticCurveTo(CX + x * 1.25, 404, CX + x * 1.4, 440); g.stroke(); }
  g.strokeStyle = '#d9b85f'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(CX - 32, 337); g.quadraticCurveTo(CX, 353, CX + 32, 337); g.stroke();
  g.fillStyle = '#e8cc7c';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(CX + 62 + i * 13, 362 + i * 16, 3.2, 0, 7); g.fill(); }
  if (c.vip) star(g, CX - 64, 378, 11, '#f3dc98');
}

function star(g, x, y, r, col) {
  g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  g.closePath(); g.fill();
}

function drawHead(g, c) {
  const sk = SKINS[c.skin], hp = HAIRS[c.hair];
  for (const sx of [-1, 1]) { // oreilles
    g.fillStyle = sx < 0 ? sk[0] : sk[2];
    g.beginPath(); g.ellipse(CX + sx * 62, 254, 9, 15, sx * 0.12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = sk[2]; g.lineWidth = 1.6; g.beginPath(); g.arc(CX + sx * 62, 254, 5, sx < 0 ? 1.2 : -1.9, sx < 0 ? 5 : 1.9); g.stroke();
  }
  headPath(g);
  let gr = g.createRadialGradient(CX - 22, 222, 8, CX, 250, 96);
  gr.addColorStop(0, sk[1]); gr.addColorStop(0.55, sk[0]); gr.addColorStop(1, sk[2]);
  g.fillStyle = gr; g.fill();
  g.save(); headPath(g); g.clip();
  gr = g.createLinearGradient(0, 296, 0, 330);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.16)');
  g.fillStyle = gr; g.fillRect(CX - 70, 290, 140, 44);
  for (const sx of [-1, 1]) { // joues
    gr = g.createRadialGradient(CX + sx * 36, 276, 1, CX + sx * 36, 276, 16);
    gr.addColorStop(0, 'rgba(235,110,95,.22)'); gr.addColorStop(1, 'rgba(235,110,95,0)');
    g.fillStyle = gr; g.fillRect(CX + sx * 36 - 18, 258, 36, 36);
  }
  g.restore();
  // sourcils
  g.strokeStyle = hp[2]; g.lineWidth = 4.2; g.lineCap = 'round';
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX + sx * 36, 236); g.quadraticCurveTo(CX + sx * 24, 229, CX + sx * 13, 235); g.stroke(); }
  // nez
  g.strokeStyle = sk[2]; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(CX + 2, 254); g.quadraticCurveTo(CX + 9, 276, CX, 281); g.quadraticCurveTo(CX - 7, 282, CX - 8, 277); g.stroke();
}

function drawFaceLive(g, c, mood, blink) {
  const sk = SKINS[c.skin];
  for (const sx of [-1, 1]) {
    const ex = CX + sx * 24, ey = 250;
    if (blink || mood === 'happy') {
      g.strokeStyle = '#2a1d18'; g.lineWidth = 2.6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ex - 9, ey + 1); g.quadraticCurveTo(ex, mood === 'happy' ? ey - 7 : ey + 5, ex + 9, ey + 1); g.stroke();
    } else {
      g.fillStyle = '#fffdf8'; g.beginPath(); g.ellipse(ex, ey, 9.5, 6.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = EYES[c.eye]; g.beginPath(); g.arc(ex + eyeDx, ey + eyeDy, 5, 0, 7); g.fill();
      g.fillStyle = '#17110e'; g.beginPath(); g.arc(ex + eyeDx, ey + eyeDy, 2.4, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + eyeDx - 1.8, ey + eyeDy - 2, 1.5, 0, 7); g.fill();
      g.strokeStyle = '#2a1d18'; g.lineWidth = 2.2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(ex - 10, ey - 1); g.quadraticCurveTo(ex, ey - 9, ex + 10, ey - 1); g.stroke();
    }
  }
  if (mood === 'happy') {
    g.fillStyle = '#6b2424'; g.beginPath(); g.moveTo(CX - 17, 294); g.quadraticCurveTo(CX, 300, CX + 17, 294); g.quadraticCurveTo(CX, 316, CX - 17, 294); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(CX - 14, 295.5); g.quadraticCurveTo(CX, 300, CX + 14, 295.5); g.quadraticCurveTo(CX, 304, CX - 14, 295.5); g.fill();
  } else {
    g.strokeStyle = '#8a3d3a'; g.lineWidth = 2.8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 13, 297); g.quadraticCurveTo(CX, 302, CX + 13, 297); g.stroke();
    g.strokeStyle = sk[2]; g.lineWidth = 1.5; g.beginPath(); g.moveTo(CX - 6, 305); g.quadraticCurveTo(CX, 307, CX + 6, 305); g.stroke();
  }
}

function drawCharacter(g, c, kk, withChair) {
  const cut = CUTS[c.cut], pal = HAIRS[c.hair];
  if (withChair) drawChair(g);
  if (cut.bk) { g.fillStyle = pal[2]; rr(g, CX - 60, 246, 120, 44 + cut.bk * 30, 28); g.fill(); g.fillStyle = pal[0]; rr(g, CX - 56, 246, 112, 38 + cut.bk * 30, 26); g.fill(); }
  drawBody(g, c);
  drawHead(g, c);
  renderHair(g, cut, pal, kk, c.seed);
  renderBeard(g, c.b1, pal, kk);
}

function buildClientLayer() {
  if (!S.client || !k) return;
  layer.width = Math.ceil(V.w * k); layer.height = Math.ceil(V.h * k);
  const g = layer.getContext('2d');
  g.setTransform(k, 0, 0, k, 0, 0);
  drawCharacter(g, S.client, k, true);
}

/* ---------- Mèches à couper (l'état « avant ») ---------- */
function buildTufts() {
  const c = S.client, svc = svcOf(c.svc), r = rng(c.seed + 1);
  tufts = [];
  const add = (x, y, ang, len, w, kind) => tufts.push({ x, y, ang, len, w, curl: (r() - 0.5) * 1.4, kind, gone: false, mx: x + Math.cos(ang) * len * 0.5, my: y + Math.sin(ang) * len * 0.5 });
  if (svc.cut) {
    for (let i = 0; i < 18; i++) { // sur le crâne
      const a = Math.PI * (0.1 + 0.8 * r()), rad = 8 + r() * 34;
      add(CX - Math.cos(a) * rad, 208 - Math.sin(a) * rad * 0.8, a + Math.PI + (r() - 0.5) * 1.2, 36 + r() * 20, 20 + r() * 6, 'hair');
    }
    for (let i = 0; i < 31; i++) { // couronne
      const th = -0.32 + (Math.PI + 0.64) * i / 30, u = Math.cos(th), s = Math.sin(th);
      const dx = u, dy = -s + 0.6;
      add(CX + (RX - 8) * u, SKY - (RY - 8) * s, Math.atan2(dy, dx) + (r() - 0.5) * 0.6, 52 + r() * 30, 20 + r() * 7, 'hair');
    }
    for (let i = 0; i < 10; i++) add(CX - 45 + i * 10 + (r() - 0.5) * 6, 178 + r() * 8, Math.PI / 2 + (r() - 0.5) * 0.6, 34 + r() * 18, 18 + r() * 4, 'hair'); // frange
  }
  if (c.b0 === 3) {
    for (let i = 0; i < 13; i++) {
      const th = 0.25 + (Math.PI - 0.5) * i / 12, u = Math.cos(th), s = Math.sin(th);
      add(CX + 50 * u, 276 + 42 * s, Math.atan2(s + 0.5, u * 0.7) + (r() - 0.5) * 0.5, 24 + r() * 16, 24, 'beard');
    }
  }
  // ordre de coupe par défaut : mélangé
  for (let i = tufts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [tufts[i], tufts[j]] = [tufts[j], tufts[i]]; }
  tufts.sort((a, b) => (a.kind === 'beard') - (b.kind === 'beard'));
}

function tuftPath(g, t) {
  const l = t.len, w = t.w, cu = t.curl;
  // mèche ondulée, épaisse à la racine et effilée à la pointe
  g.beginPath(); g.moveTo(0, -w / 2);
  g.bezierCurveTo(l * 0.35, -w / 2 - cu * 10, l * 0.7, -w * 0.3 + cu * 22, l, cu * 18);
  g.bezierCurveTo(l * 0.72, w * 0.25 + cu * 22, l * 0.35, w / 2 - cu * 6, 0, w / 2);
  g.quadraticCurveTo(-w * 0.4, 0, 0, -w / 2);
}
function drawTuft(g, t, pal) {
  const l = t.len, w = t.w, cu = t.curl;
  g.save(); g.translate(t.x, t.y); g.rotate(t.ang);
  tuftPath(g, t); g.fillStyle = pal[0]; g.fill();
  g.strokeStyle = pal[2]; g.lineWidth = 1.2; g.globalAlpha = 0.8; g.stroke();
  g.lineCap = 'round'; g.lineWidth = 1.3;
  for (let i = -1; i <= 1; i++) { // brins
    g.strokeStyle = i ? pal[2] : pal[1]; g.globalAlpha = i ? 0.45 : 0.7;
    const o = i * w * 0.24;
    g.beginPath(); g.moveTo(3, o); g.bezierCurveTo(l * 0.35, o - cu * 9, l * 0.68, o * 0.6 + cu * 21, l * 0.94, cu * 18 + o * 0.15); g.stroke();
  }
  g.restore();
}

/* ---------- Décor ---------- */
function buildBg() {
  if (!cv.width) return;
  bg.width = cv.width; bg.height = cv.height;
  const g = bg.getContext('2d'), W = bg.width, Hh = bg.height;
  let gr = g.createLinearGradient(0, 0, 0, Hh);
  gr.addColorStop(0, '#4a4640'); gr.addColorStop(0.6, '#3d3934'); gr.addColorStop(1, '#2a2723');
  g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
  g.setTransform(k, 0, 0, k, ox, oy);
  // logo du salon au mur, bords fondus
  if (logoImg.complete && logoImg.naturalWidth) {
    const lw = 250, lh = lw * logoImg.naturalHeight / logoImg.naturalWidth, lx = CX - lw / 2, ly = -14;
    scratch.width = Math.ceil(lw * k); scratch.height = Math.ceil(lh * k);
    const h = scratch.getContext('2d');
    h.drawImage(logoImg, 0, 0, scratch.width, scratch.height);
    h.globalCompositeOperation = 'destination-in';
    const m = h.createRadialGradient(scratch.width / 2, scratch.height / 2, scratch.height * 0.3, scratch.width / 2, scratch.height / 2, scratch.width * 0.52);
    m.addColorStop(0, '#000'); m.addColorStop(1, 'rgba(0,0,0,0)');
    h.fillStyle = m; h.fillRect(0, 0, scratch.width, scratch.height);
    g.drawImage(scratch, lx, ly, lw, lh);
  }
  // halo chaud derrière le client : fait ressortir les cheveux
  gr = g.createRadialGradient(CX, 232, 30, CX, 232, 215);
  gr.addColorStop(0, 'rgba(255,226,170,.55)'); gr.addColorStop(0.55, 'rgba(255,214,150,.2)'); gr.addColorStop(1, 'rgba(255,214,150,0)');
  g.fillStyle = gr; g.fillRect(-400, -200, 1160, 900);
  // suspensions
  for (const lx of [34, 326]) {
    g.strokeStyle = '#1b1917'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, -300); g.lineTo(lx, 58); g.stroke();
    gr = g.createRadialGradient(lx, 86, 2, lx, 86, 90);
    gr.addColorStop(0, 'rgba(255,220,150,.5)'); gr.addColorStop(1, 'rgba(255,220,150,0)');
    g.fillStyle = gr; g.fillRect(lx - 95, 0, 190, 190);
    g.fillStyle = '#d9b85f'; g.beginPath(); g.moveTo(lx - 9, 56); g.lineTo(lx + 9, 56); g.lineTo(lx + 24, 84); g.lineTo(lx - 24, 84); g.closePath(); g.fill();
    g.fillStyle = '#fff6d8'; g.beginPath(); g.ellipse(lx, 85, 12, 5, 0, 0, 7); g.fill();
  }
  // enseigne de barbier
  g.fillStyle = '#d9b85f'; rr(g, 320, 150, 26, 10, 4); g.fill(); rr(g, 320, 262, 26, 10, 4); g.fill();
  g.save(); rr(g, 323, 160, 20, 102, 6); g.clip();
  g.fillStyle = '#f7f3ea'; g.fillRect(323, 160, 20, 102);
  for (let i = -2; i < 9; i++) { g.fillStyle = i % 2 ? '#c8372f' : '#2f55a4'; g.beginPath(); g.moveTo(323, 160 + i * 18); g.lineTo(343, 148 + i * 18); g.lineTo(343, 156 + i * 18); g.lineTo(323, 168 + i * 18); g.closePath(); g.fill(); }
  gr = g.createLinearGradient(323, 0, 343, 0);
  gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.3)');
  g.fillStyle = gr; g.fillRect(323, 160, 20, 102);
  g.restore();
  // étagère et flacons
  g.fillStyle = '#231f1b'; rr(g, 6, 236, 64, 6, 2); g.fill();
  const bottles = [['#c8372f', 14, 30], ['#d9b85f', 32, 22], ['#3d7a5c', 50, 34]];
  for (const [col, bx, bh] of bottles) {
    g.fillStyle = col; rr(g, bx, 236 - bh, 13, bh, 3); g.fill();
    g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(bx + 2, 238 - bh, 2.5, bh - 5);
    g.fillStyle = '#1b1917'; g.fillRect(bx + 3.5, 230 - bh, 6, 6);
  }
  // sol
  g.setTransform(1, 0, 0, 1, 0, 0);
  const fy = oy + 408 * k;
  gr = g.createLinearGradient(0, fy, 0, Hh);
  gr.addColorStop(0, '#191715'); gr.addColorStop(1, '#0d0c0b');
  g.fillStyle = gr; g.fillRect(0, fy, W, Hh - fy);
  g.fillStyle = 'rgba(217,184,95,.45)'; g.fillRect(0, fy, W, Math.max(1, k));
}

/* ---------- Mains ---------- */
const hands = [
  { side: -1, x: 52, y: 300, rx: 52, ry: 300, tx: 52, ty: 300, t: 0 },
  { side: 1, x: 308, y: 300, rx: 308, ry: 300, tx: 308, ty: 300, t: 0 },
];
let snipA = 0, snipV = 0;

function drawHand(g, h, tool) {
  const sk = SKINS[1];
  const ax = h.side < 0 ? -40 : 400, ay = 480, wx = h.x + h.side * 14, wy = h.y + 12;
  g.lineCap = 'round';
  g.strokeStyle = '#141210'; g.lineWidth = 34; g.beginPath(); g.moveTo(ax, ay); g.lineTo(wx, wy); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 10; g.beginPath(); g.moveTo(ax, ay - 8); g.lineTo(wx, wy - 8); g.stroke();
  const t = 0.9;
  g.strokeStyle = '#d9b85f'; g.lineWidth = 35; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(ax + (wx - ax) * (t - 0.035), ay + (wy - ay) * (t - 0.035)); g.lineTo(ax + (wx - ax) * t, ay + (wy - ay) * t); g.stroke();

  g.save(); g.translate(h.x, h.y); g.scale(-h.side, 1); g.rotate(-0.22);
  if (tool === 'scissors') {
    for (const s of [-1, 1]) {
      g.save(); g.rotate(s * (0.07 + snipA * 0.3));
      const gr = g.createLinearGradient(0, -4, 0, 4);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#9ea3ad');
      g.fillStyle = gr; g.beginPath(); g.moveTo(4, -3 * s); g.lineTo(66, 0); g.lineTo(4, 3.5 * s); g.closePath(); g.fill();
      g.strokeStyle = '#d9b85f'; g.lineWidth = 4.5; g.beginPath(); g.ellipse(-10, s * 9, 10, 7.5, 0, 0, 7); g.stroke();
      g.restore();
    }
    g.fillStyle = '#d9b85f'; g.beginPath(); g.arc(10, 0, 3, 0, 7); g.fill();
  } else if (tool === 'clipper') {
    const gr = g.createLinearGradient(0, -13, 0, 13);
    gr.addColorStop(0, '#45413c'); gr.addColorStop(1, '#141210');
    g.fillStyle = gr; rr(g, -12, -13, 62, 26, 10); g.fill();
    g.fillStyle = '#d9b85f'; g.fillRect(30, -13, 5, 26);
    g.fillStyle = '#c8372f'; g.beginPath(); g.arc(8, 0, 3.5, 0, 7); g.fill();
    g.fillStyle = '#dfe2e8'; rr(g, 48, -14, 12, 28, 3); g.fill();
    g.strokeStyle = '#7d828c'; g.lineWidth = 1.3;
    for (let i = -11; i <= 11; i += 3.6) { g.beginPath(); g.moveTo(54, i + snipA * 1.5); g.lineTo(60, i + snipA * 1.5); g.stroke(); }
  } else if (tool === 'comb') {
    g.fillStyle = '#d9b85f'; rr(g, 2, -9, 62, 8, 3); g.fill();
    for (let i = 0; i < 14; i++) g.fillRect(8 + i * 4, -2, 2, 13);
  }
  // main
  let gr = g.createRadialGradient(-3, -4, 2, 0, 0, 20);
  gr.addColorStop(0, sk[1]); gr.addColorStop(1, sk[0]);
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 1, 16, 14, 0, 0, 7); g.fill();
  g.fillStyle = sk[0];
  for (let i = 0; i < 4; i++) {
    const wig = tool === 'none' ? Math.sin(time * 14 + i) * 3 : 0;
    rr(g, 7, -13 + i * 7, 15 + (i === 1 || i === 2 ? 3 : 0) + (tool === 'none' ? 8 + wig : 0), 6.2, 3); g.fill();
  }
  g.strokeStyle = sk[2]; g.lineWidth = 1;
  for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(9, -13.4 + i * 7); g.lineTo(21, -13.4 + i * 7); g.stroke(); }
  g.fillStyle = sk[1]; g.beginPath(); g.ellipse(2, -14, 6, 9.5, 0.9, 0, 7); g.fill();
  g.restore();
}

/* ---------- Particules ---------- */
const parts = [];
function dropTuft(t) {
  t.gone = true;
  if (parts.length > 70) return;
  parts.push({ kind: 'tuft', t, x: t.x, y: t.y, a: t.ang, vx: (Math.random() - 0.5) * 120, vy: -90 - Math.random() * 90, va: (Math.random() - 0.5) * 9, life: 1.1, pal: HAIRS[S.client.hair] });
}
function bits(x, y, pal) {
  for (let i = 0; i < 5 && parts.length < 110; i++) parts.push({ kind: 'bit', x: x + rnd(18) - 9, y: y + rnd(12) - 6, a: Math.random() * 6, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 130, va: (Math.random() - 0.5) * 12, life: 0.7, col: pal[rnd(3)] });
}
function spark(x, y) {
  parts.push({ kind: 'spark', x, y, a: 0, vx: (Math.random() - 0.5) * 180, vy: -120 - Math.random() * 160, va: 0, life: 0.9, col: Math.random() < 0.5 ? '#fff3c4' : '#d9b85f', r: 2 + Math.random() * 3 });
}

/* =====================================================================
   5. BOUCLE DE JEU
   ===================================================================== */
let phase = 'cut', phaseT = 0, slide = 0, shake = 0;
let combo = 0, lastTap = -1e9, blinkT = 3, time = 0, eyeDx = 0, eyeDy = 0;

function frame(dt) {
  time += dt;
  const now = performance.now();
  if (now - lastTap < 5000) S.playSec += dt; // temps de jeu actif uniquement
  if (autoRate() && phase === 'cut') {
    lastPt = { x: CX + Math.sin(time * 1.7) * 70, y: 190 + Math.cos(time * 2.3) * 50 };
    addWork(autoRate() * dt);
  }
  if (phase === 'done') { phaseT -= dt; if (phaseT <= 0) { newClient(); phase = 'in'; slide = 1; } }
  else if (phase === 'in') { slide -= dt * 4.5; if (slide <= 0) { slide = 0; phase = 'cut'; } }
  if (now - lastTap > 800 && combo) { combo = Math.max(0, combo - dt * 30); renderCombo(); }
  blinkT -= dt; if (blinkT < -0.13) blinkT = 2 + Math.random() * 3;
  shake = Math.max(0, shake - dt * 4);
  snipV += (0 - snipA) * 260 * dt; snipV *= Math.pow(0.001, dt); snipA += snipV * dt;

  for (const h of hands) {
    if (h.t > 0) h.t -= dt;
    const bob = Math.sin(time * 2 + h.side) * 4;
    const gx = h.t > 0 ? h.tx : h.rx, gy = h.t > 0 ? h.ty : h.ry + bob;
    const f = 1 - Math.pow(0.000001, dt);
    h.x += (gx - h.x) * f; h.y += (gy - h.y) * f;
  }
  const f2 = 1 - Math.pow(0.01, dt);
  eyeDx += (clamp((lastPt.x - CX) / 40, -2.5, 2.5) - eyeDx) * f2;
  eyeDy += (clamp((lastPt.y - 250) / 50, -1.8, 1.8) - eyeDy) * f2;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt; p.vy += (p.kind === 'spark' ? 260 : 620) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
    if (p.life <= 0) parts.splice(i, 1);
  }
  draw();
  bar.style.width = Math.min(100, S.work / S.client.need * 100) + '%';
}

function draw() {
  const c = S.client, svc = svcOf(c.svc), pal = HAIRS[c.hair], g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(bg, 0, 0);
  const sx = Math.sin(time * 70) * shake * 5 * k, ease = slide * slide;
  g.setTransform(k, 0, 0, k, ox + ease * cv.width + sx, oy);
  if (layer.width) g.drawImage(layer, 0, 0, V.w, V.h);
  const done = phase === 'done';
  drawFaceLive(g, c, done ? 'happy' : 'neutral', blinkT < 0);
  for (const t of tufts) if (!t.gone) drawTuft(g, t, pal);

  g.setTransform(k, 0, 0, k, ox, oy);
  const p = S.work / c.need;
  const massage = svc.massage && p > 0.6 && !done;
  drawHand(g, hands[0], massage ? 'none' : 'comb');
  drawHand(g, hands[1], massage ? 'none' : (!svc.cut || CUTS[c.cut].fade || CUTS[c.cut].tex === 'buzz') && p > 0.35 ? 'clipper' : 'scissors');

  for (const q of parts) {
    g.globalAlpha = Math.min(1, q.life * 2.5);
    if (q.kind === 'tuft') { const t = q.t, sx0 = t.x, sy0 = t.y, sa = t.ang; t.x = q.x; t.y = q.y; t.ang = q.a; drawTuft(g, t, q.pal); t.x = sx0; t.y = sy0; t.ang = sa; }
    else if (q.kind === 'bit') { g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.fillStyle = q.col; g.fillRect(-4, -1, 8, 2); g.restore(); }
    else star(g, q.x, q.y, q.r * 1.6, q.col);
  }
  g.globalAlpha = 1;
}

let last = performance.now();
function loop(now) {
  frame(Math.min(0.05, (now - last) / 1000));
  last = now;
  requestAnimationFrame(loop);
}

/* =====================================================================
   6. SON (synthétisé, aucun fichier)
   ===================================================================== */
let AC = null, noiseBuf = null;
function sfx(type) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t = AC.currentTime, out = AC.createGain();
    out.connect(AC.destination);
    if (type === 'snip') {
      if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.06, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const src = AC.createBufferSource(), f = AC.createBiquadFilter();
      src.buffer = noiseBuf; f.type = 'highpass'; f.frequency.value = 3200 + Math.random() * 1500;
      src.connect(f); f.connect(out);
      out.gain.setValueAtTime(0.11, t); out.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      src.start(t);
    } else {
      const notes = type === 'coin' ? [988, 1319] : [523, 659, 784, 1047];
      notes.forEach((fq, i) => {
        const o = AC.createOscillator(), g = AC.createGain();
        o.type = 'triangle'; o.frequency.value = fq; o.connect(g); g.connect(out);
        const s = t + i * 0.08;
        g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.09, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.22);
        o.start(s); o.stop(s + 0.25);
      });
    }
  } catch { /* pas de son sur cet appareil */ }
}

/* =====================================================================
   7. INTERFACE
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const bar = $('bar'), stage = $('stage'), panel = $('panel');
let tab = 'tools', selCut = -1, toastTimer = 0;

function resize() {
  const r = stage.getBoundingClientRect();
  if (!r.width || !r.height) return;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  k = Math.min(cv.width / V.w, cv.height / V.h);
  ox = (cv.width - V.w * k) / 2; oy = cv.height - V.h * k;
  buildBg(); buildClientLayer();
  if (S.client) draw(); // redessine tout de suite : changer la taille efface le canvas
}

function tapAt(vx, vy) {
  const now = performance.now();
  combo = now - lastTap < 450 ? Math.min(combo + 1, 40) : Math.max(0, combo - 6);
  lastTap = now;
  const crit = Math.random() < 0.06;
  const gain = power() * (1 + combo / 40) * (crit ? 5 : 1);
  $('hint').hidden = true;

  const tx = clamp(vx, 70, 290), ty = clamp(vy, 110, 340);
  lastPt = { x: tx, y: ty };
  const h = hands[vx < CX ? 0 : 1];
  h.tx = tx + h.side * 62; h.ty = ty + 12; h.t = 0.22;
  const o = hands[vx < CX ? 1 : 0];
  o.tx = clamp(tx - o.side * -40, 90, 270) + o.side * 62; o.ty = ty + 30; o.t = 0.22;
  snipV = 14;

  if (phase === 'cut') {
    bits(tx, ty, HAIRS[S.client.hair]);
    floatText(crit ? 'Coup de maître !' : '+' + (gain < 10 ? gain.toFixed(1).replace('.', ',') : fmt(gain)), vx + rnd(30) - 15, vy - 22, crit ? 'crit' : '');
    addWork(gain);
    sfx('snip');
  }
  if (navigator.vibrate) { try { navigator.vibrate(crit ? 18 : 6); } catch { /* rien */ } }
  renderCombo();
}

stage.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  tapAt(((e.clientX - r.left) * dpr - ox) / k, ((e.clientY - r.top) * dpr - oy) / k);
});
stage.addEventListener('contextmenu', (e) => e.preventDefault());

function floatText(txt, vx, vy, cls) {
  const el = document.createElement('span');
  el.className = 'float ' + cls;
  el.textContent = txt;
  el.style.left = (ox + vx * k) / dpr + 'px';
  el.style.top = (oy + vy * k) / dpr + 'px';
  $('floats').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
  if ($('floats').childElementCount > 22) $('floats').firstChild.remove();
}

function toast(html) {
  const t = $('toast');
  t.innerHTML = html;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 4200);
}

function modal(html) { $('modal-body').innerHTML = html; $('modal').hidden = false; }
$('modal-ok').addEventListener('click', () => { $('modal').hidden = true; });

function renderCombo() {
  $('combo-txt').textContent = 'Rythme x' + (1 + combo / 40).toFixed(1).replace('.', ',');
  $('combo-bar').style.width = (combo / 40 * 100) + '%';
  $('combo').classList.toggle('on', combo >= 5 && !$('toast').classList.contains('on'));
}

function renderGift() {
  const g = $('gift'), l = levelInfo().l;
  g.classList.toggle('won', !!S.code);
  if (S.code) g.textContent = `Votre code ${REWARD.label} : ${S.code}`;
  else if (l >= REWARD.level) g.textContent = `Encore ${Math.max(1, Math.ceil((REWARD.minMinutes * 60 - S.playSec) / 60))} min de jeu pour votre code ${REWARD.label}`;
  else g.textContent = `Code de réduction ${REWARD.label} au niveau ${REWARD.level} · vous êtes niveau ${l}`;
}
$('gift').addEventListener('click', () => {
  if (S.code) showCode(false);
  else modal(`<h3>Votre récompense</h3><p>Atteignez le <b>niveau ${REWARD.level}</b> pour gagner un code de réduction de <b>${REWARD.label}</b> à utiliser chez ${SALON.name}.</p><p class="muted">Comptez environ ${REWARD.minMinutes} à 20 minutes de jeu. ${REWARD.terms}</p>`);
});

function renderStats() {
  const li = levelInfo();
  $('money').textContent = fmt(S.money);
  $('lvl-n').textContent = 'Niv. ' + li.l;
  $('xp').style.width = (li.x / li.need * 100) + '%';
  panel.querySelectorAll('.buy').forEach((b) => {
    const can = S.money >= +b.dataset.cost;
    b.disabled = !can; b.closest('.item').classList.toggle('can', can);
  });
  renderGift();
}

function renderOrder() {
  const c = S.client, svc = svcOf(c.svc);
  $('order-svc').textContent = `Client n° ${S.served + 1} · ${svc.n}`;
  $('order-price').textContent = (c.vip ? 'x3 · ' : '') + fmtPrice(svc);
  $('order-cut').textContent = svc.cut ? `Coupe demandée : ${CUTS[c.cut].n}` : 'Barbe uniquement';
}

function portrait(canvas, cutIdx) {
  const kk = 2, g = canvas.getContext('2d');
  canvas.width = 170 * kk; canvas.height = 200 * kk;
  g.setTransform(kk, 0, 0, kk, -95 * kk, -112 * kk);
  const c = { cut: cutIdx, skin: cutIdx % SKINS.length, hair: cutIdx % HAIRS.length, eye: cutIdx % EYES.length, seed: cutIdx + 5, b1: 0 };
  drawCharacter(g, c, kk, false);
  g.setTransform(kk, 0, 0, kk, -95 * kk, -112 * kk);
  const ex = eyeDx, ey = eyeDy; eyeDx = 0; eyeDy = 0;
  drawFaceLive(g, c, 'neutral', false);
  eyeDx = ex; eyeDy = ey;
}

function renderPanel() {
  let h = '';
  if (tab === 'tools') {
    h += `<p class="muted">Puissance : ${power()} par clic · Auto : ${autoRate()}/s · Tarifs : x${mult().toFixed(2).replace('.', ',')}</p>`;
    for (const t of TOOLS) {
      const max = t.max && lvl(t.id) >= t.max, cost = toolCost(t);
      h += `<div class="item"><div class="grow"><strong>${t.n}</strong><small>${t.d} · niveau ${lvl(t.id)}</small></div>` +
        (max ? '<span class="tag">MAX</span>' : `<button class="buy" data-tool="${t.id}" data-cost="${cost}">${fmt(cost)} €</button>`) + '</div>';
    }
  } else if (tab === 'menu') {
    h += '<p class="muted">La vraie carte du salon. Débloquez une prestation pour que les clients la demandent.</p>';
    for (const s of SERVICES) {
      const own = S.svc.includes(s.id);
      h += `<div class="item ${own ? 'owned' : ''}"><div class="grow"><strong>${s.n}</strong>` +
        `<small class="real">Au salon : ${fmtPrice(s)}${s.note ? ' · ' + s.note : ''}</small></div>` +
        (own ? '<span class="tag">Acquis</span>' : `<button class="buy" data-svc="${s.id}" data-cost="${s.cost}">${fmt(s.cost)} €</button>`) + '</div>';
    }
  } else if (tab === 'cuts') {
    const info = selCut >= 0
      ? `<strong>${CUTS[selCut].n}</strong><br>${CUTS[selCut].d}`
      : 'Touchez une coupe pour la découvrir. Chaque coupe trouvée ajoute +2 % à vos tarifs.';
    h += `<h2>Collection ${S.cuts.length}/${CUTS.length}</h2><div class="cut-info">${info}</div><div class="grid">`;
    CUTS.forEach((c, i) => {
      h += S.cuts.includes(i)
        ? `<button class="tile ${i === selCut ? 'sel' : ''}" data-cut="${i}"><canvas></canvas><span>${c.n}</span></button>`
        : '<div class="tile locked"><div class="q">?</div><span>???</span></div>';
    });
    h += '</div>';
  } else {
    h += '<img class="tracy" src="img/tracy.jpg" alt="Tracy" onerror="this.remove()">' +
      `<h2>${SALON.name}</h2>` +
      `<p>${SALON.address}<br>Tél. <a href="tel:${SALON.phone.replace(/ /g, '')}">${SALON.phone}</a><br>${SALON.rating}</p>` +
      `<p><strong>Offre du moment :</strong> ${SALON.offer}</p>` +
      `<a class="cta" href="${SALON.planity}" target="_blank" rel="noopener">Prendre rendez-vous</a>` +
      '<h2>Réalisations</h2><div class="gallery">' + SALON.photos.map((p, i) => `<img src="${p}" alt="Réalisation ${i + 1} du salon" loading="lazy">`).join('') + '</div>' +
      '<h2>Horaires</h2><table>' + SALON.hours.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + '</table>' +
      '<h2>Tarifs</h2><table>' + SERVICES.map((s) => `<tr><td>${s.n}</td><td>${s.price} €</td></tr>`).join('') + '</table>' +
      `<p class="muted">Clients coiffés : ${S.served} · Gains cumulés : ${fmt(S.total)} € · Temps de jeu : ${Math.floor(S.playSec / 60)} min</p>` +
      `<p class="muted">SIRET : ${SALON.siret}<br>Tarifs, horaires et photos : fiche Planity du salon, 12/11/2026.</p>` +
      '<button class="link" id="verify">Vérifier un code (réservé au salon)</button>' +
      '<button class="link" id="reset">Recommencer la partie</button>';
  }
  panel.innerHTML = h;
  if (tab === 'cuts') panel.querySelectorAll('.tile[data-cut]').forEach((b) => portrait(b.querySelector('canvas'), +b.dataset.cut));
  renderStats();
}

panel.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.tool) {
    const t = TOOLS.find((x) => x.id === b.dataset.tool), cost = toolCost(t);
    if (S.money < cost) return;
    S.money -= cost; S.tools[t.id] = lvl(t.id) + 1; sfx('coin');
  } else if (b.dataset.svc) {
    const s = svcOf(b.dataset.svc);
    if (S.money < s.cost || S.svc.includes(s.id)) return;
    S.money -= s.cost; S.svc.push(s.id); sfx('level');
    toast(`<b>Nouvelle prestation : ${s.n}</b><br>Au salon : ${fmtPrice(s)}.`);
  } else if (b.dataset.cut) {
    selCut = +b.dataset.cut;
  } else if (b.id === 'verify') {
    const code = prompt('Code présenté par le client :');
    if (code) modal(codeValid(code) ? '<h3>Code valide</h3><p>Ce code a bien été généré par le jeu.</p>' : '<h3>Code invalide</h3><p>Ce code ne correspond à aucun code du jeu.</p>');
    return;
  } else if (b.id === 'reset') {
    if (!confirm('Effacer la partie et recommencer ? Le code de réduction sera perdu.')) return;
    const snd = S.sound; S = fresh(); S.sound = snd; newClient(); phase = 'cut'; selCut = -1;
  } else return;
  save();
  renderPanel();
});

$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  tab = b.dataset.tab;
  document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('on', x === b));
  panel.scrollTop = 0;
  renderPanel();
});

$('snd').addEventListener('click', () => { S.sound = !S.sound; $('snd').classList.toggle('off', !S.sound); save(); if (S.sound) sfx('coin'); });
$('snd').classList.toggle('off', !S.sound);

document.addEventListener('visibilitychange', () => { if (document.hidden) save(); last = performance.now(); });
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
setInterval(() => { save(); renderGift(); checkReward(); }, 5000);

/* ---------- Démarrage ---------- */
resize();
if (!S.client || !svcOf(S.client.svc) || !CUTS[S.client.cut]) newClient(); else setupClient();
renderPanel();
renderCombo();
requestAnimationFrame(loop);
