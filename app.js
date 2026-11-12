/* Tracy Signature – le jeu (clicker pixel art) · V1 démo
   Tout est local (localStorage). Le pixel art est dessiné par code sur un canvas 96 x 104.
   Données du salon : fiche Planity « Signature cut by Tracy », consultée le 12/11/2026. */

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
  hours: [
    ['Lundi', '09:00 - 19:00'], ['Mardi', '09:00 - 19:00'], ['Mercredi', '09:00 - 15:00'],
    ['Jeudi', '09:00 - 19:00'], ['Vendredi', '09:00 - 19:00'], ['Samedi', '09:00 - 12:00'],
    ['Dimanche', 'Fermé'],
  ],
};

// La vraie carte du salon : prix et durées Planity. "cost" = prix de déblocage dans le jeu.
// beard : état de la barbe en sortie (le client arrive alors avec une barbe fournie).
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

/* 30 coupes. t = forme du dessus, h = hauteur, sd = côtés (0 rasé, 1 très court, 2 court, 3 plein),
   fy = hauteur où commence le dégradé (60 = pas de dégradé), sk = dégradé à blanc, bk = nuque longue, w = largeur. */
const CUTS = [
  { n: 'Coupe simple', t: 'round', h: 3, sd: 2, fy: 60, d: 'Courte et nette aux ciseaux : la base de tout.' },
  { n: 'Buzz cut', t: 'buzz', h: 1, sd: 1, fy: 60, d: 'Tout à la tondeuse, même longueur partout.' },
  { n: 'Coupe militaire', t: 'flat', h: 2, sd: 1, fy: 44, sk: 1, d: 'Très court dessus, côtés rasés. Réglementaire.' },
  { n: 'Crew cut', t: 'round', h: 3, sd: 2, fy: 47, d: 'Court dessus, encore plus court sur les côtés.' },
  { n: 'Taper', t: 'round', h: 5, sd: 3, fy: 50, d: 'Fondu discret, seulement aux pattes et à la nuque.' },
  { n: 'Low fade', t: 'round', h: 5, sd: 2, fy: 49, sk: 1, d: 'Dégradé bas : le fondu démarre juste au-dessus de l\'oreille.' },
  { n: 'Mid fade', t: 'round', h: 5, sd: 2, fy: 45, sk: 1, d: 'Dégradé à mi-hauteur, le plus demandé.' },
  { n: 'High fade', t: 'flat', h: 5, sd: 2, fy: 41, sk: 1, d: 'Dégradé haut : le fondu monte jusqu\'aux tempes.' },
  { n: 'Dégradé à blanc', t: 'round', h: 4, sd: 2, fy: 43, sk: 1, d: 'Le fondu descend jusqu\'à la peau, à la tondeuse sans sabot.' },
  { n: 'Coupe américaine', t: 'flat', h: 4, sd: 2, fy: 45, d: 'Dégradé progressif et dessus structuré.' },
  { n: 'Drop fade', t: 'spiky', h: 5, sd: 2, fy: 46, sk: 1, d: 'Le dégradé plonge derrière l\'oreille.' },
  { n: 'Burst fade', t: 'curly', h: 5, sd: 2, fy: 47, sk: 1, bk: 1, d: 'Fondu en arc de cercle autour de l\'oreille.' },
  { n: 'French crop', t: 'crop', h: 3, sd: 2, fy: 45, sk: 1, d: 'Frange courte et droite, côtés dégradés.' },
  { n: 'Crop texturé', t: 'spikycrop', h: 4, sd: 2, fy: 46, sk: 1, d: 'Frange effilée et mèches travaillées.' },
  { n: 'Caesar', t: 'crop', h: 2, sd: 2, fy: 60, d: 'Courte, frange horizontale ramenée vers l\'avant.' },
  { n: 'Edgar', t: 'crop', h: 3, sd: 2, fy: 41, sk: 1, d: 'Frange droite très nette et dégradé haut.' },
  { n: 'Ivy League', t: 'part', h: 4, sd: 2, fy: 48, d: 'Crew cut plus long, coiffé sur le côté.' },
  { n: 'Raie sur le côté', t: 'part', h: 4, sd: 3, fy: 60, d: 'Classique : raie marquée et finitions soignées.' },
  { n: 'Slick back', t: 'slick', h: 3, sd: 2, fy: 60, d: 'Cheveux plaqués vers l\'arrière.' },
  { n: 'Undercut', t: 'slick', h: 5, sd: 1, fy: 40, d: 'Dessus long, côtés très courts, sans fondu.' },
  { n: 'Pompadour', t: 'round', h: 10, w: 13, sd: 2, fy: 46, d: 'Volume relevé sur le devant.' },
  { n: 'Quiff', t: 'quiff', h: 8, sd: 2, fy: 46, sk: 1, d: 'Mèche avant brossée vers le haut.' },
  { n: 'Faux hawk', t: 'round', h: 8, w: 8, sd: 2, fy: 44, d: 'Crête douce, côtés courts.' },
  { n: 'Crête', t: 'round', h: 12, w: 4, sd: 0, fy: 60, d: 'Côtés rasés, bande centrale dressée.' },
  { n: 'Flat top', t: 'flat', h: 8, w: 14, sd: 2, fy: 45, sk: 1, d: 'Dessus coupé parfaitement à plat.' },
  { n: 'Curly top fade', t: 'curly', h: 7, sd: 2, fy: 44, sk: 1, d: 'Boucles gardées dessus, dégradé sur les côtés.' },
  { n: 'Afro taper', t: 'afro', h: 10, w: 19, sd: 2, fy: 50, d: 'Volume afro, contours fondus.' },
  { n: 'Waves 360', t: 'waves', h: 2, sd: 2, fy: 46, sk: 1, d: 'Ondulations brossées tout autour du crâne.' },
  { n: 'Mullet moderne', t: 'spiky', h: 5, sd: 2, fy: 46, sk: 1, bk: 2, d: 'Court devant, long sur la nuque.' },
  { n: 'Man bun', t: 'bun', h: 2, sd: 2, fy: 47, d: 'Cheveux longs attachés en chignon.' },
];
const SHAGGY = { t: 'curly', h: 8, w: 17, sd: 3, fy: 60, bk: 2, shag: 1 };

