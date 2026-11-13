/* Signature Cut by Tracy – le jeu · V10 (chargé après v9.js).
   Rythme et économie revus, client en or, maîtrise des coupes, paliers d'outils, talents de franchise,
   défi du jour, messages en file d'attente, pastille de rendez-vous, icônes partout, socle mobile. */
'use strict';

/* =====================================================================
   1. ICÔNES : plus aucun émoji dans les textes du jeu
   ===================================================================== */
Object.assign(GI, {
  cal: '<rect class="a" x="4" y="5.5" width="16" height="15" rx="2"/><path d="M4 5.5h16v15H4zM4 10h16M8 3v4M16 3v4M8 13.5h2M12 13.5h2M8 17h2"/>',
  phone: '<path class="a" d="M6 3h4l1.500 5-2.500 1.500a11 11 0 005.500 5.500L16 12.500l5 1.500v4c0 1.500-1 2.500-2.500 2.500C10 20.500 3.500 14 3.500 5.500 3.500 4 4.500 3 6 3z"/><path d="M6 3h4l1.500 5-2.500 1.500a11 11 0 005.500 5.500L16 12.500l5 1.500v4c0 1.500-1 2.500-2.500 2.500C10 20.500 3.500 14 3.500 5.500 3.500 4 4.500 3 6 3z"/>',
  note: '<path d="M9 18V5l10-2v13"/><circle class="a" cx="6.500" cy="18" r="2.500"/><circle cx="6.500" cy="18" r="2.500"/><circle class="a" cx="16.500" cy="16" r="2.500"/><circle cx="16.500" cy="16" r="2.500"/>',
});
const gin = (n) => gi(n).replace('class="gi"', 'class="gi in"');
const EM = [['📅', 'cal'], ['🏆', 'cup'], ['👆', 'tap'], ['⏳', 'timer'], ['⏱️', 'timer'], ['🎁', 'gift'], ['📞', 'phone'], ['📍', 'pin'], ['🛍️', 'bag'], ['✂️', 'scissors'], ['🧑‍🎓', 'cap'], ['🏙️', 'city'], ['🎡', 'wheel']];
const MEDALS = [['🥇', 'g', 1], ['🥈', 's', 2], ['🥉', 'b', 3]];
function deEmo(h) {
  if (typeof h !== 'string') return h;
  for (const [e, n] of EM) if (h.includes(e)) h = h.split(e).join(gin(n));
  for (const [e, c, n] of MEDALS) if (h.includes(e)) h = h.split(e).join(`<i class="md ${c}">${n}</i>`);
  return h;
}
$('rank').innerHTML = gi('cup');
infoEl.innerHTML = deEmo(infoEl.innerHTML);

/* =====================================================================
   2. MESSAGES EN FILE D'ATTENTE (plus aucun message n'en écrase un autre)
   ===================================================================== */
const toastQ = []; let toastBusy = false;
function toastPump() {
  if (toastBusy || !toastQ.length) return;
  toastBusy = true;
  const t = $('toast'); t.innerHTML = toastQ.shift(); t.classList.add('on'); renderCombo();
  setTimeout(() => { t.classList.remove('on'); setTimeout(() => { toastBusy = false; renderCombo(); toastPump(); }, 280); }, toastQ.length > 1 ? 1500 : toastQ.length ? 2200 : 3200);
}
toast = function (html) { // eslint-disable-line no-func-assign
  if (simT !== null) return;
  if (toastQ.length >= 5) toastQ.shift();
  toastQ.push(deEmo(html)); toastPump();
};
const modalV9 = modal;
modal = function (html, onOk, label) { modalV9(deEmo(html), onOk, label); }; // eslint-disable-line no-func-assign

/* =====================================================================
   3. TALENTS DE FRANCHISE : un choix parmi trois à chaque nouvelle ville, pour toujours
   ===================================================================== */
