/* Signature Cut by Tracy – le jeu (clicker) · V3
   Rendu vectoriel lisse sur canvas, net sur tous les écrans. Tout est local (localStorage).
   V3 : univers de clientèle, activités (shampoing, massage, soin, lotion), décor animé, musique,
   vente de produits avec historique, fauteuils d'équipe.
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
const XP0 = 65; // vitesse des niveaux (voir xpNeed) : niveau 12 vers 10-12 min en jouant vite, le plancher de 15 min fait le reste

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
  { id: 'visage', n: 'Coupe + soin visage', price: 35, min: 30, cost: 2500, cut: true, soin: true },
  { id: 'coupebarbe', n: 'Coupe + barbe', price: 45, min: 50, cost: 4000, cut: true, beard: 2 },
  { id: 'complete', n: 'Coupe + massage crânien + barbe + soin visage', price: 65, min: 60, cost: 8000, cut: true, beard: 2, massage: true, soin: true },
];

const TOOLS = [
  { id: 'ciseaux', n: 'Ciseaux affûtés', d: '+1 de puissance par clic', base: 20, g: 1.45 },
  { id: 'apprenti', n: 'Apprenti', d: 'Coupe tout seul : +2 par seconde', base: 90, g: 1.5 },
  { id: 'lotion', n: 'Lotion & soin', d: '+10 % sur chaque prestation', base: 150, g: 1.6 },
  { id: 'tondeuse', n: 'Tondeuse pro', d: '+4 de puissance par clic', base: 220, g: 1.5 },
  { id: 'bouche', n: 'Bouche-à-oreille', d: '+5 % de clients généreux (x3)', base: 400, g: 1.7, max: 10 },
  { id: 'hold', n: 'Clic maintenu', d: 'Restez appuyé : +2 clics automatiques par seconde', base: 300, g: 2.4, max: 4 },
  { id: 'presentoir', n: 'Présentoir produits', d: '+1,5 % de chances de vendre un produit', base: 250, g: 1.6, max: 8 },
  { id: 'formation', n: "Formation de l'équipe", d: 'Les autres fauteuils vont 10 % plus vite', base: 600, g: 1.7, max: 10 },
];

/* Univers : la clientèle monte en gamme avec les gains cumulés (at). m = multiplicateur de tarifs, propre au jeu.
   wall = couleurs du mur. Les tenues et bijoux sont génériques : aucune marque réelle n'est reproduite. */
const TIERS = [
  { n: 'Quartier', at: 0, m: 1, d: 'Les habitués du quartier : t-shirts et petits budgets.', wall: ['#4a4640', '#3d3934', '#2a2723'] },
  { n: 'Centre-ville', at: 500, m: 2.5, d: 'Le bouche-à-oreille gagne le centre de Pau : chemises et rendez-vous réguliers.', wall: ['#3f4a4c', '#33403f', '#222b2b'] },
  { n: 'Affaires', at: 5000, m: 6, d: 'Costume, cravate et agenda chargé : ils veulent du net, vite.', wall: ['#3a3f52', '#2c3044', '#1c1f2e'] },
  { n: 'Créateurs', at: 40000, m: 14, d: 'T-shirts noirs de créateur et chaînes en or.', wall: ['#4a3550', '#382640', '#221628'] },
  { n: 'Stars', at: 300000, m: 30, d: 'Colliers et boucles d\'oreilles en diamant : le salon devient une adresse.', wall: ['#2c2c33', '#1e1e25', '#111116'] },
  { n: 'Légendes', at: 2000000, m: 65, d: 'Diamants partout, jusque dans le sourire.', wall: ['#3d2f12', '#261c0a', '#120c03'] },
];
// Un client plus riche est plus exigeant : plus de travail (et autant d'expérience en plus).
// Sans cela, en fin de partie, chaque client partirait en un clic.
const TIER_WORK = [1, 3, 8, 20, 45, 100];
const TIER_XP = [1, 1.7, 2.8, 4.5, 6.7, 10]; // l'expérience monte moins vite que le travail : joueurs rapides et lents restent proches
const SEATS = [600, 3500, 15000, 60000]; // prix des fauteuils 2 à 5
const SEAT_TIME = 12;                    // secondes par client sur un fauteuil d'équipe
// Produits et prix fictifs, propres au jeu : ce ne sont pas ceux du salon.
const PRODUCTS = [['Gel coiffant', 12], ['Cire mate', 14], ['Lotion après-rasage', 15], ['Shampoing soin', 16], ['Spray texturisant', 17], ['Huile à barbe', 18]];
/* Personnalités : archétypes ORIGINAUX inventés pour le jeu. Aucune personne réelle ni personnage existant
   n'est reproduit (droit à l'image, droit d'auteur). at = univers minimum, look = tenue (0 à 5 comme les
   univers, 6 = blouson de cuir), col = couleur de tenue, jw = bijoux (3 à 5), acc = accessoires. */
const STARS = [
  { n: 'Kenzo le Héros', d: 'Tout droit sorti d\'un manga : bandeau, cicatrice et cheveux bleus.', at: 1, look: 0, col: '#e9e4d8', hair: 7, acc: ['headband', 'scar'] },
  { n: 'Le Streamer', d: 'En live douze heures par jour, casque autour du cou.', at: 1, look: 0, col: '#6b3fa0', acc: ['headphones', 'glasses'] },
  { n: 'Le Pirate', d: 'Un œil, un trésor, et une envie de changer de tête.', at: 1, look: 0, col: '#7a2e2e', acc: ['patch'] },
  { n: 'Le Boss de la Tech', d: 'Blouson de cuir et keynotes : il vend des puces au monde entier.', at: 2, look: 6, hair: 5, acc: ['glasses'] },
  { n: 'Le Milliardaire pressé', d: 'Costume noir, cravate noire : il a une fusée à prendre.', at: 2, look: 2, col: '#17171a', acc: [] },
  { n: 'Le Champion', d: 'Médaille d\'or autour du cou, il sort du podium.', at: 2, look: 4, col: '#1d3f8f', acc: ['medal'] },
  { n: 'Le Chef étoilé', d: 'Trois étoiles et pas un cheveu dans la soupe.', at: 2, look: 1, col: '#f4f4f0', acc: ['stache'] },
  { n: 'Le Rockeur', d: 'Cuir, lunettes noires et larsen.', at: 2, look: 6, acc: ['shades', 'tattoo'] },
  { n: 'MC Diamant', d: 'Rappeur : il ne sourit que pour montrer ses diamants.', at: 3, look: 4, jw: 5, grillz: true, hair: 0, acc: ['shades'] },
  { n: 'La Popstar', d: 'Cheveux roses, paillettes et refrain entêtant.', at: 3, look: 5, jw: 4, hair: 6, acc: ['starcheek'] },
  { n: 'DJ Néon', d: 'Il mixe jusqu\'au lever du soleil, lunettes fluo sur le nez.', at: 3, look: 3, acc: ['headphones', 'neon'] },
  { n: 'El Tornado', d: 'Catcheur masqué : personne n\'a jamais vu son visage.', at: 3, look: 0, col: '#c8372f', acc: ['mask'] },
  { n: 'Baron Pépite', d: 'Vieux magnat : monocle, moustache blanche et coffre-fort bien rempli.', at: 4, look: 2, col: '#5a2148', hair: 5, jw: 3, acc: ['monocle', 'stache'] },
  { n: 'Unité IA-26', d: 'Un robot qui veut une coupe « plus humaine ».', at: 4, look: 4, col: '#39424e', skin: 4, hair: 8, acc: ['visor', 'antenna'] },
];
const STAR_PAY = 4; // une personnalité paie x4
// Défis : k = compteur suivi, n = objectifs possibles
const MISSIONS = [
  { k: 'served', t: (n) => `Coiffer ${n} clients`, n: [5, 8, 12] },
  { k: 'taps', t: (n) => `Faire ${n} clics`, n: [150, 300, 500] },
  { k: 'crits', t: (n) => `Réussir ${n} coups de maître`, n: [5, 10, 15] },
  { k: 'sales', t: (n) => `Vendre ${n} produit${n > 1 ? 's' : ''}`, n: [1, 2] },
  { k: 'turbo', t: (n) => `Déclencher ${n} Turbo`, n: [1, 2, 3] },
  { k: 'stars', t: (n) => `Coiffer ${n} personnalité${n > 1 ? 's' : ''}`, n: [1, 2] },
];
// Étapes d'une prestation : [nom, poids dans la durée]
const STEPS = { shampoo: ['Shampoing', 2], cut: ['Coupe', 5], beard: ['Barbe', 3], massage: ['Massage crânien', 2.5], soin: ['Soin visage', 2.5], finish: ['Lotion & coiffage', 1.2] };

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
  ['#aab4bf', '#d5dde5', '#76808c'], // 4 : métal (robot), réservé aux personnalités
];
const N_SKIN = 4, N_HAIR = 6; // les clients ordinaires piochent dans les premières teintes
const HAIRS = [
  ['#26201f', '#5a4c4a', '#0f0c0c'], ['#4b2f20', '#7d5236', '#2a180f'], ['#7c5230', '#a97a4c', '#52341b'],
  ['#d6ae56', '#f4d98f', '#a07a2c'], ['#b3552d', '#dd8250', '#7c3516'], ['#a3a3aa', '#d6d6dc', '#6d6d75'],
  ['#e85fa0', '#ff9cc8', '#a8376d'], ['#3f7fd6', '#7fb2f5', '#234f8f'], ['#5f6b78', '#9aa7b5', '#39424e'], // rose, bleu, acier
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
const fresh = () => ({ money: 0, total: 0, served: 0, xp: 0, playSec: 0, tools: {}, svc: ['simple'], cuts: [], client: null, work: 0, code: '', sound: true, music: true, tier: 0, seats: 0, sales: [], salesN: 0, salesSum: 0, stars: [], stat: {}, mis: [] });
let S = fresh();
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { /* stockage indisponible */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* rien */ } };