const SKINS = [
  ['#f2c9a0', '#fbdcb8', '#d9a77c'], ['#e0ac7e', '#edc097', '#bf8a5d'],
  ['#b97d4f', '#cc9364', '#96603a'], ['#7a4a2c', '#8f5b38', '#5c351d'],
];
const HAIRS = [
  ['#2a2224', '#4a3f44', '#151012'], ['#4a2f1f', '#6b4630', '#2f1c11'], ['#7a4e2a', '#9c6a3d', '#573619'],
  ['#d9ad4a', '#f0cf7a', '#ab8230'], ['#b5522a', '#d67542', '#853817'], ['#9a9aa0', '#c2c2c8', '#6f6f76'],
];

const fmtPrice = (s) => `${s.price} € · ${s.min} min`;
const FACTS = [
  `Le salon est au <b>${SALON.address}</b>.`,
  `Réservation en ligne <b>24h/24 sur Planity</b>.`,
  `Offre du moment : <b>${SALON.offer}</b>.`,
  `Le salon est noté <b>${SALON.rating}</b>.`,
  `Ouvert du lundi au vendredi dès <b>9h</b>, le samedi matin aussi.`,
  `Le mercredi, le salon ferme à <b>15h</b>.`,
  `Taille de barbe : à la <b>tondeuse ou traditionnelle</b>.`,
  ...SERVICES.map((s) => `Au salon : <b>${s.n}</b>, ${fmtPrice(s)}.`),
];

/* =====================================================================
   2. ÉTAT ET SAUVEGARDE
   ===================================================================== */
const KEY = 'tsj-clicker-v1';
const fresh = () => ({ money: 0, total: 0, served: 0, tools: {}, svc: ['simple'], cuts: [], client: null, work: 0 });
let S = fresh();
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { /* stockage indisponible */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* rien */ } };

const lvl = (id) => S.tools[id] || 0;
const power = () => 1 + lvl('ciseaux') + 4 * lvl('tondeuse');
const autoRate = () => 2 * lvl('apprenti');
const mult = () => 1 + 0.1 * lvl('lotion') + 0.02 * S.cuts.length;
const toolCost = (t) => Math.floor(t.base * Math.pow(t.g, lvl(t.id)));
const svcOf = (id) => SERVICES.find((s) => s.id === id);

function fmt(n) {
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('fr-FR');
  if (n < 1e6) return (n / 1e3).toFixed(1).replace('.', ',') + ' k';
  if (n < 1e9) return (n / 1e6).toFixed(2).replace('.', ',') + ' M';
  return (n / 1e9).toFixed(2).replace('.', ',') + ' Md';
}