const TALENTS = [
  ['prix', 'Tarifs premium', '+25 % sur tous les tarifs', 'crown'],
  ['force', 'Poigne de fer', 'Puissance de clic x1,5', 'scissors'],
  ['equipe', 'Chef d\'équipe', 'Les fauteuils rapportent +60 %', 'chair'],
  ['oeil', 'Œil de maître', '+4 % de coups de maître', 'star'],
  ['vente', 'Bagou', '+6 % de chances de vendre un produit', 'bag'],
  ['geste', 'Main d\'artiste', 'Pourboires des gestes +50 %', 'tap'],
  ['or', 'Flair doré', 'Le client en or passe 40 % plus souvent', 'gift'],
  ['depart', 'Bon départ', 'Chaque nouveau salon démarre avec un capital', 'city'],
];
const tal = (id) => (S.tal && S.tal[id]) || 0;
X.powerMult = () => Math.pow(1.5, tal('force'));
X.crit = () => 0.04 * tal('oeil');
X.offer = () => 0.06 * tal('vente');
function pickTalent() {
  const pool = TALENTS.map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 3);
  const give = (i) => { S.tal = S.tal || {}; S.tal[TALENTS[i][0]] = tal(TALENTS[i][0]) + 1; if (TALENTS[i][0] === 'depart') { S.money += 400 * presMult(S.pres) * Math.pow(TIER_GROW, S.pres - 1); } modalOk = null; $('modal').hidden = true; sfx('level'); save(); renderPanel(); renderStats(); toast(`<b>Talent : ${TALENTS[i][1]}</b><br>${TALENTS[i][2]}, pour toujours.`); };
  modal('<h3>Choisissez un talent</h3><p class="muted">Il reste acquis dans tous vos salons.</p><div class="talents">' +
    pool.map((i) => `<button type="button" data-tal="${i}">${gi(TALENTS[i][3])}<b>${TALENTS[i][1]}</b><small>${TALENTS[i][2]}${tal(TALENTS[i][0]) ? ` · déjà ${tal(TALENTS[i][0])}` : ''}</small></button>`).join('') + '</div>', () => { give(pool[0]); return false; }, 'Je prends le premier');
  $('modal-body').querySelectorAll('[data-tal]').forEach((b) => b.addEventListener('click', () => give(+b.dataset.tal)));
}
askPrestige = function () { // eslint-disable-line no-func-assign
  const next = CITIES[S.pres + 1];
  modal(`<h3>Ouvrir un salon à ${next} ?</h3><p>Vous repartez de zéro dans une nouvelle ville : argent, outils, prestations, fauteuils et univers sont remis à zéro.</p>` +
    `<p>En échange : tarifs <b>x${presMult(S.pres + 1)}</b> pour toujours, et <b>un talent à choisir</b> parmi trois. Vous gardez niveau, score, albums, maîtrises, trophées, décoration et tenue.</p>` +
    '<button class="link" id="pres-no">Pas maintenant</button>', () => {
    S.pres++; S.base = S.total; S.money = 0; S.tools = {}; S.svc = ['simple']; S.seats = 0; S.staff = []; S.tier = 0;
    if (ev) { ev = null; evEl.hidden = true; }
    newClient(); phase = 'cut'; buildBg(); renderSeats(); save(); renderPanel();
    cash(40, CX, 220); sfx('level');
    setTimeout(pickTalent, 60);
    return undefined;
  }, `Ouvrir à ${next}`);
  $('pres-no').addEventListener('click', () => { modalOk = null; $('modal').hidden = true; });
};

/* =====================================================================
   4. MAÎTRISE DES COUPES : bronze, argent, or
   ===================================================================== */
const MAST = [3, 12, 40], MAST_N = ['bronze', 'argent', 'or'];
const mastLv = (i) => { const n = (S.mast && S.mast[i]) || 0; return n >= MAST[2] ? 3 : n >= MAST[1] ? 2 : n >= MAST[0] ? 1 : 0; };
const mastTotal = () => { let n = 0; for (const i of S.cuts) n += mastLv(i); return n; };
TROPHIES.push({ id: 'ma10', n: 'Geste sûr', d: 'Obtenir 10 étoiles de maîtrise', ok: () => mastTotal() >= 10 }, { id: 'ma90', n: 'Grand maître', d: 'Toutes les coupes en or', ok: () => mastTotal() >= CUTS.length * 3 }, { id: 'go10', n: 'Chasseur d\'or', d: 'Attraper 10 clients en or', ok: () => st('gold') >= 10 });

/* =====================================================================
   5. LE CLIENT EN OR : il traverse l'écran de temps en temps, à attraper d'un doigt
   ===================================================================== */