const lvl = (id) => S.tools[id] || 0;
const power = () => 1 + lvl('ciseaux') + 4 * lvl('tondeuse');
const autoRate = () => 2 * lvl('apprenti');
const mult = () => 1 + 0.1 * lvl('lotion') + 0.02 * S.cuts.length;
const toolCost = (t) => Math.floor(t.base * Math.pow(t.g, lvl(t.id)));
const svcOf = (id) => SERVICES.find((s) => s.id === id);
const tierNow = () => { let i = 0; while (i < TIERS.length - 1 && S.total >= TIERS[i + 1].at) i++; return i; };
const seatPeriod = () => SEAT_TIME * Math.pow(0.9, lvl('formation'));
const seatPay = () => { // un fauteuil d'équipe encaisse la moyenne de la carte débloquée
  const own = SERVICES.filter((s) => S.svc.includes(s.id));
  return Math.max(1, Math.round(own.reduce((a, s) => a + s.price, 0) / own.length * mult() * TIERS[tierNow()].m * 0.6));
};
const offerChance = () => 0.06 + 0.015 * lvl('presentoir');
function earn(x) { S.money += x; S.total += x; }
/* ---------- Défis ---------- */
const bump = (k) => { S.stat[k] = (S.stat[k] || 0) + 1; };
const misProg = (m) => Math.max(0, Math.min(m.n, (S.stat[MISSIONS[m.m].k] || 0) - m.from));
const misReward = () => seatPay() * 6;
function newMission() {
  const used = S.mis.map((m) => m.m);
  let i;
  do { i = rnd(MISSIONS.length); } while (used.includes(i) || (MISSIONS[i].k === 'stars' && tierNow() < 1));
  return { m: i, n: MISSIONS[i].n[rnd(MISSIONS[i].n.length)], from: S.stat[MISSIONS[i].k] || 0 };
}
let simT = null; // horloge simulée (tests d'équilibrage) ; null = temps réel
const nowMs = () => (simT === null ? performance.now() : simT);
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
let tufts = [], foam = [], steps = [], stepI = 0, lastPt = { x: 180, y: 190 };

// Déroulé d'une prestation : shampoing, coupe, barbe, massage, soin, finition.
function stepsOf(c) {
  const s = svcOf(c.svc), ks = [];
  if (s.cut && c.wash) ks.push('shampoo');
  if (s.cut) ks.push('cut');
  if (c.b0 === 3) ks.push('beard');
  if (s.massage) ks.push('massage');
  if (s.soin) ks.push('soin');
  ks.push('finish');
  const tot = ks.reduce((a, x) => a + STEPS[x][1], 0);
  let acc = 0;
  return ks.map((x) => { const from = acc; acc += STEPS[x][1] / tot; return { k: x, from, to: acc }; });
}
function stepAt() { // étape en cours et avancement dans l'étape
  const p = S.work / S.client.need;
  let i = 0;
  while (i < steps.length - 1 && p >= steps[i].to) i++;
  return { k: steps[i].k, i, q: clamp((p - steps[i].from) / (steps[i].to - steps[i].from), 0, 1) };
}
function stepQ(kind) { // avancement (0 à 1) d'une étape donnée
  const s = steps.find((x) => x.k === kind);
  return s ? clamp((S.work / S.client.need - s.from) / (s.to - s.from), 0, 1) : 1;
}
// Fait tomber les mèches au fil de la coupe (cheveux) et de la taille (barbe), au plus près du doigt.
function syncTufts(drop) {
  for (const kind of ['hair', 'beard']) {
    let total = 0, gone = 0;
    for (const t of tufts) if (t.kind === kind) { total++; if (t.gone) gone++; }
    if (!total) continue;
    const target = Math.floor(stepQ(kind === 'hair' ? 'cut' : 'beard') * total);
    while (gone < target) {
      let best = null, bd = 1e9;
      for (const t of tufts) {
        if (t.gone || t.kind !== kind) continue;
        const d = (t.mx - lastPt.x) ** 2 + (t.my - lastPt.y) ** 2;
        if (d < bd) { bd = d; best = t; }
      }
      if (!best) break;
      if (drop) dropTuft(best); else best.gone = true;
      gone++;
    }
  }
}
function checkTier() {
  const tn = tierNow();
  if (tn <= (S.tier || 0)) return;
  S.tier = tn;
  buildBg(); sfx('level');
  modal(`<h3>Nouvel univers : ${TIERS[tn].n}</h3><p>${TIERS[tn].d}</p><p class="muted">Ces clients paient x${String(TIERS[tn].m).replace('.', ',')} le tarif de base.</p>`);
  if (tab === 'biz') renderPanel();
}

/* ---------- Vente de produits ---------- */
let offer = null, offerTimer = 0;
function showOffer(c) {
  const p = PRODUCTS[rnd(PRODUCTS.length)];
  offer = { n: p[0], p: Math.round(p[1] * TIERS[c.tier || 0].m), c: S.served };
  const el = $('offer');
  el.innerHTML = `<small>Le client hésite…</small><b>${offer.n}</b><span>Vendre · ${offer.p} €</span>`;
  el.style.left = (8 + rnd(38)) + '%'; el.style.top = (22 + rnd(30)) + '%';
  el.hidden = false;
  clearTimeout(offerTimer);
  offerTimer = setTimeout(() => { el.hidden = true; offer = null; }, 4500);
}
function sellOffer() {
  if (!offer) return;
  earn(offer.p);
  S.sales.unshift({ t: Date.now(), n: offer.n, p: offer.p, c: offer.c });
  S.sales.length = Math.min(S.sales.length, 40);
  S.salesN++; S.salesSum += offer.p; bump('sales'); cash(6, CX, 260);
  toast(`<b>Vendu : ${offer.n}</b><br>+${offer.p} € · à retrouver dans « Mon salon ».`);
  sfx('coin');
  clearTimeout(offerTimer); $('offer').hidden = true; offer = null;
  checkTier(); renderStats(); save();
  if (tab === 'biz') renderPanel();
}

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
  const tn = tierNow(); // la plupart des clients viennent de l'univers atteint, quelques habitués restent
  let star = -1; // de temps en temps, une personnalité pousse la porte (de préférence une nouvelle)
  if (S.served >= 3 && Math.random() < 0.06) {
    const pool = [];
    STARS.forEach((s, i) => { if (s.at <= tn) pool.push(i); });
    const unseen = pool.filter((i) => !S.stars.includes(i));
    const from = unseen.length && Math.random() < 0.7 ? unseen : pool;
    if (from.length) star = from[rnd(from.length)];
  }
  const tier = star < 0 && tn && Math.random() < 0.3 ? rnd(tn) : tn;
  const sd = star >= 0 ? STARS[star] : {};
  S.client = {
    ...(star >= 0 ? { star, look: sd.look, col: sd.col, jw: sd.jw || 0, grillz: !!sd.grillz } : {}),
    tier, xp: Math.round((20 + svc.min) * TIER_XP[tier]), fit: rnd(4), wash: S.served === 0 || Math.random() < 0.6,
    svc: svc.id, cut, skin: sd.skin !== undefined ? sd.skin : rnd(N_SKIN), hair: sd.hair !== undefined ? sd.hair : rnd(N_HAIR), eye: rnd(EYES.length), seed: rnd(1e9),
    b0: hasBeard ? 3 : stubble, b1: hasBeard ? svc.beard : stubble,
    need: Math.round((20 + svc.min) * TIER_WORK[tier]), vip: Math.random() < 0.05 * lvl('bouche'),
  };
  S.work = 0;
  setupClient();
}

function setupClient() {
  steps = stepsOf(S.client);
  stepI = stepAt().i;
  buildTufts(); buildFoam();
  syncTufts(false);
  buildClientLayer();
  renderOrder();
}

function finishClient() {
  const c = S.client, svc = svcOf(c.svc);
  const isStar = c.star !== undefined && STARS[c.star];
  const pay = Math.round(svc.price * mult() * TIERS[c.tier || 0].m * (c.vip ? 3 : 1) * (isStar ? STAR_PAY : 1));
  const before = levelInfo().l;
  earn(pay); S.served++; S.xp += c.xp || c.need;
  bump('served');
  floatText(`+${fmt(pay)} €`, 180, 150, c.vip || isStar ? 'pay vip' : 'pay');
  cash(8 + 5 * (c.tier || 0) + (isStar ? 14 : 0), CX, 300); // pluie de billets
  if (isStar) {
    bump('stars');
    if (!S.stars.includes(c.star)) { S.stars.push(c.star); toast(`<b>Nouvelle personnalité : ${isStar.n}</b><br>${isStar.d}`); if (tab === 'cuts') renderPanel(); }
  }
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

  phase = 'done'; phaseT = 0.7;
  if (Math.random() < offerChance()) showOffer(c);
  renderStats(); checkReward(); checkTier(); save();
}