const rnd = (n) => Math.floor(Math.random() * n);
function hash(x, y) {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/* =====================================================================
   3. CLIENTS
   ===================================================================== */
function newClient() {
  const owned = SERVICES.filter((s) => S.svc.includes(s.id));
  const top = owned.slice(-3);
  const svc = Math.random() < 0.7 ? top[rnd(top.length)] : owned[rnd(owned.length)];

  // Coupes disponibles : une nouvelle tous les 2 clients
  const avail = Math.min(CUTS.length, 1 + Math.floor(S.served / 2));
  let cut;
  if (svc.force !== undefined) cut = svc.force;
  else {
    const fresh = [];
    for (let i = 0; i < avail; i++) if (!S.cuts.includes(i)) fresh.push(i);
    cut = fresh.length && Math.random() < 0.6 ? fresh[0] : rnd(avail);
  }
  const hasBeard = svc.beard !== undefined;
  const stubble = svc.kid ? 0 : rnd(2);
  S.client = {
    svc: svc.id, cut, skin: rnd(SKINS.length), hair: rnd(HAIRS.length),
    b0: hasBeard ? 3 : stubble, b1: hasBeard ? svc.beard : stubble,
    need: 20 + svc.min, vip: Math.random() < 0.05 * lvl('bouche'),
  };
  S.work = 0;
  renderOrder();
}

function finishClient() {
  const c = S.client, svc = svcOf(c.svc);
  const pay = Math.round(svc.price * mult() * (c.vip ? 3 : 1));
  S.money += pay; S.total += pay; S.served++;
  floatText(`+${fmt(pay)} €`, 48, 30, c.vip ? 'pay vip' : 'pay');
  for (let i = 0; i < 14; i++) spark(30 + rnd(36), 20 + rnd(40));

  if (svc.cut && !S.cuts.includes(c.cut)) {
    S.cuts.push(c.cut);
    toast(`<b>Nouvelle coupe : ${CUTS[c.cut].n}</b><br>${CUTS[c.cut].d}`);
    if (tab === 'cuts') renderPanel();
  } else if (S.served % 3 === 0) {
    toast(`<b>Le saviez-vous ?</b><br>${FACTS[rnd(FACTS.length)]}`);
  }
  phase = 'done'; phaseT = 0.4;
  renderStats();
  save();
}

function addWork(w) {
  if (phase !== 'cut') return;
  S.work += w;
  if (S.work >= S.client.need) { S.work = S.client.need; finishClient(); }
}

/* =====================================================================
   4. PIXEL ART
   ===================================================================== */
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let g = ctx;
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

function headHalf(y) {
  let w = 14;
  if (y < 36) w = 14 - (36 - y) * (36 - y) * 0.12;
  if (y > 58) w = 14 - (y - 58) * 0.45;
  return Math.round(w);
}

// Renvoie 0 (rien), 1 (base), 2 (reflet), 3 (ombre) pour le pixel de cheveux ou de barbe.
function hairAt(s, x, y, beard) {
  const dx = x - 48, ax = Math.abs(dx);
  const hh = headHalf(Math.min(Math.max(y, 30), 70));
  let v = 0;

  if (s) {
    const W = s.w || 15;
    // --- dessus ---
    if (s.t === 'afro') {
      const ex = dx / W, ey = (y - 32) / (s.h + 5);
      if (ex * ex + ey * ey <= 1 && (y < 40 || ax >= hh)) v = hash(x >> 1, y >> 1) < 0.3 ? 3 : 1;
    } else if (ax <= W) {
      const t = ax / W, round = Math.sqrt(1 - t * t);
      let prof = round;
      if (s.t === 'flat' || s.t === 'crop') prof = t < 0.85 ? 1 : 0.6;
      else if (s.t === 'spiky' || s.t === 'spikycrop') prof = (0.55 + 0.45 * ((x * 7) % 5) / 4) * Math.sqrt(1 - t * t * 0.8);
      else if (s.t === 'curly') prof = round * (0.75 + 0.25 * hash(x >> 1, 7));
      else if (s.t === 'quiff') prof = round * (0.55 + 0.45 * (dx + W) / (2 * W));
      const yTop = 31 - s.h * prof;
      let yBot = 40 + (ax > 10 ? 2 : 0) + (ax > 12 ? 2 : 0);
      if (s.t === 'crop') yBot = 43;
      if (s.t === 'spikycrop') yBot = 41 + ((x * 5) % 3);
      if (s.shag) yBot = 42 + Math.floor(hash(x, 3) * 4);
      if (y >= yTop && y < yBot && (y < 30 || ax <= headHalf(y) + 1 + (s.shag ? 2 : 0))) {
        v = 1;
        if (s.t === 'buzz') v = hash(x, y) < 0.3 ? 3 : 1;
        else if (s.t === 'waves') v = (y + (ax >> 1)) % 3 === 0 ? 3 : 1;
        else if (s.t === 'slick' || s.t === 'bun') v = x % 3 === 0 ? 2 : 1;
        else if (s.t === 'curly') v = hash(x >> 1, y >> 1) < 0.3 ? 3 : 1;
        else if (s.t === 'part' && dx === -6 && y > yTop + 1) v = 3;
      }
    }
    if (s.t === 'bun') {
      const bx = dx, by = y - 23;
      if (bx * bx + by * by <= 26) v = bx < -1 && by < 0 ? 2 : 1;
    }
    // --- côtés et dégradé ---
    if (!v && s.sd && y >= 37 && y <= 53) {
      const out = s.sd >= 3 ? 2 : 1, extra = s.shag ? 2 : 0;
      const lo = hh - (s.sd >= 3 ? 2 : 1), hi = (y < 46 ? hh + out : hh) + extra;
      if (ax >= lo && ax <= hi) {
        const low = s.sk ? 0 : 0.4;
        let d = 1;
        if (y > s.fy - 2) d = y <= s.fy + 4 ? 1 - (1 - low) * (y - (s.fy - 2)) / 6 : low;
        if (s.sd === 1) d *= 0.6;
        if (hash(x, y) < d) v = 1;
      }
    }
    // --- nuque longue ---
    if (!v && s.bk && y >= 52 && y <= 60 + s.bk * 6) {
      const nh = y > 70 ? 5 : headHalf(y);
      if (ax > nh && ax <= 16 - Math.max(0, y - (55 + s.bk * 6))) v = 1;
    }
    // --- reflets et ombres ---
    if (v === 1) {
      if (dx < 1 && y < 36 && hash(x, y) < 0.3) v = 2;
      else if (dx > (s.w || 15) * 0.55 || hash(x, y) > 0.92) v = 3;
    }
  }

  // --- barbe ---
  if (beard && y >= 57 && y <= (beard === 3 ? 75 : 70)) {
    const bh = y <= 70 ? headHalf(y) + (beard === 3 ? 1 : 0) : 9 - (y - 70) * 1.6;
    if (ax <= bh) {
      const jaw = y >= 63 || ax >= 9;
      const stache = (y === 58 || y === 59) && ax <= 5;
      if (jaw || stache) {
        if (beard === 1) { if (hash(x, y) < 0.45) v = 3; }
        else v = hash(x, y) < 0.2 ? 3 : (dx < -4 && hash(x, y) > 0.8 ? 2 : 1);
      }
    }
  }
  return v;
}

function drawHairLayer(s, beard, pal, cutoff) {
  for (let y = 10; y < 80; y++) {
    for (let x = 22; x < 75; x++) {
      if (cutoff > 0 && hash(x + 50, y + 90) < cutoff) continue;
      const v = hairAt(s, x, y, beard);
      if (v) R(x, y, 1, 1, pal[v === 1 ? 0 : v === 2 ? 1 : 2]);
    }
  }
}

function drawFace(c, mood, blink) {
  const sk = SKINS[c.skin], hp = HAIRS[c.hair];
  // cou
  R(43, 68, 10, 7, sk[2]);
  // oreilles
  R(31, 46, 3, 8, sk[0]); R(32, 48, 1, 4, sk[2]);
  R(63, 46, 3, 8, sk[2]); R(63, 48, 1, 4, sk[0]);
  // crâne et visage, lumière venant de la gauche
  for (let y = 30; y <= 70; y++) {
    const hw = headHalf(y);
    R(48 - hw, y, hw * 2 + 1, 1, sk[0]);
    R(48 - hw, y, 2, 1, sk[1]);
    R(48 + hw - 3, y, 4, 1, sk[2]);
  }
  R(40, 31, 8, 1, sk[1]);
  R(40, 70, 17, 1, sk[2]);
  // sourcils
  R(40, 46, 5, 1, hp[2]); R(52, 46, 5, 1, hp[2]);
  // yeux
  if (blink || mood === 'happy') {
    R(41, 50, 3, 1, '#2b1d24'); R(53, 50, 3, 1, '#2b1d24');
    if (mood === 'happy') { R(41, 49, 1, 1, '#2b1d24'); R(43, 49, 1, 1, '#2b1d24'); R(53, 49, 1, 1, '#2b1d24'); R(55, 49, 1, 1, '#2b1d24'); }
  } else {
    R(41, 49, 3, 2, '#ffffff'); R(42, 49, 2, 2, '#2b1d24'); R(42, 49, 1, 1, '#5a6d8a');
    R(53, 49, 3, 2, '#ffffff'); R(54, 49, 2, 2, '#2b1d24'); R(54, 49, 1, 1, '#5a6d8a');
  }
  // nez
  R(49, 52, 1, 4, sk[2]); R(47, 56, 3, 1, sk[2]); R(47, 55, 1, 1, sk[1]);
  // joues
  R(38, 56, 2, 1, sk[1]);
  // bouche
  if (mood === 'happy') {
    R(44, 60, 1, 1, '#7a2b2b'); R(52, 60, 1, 1, '#7a2b2b');
    R(45, 61, 7, 1, '#ffffff'); R(45, 62, 7, 1, '#7a2b2b');
  } else {
    R(45, 61, 7, 1, '#8c3b3b');
  }
}

function drawChairAndCape(c) {
  // dossier
  R(28, 46, 40, 44, '#7a1f2b'); R(28, 46, 3, 44, '#a3323f'); R(64, 46, 4, 44, '#571420');
  R(38, 38, 20, 10, '#7a1f2b'); R(38, 38, 20, 2, '#a3323f'); R(55, 40, 3, 8, '#571420');
  for (let y = 52; y < 88; y += 8) { R(34, y, 1, 1, '#571420'); R(61, y, 1, 1, '#571420'); }
  // accoudoirs chromés
  R(14, 84, 14, 4, '#d0d0d6'); R(14, 84, 14, 1, '#ffffff'); R(68, 84, 14, 4, '#a9a9b2'); R(68, 84, 14, 1, '#e4e4ea');
  // cape
  for (let y = 73; y < 104; y++) {
    const hw = Math.min(34, Math.floor(11 + (y - 73) * 3.2));
    R(48 - hw, y, hw * 2, 1, '#f1e9e0');
    R(48 - hw, y, 2, 1, '#ffffff');
    R(48 + hw - 5, y, 5, 1, '#cfc2b4');
    if (y > 80) { R(36, y, 1, 1, '#d9cdc0'); R(54, y, 1, 1, '#d9cdc0'); R(66, y, 1, 1, '#c2b4a5'); }
  }
  R(41, 72, 14, 2, '#2b1d24'); R(47, 72, 2, 2, '#e0a93f');
  if (c.vip) { R(46, 80, 5, 1, '#e0a93f'); R(47, 79, 3, 3, '#e0a93f'); R(48, 78, 1, 5, '#e0a93f'); }
}

// Décor fixe, dessiné une seule fois
const bg = document.createElement('canvas');
bg.width = 96; bg.height = 104;
(function drawBg() {
  g = bg.getContext('2d');
  R(0, 0, 96, 104, '#6d9a98');
  for (let y = 4; y < 70; y += 8) for (let x = (y % 16 ? 2 : 6); x < 96; x += 8) R(x, y, 1, 1, '#629090');
  // miroir
  R(18, 3, 60, 66, '#a8761f'); R(19, 4, 58, 64, '#e0a93f'); R(21, 6, 54, 60, '#bcd9d6');
  for (let i = 0; i < 26; i++) { R(24 + i, 34 - i, 3, 1, '#d3e8e5'); R(40 + i, 52 - i, 2, 1, '#d3e8e5'); }
  for (let x = 24; x < 74; x += 8) { R(x, 1, 3, 3, '#fff3c4'); R(x + 1, 2, 1, 1, '#ffffff'); }
  // étagères et flacons
  R(1, 34, 15, 2, '#5a3a22'); R(80, 34, 15, 2, '#5a3a22');
  R(3, 26, 3, 8, '#b3413a'); R(3, 24, 3, 2, '#2b1d24'); R(8, 28, 4, 6, '#e0a93f'); R(9, 26, 2, 2, '#2b1d24');
  R(82, 27, 3, 7, '#3f9b6a'); R(82, 25, 3, 2, '#f7f1ea'); R(87, 24, 4, 10, '#5a6d8a'); R(88, 22, 2, 2, '#2b1d24');
  // enseigne de barbier
  R(86, 44, 6, 20, '#f7f1ea'); R(85, 42, 8, 2, '#d0d0d6'); R(85, 64, 8, 2, '#d0d0d6');
  for (let y = 44; y < 64; y++) { const k = (y >> 1) % 3; R(86 + k * 2, y, 2, 1, k ? '#b3413a' : '#3d5f9a'); }
  // soubassement et sol
  R(0, 70, 96, 22, '#557c7b'); R(0, 70, 96, 1, '#3f6362'); R(0, 91, 96, 1, '#3f6362');
  for (let y = 92; y < 104; y += 6) for (let x = 0; x < 96; x += 6) R(x, y, 6, 6, ((x + y) / 6) % 2 ? '#2b1d24' : '#e9dfd2');
  g = ctx;
})();

/* ---------- Mains ---------- */
const hands = [
  { side: -1, x: 14, y: 62, rx: 14, ry: 62, tx: 14, ty: 62, t: 0 },
  { side: 1, x: 82, y: 62, rx: 82, ry: 62, tx: 82, ty: 62, t: 0 },
];
let snip = 0;

function drawArm(h) {
  const ex = h.side < 0 ? -3 : 99, ey = 102;
  const hx = h.x + h.side * 5, hy = h.y + 2;
  const n = 18;
  for (let i = 0; i <= n; i++) {
    const x = Math.round(ex + (hx - ex) * i / n), y = Math.round(ey + (hy - ey) * i / n);
    R(x - 3, y - 3, 7, 7, i > n - 3 ? '#f7f1ea' : '#2b1d24');
    if (i <= n - 3) R(x - 3, y - 3, 7, 1, '#4a3640');
  }
}

function drawHand(h, tool) {
  const sk = SKINS[1];
  const x = Math.round(h.x), y = Math.round(h.y), d = -h.side; // d : direction vers le client
  drawArm(h);
  // outil (derrière les doigts)
  const fx = x + d * 5;
  if (tool === 'comb') {
    for (let i = 0; i < 12; i++) { const px = fx + d * i; R(px, y - 1, 1, 2, '#2b1d24'); if (i % 2 && i > 1) R(px, y + 1, 1, 3, '#2b1d24'); }
  } else if (tool === 'clipper') {
    const x0 = d > 0 ? fx - 2 : fx - 10;
    R(x0, y - 3, 13, 7, '#27364f'); R(x0, y - 3, 13, 1, '#4a5f85'); R(x0, y + 3, 13, 1, '#162033');
    R(d > 0 ? x0 + 12 : x0 - 1, y - 3, 2, 7, snip ? '#ffffff' : '#c9ccd4');
    R(d > 0 ? x0 + 13 : x0 - 2, y - 3, 1, 7, '#8d9099');
    R(x0 + 5, y - 1, 3, 2, '#b3413a');
  } else if (tool === 'scissors') {
    for (let i = 0; i < 11; i++) {
      const px = fx + d * i, off = snip ? 0 : Math.round(i * 0.45);
      R(px, y - 1 - off, 1, 2, i % 4 === 0 ? '#ffffff' : '#c9ccd4');
      R(px, y + 1 + off, 1, 1, '#8d9099');
    }
    R(fx + d * 3, y, 1, 1, '#2b1d24');
  }
  // paume
  R(x - 4, y - 5, 9, 11, sk[0]); R(x - 4, y - 5, 9, 1, sk[1]); R(x - 4, y + 5, 9, 1, sk[2]);
  // pouce
  R(x - 2, y - 8, 5, 4, sk[0]); R(x - 2, y - 8, 5, 1, sk[1]);
  // doigts
  const wig = tool === 'none' ? snip : 0;
  for (let i = 0; i < 4; i++) {
    const fy = y - 5 + i * 3, len = 4 + (wig && i % 2 ? 2 : 0) + (i === 1 || i === 2 ? 1 : 0);
    R(d > 0 ? x + 5 : x - 4 - len, fy, len, 2, sk[0]);
    R(d > 0 ? x + 5 : x - 4 - len, fy + 2, len, 1, sk[2]);
  }
}

/* ---------- Particules ---------- */
const parts = [];
function clip(x, y, col) {
  if (parts.length > 90) parts.shift();
  parts.push({ x, y, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 30, life: 0.8, col, gr: 160 });
}
function spark(x, y) {
  parts.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: -30 - Math.random() * 20, life: 0.7, col: Math.random() < 0.5 ? '#fff3c4' : '#e0a93f', gr: 40 });
}

