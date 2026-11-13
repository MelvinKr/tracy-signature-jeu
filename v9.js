/* Signature Cut by Tracy – le jeu · V9 (chargé après app.js et plus.js, dont il partage les variables).
   Icônes dessinées, mesure d'audience anonyme, parrainage, code du salon et carte de fidélité, carte avant/après,
   mode Chrono, mode enfant, tenue du coiffeur, reprise sur un autre appareil. Serveur : netlify/functions/game.mjs. */
'use strict';

/* =====================================================================
   1. ICÔNES MAISON (SVG, trait doré) : remplacent les émojis des tuiles, des étapes et des onglets
   ===================================================================== */
const GI = {
  scissors: '<circle cx="6" cy="6.5" r="2.6"/><circle cx="6" cy="17.5" r="2.6"/><path d="M8.2 8.1l12.3 8.9M8.2 15.9l12.3-8.9"/>',
  cap: '<path class="a" d="M2 9l10-4 10 4-10 4z"/><path d="M2 9l10-4 10 4-10 4zM6 11v4.5c2 2 10 2 12 0V11M22 9v5"/>',
  bottle: '<path class="a" d="M8 10h8v10a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 20z"/><path d="M8 10h8v10a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 20zM10 10V6h4v4M9 3.5h6M12 3.5V6M10.5 15h3"/>',
  clipper: '<rect class="a" x="8" y="7" width="8" height="14" rx="3"/><rect x="8" y="7" width="8" height="14" rx="3"/><path d="M8 3v4M10 3v4M12 3v4M14 3v4M16 3v4M12 12v3"/>',
  horn: '<path class="a" d="M4 10v4h3l8 4V6l-8 4z"/><path d="M4 10v4h3l8 4V6l-8 4zM18 9.5c1.3 1.3 1.3 3.7 0 5M7 14l1 5h2.5"/>',
  tap: '<path class="a" d="M9 11V5.5a1.7 1.7 0 013.4 0V11l4.6 1.2c1 .3 1.6 1.2 1.4 2.2l-.8 4.3a2.5 2.5 0 01-2.5 2h-3.6a3 3 0 01-2.4-1.2l-3.6-5c-.6-.9.5-2 1.4-1.4L9 14.6z"/><path d="M9 11V5.5a1.7 1.7 0 013.4 0V11l4.6 1.2c1 .3 1.6 1.2 1.4 2.2l-.8 4.3a2.5 2.5 0 01-2.5 2h-3.6a3 3 0 01-2.4-1.2l-3.6-5c-.6-.9.5-2 1.4-1.4L9 14.6zM6.6 5a4.4 4.4 0 018.2 0"/>',
  bag: '<path class="a" d="M5 8h14l-1 13H6z"/><path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2"/>',
  book: '<path class="a" d="M12 6.5c-2.5-1.6-5-2-8-1v13c3-1 5.5-.6 8 1z"/><path d="M12 6.5c-2.5-1.6-5-2-8-1v13c3-1 5.5-.6 8 1 2.5-1.6 5-2 8-1v-13c-3-1-5.500-.6-8 1zM12 6.5v13"/>',
  wheel: '<circle class="a" cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="8"/><circle class="f" cx="12" cy="13" r="1.600"/><path d="M12 5v16M4 13h16M6.300 7.300l11.400 11.400M17.700 7.300L6.300 18.700"/><path class="f" d="M10 1.500h4l-2 3.500z"/>',
  gift: '<rect class="a" x="4" y="10" width="16" height="10.500" rx="1.500"/><path d="M4 10h16v10.500H4zM3 7h18v3H3zM12 7v13.500M12 7c-1.500-3.500-5.500-3.500-5 0M12 7c1.500-3.500 5.500-3.500 5 0"/>',
  head: '<circle class="a" cx="12" cy="10" r="5"/><circle cx="12" cy="10" r="5"/><path d="M7.200 8.500c1.500-3.500 8-3.500 9.600 0M4 21c1-4 4.500-5.500 8-5.500s7 1.500 8 5.500"/>',
  star: '<path class="a" d="M12 3l2.700 5.600 6.100.8-4.500 4.300 1.100 6.100L12 16.900l-5.400 2.900 1.100-6.100L3.200 9.400l6.100-.8z"/><path d="M12 3l2.700 5.600 6.100.8-4.500 4.300 1.100 6.100L12 16.900l-5.400 2.900 1.100-6.100L3.200 9.400l6.100-.8z"/>',
  bolt: '<path class="a" d="M13 2L5 13.500h5.500L9.500 22 18 10h-5.500z"/><path d="M13 2L5 13.500h5.500L9.500 22 18 10h-5.500z"/>',
  crown: '<path class="a" d="M4 18L2.500 9l5 4L12 6l4.500 7 5-4L20 18z"/><path d="M4 18L2.500 9l5 4L12 6l4.500 7 5-4L20 18zM4 21h16"/>',
  chair: '<path class="a" d="M7 4h10v8H7z"/><path d="M7 4h10v8H7zM5 12h14v3H5zM12 15v4M8 21h8M4 9v3M20 9v3"/>',
  city: '<path class="a" d="M4 21V8h6v13M10 21V4h6v17M16 21V11h4v10"/><path d="M4 21V8h6v13M10 21V4h6v17M16 21V11h4v10M2.500 21h19M6.500 11.500h1M6.500 15h1M12.500 7.500h1M12.500 11h1M12.500 14.500h1"/>',
  palette: '<path class="a" d="M12 3a9 9 0 100 18c1.500 0 2-1 1.500-2.200-.6-1.500.4-2.800 2-2.800H18a3 3 0 003-3c0-5.500-4-10-9-10z"/><path d="M12 3a9 9 0 100 18c1.500 0 2-1 1.500-2.200-.6-1.500.4-2.800 2-2.800H18a3 3 0 003-3c0-5.500-4-10-9-10z"/><circle class="f" cx="7.500" cy="11" r="1.200"/><circle class="f" cx="10.500" cy="7" r="1.200"/><circle class="f" cx="15" cy="7.500" r="1.200"/>',
  plant: '<path class="a" d="M8 15h8l-1 6H9z"/><path d="M8 15h8l-1 6H9zM12 15V9M12 11c-4 0-5-3-5-5 3 0 5 2 5 5zM12 9c0-3 2-5 5-5 0 3-2 5-5 5z"/>',
  frame: '<rect x="4" y="4" width="16" height="16" rx="1.500"/><rect class="a" x="7" y="7" width="10" height="10"/><circle cx="12" cy="11" r="1.800"/><path d="M8.500 17c.5-2.500 6.500-2.500 7 0"/>',
  carpet: '<rect class="a" x="5" y="6" width="14" height="12"/><path d="M5 6h14v12H5zM7 3.500V6M10.300 3.500V6M13.700 3.500V6M17 3.500V6M7 18v2.500M10.300 18v2.500M13.700 18v2.500M17 18v2.500M12 9l3 3-3 3-3-3z"/>',
  bulb: '<path class="a" d="M8.500 14a5.500 5.500 0 117 0c-.7.7-1 1.500-1 2.500h-5c0-1-.3-1.800-1-2.500z"/><path d="M8.500 14a5.500 5.500 0 117 0c-.7.7-1 1.500-1 2.500h-5c0-1-.3-1.800-1-2.500zM10 19.500h4M10.500 22h3"/>',
  checker: '<rect x="4" y="4" width="16" height="16" rx="1.500"/><path class="a" d="M4 4h8v8H4zM12 12h8v8h-8z"/>',
  cup: '<path class="a" d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 4h10v5a5 5 0 01-10 0zM7 6H4c0 3 1.500 4.500 3.500 4.500M17 6h3c0 3-1.500 4.500-3.500 4.500M12 14v4M8.500 20.500h7"/>',
  beard: '<path class="a" d="M6.500 9v3c0 4.500 2.500 8.500 5.500 8.500s5.500-4 5.500-8.500V9c-1 2-2.500 3-5.500 3s-4.500-1-5.500-3z"/><path d="M6.500 9a5.500 5.500 0 0111 0v3c0 4.500-2.500 8.500-5.500 8.500S6.500 16.500 6.500 12zM6.500 9c1 2 2.500 3 5.500 3s4.500-1 5.500-3M10.500 15.500h3"/>',
  kid: '<circle class="a" cx="12" cy="12" r="5.500"/><circle cx="12" cy="12" r="5.500"/><path d="M12 6.500V4c1.500 0 2.500.5 3 1.500M9.800 13.500c1.300 1.500 3.100 1.500 4.400 0"/><circle class="f" cx="10" cy="11" r=".8"/><circle class="f" cx="14" cy="11" r=".8"/>',
  helmet: '<path class="a" d="M4 14a8 8 0 0116 0v2H4z"/><path d="M4 14a8 8 0 0116 0v2H4zM2.500 16h19M9 16v2.500h6V16"/>',
  teen: '<circle class="a" cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="5"/><path d="M5.500 12a6.500 6.500 0 0113 0M4.500 11.500h2v4h-2zM17.500 11.500h2v4h-2zM10 14.500c1.200 1 2.800 1 4 0"/>',
  flag: '<path class="a" d="M6 4.500h13l-2.500 4 2.500 4H6z"/><path d="M6 21V4M6 4.500h13l-2.500 4 2.500 4H6"/>',
  duo: '<circle class="a" cx="9" cy="8" r="4"/><circle cx="9" cy="8" r="4"/><circle cx="17.500" cy="12.500" r="2.800"/><path d="M2.500 20c.5-3.500 3-5 6.500-5 2 0 3.500.5 4.500 1.500M13.500 20.500c.3-2 1.800-3.200 4-3.200s3.700 1.200 4 3.200"/>',
  massage: '<circle class="a" cx="12" cy="11" r="5"/><circle cx="12" cy="11" r="5"/><path d="M4.500 8c1-1 1-2.500 0-3.500M19.500 8c-1-1-1-2.500 0-3.500M2 12c1-.8 1-2 0-2.800M22 12c-1-.8-1-2 0-2.800M9.500 12.500c1.500 1.500 3.500 1.500 5 0M5 21c1-3 4-4.500 7-4.500s6 1.500 7 4.500"/>',
  mask: '<path class="a" d="M6 9a6 6 0 0112 0v4a6 6 0 01-12 0z"/><path d="M6 9a6 6 0 0112 0v4a6 6 0 01-12 0zM10.500 15.500h3"/><circle cx="9.700" cy="10.500" r="1.300"/><circle cx="14.300" cy="10.500" r="1.300"/>',
  pole: '<rect class="a" x="9" y="5" width="6" height="14" rx="1"/><rect x="9" y="5" width="6" height="14" rx="1"/><path d="M9 9.500l6-3M9 13.500l6-3M9 17.500l6-3M7.500 5h9M7.500 19h9M12 2.500V5M12 19v2.500"/>',
  bubbles: '<circle class="a" cx="9" cy="14" r="5"/><circle cx="9" cy="14" r="5"/><circle cx="17" cy="8" r="3"/><circle cx="18" cy="17" r="1.800"/><path d="M7 12c.5-1 1.500-1.500 2.500-1.500"/>',
  lock: '<rect class="a" x="6" y="11" width="12" height="9" rx="2"/><path d="M6 11h12v9H6zM8.500 11V8a3.500 3.500 0 017 0v3"/>',
  house: '<path class="a" d="M4 11l8-7 8 7v9H4z"/><path d="M4 11l8-7 8 7v9H4zM10 20v-5h4v5"/>',
  list: '<rect class="a" x="5" y="4" width="14" height="17" rx="2"/><path d="M5 4h14v17H5zM9 2.500h6v3H9zM8.500 10h7M8.500 13.500h7M8.500 17h4"/>',
  album: '<rect class="a" x="4" y="4" width="16" height="16" rx="2"/><path d="M4 4h16v16H4zM8 4v16"/><circle cx="14" cy="10.500" r="2.200"/><path d="M10.500 17c.5-2.500 6.500-2.500 7 0"/>',
  pin: '<path class="a" d="M12 21.500c-4-5-6.500-8-6.500-11.500a6.500 6.500 0 0113 0c0 3.500-2.500 6.500-6.500 11.500z"/><path d="M12 21.500c-4-5-6.500-8-6.500-11.500a6.500 6.500 0 0113 0c0 3.500-2.500 6.500-6.500 11.500z"/><circle cx="12" cy="10" r="2.300"/>',
  timer: '<circle class="a" cx="12" cy="13.500" r="7.500"/><circle cx="12" cy="13.500" r="7.500"/><path d="M12 13.500V9M12 13.500l3 2M9.500 2.500h5M12 2.500V6M18.500 6.500l1.500-1.500"/>',
  hair1: '<circle class="a" cx="12" cy="11" r="5"/><circle cx="12" cy="11" r="5"/><path class="f" d="M7 10c0-4.500 10-4.500 10 0-2-1.500-4-2-5-2s-3 .5-5 2z"/><path d="M5 21c1-3 4-4.500 7-4.500s6 1.500 7 4.500"/>',
  hair2: '<circle class="a" cx="12" cy="10.500" r="4.800"/><circle cx="12" cy="10.500" r="4.800"/><path class="f" d="M6.500 16V10a5.500 5.500 0 0111 0v6h-1.800v-6c-2 0-5-1-5.700-2.500-.5 1.500-1 2-1.700 2.500v6z"/><path d="M5 21.500c1-2.500 4-4 7-4s6 1.500 7 4"/>',
  hair3: '<circle class="a" cx="12" cy="10" r="5"/><circle cx="12" cy="10" r="5"/><path class="f" d="M7.500 11c.5 5 2.500 7 4.500 7s4-2 4.500-7c-1 1.500-2.500 2-4.500 2s-3.500-.5-4.500-2zM7 8.500c1-3.500 9-3.500 10 0-3-1-7-1-10 0z"/><path d="M4.500 21.500c.8-2 2.500-3.200 4.500-3.800M19.500 21.500c-.8-2-2.500-3.200-4.500-3.800"/>',
  hair4: '<circle class="a" cx="12" cy="12" r="4.800"/><circle cx="12" cy="12" r="4.800"/><circle class="f" cx="12" cy="4.800" r="2.300"/><path class="f" d="M7.200 11c0-4.500 9.600-4.500 9.600 0-1.500-1-3-1.500-4.800-1.500S8.700 10 7.200 11z"/><path d="M5 21.500c1-2.500 4-4 7-4s6 1.500 7 4"/>',
};
const gi = (n) => `<svg class="gi" viewBox="0 0 24 24" aria-hidden="true">${GI[n].replace(/(\d)\.(\d)00/g, '$1.$2')}</svg>`;
Object.assign(TOOL_IC, { ciseaux: gi('scissors'), apprenti: gi('cap'), lotion: gi('bottle'), tondeuse: gi('clipper'), bouche: gi('horn'), hold: gi('tap'), presentoir: gi('bag'), formation: gi('book') });
Object.assign(SVC_IC, { simple: gi('scissors'), express: gi('bolt'), enfant: gi('kid'), militaire: gi('helmet'), ado: gi('teen'), americaine: gi('flag'), barbe: gi('beard'), pere: gi('duo'), massage: gi('massage'), visage: gi('mask'), coupebarbe: gi('pole'), complete: gi('crown') });
Object.assign(MIS_IC, { served: gi('head'), taps: gi('tap'), crits: gi('star'), sales: gi('bag'), turbo: gi('bolt'), stars: gi('crown') });
Object.assign(DECO_IC, { plant: gi('plant'), frames: gi('frame'), carpet: gi('carpet'), vip: gi('bulb'), checker: gi('checker'), cup: gi('cup') });
Object.assign(STEP_IC, { shampoo: gi('bubbles'), cut: gi('scissors'), beard: gi('beard'), massage: gi('massage'), soin: gi('mask'), finish: gi('pole'), color: gi('palette') });
['hair1', 'hair2', 'hair3', 'hair4'].forEach((n, i) => { STAFF_IC[i] = gi(n); });
const TAB_IC = { tools: 'scissors', biz: 'house', menu: 'list', cuts: 'album', salon: 'pin' };
document.querySelectorAll('#tabs button').forEach((b) => { const s = b.querySelector('span'); if (s && TAB_IC[b.dataset.tab]) s.innerHTML = gi(TAB_IC[b.dataset.tab]); });
const EMO = [['🎡', 'wheel'], ['🎁', 'gift'], ['🏙️', 'city'], ['💺', 'chair'], ['🎨', 'palette'], ['🔒', 'lock']]; // émojis restants des tuiles