function levelUp(l) {
  const bonus = l * 15;
  earn(bonus);
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
  syncTufts(true);
  const i = stepAt().i;
  if (i !== stepI) { // changement d'activité
    if (steps[stepI].k === 'shampoo') for (let n = 0; n < 30; n++) puff('drop', 115 + rnd(130), 140 + rnd(70)); // rinçage
    stepI = i;
    floatText(STEPS[steps[i].k][0] + ' !', 180, 118, 'step');
    sfx('step'); renderOrder();
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
  if (c.cape) drawCape(g, c); else drawOutfit(g, c);
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), c = (v) => clamp(Math.round(v * f), 0, 255);
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}
function torso(g) {
  g.beginPath(); g.moveTo(CX - 27, 334);
  g.bezierCurveTo(CX - 60, 344, CX - 108, 352, CX - 118, 440);
  g.lineTo(CX + 118, 440);
  g.bezierCurveTo(CX + 108, 352, CX + 60, 344, CX + 27, 334);
  g.quadraticCurveTo(CX, 356, CX - 27, 334); g.closePath();
}
const TEES = ['#8d99a6', '#5f7f9c', '#6f8f6b', '#a3665a'];
const SHIRTS = ['#dfe7ee', '#c9d9ea', '#e9dcc6', '#d6c4d8'];
const SUITS = ['#2b3140', '#3a3a3f', '#27303a', '#40332c'];
const TIES = ['#8c2f39', '#2f4f8c', '#d9b85f', '#5a3d6b'];

// La tenue du client, visible à l'arrivée et au départ : elle monte en gamme avec l'univers.
function drawOutfit(g, c) {
  const t = c.look !== undefined ? c.look : c.tier || 0, f = c.fit || 0;
  const base = c.col || (t === 0 ? TEES[f] : t === 1 ? SHIRTS[f] : t === 2 ? SUITS[f] : t === 5 ? '#b8943c' : '#1a1817');
  torso(g);
  let gr = g.createLinearGradient(CX - 120, 340, CX + 120, 440);
  gr.addColorStop(0, shade(base, 1.25)); gr.addColorStop(1, shade(base, 0.6));
  g.fillStyle = gr; g.fill();
  g.save(); torso(g); g.clip();
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (t === 1) { // chemise : col et boutons
    g.strokeStyle = shade(base, 0.72); g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(CX, 358); g.lineTo(CX, 440); g.stroke();
    for (const sx of [-1, 1]) {
      g.fillStyle = shade(base, 1.08);
      g.beginPath(); g.moveTo(CX, 358); g.lineTo(CX + sx * 30, 332); g.lineTo(CX + sx * 36, 366); g.closePath(); g.fill(); g.stroke();
    }
    g.fillStyle = shade(base, 0.6);
    for (const y of [380, 404, 428]) { g.beginPath(); g.arc(CX, y, 2.4, 0, 7); g.fill(); }
  } else if (t === 2 || t === 5) { // costume (doré pour les légendes)
    g.fillStyle = t === 5 ? '#151312' : '#f3f3f1';
    g.beginPath(); g.moveTo(CX - 24, 334); g.quadraticCurveTo(CX, 356, CX + 24, 334); g.lineTo(CX, 432); g.closePath(); g.fill();
    if (t === 2) {
      g.fillStyle = TIES[f];
      g.beginPath(); g.moveTo(CX - 6, 354); g.lineTo(CX + 6, 354); g.lineTo(CX + 9, 408); g.lineTo(CX, 422); g.lineTo(CX - 9, 408); g.closePath(); g.fill();
      g.fillStyle = shade(TIES[f], 0.7); g.fillRect(CX - 6, 354, 12, 9);
    }
    for (const sx of [-1, 1]) {
      g.fillStyle = t === 5 ? '#151312' : shade(base, 1.35); g.strokeStyle = shade(base, 0.5); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(CX + sx * 25, 334); g.lineTo(CX + sx * 50, 376); g.lineTo(CX + sx * 32, 380); g.lineTo(CX + sx * 3, 432); g.closePath(); g.fill(); g.stroke();
    }
  } else if (t === 3) { // t-shirt de créateur : médaillon soleil doré (motif générique)
    g.strokeStyle = '#d9b85f'; g.lineWidth = 3;
    g.beginPath(); g.arc(CX, 410, 21, 0, 7); g.stroke();
    g.lineWidth = 1.6;
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; g.beginPath(); g.moveTo(CX + Math.cos(a) * 25, 410 + Math.sin(a) * 25); g.lineTo(CX + Math.cos(a) * 31, 410 + Math.sin(a) * 31); g.stroke(); }
    star(g, CX, 410, 13, '#f3dc98');
  } else if (t === 6) { // blouson de cuir ouvert sur un t-shirt
    g.fillStyle = '#2a2826';
    g.beginPath(); g.moveTo(CX - 24, 334); g.quadraticCurveTo(CX, 356, CX + 24, 334); g.lineTo(CX + 10, 440); g.lineTo(CX - 10, 440); g.closePath(); g.fill();
    for (const sx of [-1, 1]) {
      g.fillStyle = '#34312e'; g.strokeStyle = '#0a0908'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(CX + sx * 25, 334); g.lineTo(CX + sx * 54, 366); g.lineTo(CX + sx * 30, 392); g.lineTo(CX + sx * 10, 440); g.lineTo(CX + sx * 12, 372); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#b9bcc4'; g.lineWidth = 1.6; g.setLineDash([2, 2]);
      g.beginPath(); g.moveTo(CX + sx * 11, 374); g.lineTo(CX + sx * 10, 440); g.stroke(); g.setLineDash([]);
    }
    g.strokeStyle = 'rgba(255,255,255,.1)'; g.lineWidth = 2;
    for (const x of [-92, -70, 70, 92]) { g.beginPath(); g.moveTo(CX + x, 370); g.lineTo(CX + x * 1.06, 440); g.stroke(); }
  } else if (t === 4) { // bandes blanches sur les manches
    g.strokeStyle = '#f1f1ee'; g.lineWidth = 5;
    for (const sx of [-1, 1]) for (const o of [0, 10]) { g.beginPath(); g.moveTo(CX + sx * (58 + o), 344); g.quadraticCurveTo(CX + sx * (96 + o), 362, CX + sx * (104 + o), 440); g.stroke(); }
  }
  g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 3;
  for (const x of [-78, 80]) { g.beginPath(); g.moveTo(CX + x, 384); g.quadraticCurveTo(CX + x * 1.08, 410, CX + x * 1.14, 440); g.stroke(); }
  g.restore();
  if (t === 0 || t === 3 || t === 4) { // encolure
    g.strokeStyle = t === 0 ? shade(base, 0.62) : t === 3 ? '#d9b85f' : '#f1f1ee'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 27, 335); g.quadraticCurveTo(CX, 357, CX + 27, 335); g.stroke();
  }
}

function drawCape(g, c) { // cape noire à liseré doré
  let gr;
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

/* ---------- Bijoux (univers Créateurs, Stars, Légendes) ---------- */
function diamond(g, x, y, s) {
  const gr = g.createLinearGradient(x - s, y - s, x + s, y + s);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, '#bfe6ff'); gr.addColorStop(1, '#6fb4e6');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(x - s, y - s * 0.3); g.lineTo(x - s * 0.55, y - s * 0.85); g.lineTo(x + s * 0.55, y - s * 0.85); g.lineTo(x + s, y - s * 0.3); g.lineTo(x, y + s); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(0.6, s * 0.09);
  g.beginPath(); g.moveTo(x - s, y - s * 0.3); g.lineTo(x + s, y - s * 0.3); g.moveTo(x - s * 0.3, y - s * 0.3); g.lineTo(x, y + s); g.lineTo(x + s * 0.3, y - s * 0.3); g.stroke();
}
function twinkle(g, x, y, r, ph) {
  const a = Math.sin(time * 3.2 + ph);
  if (a <= 0) return;
  g.globalAlpha = a; g.fillStyle = '#fff';
  g.beginPath(); g.moveTo(x, y - r * a); g.quadraticCurveTo(x, y, x + r * a, y); g.quadraticCurveTo(x, y, x, y + r * a); g.quadraticCurveTo(x, y, x - r * a, y); g.quadraticCurveTo(x, y, x, y - r * a); g.fill();
  g.globalAlpha = 1;
}
function chain(g, depth, w, col, dash) {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'butt'; g.setLineDash(dash);
  g.beginPath(); g.moveTo(CX - 25, 332); g.quadraticCurveTo(CX, 332 + (depth - 332) * 2 - 6, CX + 25, 332); g.stroke();
  g.setLineDash([]);
}
// Dessinés en direct, par-dessus la cape : ils scintillent.
function drawJewels(g, c) {
  const t = c.jw !== undefined ? c.jw : c.tier || 0;
  if (t < 3) return;
  if (t === 3) {
    chain(g, 372, 3.4, '#e8cc7c', [4, 2]);
    g.fillStyle = '#f3dc98'; rr(g, CX - 4, 366, 8, 13, 2); g.fill();
    twinkle(g, CX + 2, 368, 7, 0);
  } else {
    if (t === 5) { chain(g, 392, 6, '#f3dc98', [5, 2]); diamond(g, CX, 392, 13); twinkle(g, CX - 5, 386, 12, 2.1); twinkle(g, CX + 17, 366, 7, 4); }
    chain(g, 370, 4.6, '#e9f4fb', [3, 1.6]);
    diamond(g, CX, t === 5 ? 368 : 374, t === 5 ? 6 : 9);
    twinkle(g, CX + 4, 370, 9, 0); twinkle(g, CX - 16, 356, 6, 1.3);
    for (const sx of [-1, 1]) twinkle(g, CX + sx * 64, 268, 7, sx + 3);
  }
}

