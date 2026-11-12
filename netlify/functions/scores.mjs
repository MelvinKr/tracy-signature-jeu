// Classement partagé du jeu. GET /api/scores?s=<saison>&id=<joueur> : lit le classement.
// POST /api/scores?s=<saison> { id, name, score, level } : enregistre le meilleur score du joueur.
// Stockage : Netlify Blobs (un document JSON par saison). Aucune donnée personnelle : un pseudo et un score.
// Limite connue : le score est envoyé par le navigateur, un tricheur peut donc envoyer un faux score.
import { getStore } from '@netlify/blobs';

const MAX_PLAYERS = 1000, TOP = 50, MAX_SCORE = 1e12;
const clean = (s) => String(s || '').replace(/[<>&"'`\\\u0000-\u001f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);

export default async (req) => {
  const url = new URL(req.url);
  const season = (url.searchParams.get('s') || 's1').replace(/[^a-z0-9-]/gi, '').slice(0, 20) || 's1';
  const store = getStore('scores');
  const key = 'board-' + season;
  const board = (await store.get(key, { type: 'json' })) || {};
  let id = String(url.searchParams.get('id') || '').slice(0, 40);

  if (req.method === 'POST') {
    let b;
    try { b = await req.json(); } catch { return Response.json({ error: 'json' }, { status: 400 }); }
    id = String(b.id || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40);
    const name = clean(b.name), score = Math.floor(Number(b.score)), level = Math.floor(Number(b.level)) || 1;
    if (id.length < 8 || name.length < 2 || !Number.isFinite(score) || score < 0 || score > MAX_SCORE) {
      return Response.json({ error: 'invalid' }, { status: 400 });
    }
    const prev = board[id];
    board[id] = { n: name, s: Math.max(score, prev ? prev.s : 0), l: Math.min(999, Math.max(level, prev ? prev.l : 1)), t: Date.now() };
    const ids = Object.keys(board);
    if (ids.length > MAX_PLAYERS) { // on garde les meilleurs
      ids.sort((a, c) => board[c].s - board[a].s).slice(MAX_PLAYERS).forEach((k) => { if (k !== id) delete board[k]; });
    }
    await store.setJSON(key, board);
  } else if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const all = Object.entries(board).sort((a, c) => c[1].s - a[1].s);
  const rank = all.findIndex(([k]) => k === id);
  return Response.json({
    top: all.slice(0, TOP).map(([k, e], i) => ({ r: i + 1, n: e.n, s: e.s, l: e.l, me: k === id })), // les identifiants ne sortent jamais
    me: rank >= 0 ? { r: rank + 1, n: all[rank][1].n, s: all[rank][1].s, l: all[rank][1].l } : null,
    count: all.length,
  }, { headers: { 'Cache-Control': 'no-store' } });
};

export const config = { path: '/api/scores' };