/* ---------- Rendu d'une tête seule (collection) ---------- */
function drawPortrait(target, cutIdx) {
  g = target.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, target.width, target.height);
  g.translate(-24, -16);
  const c = { skin: 1, hair: cutIdx % HAIRS.length };
  R(41, 72, 14, 2, '#2b1d24');
  drawFace(c, 'happy', false);
  drawHairLayer(CUTS[cutIdx], 0, HAIRS[c.hair], 0);
  g = ctx;
}

/* =====================================================================
   5. BOUCLE DE JEU
   ===================================================================== */
let phase = 'cut', phaseT = 0, slide = 0;
let combo = 0, lastTap = 0, blinkT = 3, time = 0;

function frame(dt) {
  time += dt;
  // travail automatique
  if (autoRate() && phase === 'cut') addWork(autoRate() * dt);

  if (phase === 'done') {
    phaseT -= dt;
    if (phaseT <= 0) { newClient(); phase = 'in'; slide = 1; }
  } else if (phase === 'in') {
    slide -= dt * 5;
    if (slide <= 0) { slide = 0; phase = 'cut'; }
  }
  if (performance.now() - lastTap > 700 && combo) { combo = 0; renderCombo(); }
  blinkT -= dt; if (blinkT < -0.12) blinkT = 2 + Math.random() * 3;

  // mains
  for (const h of hands) {
    if (h.t > 0) h.t -= dt;
    const bob = Math.sin(time * 2 + h.side) * 1.5;
    const gx = h.t > 0 ? h.tx : h.rx, gy = h.t > 0 ? h.ty : h.ry + bob;
    const k = Math.min(1, dt * 22);
    h.x += (gx - h.x) * k; h.y += (gy - h.y) * k;
  }
  // particules
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt; p.vy += p.gr * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.life <= 0) parts.splice(i, 1);
  }
  draw();
  bar.style.width = Math.min(100, S.work / S.client.need * 100) + '%';
}

