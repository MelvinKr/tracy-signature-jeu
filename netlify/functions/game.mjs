// Services du jeu (V9), tous dans Netlify Blobs (magasin « game »). Aucune donnée personnelle.
//   POST /api/event { e }            : compteur anonyme du jour (visites, clics rendez-vous…)
//   GET  /api/ref?code=              : nombre de filleuls d'un code de parrainage
//   POST /api/ref { id, code }       : un nouveau joueur déclare son parrain (une fois par joueur)
//   POST /api/code { id, code }      : mot de la semaine ou tampon de fidélité (usage unique)
//   POST /api/save { id, data }      : dépose une sauvegarde, renvoie un code de reprise
//   GET  /api/save?code=             : relit une sauvegarde
//   POST /api/admin { a, … }         : page de Tracy, protégée par la variable d'environnement ADMIN_KEY
import { getStore } from '@netlify/blobs';

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const EVENTS = ['visit', 'new', 'rdv', 'tel', 'map', 'share', 'chrono', 'ref'];
const json = (o, status = 200) => Response.json(o, { status, headers: { 'Cache-Control': 'no-store' } });
const idOk = (s) => typeof s === 'string' && /^[a-zA-Z0-9-]{8,40}$/.test(s);
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((x) => ALPHA[x % 32]).join('');
// Même calcul que dans le jeu (v9.js) : le code de parrainage d'un joueur se déduit de son identifiant.
function refCode(id) {
  let h = 2166136261;
  for (const ch of 'parrain-' + id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  let s = '';
  for (let i = 0; i < 6; i++) { s += ALPHA[(h >>> (i * 5)) & 31]; if (i === 2) h = Math.imul(h ^ (h >>> 13), 16777619); }
  return s;
}

export default async (req) => {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '');
  const store = getStore({ name: 'game', consistency: 'strong' });
  const get = async (k) => (await store.get(k, { type: 'json' })) || {};
  let b = {};
  if (req.method === 'POST') { try { b = (await req.json()) || {}; } catch { return json({ error: 'json' }, 400); } }
  else if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });

  if (path === '/api/event') {
    if (req.method !== 'POST' || !EVENTS.includes(b.e)) return json({ error: 'invalid' }, 400);
    const day = new Date().toISOString().slice(0, 10), key = 'stats-' + day.slice(0, 7), doc = await get(key);
    doc[day] = doc[day] || {}; doc[day][b.e] = (doc[day][b.e] || 0) + 1;
    await store.setJSON(key, doc); // deux clics simultanés peuvent n'en compter qu'un : ordre de grandeur, pas comptabilité
    return json({ ok: true });
  }

  if (path === '/api/ref') {
    const refs = await get('refs');
    if (req.method === 'GET') { const c = norm(url.searchParams.get('code')); return json({ n: refs[c] ? refs[c].n : 0 }); }
    const code = norm(b.code);
    if (!idOk(b.id) || code.length !== 6) return json({ error: 'invalid' }, 400);
    if (refCode(b.id) === code) return json({ error: 'self' }, 400);
    const used = await get('refused');
    if (used[b.id]) return json({ ok: true, dup: true }); // un joueur n'a qu'un parrain
    const r = refs[code] || { n: 0 };
    if (r.n >= 500) return json({ error: 'full' }, 400);
    r.n++; refs[code] = r; used[b.id] = code;
    await store.setJSON('refs', refs); await store.setJSON('refused', used);
    return json({ ok: true });
  }

  if (path === '/api/code') {
    const code = norm(b.code);
    if (req.method !== 'POST' || !idOk(b.id) || code.length < 3) return json({ error: 'invalid' }, 400);
    const cfg = await get('config');
    if (cfg.word && code === cfg.word) return json({ type: 'word', wid: cfg.wid });
    const stamps = await get('stamps');
    if (stamps[code]) {
      if (stamps[code].u) return json({ error: 'used' }, 409);
      stamps[code].u = b.id; stamps[code].t = Date.now();
      await store.setJSON('stamps', stamps);
      return json({ type: 'stamp' });
    }
    return json({ error: 'unknown' }, 404);
  }

  if (path === '/api/save') {
    if (req.method === 'GET') {
      const c = norm(url.searchParams.get('code'));
      const doc = c.length === 8 ? await store.get('save-' + c, { type: 'json' }) : null;
      return doc ? json({ data: doc.d }) : json({ error: 'unknown' }, 404);
    }
    if (!idOk(b.id) || typeof b.data !== 'string' || b.data.length < 2 || b.data.length > 60000) return json({ error: 'invalid' }, 400);
    const mine = await get('saveof'); // un seul code par joueur : il est réécrit à chaque dépôt
    const code = mine[b.id] || rand(8);
    if (!mine[b.id]) { mine[b.id] = code; await store.setJSON('saveof', mine); }
    await store.setJSON('save-' + code, { d: b.data, t: Date.now() });
    return json({ code });
  }

  if (path === '/api/admin') {
    const key = (globalThis.Netlify && Netlify.env && Netlify.env.get('ADMIN_KEY')) || process.env.ADMIN_KEY || '';
    if (!key) return json({ error: 'unset' }, 503); // la variable ADMIN_KEY n'est pas encore réglée dans Netlify
    if (req.method !== 'POST' || req.headers.get('x-admin-key') !== key) return json({ error: 'auth' }, 401);
    const scores = getStore({ name: 'scores', consistency: 'strong' });
    const season = String(b.season || 's1').replace(/[^a-z0-9-]/gi, '').slice(0, 20) || 's1';
    if (b.a === 'word') {
      const cfg = await get('config');
      cfg.word = norm(b.word); cfg.wid = Date.now().toString(36);
      await store.setJSON('config', cfg);
    } else if (b.a === 'stamps') {
      const stamps = await get('stamps'), n = Math.max(1, Math.min(50, Math.floor(Number(b.n)) || 10)), made = [];
      while (made.length < n) { const c = rand(6); if (!stamps[c]) { stamps[c] = { c: Date.now() }; made.push(c); } }
      await store.setJSON('stamps', stamps);
      return json({ codes: made });
    } else if (b.a === 'remove') {
      if (!idOk(b.id)) return json({ error: 'invalid' }, 400);
      const board = (await scores.get('board-' + season, { type: 'json' })) || {};
      delete board[b.id];
      await scores.setJSON('board-' + season, board);
      const ban = await get('ban'); ban[b.id] = Date.now(); await store.setJSON('ban', ban); // il ne pourra pas se réinscrire
    } else if (b.a !== 'summary') return json({ error: 'invalid' }, 400);
    // Dans tous les cas, on renvoie l'état à jour
    const board = (await scores.get('board-' + season, { type: 'json' })) || {};
    const now = new Date(), m1 = now.toISOString().slice(0, 7), prev = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString().slice(0, 7);
    const stats = { ...(await get('stats-' + prev)), ...(await get('stats-' + m1)) };
    const stamps = await get('stamps'), cfg = await get('config'), refs = await get('refs');
    return json({
      season,
      board: Object.entries(board).sort((x, y) => y[1].s - x[1].s).map(([id, e]) => ({ id, n: e.n, s: e.s, l: e.l, ti: e.ti || '', t: e.t })),
      stats, word: cfg.word || '',
      stamps: { total: Object.keys(stamps).length, used: Object.values(stamps).filter((x) => x.u).length, free: Object.entries(stamps).filter(([, x]) => !x.u).map(([c]) => c).slice(0, 100) },
      refs: Object.entries(refs).sort((x, y) => y[1].n - x[1].n).slice(0, 20).map(([c, r]) => ({ code: c, n: r.n })),
    });
  }
  return json({ error: 'not found' }, 404);
};

export const config = { path: ['/api/event', '/api/ref', '/api/code', '/api/save', '/api/admin'] };