/* ---------- Accessoires des personnalités ---------- */
// under = true : ce qui passe sous les yeux et la bouche (masque, bandeau) ; false : par-dessus (lunettes…)
function drawAcc(g, c, under) {
  const s = c.star !== undefined && STARS[c.star];
  if (!s) return;
  const has = (a) => s.acc.includes(a), hp = HAIRS[c.hair];
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (under) {
    if (has('mask')) { // masque de catcheur
      g.save(); headPath(g); g.clip();
      g.fillStyle = '#c8372f'; g.fillRect(CX - 70, 196, 140, 140);
      g.strokeStyle = '#f3dc98'; g.lineWidth = 3;
      for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 24, 250, 16, 12, sx * 0.25, 0, 7); g.stroke(); g.beginPath(); g.moveTo(CX + sx * 44, 226); g.quadraticCurveTo(CX + sx * 30, 212, CX + sx * 8, 222); g.stroke(); }
      g.beginPath(); g.ellipse(CX, 299, 24, 13, 0, 0, 7); g.stroke();
      g.fillStyle = SKINS[c.skin][0]; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 24, 250, 14, 10, sx * 0.25, 0, 7); g.fill(); }
      g.beginPath(); g.ellipse(CX, 299, 22, 11, 0, 0, 7); g.fill();
      g.restore();
    }
    if (has('headband')) {
      g.save(); headPath(g); g.clip(); g.fillStyle = '#c8372f'; g.fillRect(CX - 70, 204, 140, 13); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(CX - 70, 206, 140, 2.5); g.restore();
      g.fillStyle = '#c8372f'; g.beginPath(); g.moveTo(CX + 58, 208); g.lineTo(CX + 84, 222); g.lineTo(CX + 78, 232); g.lineTo(CX + 60, 216); g.closePath(); g.fill();
    }
    if (has('scar')) { g.strokeStyle = '#a8543f'; g.lineWidth = 2; g.beginPath(); g.moveTo(CX + 30, 264); g.lineTo(CX + 42, 284); g.moveTo(CX + 31, 273); g.lineTo(CX + 39, 270); g.moveTo(CX + 35, 280); g.lineTo(CX + 43, 277); g.stroke(); }
    if (has('tattoo')) { g.fillStyle = '#2b2f3a'; g.beginPath(); g.moveTo(CX - 40, 262); g.lineTo(CX - 33, 272); g.lineTo(CX - 38, 272); g.lineTo(CX - 34, 284); g.lineTo(CX - 44, 270); g.lineTo(CX - 39, 270); g.closePath(); g.fill(); }
    if (has('starcheek')) star(g, CX + 38, 274, 7, '#ff8fc0');
    return;
  }
  if (has('shades') || has('neon')) {
    const col = has('neon') ? '#7dff5a' : '#121110';
    g.fillStyle = col; g.strokeStyle = has('neon') ? '#2f8f1d' : '#3a3632'; g.lineWidth = 2;
    for (const sx of [-1, 1]) { rr(g, CX + sx * 24 - 15, 240, 30, 20, 7); g.fill(); g.stroke(); }
    g.lineWidth = 3; g.beginPath(); g.moveTo(CX - 9, 247); g.lineTo(CX + 9, 247); g.moveTo(CX - 39, 246); g.lineTo(CX - 58, 244); g.moveTo(CX + 39, 246); g.lineTo(CX + 58, 244); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX + sx * 24 - 9, 245); g.lineTo(CX + sx * 24 - 2, 245); g.stroke(); }
  }
  if (has('glasses')) {
    g.strokeStyle = '#2a2826'; g.lineWidth = 2.2;
    for (const sx of [-1, 1]) { rr(g, CX + sx * 24 - 14, 240, 28, 19, 6); g.stroke(); }
    g.beginPath(); g.moveTo(CX - 10, 247); g.lineTo(CX + 10, 247); g.moveTo(CX - 38, 246); g.lineTo(CX - 58, 244); g.moveTo(CX + 38, 246); g.lineTo(CX + 58, 244); g.stroke();
  }
  if (has('visor')) { // regard de robot
    g.fillStyle = '#10151c'; rr(g, CX - 44, 239, 88, 22, 9); g.fill();
    g.fillStyle = `rgba(90,220,255,${0.7 + 0.3 * Math.sin(time * 4)})`;
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 22 + eyeDx, 250, 8, 4.5, 0, 0, 7); g.fill(); }
  }
  if (has('monocle')) {
    g.strokeStyle = '#e8cc7c'; g.lineWidth = 2.6; g.beginPath(); g.arc(CX + 24, 250, 14, 0, 7); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.14)'; g.fill();
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(CX + 36, 258); g.quadraticCurveTo(CX + 52, 290, CX + 40, 322); g.stroke();
  }
  if (has('patch')) {
    g.strokeStyle = '#121110'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(CX - 58, 226); g.lineTo(CX + 58, 258); g.stroke();
    g.fillStyle = '#121110'; g.beginPath(); g.ellipse(CX - 24, 250, 15, 12, 0, 0, 7); g.fill();
  }
  if (has('stache')) {
    g.fillStyle = hp[1]; g.strokeStyle = hp[2]; g.lineWidth = 1;
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(CX, 285); g.quadraticCurveTo(CX + sx * 14, 279, CX + sx * 27, 288); g.quadraticCurveTo(CX + sx * 30, 283, CX + sx * 31, 280); g.quadraticCurveTo(CX + sx * 30, 296, CX + sx * 14, 294); g.quadraticCurveTo(CX + sx * 4, 293, CX, 289); g.closePath(); g.fill(); g.stroke(); }
  }
  if (has('antenna')) {
    g.strokeStyle = '#76808c'; g.lineWidth = 3; g.beginPath(); g.moveTo(CX + 66, 246); g.lineTo(CX + 80, 214); g.stroke();
    g.fillStyle = Math.sin(time * 5) > 0 ? '#ff5e62' : '#7a2f31'; g.beginPath(); g.arc(CX + 80, 212, 4.5, 0, 7); g.fill();
  }
  if (has('headphones')) { // casque autour du cou
    g.strokeStyle = '#17171a'; g.lineWidth = 7; g.beginPath(); g.moveTo(CX - 34, 330); g.quadraticCurveTo(CX, 362, CX + 34, 330); g.stroke();
    for (const sx of [-1, 1]) { g.fillStyle = '#17171a'; rr(g, CX + sx * 36 - 9, 318, 18, 28, 8); g.fill(); g.fillStyle = '#7dff5a'; g.fillRect(CX + sx * 36 - 2, 326, 4, 12); }
  }
  if (has('medal')) {
    g.strokeStyle = '#2f55a4'; g.lineWidth = 6; g.beginPath(); g.moveTo(CX - 22, 334); g.lineTo(CX, 372); g.stroke();
    g.strokeStyle = '#c8372f'; g.beginPath(); g.moveTo(CX + 22, 334); g.lineTo(CX, 372); g.stroke();
    g.fillStyle = '#e8cc7c'; g.beginPath(); g.arc(CX, 380, 11, 0, 7); g.fill();
    g.strokeStyle = '#9a7b2c'; g.lineWidth = 1.5; g.stroke(); star(g, CX, 380, 6, '#fff3c4'); twinkle(g, CX + 5, 375, 8, 1);
  }
}