function draw() {
  const c = S.client, svc = svcOf(c.svc), pal = HAIRS[c.hair];
  g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(bg, 0, 0);

  g.translate(Math.round(slide * 96), 0);
  drawChairAndCape(c);
  const done = phase === 'done';
  drawFace(c, done ? 'happy' : 'neutral', blinkT < 0);
  const p = done ? 1 : S.work / c.need;
  // état final dessous, état « avant » par-dessus, qui se dissout avec l'avancement
  drawHairLayer(CUTS[c.cut], c.b1, pal, 0);
  if (p < 1) drawHairLayer(svc.cut ? SHAGGY : null, c.b0 !== c.b1 ? c.b0 : 0, pal, p);
  g.setTransform(1, 0, 0, 1, 0, 0);

  const right = svc.massage && p > 0.6 ? 'none' : (!svc.cut || CUTS[c.cut].sk || CUTS[c.cut].t === 'buzz' ? 'clipper' : 'scissors');
  drawHand(hands[0], svc.massage && p > 0.6 ? 'none' : 'comb');
  drawHand(hands[1], right);

  for (const q of parts) R(Math.round(q.x), Math.round(q.y), 1, q.gr > 100 ? 2 : 1, q.col);
}

let last = performance.now();
function loop(now) {
  frame(Math.min(0.05, (now - last) / 1000));
  last = now;
  requestAnimationFrame(loop);
}