/* =====================================================================
   2. MESURE D'AUDIENCE ANONYME (compteurs par jour, aucun identifiant envoyé)
   ===================================================================== */
const GAPI = (p) => '/api/' + p;
function track(e) {
  if (simT !== null || location.protocol !== 'https:') return;
  try { fetch(GAPI('event'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ e }), keepalive: true }).catch(() => { /* rien */ }); } catch { /* rien */ }
}
if (S.vday !== today()) { S.vday = today(); track('visit'); }
if (!S.vnew) { S.vnew = 1; track('new'); }
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]'); if (!a) return;
  const h = a.getAttribute('href');
  if (h.includes('planity')) track('rdv'); else if (h.startsWith('tel:')) track('tel'); else if (h.includes('google.com/maps')) track('map');
});
const post = async (p, body) => { try { const r = await fetch(GAPI(p), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, ...(await r.json()) }; } catch { return { status: 0 }; } };

/* =====================================================================
   3. PARRAINAGE
   ===================================================================== */
const ALPHA9 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function refCode(id) { // même calcul que sur le serveur
  let h = 2166136261;
  for (const ch of 'parrain-' + id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let s = '';
  for (let i = 0; i < 6; i++) { s += ALPHA9[(h >>> (i * 5)) & 31]; if (i === 2) h = Math.imul(h ^ (h >>> 13), 16777619); }
  return s;
}
if (!S.pid) S.pid = (crypto.randomUUID ? crypto.randomUUID() : 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
const myRef = () => refCode(S.pid);
const refLink = () => `${location.origin}/?r=${myRef()}`;
const QS = new URLSearchParams(location.search);
{ const r = (QS.get('r') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); if (r.length === 6 && !S.served && !S.refIn && r !== myRef()) S.refIn = r; }
async function refTick() {
  if (simT !== null || chrono) return;
  if (S.refIn && !S.refDone && S.served >= 5) { // le filleul valide son parrain après 5 clients
    const r = await post('ref', { id: S.pid, code: S.refIn });
    if (r.ok) { S.refDone = 1; const g = unit() * 20; earn(g); cash(24, CX, 240); sfx('level'); track('ref'); toast(`<b>Bienvenue de la part de votre parrain !</b><br>+${fmt(g)} ${COIN}`); renderStats(); save(); }
    else if (r.status === 400) S.refDone = 1;
  }
  try { // le parrain touche sa prime à chaque nouveau filleul
    const r = await fetch(GAPI('ref') + '?code=' + myRef()); if (!r.ok) return;
    const n = (await r.json()).n || 0, had = S.refN || 0;
    if (n > had) { const g = unit() * 25 * (n - had); S.refN = n; earn(g); cash(30, CX, 240); sfx('level'); toast(`<b>${n - had} nouveau${n - had > 1 ? 'x' : ''} filleul${n - had > 1 ? 's' : ''} !</b><br>Prime de parrainage : +${fmt(g)} ${COIN}`); renderStats(); checkTier(); save(); if (tab === 'salon') renderPanel(); }
  } catch { /* hors ligne */ }
}
TROPHIES.splice(4, 0, { id: 'rf1', n: 'Parrain', d: 'Faire venir un ami dans le jeu', ok: () => (S.refN || 0) >= 1 }, { id: 'ch1', n: 'Sprinteur', d: 'Terminer un Chrono', ok: () => (S.chronoN || 0) >= 1 });
TROPHIES.push({ id: 'rf5', n: 'Ambassadeur du salon', d: 'Parrainer 5 amis', ok: () => (S.refN || 0) >= 5 }, { id: 'fid', n: 'Client fidèle', d: 'Remplir sa carte de fidélité', ok: () => (S.stamps || 0) >= LOYAL });
async function shareText(text, url) {
  track('share');
  try {
    if (navigator.share) await navigator.share({ title: SALON.name, text, url });
    else { await navigator.clipboard.writeText(text + ' ' + url); toast('<b>Copié !</b><br>Collez le message où vous voulez.'); }
  } catch { /* partage annulé */ }
}

/* =====================================================================
   4. CODE DU SALON ET CARTE DE FIDÉLITÉ
   ===================================================================== */
const LOYAL = 5; // tampons pour remplir la carte. La récompense réelle est À DÉFINIR avec Tracy.
const stampCard = () => '<div class="stamps">' + Array.from({ length: LOYAL }, (_, i) => `<span class="${i < (S.stamps || 0) % LOYAL || ((S.stamps || 0) >= LOYAL && (S.stamps || 0) % LOYAL === 0) ? 'on' : ''}">${gi('scissors')}</span>`).join('') + '</div>';
async function sendCode() {
  const el = $('code-in'), v = (el.value || '').trim();
  if (v.length < 3) { el.focus(); return; }
  const r = await post('code', { id: S.pid, code: v });
  if (r.type === 'word') {
    S.words = S.words || [];
    if (S.words.includes(r.wid)) { modal('<h3>Déjà utilisé</h3><p>Ce mot a déjà été validé sur cet appareil. Un nouveau mot est affiché au salon chaque semaine.</p>'); return; }
    S.words.push(r.wid); const g = unit() * 30; earn(g); starNext = true; cash(36, CX, 230); sfx('level'); save(); renderStats(); checkTier();
    modal(`<h3>Mot du salon validé !</h3><p>Merci d'être passé chez Tracy : <b>+${fmt(g)} ${COIN}</b>.</p><p>Une personnalité pousse la porte, et « L'Ami du salon » peut désormais venir se faire coiffer.</p>`);
  } else if (r.type === 'stamp') {
    S.stamps = (S.stamps || 0) + 1; const g = unit() * 40; earn(g); cash(36, CX, 230); sfx('level'); save(); renderStats(); checkTier();
    const full = S.stamps % LOYAL === 0;
    modal(`<h3>${full ? 'Carte complète !' : 'Tampon ajouté'}</h3>${stampCard()}<p>+${fmt(g)} ${COIN} dans le jeu.</p>` + (full ? '<p><b>Montrez cet écran à Tracy</b> pour votre récompense de fidélité.</p>' : `<p class="muted">Encore ${LOYAL - S.stamps % LOYAL} tampon${LOYAL - S.stamps % LOYAL > 1 ? 's' : ''} pour remplir la carte.</p>`));
  } else modal(r.status === 409 ? '<h3>Code déjà utilisé</h3><p>Ce tampon a déjà servi. Chaque code ne marche qu\'une fois.</p>' : r.status === 404 ? '<h3>Code inconnu</h3><p>Vérifiez le mot affiché au salon ou le code donné par Tracy.</p>' : '<h3>Pas de connexion</h3><p>Réessayez dans un instant.</p>');
  if (tab === 'salon') renderPanel();
}

/* =====================================================================
   5. CARTE « AVANT / APRÈS » (à chaque nouvelle coupe découverte), partageable en image
   ===================================================================== */
const cardCv = document.createElement('canvas');
function drawCard(c, nat, svc) {
  const W = 640, H = 470, g = cardCv.getContext('2d'), s = 1.62, ex = eyeDx, ey = eyeDy;
  cardCv.width = W; cardCv.height = H; eyeDx = 0; eyeDy = 0;
  let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a2520'); gr.addColorStop(1, '#141210');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#d9b85f'; g.lineWidth = 3; g.strokeRect(8, 8, W - 16, H - 16);
  [[26, 'AVANT', nat, false], [334, 'APRÈS', c.hair, true]].forEach(([px, label, hair, after]) => {
    const py = 66, pw = 280, ph = 300;
    g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
    gr = g.createRadialGradient(px + pw / 2, py + ph * 0.45, 20, px + pw / 2, py + ph * 0.45, 230); gr.addColorStop(0, after ? '#8a7440' : '#6a6258'); gr.addColorStop(1, '#2c2924');
    g.fillStyle = gr; g.fillRect(px, py, pw, ph);
    const T = () => g.setTransform(s, 0, 0, s, px + pw / 2 - CX * s, py + ph / 2 - 252 * s);
    const cc = { ...c, hair };
    T(); drawCharacter(g, cc, s, false); T();
    drawFaceLive(g, cc, after ? 'happy' : 'neutral', false);
    if (!after) for (const t of tufts) drawTuft(g, t, HAIRS[nat]);
    g.restore(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.strokeStyle = '#d9b85f'; g.lineWidth = 2; g.strokeRect(px, py, pw, ph);
    g.fillStyle = after ? '#d9b85f' : '#3a352f'; g.fillRect(px, py, 92, 28);
    g.fillStyle = after ? '#1c1a17' : '#f4ecdc'; g.font = '700 16px Outfit, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, px + 46, py + 15);
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#f3dc98'; g.font = '700 30px Outfit, system-ui, sans-serif'; g.fillText(CUTS[c.cut].n, W / 2, 38);
  g.fillStyle = '#f4ecdc'; g.font = '600 19px Outfit, system-ui, sans-serif'; g.fillText(`${svc.n} · ${svc.price} € chez ${SALON.name}`, W / 2, 398);
  g.fillStyle = '#a89d8b'; g.font = '500 16px Outfit, system-ui, sans-serif'; g.fillText(`${SALON.address} · ${SALON.phone}`, W / 2, 428);
  eyeDx = ex; eyeDy = ey;
}
function showCard(name) {
  later(() => {
    modal(`<h3>Nouvelle coupe : ${name}</h3><canvas id="ba" class="bacard"></canvas>${RDV_BTN().replace('rdvbtn', 'rdvbtn big')}<button type="button" class="link" id="ba-share">Partager cette image</button>`, null, 'Continuer à jouer');
    const cv2 = $('ba'); cv2.width = cardCv.width; cv2.height = cardCv.height; cv2.getContext('2d').drawImage(cardCv, 0, 0);
    $('ba-share').addEventListener('click', () => cv2.toBlob(async (blob) => {
      if (!blob) return; track('share');
      const file = new File([blob], 'signature-cut.png', { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: SALON.name, text: `${name} chez ${SALON.name}` });
        else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'signature-cut.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
      } catch { /* annulé */ }
    }));
  });
}

/* =====================================================================
   6. MODE CHRONO : 60 secondes, tout le monde part de zéro, classement à part
   ===================================================================== */
let chrono = null, restoring = false;
const CH_SEASON = SEASON + '-chrono', CH_TIME = 60;
const chEl = document.createElement('div');
chEl.id = 'chrono'; chEl.hidden = true; stage.appendChild(chEl);
X.noSave = () => !!chrono || restoring;
X.noModal = () => !!chrono;
function setTab(t) { tab = t; document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('on', x.dataset.tab === t)); renderPanel(); }
function chronoStart() {
  if (chrono || simT !== null) return;
  $('modal').hidden = true; modalOk = null; waiting.length = 0;
  save();
  const keep = JSON.stringify(S), old = S;
  S = fresh();
  Object.assign(S, { sound: old.sound, music: old.music, name: old.name, pid: old.pid, tuto: 9, noRdv: 1, seen6: 1, day: today(), spin: today(), vday: old.vday, vnew: 1, kid: old.kid, look: old.look, lookOwn: old.lookOwn, staff: [], deco: [], troph: [], dyes: [] });
  while (S.mis.length < 3) S.mis.push(newMission());
  chrono = { t: CH_TIME, keep };
  mini = null; ev = null; evEl.hidden = true; pickEl.hidden = true; rdvEl.hidden = true; fever = 0; combo = 0; boost = 0; evNext = 9999;
  newClient(); phase = 'cut'; slide = 0; buildBg(); renderSeats(); setTab('tools'); renderStats(); renderCombo();
  chEl.hidden = false; lastTap = nowMs(); sfx('level'); track('chrono');
  floatText('C\'est parti : 60 secondes !', 180, 150, 'step');
}
async function chronoEnd() {
  const score = Math.floor(S.total), keep = chrono.keep;
  S = JSON.parse(keep); chrono = null; chEl.hidden = true; evNext = 80; mini = null; pickEl.hidden = true; fever = 0; combo = 0;
  S.chronoN = (S.chronoN || 0) + 1; const best = score > (S.chronoBest || 0); if (best) S.chronoBest = score;
  const g = unit() * 6; earn(g);
  if (!S.client || !svcOf(S.client.svc) || !CUTS[S.client.cut]) newClient(); else setupClient();
  phase = 'cut'; slide = 0; buildBg(); renderSeats(); renderPanel(); renderStats(); renderCombo(); save(); sfx('level'); cash(24, CX, 240);
  let d = null;
  if (S.name) { const r = await post('scores?s=' + CH_SEASON, { id: S.pid, name: S.name, score, level: 1, play: CH_TIME, title: X.title() }); if (r.status === 200) d = r; }
  chronoResult(score, best, g, d);
}
function boardRows(d, n) {
  const medal = ['🥇', '🥈', '🥉'];
  return d && d.top && d.top.length ? '<div class="board"><table>' + d.top.slice(0, n).map((e) => `<tr class="${e.me ? 'me' : ''}"><td>${medal[e.r - 1] || e.r}</td><td>${esc(e.n)}</td><td>${fmt(e.s)} ${COIN}</td></tr>`).join('') + '</table></div>'
    + (d.me && d.me.r > n ? `<p class="muted">Votre place : ${d.me.r}e sur ${d.count}</p>` : '') : '';
}
function chronoResult(score, best, g, d) {
  modal(`<h3>${fmt(score)} ${COIN} en 60 secondes</h3><p>${best ? '<b>Nouveau record personnel !</b> ' : `Votre record : ${fmt(S.chronoBest)} ${COIN}. `}Prime de participation : +${fmt(g)} ${COIN}.</p>` +
    (S.name ? boardRows(d, 8) || '<p class="muted">Classement Chrono indisponible pour le moment.</p>' : '<p class="muted">Choisissez un pseudo (bouton 🏆) pour entrer au classement Chrono.</p>') +
    '<button type="button" class="rdvbtn" id="ch-again">Rejouer un Chrono</button><button type="button" class="link" id="ch-dare">Défier un ami</button>', null, 'Fermer');
  $('ch-again').addEventListener('click', chronoStart);
  $('ch-dare').addEventListener('click', () => shareText(`J'ai fait ${fmt(score)} Tracy coins en 60 secondes au jeu ${SALON.name}. Tu fais mieux ?`, `${location.origin}/?c=${score}&r=${myRef()}`));
}
async function showChronoBoard() {
  modal('<h3>Classement Chrono</h3><p class="muted">Chargement…</p>');
  let d = null;
  try { const r = await fetch(`${API}?s=${CH_SEASON}&id=${encodeURIComponent(S.pid)}`); d = r.ok ? await r.json() : null; } catch { d = null; }
  if ($('modal').hidden) return;
  modal('<h3>Classement Chrono</h3><p class="muted">Meilleur score en 60 secondes, en partant de zéro.</p>' + (boardRows(d, 20) || '<p>Personne n\'a encore joué. À vous d\'ouvrir le bal !</p>') +
    '<button type="button" class="rdvbtn" id="ch-again">Lancer un Chrono</button>', null, 'Fermer');
  $('ch-again').addEventListener('click', chronoStart);
}
{ const c = Math.floor(Number(QS.get('c'))); if (c > 0 && c < 1e9) later(() => { modal(`<h3>Un ami vous défie !</h3><p>Il a gagné <b>${fmt(c)} ${COIN}</b> en 60 secondes. Vous partez de zéro, comme lui : à vous de faire mieux.</p>`, () => { setTimeout(chronoStart, 50); }, 'Relever le défi'); }); }

/* =====================================================================
   7. MODE ENFANT, LECTURE DES INFOBULLES
   ===================================================================== */
const applyKid = () => document.body.classList.toggle('kid', !!S.kid);
applyKid();
const showTipV8 = showTip;
showTip = function (el) { // eslint-disable-line no-func-assign
  showTipV8(el);
  if (!S.tipVoice || !('speechSynthesis' in window) || !el.dataset.tip) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(el.dataset.tip.replace(/<br>/g, '. ').replace(/<\/b>/g, '. ').replace(/<[^>]+>/g, '').replace(/Ŧ/g, 'Tracy coins')); u.lang = 'fr-FR'; u.rate = 0.95; speechSynthesis.speak(u); } catch { /* pas de synthèse vocale */ }
};

/* =====================================================================
   8. TENUE DU COIFFEUR
   ===================================================================== */
const SLEEVES = [['Veste noire', '#141210', 0], ['Veste bordeaux', '#5a1a24', 3000], ['Veste bleu nuit', '#1b2a52', 3000], ['Veste blanche', '#e9e4d8', 8000], ['Veste rose', '#c2447a', 8000], ['Veste dorée', '#b8963f', 50000]];
const METALS = [['Outils dorés', '#d9b85f', 0], ['Outils argentés', '#c9ced6', 5000], ['Outils or rose', '#e6a08a', 12000], ['Outils noir mat', '#4a4540', 12000], ['Outils turquoise', '#1fb5ad', 30000]];
const look = () => { if (!S.look) S.look = { s: 0, m: 0, k: 1 }; if (!Array.isArray(S.lookOwn)) S.lookOwn = ['s0', 'm0']; return S.look; };
X.outfit = () => { const l = look(); return { skin: l.k, sleeve: (SLEEVES[l.s] || SLEEVES[0])[1], metal: (METALS[l.m] || METALS[0])[1] }; };
function lookTiles() {
  const l = look(), sw = (col) => `<i class="swt" style="background:${col}"></i>`;
  let o = '<p class="statline">Ma tenue</p><div class="icg sm">';
  const row = (list, p, cur) => list.forEach(([n, col, cost], i) => {
    const own = S.lookOwn.includes(p + i), sel = cur === i;
    o += tile({ cls: 'buy' + (sel ? ' sel' : ''), attrs: `data-look="${p}${i}" data-cost="${own ? 0 : cost}"`, ic: sw(col), foot: sel ? '●' : own ? '✓' : coin(cost), tip: `<b>${n}</b>${own ? (sel ? 'Portée en ce moment.' : 'Touchez pour la porter.') : 'Change la couleur à l\'écran. Aucun effet sur les gains.'}` });
  });
  row(SLEEVES, 's', l.s); row(METALS, 'm', l.m);
  for (let i = 0; i < N_SKIN; i++) o += tile({ cls: 'buy' + (l.k === i ? ' sel' : ''), attrs: `data-look="k${i}" data-cost="0"`, ic: sw(SKINS[i][0]), foot: l.k === i ? '●' : '', tip: '<b>Couleur des mains</b>Gratuit : choisissez celle qui vous ressemble.' });
  return o + '</div>';
}

/* =====================================================================
   9. REPRISE SUR UN AUTRE APPAREIL
   ===================================================================== */
async function saveOut() {
  save();
  const r = await post('save', { id: S.pid, data: JSON.stringify(S) });
  modal(r.code ? `<h3>Votre code de reprise</h3><div class="code">${r.code}</div><p>Sur l'autre appareil : onglet Infos, « J'ai un code », puis saisissez ce code.</p><p class="muted">Le code reprend la partie telle qu'elle est maintenant. Refaites-en un plus tard pour une partie plus récente. Ne le partagez pas : il donne accès à votre partie.</p>` : '<h3>Pas de connexion</h3><p>Réessayez dans un instant.</p>');
}
function saveIn() {
  modal('<h3>Reprendre une partie</h3><p>Saisissez le code obtenu sur l\'autre appareil.</p><input id="save-in" class="field" maxlength="8" placeholder="Code à 8 caractères" autocomplete="off"><p class="muted">Attention : la partie de cet appareil sera remplacée.</p>', () => {
    const v = ($('save-in').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (v.length !== 8) { $('save-in').focus(); return false; }
    fetch(GAPI('save') + '?code=' + v).then((r) => (r.ok ? r.json() : null)).then((d) => {
      let ok = false;
      try { const o = d && JSON.parse(d.data); ok = !!o && typeof o.total === 'number' && Array.isArray(o.svc); } catch { ok = false; }
      if (!ok) { modal('<h3>Code inconnu</h3><p>Vérifiez le code et réessayez.</p>'); return; }
      restoring = true; localStorage.setItem(KEY, d.data); location.replace(location.origin + '/');
    }).catch(() => modal('<h3>Pas de connexion</h3><p>Réessayez dans un instant.</p>'));
    return false;
  }, 'Reprendre');
}

/* =====================================================================
   10. BRANCHEMENTS
   ===================================================================== */
const panelV8 = X.panel, clickV8 = X.click, finV8 = X.onFinish, frameV8 = X.frame, perfectV8 = X.perfect, arriveV8 = X.arrive, levelV8 = X.levelUp, trophV8 = checkTrophies, shareV8 = X.share;
X.share = () => shareText(`J'ai gagné ${fmt(S.total)} Tracy coins au jeu ${SALON.name}. Tu fais mieux ?`, refLink());
checkTrophies = function () { if (!chrono) trophV8(); }; // eslint-disable-line no-func-assign
X.perfect = (c) => (chrono ? false : perfectV8(c));
X.arrive = (c) => { if (!chrono) arriveV8(c); };
X.levelUp = (l, b) => { if (!chrono && !S.kid) levelV8(l, b); };
X.frame = (dt) => {
  frameV8(dt);
  if (S.kid && !rdvEl.hidden) rdvEl.hidden = true;
  if (!chrono) return;
  chrono.t -= dt;
  chEl.innerHTML = `${gi('timer')}<b>${Math.max(0, Math.ceil(chrono.t))} s</b><span><i class="tc">T</i>${fmt(S.total)}</span>`;
  chEl.classList.toggle('end', chrono.t < 10);
  if (chrono.t <= 0) chronoEnd();
};
X.onFinish = (c, pay) => {
  const nat = c.hair, svc = svcOf(c.svc), isNew = svc.cut && !S.cuts.includes(c.cut) && !chrono && !S.kid && !S.noRdv && simT === null && S.tuto >= 9;
  if (isNew) { const keepHair = c.hair; if (c.dye !== undefined) c.hair = c.dye; drawCard(c, nat, svc); c.hair = keepHair; }
  finV8(c, pay);
  if (isNew) showCard(CUTS[c.cut].n);
};
X.panel = (t, h) => {
  let o = panelV8(t, h);
  for (const [e, n] of EMO) o = o.split(`<span class="em">${e}</span>`).join(`<span class="em">${gi(n)}</span>`).split(`<span class="lv">${e}</span>`).join(`<span class="lv">${gi(n)}</span>`);
  o = o.split('<span class="ft">🎁</span>').join(`<span class="ft">${gi('gift')}</span>`);
  o = o.split('">🏆</div>').join('">' + gi('cup') + '</div>');
  if (chrono) return t === 'tools' ? o : '<p class="statline big">Chrono en cours : retournez dans Outils !</p>';
  if (t === 'tools') {
    const ch = tile({ cls: 'buy', attrs: 'id="chrono-go" data-cost="0"', ic: gi('timer'), badge: S.chronoBest ? '★' : '', foot: '60 s', tip: `<b>Mode Chrono</b>60 secondes, en partant de zéro, comme tout le monde. Votre partie est mise de côté puis retrouvée intacte.${S.chronoBest ? `<br>Votre record : ${fmt(S.chronoBest)} ${COIN}` : ''}` });
    o = o.replace('<div class="icg">', '<div class="icg">' + ch);
  } else if (t === 'biz') o += lookTiles();
  else if (t === 'salon') {
    const blocks = '<div class="box"><h2>Parrainage</h2><p>Invitez un ami : dès qu\'il a coiffé 5 clients, vous recevez tous les deux une grosse prime de Tracy coins.</p>' +
      `<p class="statline big">Filleuls : <b>${S.refN || 0}</b></p><button type="button" class="rdvbtn" id="ref-share">Inviter un ami</button></div>` +
      '<div class="box"><h2>Code du salon</h2><p>Le mot de la semaine est affiché au salon. Tracy donne aussi un code de fidélité après chaque rendez-vous.</p>' +
      `<div class="coderow"><input id="code-in" class="field" maxlength="16" placeholder="Mot ou code" autocomplete="off"><button type="button" class="btn" id="code-ok">Valider</button></div>${stampCard()}` +
      `<p class="muted">Carte de fidélité : ${(S.stamps || 0) % LOYAL}/${LOYAL} tampons${(S.stamps || 0) >= LOYAL ? ` · ${Math.floor(S.stamps / LOYAL)} carte${S.stamps >= 2 * LOYAL ? 's' : ''} remplie${S.stamps >= 2 * LOYAL ? 's' : ''}` : ''}. Récompense à demander au salon.</p></div>` +
      '<div class="box"><h2>Réglages</h2>' +
      `<label class="sw"><input type="checkbox" id="set-kid" ${S.kid ? 'checked' : ''}> Mode enfant <small>moins de texte, pas de lien de rendez-vous</small></label>` +
      `<label class="sw"><input type="checkbox" id="set-voice" ${S.tipVoice ? 'checked' : ''}> Lire les infobulles à voix haute <small>voix du téléphone</small></label>` +
      '<p class="rowbtn"><button type="button" class="link" id="save-out">Changer d\'appareil : obtenir mon code</button><button type="button" class="link" id="save-go">J\'ai un code</button></p>' +
      '<p class="rowbtn"><button type="button" class="link" id="ch-board">Classement Chrono</button></p></div>';
    o = o.replace('<img class="tracy"', blocks + '<img class="tracy"');
  }
  return o;
};
X.click = (b) => {
  if (b.id === 'chrono-go') { modal('<h3>Mode Chrono</h3><p>60 secondes pour gagner un maximum de Tracy coins, en partant de zéro. Tout le monde a les mêmes chances.</p><p class="muted">Votre partie est mise de côté et vous la retrouvez intacte à la fin.</p>', () => { setTimeout(chronoStart, 50); }, 'C\'est parti'); return true; }
  if (b.dataset.look) {
    const p = b.dataset.look[0], i = +b.dataset.look.slice(1), l = look();
    if (p === 'k') l.k = i;
    else {
      const list = p === 's' ? SLEEVES : METALS, key = p + i;
      if (!list[i]) return true;
      if (!S.lookOwn.includes(key)) { if (S.money < list[i][2]) return true; S.money -= list[i][2]; S.lookOwn.push(key); sfx('level'); }
      if (p === 's') l.s = i; else l.m = i;
    }
    sfx('coin'); return true;
  }
  if (b.id === 'ref-share') { shareText(`Viens coiffer tes clients au jeu ${SALON.name} : on gagne tous les deux une prime avec ce lien.`, refLink()); return true; }
  if (b.id === 'code-ok') { sendCode(); return true; }
  if (b.id === 'save-out') { saveOut(); return true; }
  if (b.id === 'save-go') { saveIn(); return true; }
  if (b.id === 'ch-board') { showChronoBoard(); return true; }
  return clickV8(b);
};
panel.addEventListener('change', (e) => {
  if (e.target.id === 'set-kid') { S.kid = e.target.checked ? 1 : 0; applyKid(); save(); renderOrder(); }
  else if (e.target.id === 'set-voice') { S.tipVoice = e.target.checked ? 1 : 0; save(); }
});
panel.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'code-in') sendCode(); });

renderPanel(); renderOrder();
setTimeout(refTick, 4000); setInterval(refTick, 90000);