function drawHead(g, c) {
  const sk = SKINS[c.skin], hp = HAIRS[c.hair];
  for (const sx of [-1, 1]) { // oreilles
    g.fillStyle = sx < 0 ? sk[0] : sk[2];
    g.beginPath(); g.ellipse(CX + sx * 62, 254, 9, 15, sx * 0.12, 0, Math.PI * 2); g.fill();
    g.strokeStyle = sk[2]; g.lineWidth = 1.6; g.beginPath(); g.arc(CX + sx * 62, 254, 5, sx < 0 ? 1.2 : -1.9, sx < 0 ? 5 : 1.9); g.stroke();
    if ((c.tier || 0) >= 4) diamond(g, CX + sx * 64, 268, 4.5); // boucles en diamant
    else if (c.tier === 3) { g.fillStyle = '#e8cc7c'; g.beginPath(); g.arc(CX + sx * 64, 267, 3, 0, 7); g.fill(); }
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
    const grillz = c.grillz !== undefined ? c.grillz : c.tier === 5;
    if (grillz) { const gz = g.createLinearGradient(CX - 14, 0, CX + 14, 0); gz.addColorStop(0, '#9fd4f5'); gz.addColorStop(0.5, '#ffffff'); gz.addColorStop(1, '#9fd4f5'); g.fillStyle = gz; } else g.fillStyle = '#fff';
    g.beginPath(); g.moveTo(CX - 14, 295.5); g.quadraticCurveTo(CX, 300, CX + 14, 295.5); g.quadraticCurveTo(CX, 304, CX - 14, 295.5); g.fill();
    if (grillz) { // sourire en diamant
      g.strokeStyle = 'rgba(70,130,180,.7)'; g.lineWidth = 0.8;
      for (let x = -9; x <= 9; x += 4.5) { g.beginPath(); g.moveTo(CX + x, 297); g.lineTo(CX + x, 302); g.stroke(); }
      twinkle(g, CX + 6, 298, 8, 0.7); twinkle(g, CX - 8, 299, 6, 2.6);
    }
  } else {
    g.strokeStyle = '#8a3d3a'; g.lineWidth = 2.8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(CX - 13, 297); g.quadraticCurveTo(CX, mood === 'relax' ? 308 : 302, CX + 13, 297); g.stroke();
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

/* ---------- Mousse du shampoing et masque du soin ---------- */
function buildFoam() {
  const r = rng(S.client.seed + 9);
  foam = [];
  for (let i = 0; i < 30; i++) {
    const th = Math.PI * (0.06 + 0.88 * r()), d = 0.35 + 0.75 * r();
    foam.push({ x: CX + Math.cos(th) * (RX + 2) * d, y: SKY - 8 - Math.sin(th) * (RY + 14) * d, r: 10 + r() * 9, ph: r() * 6 });
  }
}
function drawFoam(g, q) {
  const n = Math.ceil(q * foam.length);
  for (let i = 0; i < n; i++) {
    const f = foam[i], rad = f.r * (0.92 + 0.08 * Math.sin(time * 5 + f.ph));
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(f.x, f.y, rad, 0, 7); g.fill();
    g.strokeStyle = 'rgba(150,195,230,.55)'; g.lineWidth = 1.2; g.beginPath(); g.arc(f.x, f.y, rad * 0.62, 3.6, 5.4); g.stroke();
  }
}
function drawMask(g, q) { // le soin s'applique, pose, puis se retire
  const a = q < 0.6 ? q / 0.6 : (1 - q) / 0.4;
  g.save(); headPath(g); g.clip();
  g.globalAlpha = 0.82 * clamp(a, 0, 1); g.fillStyle = '#d5ecd0';
  g.beginPath(); g.ellipse(CX, 218, 30, 11, 0, 0, 7); g.fill();
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(CX + sx * 34, 276, 17, 15, 0, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(CX, 268, 8, 13, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(CX, 314, 20, 8, 0, 0, 7); g.fill();
  g.restore();
}

/* ---------- Décor ---------- */
// Tout ce qui bouge derrière le client : projecteurs, lampes, enseigne, néon, poussières.
function drawBgLive(g) {
  const tn = S.tier || 0;
  let gr;
  if (tn >= 3) for (const s of [-1, 1]) { // projecteurs des univers haut de gamme
    g.save(); g.translate(CX + s * 150, -30); g.rotate(Math.sin(time * 0.55 + s) * 0.32 + s * 0.3);
    gr = g.createLinearGradient(0, 0, 0, 430);
    gr.addColorStop(0, tn >= 5 ? 'rgba(255,214,120,.24)' : 'rgba(255,255,255,.17)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.lineTo(74, 430); g.lineTo(-74, 430); g.closePath(); g.fill();
    g.restore();
  }
  for (let i = 0; i < 2; i++) { // suspensions qui se balancent
    const x0 = i ? 326 : 34, lx = x0 + Math.sin(time * 0.9 + i * 2) * 3.5, fl = 0.46 + Math.sin(time * 6 + i * 3) * 0.03;
    g.strokeStyle = '#1b1917'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, -300); g.lineTo(lx, 58); g.stroke();
    gr = g.createRadialGradient(lx, 86, 2, lx, 86, 90);
    gr.addColorStop(0, `rgba(255,220,150,${fl})`); gr.addColorStop(1, 'rgba(255,220,150,0)');
    g.fillStyle = gr; g.fillRect(lx - 95, 0, 190, 190);
    g.fillStyle = '#d9b85f'; g.beginPath(); g.moveTo(lx - 9, 56); g.lineTo(lx + 9, 56); g.lineTo(lx + 24, 84); g.lineTo(lx - 24, 84); g.closePath(); g.fill();
    g.fillStyle = '#fff6d8'; g.beginPath(); g.ellipse(lx, 85, 12, 5, 0, 0, 7); g.fill();
  }
  // enseigne de barbier qui tourne
  g.fillStyle = '#d9b85f'; rr(g, 320, 150, 26, 10, 4); g.fill(); rr(g, 320, 262, 26, 10, 4); g.fill();
  g.save(); rr(g, 323, 160, 20, 102, 6); g.clip();
  g.fillStyle = '#f7f3ea'; g.fillRect(323, 160, 20, 102);
  const off = (time * 16) % 36;
  for (let i = -3; i < 9; i++) { g.fillStyle = i & 1 ? '#c8372f' : '#2f55a4'; const y = 160 + i * 18 + off; g.beginPath(); g.moveTo(323, y); g.lineTo(343, y - 12); g.lineTo(343, y - 4); g.lineTo(323, y + 8); g.closePath(); g.fill(); }
  gr = g.createLinearGradient(323, 0, 343, 0);
  gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.3)');
  g.fillStyle = gr; g.fillRect(323, 160, 20, 102);
  g.restore();
  // néon « OUVERT »
  const flick = Math.sin(time * 2.2) > -0.96 ? 0.8 + 0.2 * Math.sin(time * 2.6) : 0.25;
  g.globalAlpha = flick * 0.22; g.strokeStyle = '#ff7fb5'; g.lineWidth = 7; rr(g, 6, 156, 64, 24, 8); g.stroke();
  g.globalAlpha = flick; g.lineWidth = 1.8; rr(g, 6, 156, 64, 24, 8); g.stroke();
  g.fillStyle = '#ffd0e4'; g.font = '600 12px Outfit, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('OUVERT', 38, 168.5);
  g.globalAlpha = 1;
  // poussières dorées dans la lumière
  g.fillStyle = tn >= 4 ? '#ffffff' : '#f3dc98';
  for (let i = 0; i < 14; i++) {
    const x = ((i * 97 + time * (5 + (i % 4) * 3)) % 440) - 40, y = 40 + (i * 61) % 330 + Math.sin(time * 0.7 + i) * 12;
    g.globalAlpha = 0.16 + 0.14 * Math.sin(time * 1.3 + i * 2);
    g.beginPath(); g.arc(x, y, 1.2 + (i % 3) * 0.5, 0, 7); g.fill();
  }
  g.globalAlpha = 1;
  if (tn >= 4) for (let i = 0; i < 7; i++) twinkle(g, 20 + (i * 53) % 330, 30 + (i * 89) % 150, 6 + (i % 3) * 2, i * 1.7); // paillettes
}

function buildBg() {
  if (!cv.width) return;
  bg.width = cv.width; bg.height = cv.height;
  const g = bg.getContext('2d'), W = bg.width, Hh = bg.height, wall = TIERS[S.tier || 0].wall;
  let gr = g.createLinearGradient(0, 0, 0, Hh);
  gr.addColorStop(0, wall[0]); gr.addColorStop(0.6, wall[1]); gr.addColorStop(1, wall[2]);
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
  // étagère et flacons (lampes, enseigne et néon sont animés : voir drawBgLive)
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

const REACH = { scissors: 62, clipper: 58, comb: 62, none: 28, spray: 50, brush: 60 }; // distance main → pointe de l'outil
function handTools(st) {
  if (st === 'shampoo' || st === 'massage') return ['none', 'none'];
  if (st === 'soin') return ['none', 'brush'];
  if (st === 'finish') return ['comb', 'spray'];
  if (st === 'beard') return ['comb', 'clipper'];
  const cut = CUTS[S.client.cut];
  return ['comb', (cut.fade || cut.tex === 'buzz') && stepQ('cut') > 0.45 ? 'clipper' : 'scissors'];
}

function drawHand(g, h, tool, soapy) {
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
  } else if (tool === 'spray') { // flacon de lotion
    const gr = g.createLinearGradient(0, -16, 0, 16);
    gr.addColorStop(0, '#f3dc98'); gr.addColorStop(1, '#9a7b2c');
    g.fillStyle = gr; rr(g, 4, -6, 26, 34, 7); g.fill();
    g.fillStyle = '#141210'; g.fillRect(11, -14, 12, 9); rr(g, 9, -24, 34, 11, 4); g.fill();
    g.fillStyle = '#f7f3ea'; g.fillRect(43, -21, 5, 5);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(8, 0, 4, 22);
  } else if (tool === 'brush') { // pinceau de soin
    g.fillStyle = '#6b3f26'; rr(g, 2, -4, 40, 8, 4); g.fill();
    g.fillStyle = '#d9b85f'; g.fillRect(40, -6, 7, 12);
    g.fillStyle = '#f5ecdc'; rr(g, 46, -7, 17, 14, 6); g.fill();
    g.fillStyle = '#d5ecd0'; rr(g, 56, -7, 7, 14, 5); g.fill();
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
  if (soapy) { // mains pleines de mousse
    g.fillStyle = 'rgba(255,255,255,.95)';
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(10 + i * 6, -10 + (i * 37 % 20) + Math.sin(time * 6 + i) * 1.5, 5 + (i % 3) * 1.5, 0, 7); g.fill(); }
  }
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
// bulles (bub), gouttes de rinçage (drop), brume de lotion (mist), cœurs du massage (heart)
function puff(kind, x, y) {
  if (parts.length > 120) return;
  const p = { kind, x, y, a: 0, va: 0, vx: (Math.random() - 0.5) * 70, vy: -30 - Math.random() * 60, life: 0.9, r: 3 + Math.random() * 5 };
  if (kind === 'drop') { p.vy = 40 + Math.random() * 120; p.vx *= 1.6; p.life = 0.7; p.r = 2 + Math.random() * 2.5; }
  else if (kind === 'mist') { p.vx *= 0.5; p.vy = -10 - Math.random() * 25; p.life = 0.6; p.r = 5 + Math.random() * 7; }
  else if (kind === 'heart') { p.vx *= 0.6; p.life = 1.1; p.r = 5 + Math.random() * 3; }
  parts.push(p);
}
const GRAV = { spark: 260, bub: -70, mist: 0, heart: -50, drop: 520, bill: 430 };
function cash(n, x, y) { // jet de billets verts
  for (let i = 0; i < n && parts.length < 170; i++) parts.push({ kind: 'bill', x: x + rnd(50) - 25, y, a: Math.random() * 6, va: (Math.random() - 0.5) * 9, vx: (Math.random() - 0.5) * 400, vy: -230 - Math.random() * 300, life: 1.5 + Math.random() * 0.6, ph: Math.random() * 6 });
}
function spark(x, y) {
  parts.push({ kind: 'spark', x, y, a: 0, vx: (Math.random() - 0.5) * 180, vy: -120 - Math.random() * 160, va: 0, life: 0.9, col: Math.random() < 0.5 ? '#fff3c4' : '#d9b85f', r: 2 + Math.random() * 3 });
}

/* =====================================================================
   5. BOUCLE DE JEU
   ===================================================================== */
let phase = 'cut', phaseT = 0, slide = 0, shake = 0;
let combo = 0, lastTap = -1e9, blinkT = 3, time = 0, eyeDx = 0, eyeDy = 0, capeA = 1;
const FEVER = 6; // durée du Turbo, en secondes
let fever = 0, hold = null, holdAcc = 0;
const seatT = [];
let seatBars = [], seatPops = [];

function frame(dt) {
  time += dt;
  const now = nowMs();
  if (now - lastTap < 5000) S.playSec += dt; // temps de jeu actif uniquement
  for (let i = 0; i < S.seats; i++) { // les fauteuils de l'équipe tournent tout seuls
    seatT[i] = (seatT[i] || 0) + dt / seatPeriod();
    if (seatT[i] >= 1) { seatT[i] = 0; const pay = seatPay(); earn(pay); seatPop(i, pay); renderStats(); checkTier(); }
    if (seatBars[i]) seatBars[i].style.width = (seatT[i] * 100) + '%';
  }
  if (hold && lvl('hold')) { // clic maintenu
    holdAcc += dt * 2 * lvl('hold');
    while (holdAcc >= 1) { holdAcc--; tapAt(hold.x + rnd(14) - 7, hold.y + rnd(14) - 7); }
  }
  if (fever > 0) { // Turbo : gains x2, billets qui tombent
    fever -= dt;
    if (Math.random() < dt * 9 && parts.length < 170) parts.push({ kind: 'bill', x: rnd(360), y: -12, a: Math.random() * 6, va: (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 60, vy: 40, life: 1.6, ph: Math.random() * 6 });
    if (fever <= 0) combo = 0;
    renderCombo();
  }
  capeA += ((phase === 'cut' ? 1 : 0) - capeA) * (1 - Math.pow(0.0004, dt)); // la cape se pose puis s'enlève
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

  const stk = phase === 'cut' ? stepAt().k : '';
  const onHead = stk === 'shampoo' || stk === 'massage'; // les mains restent dans les cheveux
  for (const h of hands) {
    if (h.t > 0) h.t -= dt;
    const bob = Math.sin(time * 2 + h.side) * 4;
    const rx = onHead ? CX + h.side * (84 + Math.cos(time * 3 + h.side) * 9) : h.rx, ry = onHead ? 200 + Math.sin(time * 3 + h.side) * 12 : h.ry + bob;
    const gx = h.t > 0 ? h.tx : rx, gy = h.t > 0 ? h.ty : ry;
    const f = 1 - Math.pow(0.000001, dt);
    h.x += (gx - h.x) * f; h.y += (gy - h.y) * f;
  }
  const f2 = 1 - Math.pow(0.01, dt);
  eyeDx += (clamp((lastPt.x - CX) / 40, -2.5, 2.5) - eyeDx) * f2;
  eyeDy += (clamp((lastPt.y - 250) / 50, -1.8, 1.8) - eyeDy) * f2;
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life -= dt; p.vy += (GRAV[p.kind] === undefined ? 620 : GRAV[p.kind]) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
    if (p.life <= 0) parts.splice(i, 1);
  }
  draw();
  bar.style.width = Math.min(100, S.work / S.client.need * 100) + '%';
}

function draw() {
  if (simT !== null || !steps.length) return; // simulation d'équilibrage ou client pas encore prêt : pas de rendu
  const c = S.client, pal = HAIRS[c.hair], g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(bg, 0, 0);
  g.setTransform(k, 0, 0, k, ox, oy);
  drawBgLive(g);
  const sx = Math.sin(time * 70) * shake * 5 * k, ease = slide * slide;
  g.setTransform(k, 0, 0, k, ox + ease * cv.width + sx, oy);
  if (layer.width) g.drawImage(layer, 0, 0, V.w, V.h);
  const done = phase !== 'cut', st = stepAt();
  if (capeA > 0.02) { g.globalAlpha = Math.min(1, capeA); drawCape(g, c); g.globalAlpha = 1; }
  drawJewels(g, c);
  if (st.k === 'soin' && !done) drawMask(g, st.q);
  const relax = !done && (st.k === 'massage' || st.k === 'shampoo' || st.k === 'soin');
  drawAcc(g, c, true);
  drawFaceLive(g, c, phase === 'done' ? 'happy' : relax ? 'relax' : 'neutral', blinkT < 0 || relax);
  drawAcc(g, c, false);
  for (const t of tufts) if (!t.gone) drawTuft(g, t, pal);
  if (st.k === 'shampoo' && !done) drawFoam(g, st.q);

  g.setTransform(k, 0, 0, k, ox, oy);
  const tl = handTools(st.k);
  drawHand(g, hands[0], tl[0], st.k === 'shampoo' && !done);
  drawHand(g, hands[1], tl[1], st.k === 'shampoo' && !done);

  if (fever > 0) { // voile doré pendant le Turbo
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = `rgba(255,200,80,${0.09 + 0.05 * Math.sin(time * 12)})`; g.fillRect(0, 0, cv.width, cv.height);
    g.setTransform(k, 0, 0, k, ox, oy);
  }
  for (const q of parts) {
    g.globalAlpha = Math.min(1, q.life * 2.5);
    if (q.kind === 'bill') { // billet vert qui virevolte
      g.save(); g.translate(q.x, q.y); g.rotate(q.a); g.scale(1, Math.cos(time * 9 + q.ph));
      g.fillStyle = '#3fae5a'; rr(g, -13, -7, 26, 14, 2); g.fill();
      g.strokeStyle = '#d7f5dc'; g.lineWidth = 1; rr(g, -10.5, -4.5, 21, 9, 1.5); g.stroke();
      g.fillStyle = '#d7f5dc'; g.beginPath(); g.arc(0, 0, 2.8, 0, 7); g.fill();
      g.restore();
    } else if (q.kind === 'bub') { g.strokeStyle = '#fff'; g.lineWidth = 1.4; g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 7); g.fill(); g.stroke(); }
    else if (q.kind === 'drop') { g.fillStyle = '#8fd0ff'; g.beginPath(); g.ellipse(q.x, q.y, q.r * 0.7, q.r * 1.3, 0, 0, 7); g.fill(); }
    else if (q.kind === 'mist') { g.globalAlpha *= 0.35; g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(q.x, q.y, q.r * (1.8 - q.life), 0, 7); g.fill(); }
    else if (q.kind === 'heart') { g.fillStyle = '#ff8fc0'; const r = q.r; g.beginPath(); g.moveTo(q.x, q.y + r); g.bezierCurveTo(q.x - r * 1.6, q.y - r * 0.2, q.x - r * 0.6, q.y - r * 1.3, q.x, q.y - r * 0.4); g.bezierCurveTo(q.x + r * 0.6, q.y - r * 1.3, q.x + r * 1.6, q.y - r * 0.2, q.x, q.y + r); g.fill(); }
    else if (q.kind === 'tuft') { const t = q.t, sx0 = t.x, sy0 = t.y, sa = t.ang; t.x = q.x; t.y = q.y; t.ang = q.a; drawTuft(g, t, q.pal); t.x = sx0; t.y = sy0; t.ang = sa; }
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
    const t = AC.currentTime, out = AC.destination;
    if (type === 'snip') noise(t, 0.06, 0.11, 'highpass', 3200 + Math.random() * 1500, out);
    else if (type === 'buzz') tone(95 + Math.random() * 10, t, 0.08, 0.05, 'sawtooth', out);
    else if (type === 'bub') tone(380 + Math.random() * 200, t, 0.09, 0.08, 'sine', out, 900);
    else if (type === 'soft') tone([196, 220, 247, 262][rnd(4)], t, 0.22, 0.07, 'sine', out);
    else if (type === 'spray') noise(t, 0.14, 0.07, 'bandpass', 5200, out);
    else if (type === 'step') { tone(659, t, 0.14, 0.07, 'triangle', out); tone(988, t + 0.07, 0.2, 0.07, 'triangle', out); }
    else (type === 'coin' ? [988, 1319] : [523, 659, 784, 1047]).forEach((fq, i) => tone(fq, t + i * 0.08, 0.24, 0.09, 'triangle', out));
  } catch { /* pas de son sur cet appareil */ }
}
function tone(fq, t, dur, vol, type, out, fqEnd) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(fq, t);
  if (fqEnd) o.frequency.exponentialRampToValueAtTime(fqEnd, t + dur);
  o.connect(g); g.connect(out);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.03);
}
function noise(t, dur, vol, ftype, fq, out) {
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.3, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = noiseBuf; f.type = ftype; f.frequency.value = fq;
  src.connect(f); f.connect(g); g.connect(out);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t); src.stop(t + dur + 0.02);
}