/* =====================================================================
   6. INTERFACE
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const bar = $('bar'), scene = $('scene'), panel = $('panel');
let tab = 'tools', selCut = -1, toastTimer = 0;

function tapAt(cx, cy) {
  const now = performance.now();
  combo = now - lastTap < 450 ? Math.min(combo + 1, 40) : 0;
  lastTap = now;
  const cm = 1 + combo / 40;
  const gain = power() * cm;
  $('hint').hidden = true;

  // la main du côté touché file vers le point de contact
  const tx = Math.max(26, Math.min(70, cx)), ty = Math.max(22, Math.min(74, cy));
  const h = hands[cx < 48 ? 0 : 1];
  h.tx = tx + h.side * 15; h.ty = ty; h.t = 0.16;
  snip = snip ? 0 : 1;

  if (phase === 'cut') {
    const col = HAIRS[S.client.hair];
    for (let i = 0; i < 4; i++) clip(tx + rnd(7) - 3, ty + rnd(5) - 2, col[rnd(3)]);
    floatText('+' + (gain < 10 ? gain.toFixed(1).replace('.', ',') : fmt(gain)), cx + rnd(9) - 4, cy - 6, '');
    addWork(gain);
  }
  if (navigator.vibrate) navigator.vibrate(6);
  renderCombo();
}

scene.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const r = cv.getBoundingClientRect();
  tapAt((e.clientX - r.left) / r.width * 96, (e.clientY - r.top) / r.height * 104);
});
scene.addEventListener('contextmenu', (e) => e.preventDefault());

function floatText(txt, cx, cy, cls) {
  const r = cv.getBoundingClientRect(), s = scene.getBoundingClientRect();
  const el = document.createElement('span');
  el.className = 'float ' + cls;
  el.textContent = txt;
  el.style.left = (r.left - s.left + cx / 96 * r.width) + 'px';
  el.style.top = (cy / 104 * r.height) + 'px';
  $('floats').appendChild(el);
  el.addEventListener('animationend', () => el.remove());
  if ($('floats').childElementCount > 24) $('floats').firstChild.remove();
}

function toast(html) {
  const t = $('toast');
  t.innerHTML = html;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 4200);
}

function renderCombo() {
  const el = $('combo');
  el.textContent = 'RYTHME x' + (1 + combo / 40).toFixed(1).replace('.', ',');
  el.classList.toggle('on', combo >= 5);
}

function renderStats() {
  $('money').textContent = fmt(S.money) + ' €';
  $('points').textContent = fmt(S.total);
  panel.querySelectorAll('.buy').forEach((b) => { b.disabled = S.money < +b.dataset.cost; });
}

function renderOrder() {
  const c = S.client, svc = svcOf(c.svc);
  $('order-svc').textContent = `Client n° ${S.served + 1} : ${svc.n}`;
  $('order-price').textContent = (c.vip ? 'x3 · ' : '') + fmtPrice(svc);
  $('order-cut').textContent = svc.cut ? `Coupe demandée : ${CUTS[c.cut].n}` : 'Barbe uniquement';
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
        (own ? '<span class="tag">ACQUIS</span>' : `<button class="buy" data-svc="${s.id}" data-cost="${s.cost}">${fmt(s.cost)} €</button>`) + '</div>';
    }
  } else if (tab === 'cuts') {
    const info = selCut >= 0
      ? `<strong>${CUTS[selCut].n}</strong><br>${CUTS[selCut].d}`
      : 'Touchez une coupe pour la découvrir. Chaque coupe trouvée ajoute +2 % à vos tarifs.';
    h += `<h2>COLLECTION ${S.cuts.length}/${CUTS.length}</h2><div class="cut-info">${info}</div><div class="grid">`;
    CUTS.forEach((c, i) => {
      h += S.cuts.includes(i)
        ? `<button class="tile ${i === selCut ? 'sel' : ''}" data-cut="${i}"><canvas width="48" height="56"></canvas><span class="tile-n">${c.n}</span></button>`
        : '<div class="tile locked"><div class="q">?</div><span class="tile-n">???</span></div>';
    });
    h += '</div>';
  } else {
    h += `<h2>${SALON.name.toUpperCase()}</h2>` +
      `<p>${SALON.address}<br>Tél. <a href="tel:${SALON.phone.replace(/ /g, '')}">${SALON.phone}</a><br>${SALON.rating}</p>` +
      `<p><strong>Offre du moment :</strong> ${SALON.offer}</p>` +
      `<a class="cta" href="${SALON.planity}" target="_blank" rel="noopener">PRENDRE RDV</a>` +
      '<h2>HORAIRES</h2><table>' + SALON.hours.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + '</table>' +
      '<h2>TARIFS</h2><table>' + SERVICES.map((s) => `<tr><td>${s.n}</td><td>${s.price} €</td></tr>`).join('') + '</table>' +
      '<h2>LE CONCOURS</h2><p>2 semaines pour marquer un maximum de points. 1re place : une coupe offerte. Les 3 suivantes : un rabais. Classement en ligne : bientôt.</p>' +
      `<p class="muted">Vos points : ${fmt(S.total)} · Clients coiffés : ${S.served}</p>` +
      `<p class="muted">SIRET : ${SALON.siret}<br>Tarifs et horaires : fiche Planity du salon, 12/11/2026.</p>` +
      '<button class="link" id="reset">Recommencer la partie</button>';
  }
  panel.innerHTML = h;
  if (tab === 'cuts') panel.querySelectorAll('.tile[data-cut]').forEach((b) => drawPortrait(b.querySelector('canvas'), +b.dataset.cut));
  renderStats();
}

panel.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.tool) {
    const t = TOOLS.find((x) => x.id === b.dataset.tool), cost = toolCost(t);
    if (S.money < cost) return;
    S.money -= cost; S.tools[t.id] = lvl(t.id) + 1;
  } else if (b.dataset.svc) {
    const s = svcOf(b.dataset.svc);
    if (S.money < s.cost || S.svc.includes(s.id)) return;
    S.money -= s.cost; S.svc.push(s.id);
    toast(`<b>Nouvelle prestation : ${s.n}</b><br>Au salon : ${fmtPrice(s)}.`);
  } else if (b.dataset.cut) {
    selCut = +b.dataset.cut;
  } else if (b.id === 'reset') {
    if (!confirm('Effacer la partie et recommencer ?')) return;
    S = fresh(); newClient(); phase = 'cut'; selCut = -1;
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

document.addEventListener('visibilitychange', () => { if (document.hidden) save(); last = performance.now(); });
setInterval(save, 5000);

/* ---------- Démarrage ---------- */
if (!S.client || !svcOf(S.client.svc) || !CUTS[S.client.cut]) newClient(); else renderOrder();
renderPanel();
renderCombo();
requestAnimationFrame(loop);