const goldEl = document.createElement('button');
goldEl.id = 'golden'; goldEl.type = 'button'; goldEl.hidden = true; goldEl.setAttribute('aria-label', 'Client en or'); goldEl.innerHTML = gi('head');
stage.appendChild(goldEl);
const frEl = document.createElement('div');
frEl.id = 'frenzy'; frEl.hidden = true; stage.appendChild(frEl);
const goldGap = () => (150 + rnd(90)) * Math.pow(0.6, tal('or'));
let goldNext = 70 + rnd(40), goldT = 0, frenzy = null; // frenzy = { k: 'pay' | 'work', t }
function goldShow() {
  goldT = 8; goldEl.hidden = false; goldEl.style.top = (24 + rnd(36)) + '%';
  goldEl.classList.remove('run'); void goldEl.offsetWidth; goldEl.classList.add('run'); sfx('step');
}
goldEl.addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation();
  if (goldEl.hidden) return;
  goldEl.hidden = true; goldT = 0; goldNext = goldGap(); bump('gold'); sfx('level'); lastTap = nowMs();
  if (navigator.vibrate) { try { navigator.vibrate([20, 40, 20]); } catch { /* rien */ } }
  const r = Math.random();
  if (r < 0.5) { const g = unit() * 12; earn(g); cash(40, CX, 220); toast(`<b>Client en or !</b><br>Il laisse un pourboire royal : +${fmt(g)} ${COIN}`); renderStats(); checkTier(); }
  else if (r < 0.75) { frenzy = { k: 'pay', t: 20 }; cash(20, CX, 220); toast('<b>Client en or : frénésie !</b><br>Tous les encaissements x7 pendant 20 secondes.'); }
  else { frenzy = { k: 'work', t: 20 }; cash(20, CX, 220); toast('<b>Client en or : doigts de fée !</b><br>Chaque clic vaut x5 pendant 20 secondes.'); }
});

/* =====================================================================
   6. DÉFI DU JOUR, PSEUDO DEMANDÉ PLUS TARD, DÉFIS QUI GRANDISSENT
   ===================================================================== */
const DQ_N = 40;
const dq = () => { if (!S.dq || S.dq.day !== today()) S.dq = { day: today(), from: S.served, done: 0 }; return S.dq; };
const dqProg = () => Math.min(DQ_N, S.served - dq().from);
X.misScale = (k) => { const l = levelInfo().l; return k === 'served' || k === 'taps' || k === 'crits' ? 1 + Math.floor(l / 4) * 0.5 : 1 + Math.floor(l / 10); };
let askedName = false;

/* =====================================================================
   7. CLIC : zone utile, élan pour l'équipe, relâcher sur la jauge
   ===================================================================== */
X.offTarget = (x, y) => !S.kid && (((x - CX) / 118) ** 2 + ((y - 236) / 150) ** 2 > 1);
X.tap = (x, y, crit, off) => {
  if (off) { if (Math.random() < 0.35) floatText('à côté', clamp(x, 30, 330), y - 40, 'miss'); return; }
  for (let i = 0; i < S.seats; i++) seatT[i] = Math.min(1, (seatT[i] || 0) + 0.006); // votre énergie motive l'équipe
};
X.release = () => { if (phase === 'mini' && mini && mini.k === 'perfect' && mini.held && mini.t > 0.25) X.miniTap({ x: CX, y: 200 }); };

/* =====================================================================
   8. RENDEZ-VOUS : la bulle se replie en pastille au lieu de rester sur les mains
   ===================================================================== */
showRdv = function (c) { // eslint-disable-line no-func-assign
  if (S.noRdv || S.kid || S.tuto < 9 || simT !== null || chrono) return;
  const s = svcOf(c.svc);
  rdvEl.innerHTML = `<a class="go" href="${SALON.planity}" target="_blank" rel="noopener"><span>${gi('cal')}</span><b class="long">Prendre rendez-vous</b><b class="short">RDV</b><small>${s.n} · ${s.price} € au salon</small></a>` +
    '<button type="button" class="x" aria-label="Fermer">✕</button><button type="button" class="never">Ne plus afficher</button>';
  rdvEl.classList.remove('pill'); rdvEl.hidden = false; clearTimeout(rdvT);
  rdvT = setTimeout(() => rdvEl.classList.add('pill'), 3500);
};