/* ---------- Musique d'ambiance : boucle lo-fi générée, aucun fichier ---------- */
const BPM = 84, CHORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]]; // Am7, Fmaj7, Cmaj7, G6
const LEAD = [69, 72, 74, 76, 79, 81];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
let musicOn = false, musicTimer = 0, musicGain = null, padFilter = null, nextT = 0, beat16 = 0;
function musicStart() {
  if (musicOn || !S.music) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    if (!musicGain) {
      musicGain = AC.createGain(); musicGain.connect(AC.destination);
      padFilter = AC.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 1100; padFilter.connect(musicGain);
    }
    musicGain.gain.setTargetAtTime(0.55, AC.currentTime, 0.3);
    musicOn = true; nextT = AC.currentTime + 0.1; beat16 = 0;
    musicTimer = setInterval(musicTick, 90);
  } catch { /* pas de musique sur cet appareil */ }
}
function musicStop() {
  if (!musicOn) return;
  musicOn = false; clearInterval(musicTimer);
  musicGain.gain.setTargetAtTime(0, AC.currentTime, 0.08);
}
function musicTick() {
  const d16 = 60 / BPM / 4;
  if (nextT < AC.currentTime) nextT = AC.currentTime + 0.05; // retour d'onglet : on repart proprement
  while (nextT < AC.currentTime + 0.35) {
    const b = beat16 & 15, ch = CHORDS[(beat16 >> 4) & 3], t = nextT + (b & 1 ? 0.02 : 0);
    if (b === 0) for (const n of ch) { // nappe
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'triangle'; o.frequency.value = mtof(n); o.detune.value = (n % 3 - 1) * 7;
      o.connect(g); g.connect(padFilter);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045, t + 0.35); g.gain.linearRampToValueAtTime(0.0001, t + d16 * 16);
      o.start(t); o.stop(t + d16 * 16 + 0.05);
    }
    if (b === 0 || b === 6 || b === 10) tone(mtof(ch[0] - 24), t, 0.32, 0.2, 'sine', musicGain);       // basse
    if (b === 0 || b === 7 || b === 10) tone(125, t, 0.16, 0.3, 'sine', musicGain, 42);                // grosse caisse
    if (b === 4 || b === 12) noise(t, 0.11, 0.07, 'bandpass', 1900, musicGain);                        // caisse claire
    if (!(b & 1)) noise(t, 0.035, b % 4 === 2 ? 0.035 : 0.02, 'highpass', 7500, musicGain);            // charleston
    if ((b === 2 || b === 5 || b === 9 || b === 14) && Math.random() < 0.4 + 0.06 * (S.tier || 0)) tone(mtof(LEAD[rnd(LEAD.length)]), t, 0.5, 0.05, 'sine', musicGain); // mélodie
    nextT += d16; beat16 = (beat16 + 1) & 63;
  }
}