/* =====================================================================
   9. BRANCHEMENTS
   ===================================================================== */
const multV9 = X.mult, payV9 = X.payMult, workV9 = X.workMult, seatV9 = X.seatMult, frameV9 = X.frame, finV9 = X.onFinish, panelV9 = X.panel, clickV9 = X.click, perfectV9 = X.perfect, giftV9 = renderGift, drawV9 = X.draw, frontV9 = X.front;
X.mult = () => multV9() * (1 + 0.25 * tal('prix')) * (1 + 0.01 * mastTotal());
X.payMult = () => {
  let m = payV9();
  const t = (S.client && S.client.tip) || 1;
  if (t > 1 && tal('geste')) m = m / t * (1 + (t - 1) * (1 + 0.5 * tal('geste')));
  return m * (frenzy && frenzy.k === 'pay' ? 7 : 1);
};
X.workMult = () => workV9() * (frenzy && frenzy.k === 'work' ? 5 : 1);
X.seatMult = (i) => seatV9(i) * (1 + 0.6 * tal('equipe'));
X.perfect = (c) => { const r = perfectV9(c); if (r && mini) mini.held = !!hold; return r; };
let ft = [], slow = 0, lastNow = 0;
X.frame = (dt) => {
  const open = !$('modal').hidden;
  if (open) { if (ev) ev.t += dt; if (mini) mini.t -= dt; } // le temps s'arrête pour les événements quand une fenêtre est ouverte
  frameV9(dt);
  if (simT !== null) return;
  if (frenzy) { frenzy.t -= dt; frEl.hidden = false; frEl.innerHTML = `${gi(frenzy.k === 'pay' ? 'gift' : 'tap')}<b>x${frenzy.k === 'pay' ? 7 : 5}</b><span>${Math.ceil(frenzy.t)} s</span>`; if (frenzy.t <= 0) { frenzy = null; frEl.hidden = true; } }
  if (goldT > 0) { if (!open) goldT -= dt; if (goldT <= 0) { goldEl.hidden = true; goldNext = goldGap(); } }
  else if (!chrono && !open && S.tuto >= 9 && S.served >= 6 && phase === 'cut' && nowMs() - lastTap < 5000) { goldNext -= dt; if (goldNext <= 0) goldShow(); }
  if (!askedName && !S.name && S.served >= 4 && !chrono && S.tuto >= 9 && !open) { askedName = true; later(() => askName()); }
  // Finesse adaptative : si l'image rame, on dessine moins de points
  const now = performance.now();
  if (lastNow) { ft.push(now - lastNow); if (ft.length >= 90) { const avg = ft.reduce((a, b) => a + b, 0) / ft.length; ft = []; slow = avg > 30 ? slow + 1 : 0; if (slow >= 3 && (X.dprCap || 2) > 1) { X.dprCap = (X.dprCap || 2) - 0.5; slow = 0; resize(); } } }
  lastNow = now;
};
X.onFinish = (c, pay) => {
  finV9(c, pay);
  if (svcOf(c.svc).cut && !chrono) {
    S.mast = S.mast || {}; const b = mastLv(c.cut); S.mast[c.cut] = (S.mast[c.cut] || 0) + 1; const a = mastLv(c.cut);
    if (a > b) { const g = unit() * 4 * a; earn(g); sfx('level'); toast(`<b>Maîtrise ${MAST_N[a - 1]} : ${CUTS[c.cut].n}</b><br>+${fmt(g)} ${COIN} et +1 % sur vos tarifs.`); if (tab === 'cuts') renderPanel(); }
  }
};
const TOOL_D = {}; for (const t of TOOLS) TOOL_D[t.id] = t.d;
X.panel = (t, h) => {
  for (const tl of TOOLS) { // l'infobulle annonce le prochain palier
    const nx = ['ciseaux', 'tondeuse', 'apprenti'].includes(tl.id) ? MILE.find((x) => lvl(tl.id) < x) : 0;
    tl.d = TOOL_D[tl.id] + (nx ? `<br>Palier : effet x2 au niveau ${nx}${mile(tl.id) > 1 ? ` (déjà x${mile(tl.id)})` : ''}` : '');
  }
  let o = panelV9(t, h);
  if (t === 'tools' && !chrono) {
    const d = dq(), p = dqProg();
    const tl = d.done ? tile({ cls: 'done', ic: gi('cal'), foot: '✓', tip: '<b>Défi du jour</b>Réussi ! Un nouveau défi arrive demain.' })
      : p >= DQ_N ? tile({ cls: 'buy mq', attrs: 'id="dq-ok" data-cost="0"', ic: gi('cal'), badge: '✓', foot: gi('gift'), tip: '<b>Défi du jour réussi</b>Touchez pour encaisser : grosse prime et un lancer de roue en plus.' })
        : tile({ cls: 'mq', attrs: `id="dq" style="--p:${p / DQ_N}"`, ic: gi('cal'), foot: `${p}/${DQ_N}`, tip: `<b>Défi du jour</b>Coiffer ${DQ_N} clients aujourd'hui.<br>Récompense : grosse prime et un lancer de roue en plus.` });
    o = o.replace('<div class="icg">', '<div class="icg">' + tl);
  } else if (t === 'cuts') {
    for (const i of S.cuts) { const l = mastLv(i), n = (S.mast && S.mast[i]) || 0, nx = MAST[l]; o = o.replace(`data-cut="${i}"><canvas></canvas><span>`, `data-cut="${i}" data-tip="${esc(`<b>${CUTS[i].n}</b>Réalisée ${n} fois.<br>${nx ? `Prochaine étoile à ${nx}.` : 'Maîtrise en or !'}`)}"><canvas></canvas><i class="ms m${l}">${'★'.repeat(l)}${'☆'.repeat(3 - l)}</i><span>`); }
    o = o.replace('<h2>Collection', `<p class="statline">Maîtrise : ${mastTotal()}/${CUTS.length * 3} étoiles · +1 % sur vos tarifs par étoile</p><h2>Collection`);
  } else if (t === 'biz' && S.tal && Object.keys(S.tal).length) {
    o = o.replace('<div class="tiers">', '<div class="talrow">' + TALENTS.filter((x) => tal(x[0])).map((x) => `<span data-tip="${esc(`<b>${x[1]}${tal(x[0]) > 1 ? ' x' + tal(x[0]) : ''}</b>${x[2]}`)}">${gi(x[3])}${tal(x[0]) > 1 ? `<b>${tal(x[0])}</b>` : ''}</span>`).join('') + '</div><div class="tiers">');
  }
  return deEmo(o);
};
X.click = (b) => {
  if (b.id === 'dq-ok') {
    const d = dq(); if (d.done || dqProg() < DQ_N) return true;
    d.done = 1; const g = unit() * 30; earn(g); S.spin = ''; cash(36, CX, 230); sfx('level'); checkTier();
    toast(`<b>Défi du jour réussi !</b><br>+${fmt(g)} ${COIN} et la roue est à relancer.`); return true;
  }
  return clickV9(b);
};
X.stats = ((old) => () => { old(); const el = $('dq'); if (el && tab === 'tools') { const p = dqProg(); if (p >= DQ_N) { renderPanel(); return; } el.style.setProperty('--p', p / DQ_N); el.querySelector('.ft').textContent = `${p}/${DQ_N}`; } })(X.stats);
renderGift = function () { // eslint-disable-line no-func-assign
  giftV9();
  const l = levelInfo().l, g = $('gift');
  if (S.code) return;
  const left = Math.max(0, Math.ceil((REWARD.minMinutes * 60 - S.playSec) / 60)), p = Math.min(1, Math.min(l / REWARD.level, S.playSec / (REWARD.minMinutes * 60)));
  g.innerHTML = `${gin('gift')} ${REWARD.label} au salon : niveau ${Math.min(l, REWARD.level)}/${REWARD.level}${left ? ` · encore ${left} min de jeu` : ''}`;
  g.style.setProperty('--p', p);
};
X.share = ((old) => old)(X.share);
TOOL_IC.precision = gi('star');

document.querySelectorAll('#tabs button').forEach((b) => { b.setAttribute('aria-label', b.textContent.trim()); });
renderPanel(); renderGift(); renderStats();