/* =====================================================================
   7. INTERFACE
   ===================================================================== */
const $ = (id) => document.getElementById(id);
const bar = $('bar'), stage = $('stage'), panel = $('panel');
let tab = 'tools', selCut = -1, selStar = -1, toastTimer = 0, misSig = '', lastMoney = 0;
const tabBtn = {};
document.querySelectorAll('#tabs button').forEach((b) => { tabBtn[b.dataset.tab] = b; });

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
  const now = nowMs();
  combo = now - lastTap < 450 ? Math.min(combo + 1, 40) : Math.max(0, combo - 6);
  lastTap = now;
  const crit = Math.random() < 0.06;
  if (combo >= 40 && fever <= 0) { // rythme au maximum : Turbo
    fever = FEVER; bump('turbo'); sfx('level');
    floatText('TURBO x2 !', 180, 92, 'step'); cash(14, CX, 200);
  }
  const gain = power() * (1 + combo / 40) * (crit ? 5 : 1) * (fever > 0 ? 2 : 1);
  bump('taps'); if (crit) bump('crits');
  $('hint').hidden = true;

  const tx = clamp(vx, 70, 290), ty = clamp(vy, 110, 340);
  lastPt = { x: tx, y: ty };
  const st = phase === 'cut' ? stepAt().k : 'cut', tl = handTools(st);
  const hi = vx < CX ? 0 : 1, h = hands[hi], o = hands[1 - hi];
  h.tx = tx + h.side * REACH[tl[hi]]; h.ty = ty + 12; h.t = 0.22;
  o.tx = clamp(tx - o.side * -40, 90, 270) + o.side * REACH[tl[1 - hi]]; o.ty = ty + 30; o.t = 0.22;
  snipV = 14;

  if (phase === 'cut') {
    if (st === 'shampoo') { for (let i = 0; i < 3; i++) puff('bub', tx + rnd(30) - 15, ty + rnd(20) - 10); sfx('bub'); }
    else if (st === 'massage') { puff('heart', tx + rnd(20) - 10, ty - 10); sfx('soft'); }
    else if (st === 'soin') { spark(tx, ty); sfx('soft'); }
    else if (st === 'finish') { for (let i = 0; i < 4; i++) puff('mist', tx + rnd(40) - 20, ty + rnd(30) - 15); sfx('spray'); }
    else { bits(tx, ty, HAIRS[S.client.hair]); sfx(tl[1] === 'clipper' ? 'buzz' : 'snip'); }
    floatText(crit ? 'Coup de maître !' : '+' + (gain < 10 ? gain.toFixed(1).replace('.', ',') : fmt(gain)), vx + rnd(30) - 15, vy - 22, crit ? 'crit' : '');
    addWork(gain);
  }
  musicStart();
  if (navigator.vibrate) { try { navigator.vibrate(crit ? 18 : 6); } catch { /* rien */ } }
  renderCombo();
}

stage.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (e.target.closest('#offer')) { sellOffer(); return; }
  hold = toV(e); holdAcc = 0;
  tapAt(hold.x, hold.y);
});
// Clic maintenu : tant que le doigt reste posé, l'outil « Clic maintenu » clique tout seul
const toV = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) * dpr - ox) / k, y: ((e.clientY - r.top) * dpr - oy) / k }; };
stage.addEventListener('pointermove', (e) => { if (hold) hold = toV(e); });
for (const ev of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(ev, () => { hold = null; });
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
  const tb = fever > 0;
  $('combo-txt').textContent = tb ? 'TURBO x2' : 'Rythme x' + (1 + combo / 40).toFixed(1).replace('.', ',');
  $('combo-bar').style.width = (tb ? fever / FEVER : combo / 40) * 100 + '%';
  $('combo').classList.toggle('turbo', tb);
  $('combo').classList.toggle('on', (tb || combo >= 5) && !$('toast').classList.contains('on'));
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
  // Défis : on ne reconstruit le panneau que lorsqu'un défi devient encaissable (sinon un clic en cours serait perdu)
  const sig = S.mis.map((m) => misProg(m) >= m.n).join();
  if (sig !== misSig) { misSig = sig; if (tab === 'tools') { renderPanel(); return; } }
  if (tab === 'tools') panel.querySelectorAll('.mis').forEach((el, i) => {
    const m = S.mis[i]; if (!m) return;
    const p = misProg(m), pc = el.querySelector('.pct');
    el.style.setProperty('--p', p / m.n);
    el.querySelector('small').textContent = `${p}/${m.n} · récompense ${fmt(misReward())} €`;
    if (pc) pc.textContent = Math.floor(p / m.n * 100) + ' %';
  });
  $('money').textContent = fmt(S.money);
  if (S.money > lastMoney) { const ch = $('money').parentNode; ch.classList.remove('bump'); void ch.offsetWidth; ch.classList.add('bump'); }
  lastMoney = S.money;
  $('lvl-n').textContent = 'Niv. ' + li.l;
  $('xp').style.width = (li.x / li.need * 100) + '%';
  panel.querySelectorAll('.buy').forEach((b) => {
    const cost = +b.dataset.cost, can = S.money >= cost, it = b.closest('.item');
    b.disabled = !can; it.classList.toggle('can', can);
    if (cost) it.style.setProperty('--p', Math.min(1, S.money / cost)); // jauge : ce qu'il manque pour acheter
  });
  // pastilles sur les onglets : quelque chose vous attend
  tabBtn.tools.classList.toggle('dot', S.mis.some((m) => misProg(m) >= m.n));
  tabBtn.biz.classList.toggle('dot', SEATS[S.seats] !== undefined && S.money >= SEATS[S.seats]);
  tabBtn.menu.classList.toggle('dot', SERVICES.some((s) => !S.svc.includes(s.id) && S.money >= s.cost));
  renderGift();
}

function renderOrder() {
  const c = S.client, svc = svcOf(c.svc);
  const st = stepAt();
  const sd = c.star !== undefined && STARS[c.star];
  $('order-svc').textContent = `${sd ? '★ ' + sd.n : 'Client ' + TIERS[c.tier || 0].n} · ${svc.n}`;
  $('order').classList.toggle('star', !!sd);
  $('order-price').textContent = (sd ? `x${STAR_PAY} · ` : c.vip ? 'x3 · ' : '') + fmtPrice(svc);
  $('order-cut').textContent = `Étape ${st.i + 1}/${steps.length} : ${STEPS[st.k][0]}` + (svc.cut ? ` · ${CUTS[c.cut].n}` : '');
  $('ticks').innerHTML = steps.slice(1).map((s) => `<span style="left:${(s.from * 100).toFixed(1)}%"></span>`).join('');
}

// Bandeau des fauteuils de l'équipe, en bas de la scène
function renderSeats() {
  let h = '';
  for (let i = 0; i < S.seats; i++) h += `<div class="seat"><span>Fauteuil ${i + 2}</span><i><b></b></i><em></em></div>`;
  $('seats').innerHTML = h;
  if (S.seats) $('hint').hidden = true;
  seatBars = [...$('seats').querySelectorAll('b')];
  seatPops = [...$('seats').querySelectorAll('em')];
}
function seatPop(i, pay) {
  const el = seatPops[i];
  if (!el) return;
  el.textContent = `+${fmt(pay)} €`;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
}

function portrait(canvas, cutIdx, si) {
  const kk = 2, g = canvas.getContext('2d'), s = STARS[si];
  canvas.width = 170 * kk; canvas.height = 200 * kk;
  g.setTransform(kk, 0, 0, kk, -95 * kk, -112 * kk);
  const c = s
    ? { star: si, cut: (si * 7 + 4) % CUTS.length, skin: s.skin !== undefined ? s.skin : si % N_SKIN, hair: s.hair !== undefined ? s.hair : si % N_HAIR, eye: si % EYES.length, seed: si + 50, b1: 0, tier: s.at, look: s.look, col: s.col, jw: s.jw || 0, grillz: !!s.grillz, fit: si % 4 }
    : { cut: cutIdx, skin: cutIdx % N_SKIN, hair: cutIdx % N_HAIR, eye: cutIdx % EYES.length, seed: cutIdx + 5, b1: 0, cape: true };
  drawCharacter(g, c, kk, false);
  g.setTransform(kk, 0, 0, kk, -95 * kk, -112 * kk);
  const ex = eyeDx, ey = eyeDy; eyeDx = 0; eyeDy = 0;
  if (s) { drawJewels(g, c); drawAcc(g, c, true); }
  drawFaceLive(g, c, s ? 'happy' : 'neutral', false);
  if (s) drawAcc(g, c, false);
  eyeDx = ex; eyeDy = ey;
}

function renderPanel() {
  let h = '';
  if (tab === 'tools') {
    h += '<h2>Défis</h2>' + S.mis.map((m, i) => {
      const p = misProg(m), ok = p >= m.n;
      return `<div class="item mis ${ok ? 'can' : ''}" style="--p:${p / m.n}"><div class="grow"><strong>${MISSIONS[m.m].t(m.n)}</strong><small>${p}/${m.n} · récompense ${fmt(misReward())} €</small></div>` +
        (ok ? `<button class="buy" data-mis="${i}" data-cost="0">Encaisser</button>` : `<span class="pct">${Math.floor(p / m.n * 100)} %</span>`) + '</div>';
    }).join('') + '<h2>Améliorations</h2>';
    h += `<p class="muted">Puissance : ${power()} par clic · Auto : ${autoRate()}/s · Tarifs : x${mult().toFixed(2).replace('.', ',')}</p>`;
    for (const t of TOOLS) {
      const max = t.max && lvl(t.id) >= t.max, cost = toolCost(t);
      h += `<div class="item"><div class="grow"><strong>${t.n}</strong><small>${t.d} · niveau ${lvl(t.id)}</small></div>` +
        (max ? '<span class="tag">MAX</span>' : `<button class="buy" data-tool="${t.id}" data-cost="${cost}">${fmt(cost)} €</button>`) + '</div>';
    }
  } else if (tab === 'biz') {
    const tn = tierNow(), nx = TIERS[tn + 1];
    h += `<h2>Univers : ${TIERS[tn].n}</h2><p>${TIERS[tn].d}</p>`;
    if (nx) h += `<p class="muted">Prochain univers : <b>${nx.n}</b> à ${fmt(nx.at)} € de gains cumulés (vous : ${fmt(S.total)} €).</p>` +
      `<div class="bar big"><i style="width:${Math.min(100, (S.total - TIERS[tn].at) / (nx.at - TIERS[tn].at) * 100)}%"></i></div>`;
    h += '<div class="tiers">' + TIERS.map((t, i) => `<span class="${i <= tn ? 'on' : ''}">${i <= tn ? t.n : '?'}<small>x${String(t.m).replace('.', ',')}</small></span>`).join('') + '</div>';
    h += `<h2>Fauteuils ${S.seats + 1}/${SEATS.length + 1}</h2>` +
      '<div class="item owned"><div class="grow"><strong>Fauteuil 1</strong><small>Le vôtre : c\'est ici que vous cliquez.</small></div><span class="tag">Vous</span></div>';
    for (let i = 0; i < S.seats; i++) h += `<div class="item owned"><div class="grow"><strong>Fauteuil ${i + 2}</strong><small>Un coiffeur de l'équipe : +${fmt(seatPay())} € toutes les ${seatPeriod().toFixed(1).replace('.', ',')} s</small></div><span class="tag">Ouvert</span></div>`;
    if (S.seats < SEATS.length) h += `<div class="item"><div class="grow"><strong>Ouvrir le fauteuil ${S.seats + 2}</strong><small>Un coiffeur de plus : il encaisse tout seul, sans clic.</small></div><button class="buy" data-seat="1" data-cost="${SEATS[S.seats]}">${fmt(SEATS[S.seats])} €</button></div>`;
    h += `<h2>Ventes de produits</h2><p class="muted">${S.salesN} vente${S.salesN > 1 ? 's' : ''} · ${fmt(S.salesSum)} € · ${Math.round(offerChance() * 100)} % de chances par client. Quand un client hésite, touchez la bulle avant qu'elle disparaisse.</p>`;
    h += S.sales.length
      ? '<table>' + S.sales.map((s) => `<tr><td>${new Date(s.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${s.n}<small class="who">client n° ${s.c}</small></td><td>+${s.p} €</td></tr>`).join('') + '</table>'
      : '<p class="muted">Aucune vente pour l\'instant.</p>';
    h += '<p class="muted">Produits, prix des produits et univers sont propres au jeu.</p>';
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
    const sinfo = selStar >= 0
      ? `<strong>${STARS[selStar].n}</strong><br>${STARS[selStar].d}`
      : `Des clients pas comme les autres poussent parfois la porte. Ils paient x${STAR_PAY} et rejoignent votre album.`;
    h += `<h2>Personnalités ${S.stars.length}/${STARS.length}</h2><div class="cut-info">${sinfo}</div><div class="grid">`;
    STARS.forEach((s, i) => {
      h += S.stars.includes(i)
        ? `<button class="tile star ${i === selStar ? 'sel' : ''}" data-star="${i}"><canvas></canvas><span>${s.n}</span></button>`
        : `<div class="tile locked"><div class="q">★</div><span>Univers ${TIERS[s.at].n}</span></div>`;
    });
    h += '</div><p class="muted">Personnages inventés pour le jeu : toute ressemblance serait fortuite.</p>';
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
  misSig = S.mis.map((m) => misProg(m) >= m.n).join();
  if (tab === 'cuts') {
    panel.querySelectorAll('.tile[data-cut]').forEach((b) => portrait(b.querySelector('canvas'), +b.dataset.cut));
    panel.querySelectorAll('.tile[data-star]').forEach((b) => portrait(b.querySelector('canvas'), 0, +b.dataset.star));
  }
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
  } else if (b.dataset.seat) {
    const cost = SEATS[S.seats];
    if (cost === undefined || S.money < cost) return;
    S.money -= cost; S.seats++; sfx('level'); renderSeats();
    toast(`<b>Fauteuil ${S.seats + 1} ouvert !</b><br>Un coiffeur de plus travaille pour le salon.`);
  } else if (b.dataset.mis) {
    const i = +b.dataset.mis, m = S.mis[i];
    if (!m || misProg(m) < m.n) return;
    const r = misReward();
    earn(r); S.mis.splice(i, 1); S.mis.push(newMission());
    sfx('level'); cash(16, CX, 240);
    toast(`<b>Défi réussi !</b><br>+${fmt(r)} € · un nouveau défi vous attend.`);
    checkTier();
  } else if (b.dataset.star) {
    selStar = +b.dataset.star;
  } else if (b.dataset.cut) {
    selCut = +b.dataset.cut;
  } else if (b.id === 'verify') {
    const code = prompt('Code présenté par le client :');
    if (code) modal(codeValid(code) ? '<h3>Code valide</h3><p>Ce code a bien été généré par le jeu.</p>' : '<h3>Code invalide</h3><p>Ce code ne correspond à aucun code du jeu.</p>');
    return;
  } else if (b.id === 'reset') {
    if (!confirm('Effacer la partie et recommencer ? Le code de réduction sera perdu.')) return;
    const snd = S.sound, mus = S.music; S = fresh(); S.sound = snd; S.music = mus; while (S.mis.length < 3) S.mis.push(newMission()); newClient(); phase = 'cut'; selCut = -1; selStar = -1; buildBg(); renderSeats();
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

// Bouton son : musique + effets → effets seuls → muet
function renderSnd() {
  const b = $('snd');
  b.textContent = S.sound && S.music ? '♫' : '♪';
  b.classList.toggle('off', !S.sound);
  b.title = S.sound ? (S.music ? 'Musique et effets' : 'Effets seuls') : 'Muet';
}
$('snd').addEventListener('click', () => {
  if (S.sound && S.music) S.music = false;
  else if (S.sound) S.sound = false;
  else { S.sound = true; S.music = true; }
  if (S.music) musicStart(); else musicStop();
  renderSnd(); save(); if (S.sound) sfx('coin');
});
if (!S.sound) S.music = false;
renderSnd();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); if (AC) AC.suspend(); } else if (AC && (S.sound || S.music)) AC.resume();
  last = performance.now();
});
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
setInterval(() => { save(); renderGift(); checkReward(); }, 5000);

/* ---------- Démarrage ---------- */
S.tier = Math.max(S.tier || 0, tierNow());
if (S.served) $('hint').hidden = true;
S.stars = S.stars || []; S.stat = S.stat || {}; S.mis = (S.mis || []).filter((m) => MISSIONS[m.m]);
while (S.mis.length < 3) S.mis.push(newMission());
lastMoney = S.money;
resize();
renderSeats();
if (!S.client || !svcOf(S.client.svc) || !CUTS[S.client.cut]) newClient(); else setupClient();
renderPanel();
renderCombo();
requestAnimationFrame(loop);
