/* Servidor da loja — Node.js + Express
   Salva tudo em data/db.json (produtos, pedidos, campanhas, configurações).
   Variáveis de ambiente:
     ADMIN_PASSWORD  senha do painel (obrigatória em produção)
     DATA_DIR        pasta onde fica o db.json (padrão: ./data)
     PORT            porta (o Render define sozinho)
*/
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
if (!process.env.ADMIN_PASSWORD) console.warn('⚠️  ADMIN_PASSWORD não definida — usando a senha "admin". Defina no Render!');

/* ---------- banco em arquivo ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
const EMPTY = {
  settings: {
    name: 'Minha Loja', tagline: 'Utilidades para casa', whatsapp: '', instagram: '', address: '', hours: '',
    primary: '#0E4D4A', accent: '#FF6B4A', freeShip: 0,
    topbar: ['Peça pelo WhatsApp e retire na loja'],
    heroes: [{ eyebrow: 'Bem-vindo', title: 'Conheça nossa', highlight: 'loja', text: 'Cadastre suas campanhas no painel.', btn: 'Ver produtos', art: 'natal', active: true }],
    values: [
      { t: 'Favoritos confiáveis', d: 'Produtos que resistem ao teste do tempo.' },
      { t: 'Abordagem inovadora', d: 'Função e design pensados para o dia a dia.' },
      { t: 'Sempre melhorando', d: 'Novidades toda semana na nossa vitrine.' }
    ]
  },
  categories: ['Armazenar', 'Para levar', 'Cozinhar e aquecer', 'Servir', 'Preparar'],
  products: [], orders: [], seq: 100
};
let db;
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
catch (e) {
  // primeira vez (ou disco apagado): começa com o catálogo inicial do seed.json
  db = JSON.parse(JSON.stringify(EMPTY));
  try {
    const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));
    db = { ...db, ...seed, settings: { ...db.settings, ...(seed.settings || {}) } };
    console.log('Catálogo inicial carregado do seed.json:', db.products.length, 'produtos');
  } catch (e2) {}
}
let saving = Promise.resolve();
function persist() {
  const snapshot = JSON.stringify(db);
  saving = saving.then(() => new Promise(res => {
    const tmp = DB_FILE + '.tmp';
    fs.writeFile(tmp, snapshot, err => { if (err) { console.error(err); return res(); } fs.rename(tmp, DB_FILE, () => res()); });
  }));
  return saving;
}

/* ---------- auth simples por token ---------- */
const tokens = new Map(); // token -> expira em
const TTL = 1000 * 60 * 60 * 24 * 7;
function auth(req, res, next) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  const exp = tokens.get(t);
  if (!exp || exp < Date.now()) return res.status(401).json({ error: 'Não autorizado' });
  next();
}
const attempts = new Map();
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

const imgOk = v => typeof v === 'string' && (v === '' || v.startsWith('data:image/') || /^\/img\/[\w\-\/.]+$/.test(v));
/* ---------- regras de pedido ---------- */
const str = (v, n) => String(v == null ? '' : v).slice(0, n);
function makeOrder(body, manual) {
  const items = [];
  for (const it of (Array.isArray(body.items) ? body.items : [])) {
    const p = db.products.find(x => x.id === String(it.id));
    const qty = Math.max(1, parseInt(it.qty) || 1);
    if (!p || (!manual && !p.active)) throw new Error('Produto não encontrado');
    if (p.stock < qty) throw new Error(`Estoque insuficiente: ${p.name} (restam ${p.stock})`);
    items.push({ id: p.id, name: p.name, price: manual && it.price != null ? +it.price : p.price, cost: p.cost || 0, qty });
  }
  if (!items.length) throw new Error('Carrinho vazio');
  items.forEach(it => { db.products.find(x => x.id === it.id).stock -= it.qty; });
  const c = body.customer || {};
  const o = {
    id: String(++db.seq), date: Date.now(), items,
    total: +items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2),
    customer: { name: str(c.name, 80), phone: str(c.phone, 30), delivery: str(c.delivery, 40), address: str(c.address, 200) },
    payment: str(body.payment, 40), status: manual ? (STATUS.includes(body.status) ? body.status : 'pago') : 'novo',
    channel: manual ? 'manual' : 'site', note: str(body.note, 300)
  };
  db.orders.unshift(o);
  return o;
}
const STATUS = ['novo', 'pago', 'separado', 'entregue', 'cancelado'];
function setStatus(id, status) {
  if (!STATUS.includes(status)) throw new Error('Status inválido');
  const o = db.orders.find(x => x.id === id); if (!o) throw new Error('Pedido não encontrado');
  const was = o.status === 'cancelado', is = status === 'cancelado';
  const move = sign => o.items.forEach(i => { const p = db.products.find(x => x.id === i.id); if (p) p.stock += sign * i.qty; });
  if (!was && is) move(1);
  if (was && !is) move(-1);
  o.status = status; return o;
}
function cleanProduct(b, old) {
  return {
    ...(old || {}),
    id: old ? old.id : String(Date.now()) + Math.floor(Math.random() * 1000),
    name: str(b.name, 140).trim(), category: str(b.category, 60),
    price: Math.max(0, +b.price || 0), oldPrice: Math.max(0, +b.oldPrice || 0), cost: Math.max(0, +b.cost || 0),
    stock: parseInt(b.stock) || 0,
    colors: (Array.isArray(b.colors) ? b.colors : []).filter(c => /^#[0-9a-f]{3,8}$/i.test(c)).slice(0, 4),
    image: imgOk(b.image) ? b.image : (old ? old.image : ''),
    art: str(b.art || (old && old.art) || '', 20),
    description: str(b.description, 2000), active: b.active !== false, novo: !!b.novo, destaque: !!b.destaque,
    created: old ? old.created : Date.now()
  };
}

/* ---------- app ---------- */
const app = express();
app.use(express.json({ limit: '25mb' }));
const wrap = fn => (req, res) => { try { const r = fn(req, res); if (r !== undefined) res.json(r); } catch (e) { res.status(400).json({ error: e.message }); } };

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.get('/api/store', wrap(() => {
  const sold = {};
  db.orders.filter(o => o.status !== 'cancelado').forEach(o => o.items.forEach(i => { sold[i.id] = (sold[i.id] || 0) + i.qty; }));
  return { settings: db.settings, categories: db.categories, products: db.products.filter(p => p.active).map(({ cost, ...p }) => p), sold };
}));

app.post('/api/orders', wrap((req) => { const o = makeOrder(req.body, false); persist(); return o; }));

app.post('/api/login', (req, res) => {
  const ip = req.ip; const a = attempts.get(ip) || { n: 0, t: 0 };
  if (a.n >= 8 && Date.now() - a.t < 15 * 60 * 1000) return res.status(429).json({ error: 'Muitas tentativas. Aguarde 15 minutos.' });
  if (!safeEqual(req.body.password || '', ADMIN_PASSWORD)) { attempts.set(ip, { n: a.n + 1, t: Date.now() }); return res.status(400).json({ error: 'Senha incorreta' }); }
  attempts.delete(ip);
  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, Date.now() + TTL);
  res.json({ token });
});

app.get('/api/admin/data', auth, wrap(() => db));

app.put('/api/admin/settings', auth, wrap(req => {
  const s = req.body.settings || {};
  const allowed = ['name', 'tagline', 'whatsapp', 'instagram', 'address', 'hours', 'primary', 'accent', 'freeShip', 'topbar', 'heroes', 'values', 'content'];
  for (const k of allowed) if (k in s) db.settings[k] = s[k];
  if (s.content && typeof s.content === 'object') {
    const c = { ...s.content };
    for (const k of ['logo', 'favicon', 'bannerImage']) if (!imgOk(c[k])) c[k] = '';
    db.settings.content = c;
  }
  if (Array.isArray(s.heroes)) db.settings.heroes = s.heroes.slice(0, 12).map(h => ({
    eyebrow: str(h.eyebrow, 60), title: str(h.title, 120), highlight: str(h.highlight, 80), text: str(h.text, 240), btn: str(h.btn, 40),
    art: ['natal', 'oferta', 'organiza'].includes(h.art) ? h.art : 'natal', link: str(h.link, 120), start: str(h.start, 10), end: str(h.end, 10),
    textColor: ['auto', 'light', 'dark', 'none'].includes(h.textColor) ? h.textColor : 'auto', active: h.active !== false,
    image: imgOk(h.image) ? h.image : '', imageMobile: imgOk(h.imageMobile) ? h.imageMobile : ''
  }));
  if (Array.isArray(req.body.categories) && req.body.categories.length) db.categories = req.body.categories.map(c => str(c, 60)).filter(Boolean);
  persist(); return db;
}));

app.post('/api/admin/products', auth, wrap(req => {
  const old = req.body.id ? db.products.find(p => p.id === String(req.body.id)) : null;
  const p = cleanProduct(req.body, old);
  if (!p.name) throw new Error('Informe o nome');
  if (old) db.products[db.products.indexOf(old)] = p; else db.products.unshift(p);
  persist(); return p;
}));
app.delete('/api/admin/products/:id', auth, wrap(req => { db.products = db.products.filter(p => p.id !== req.params.id); persist(); return { ok: true }; }));

app.post('/api/admin/orders', auth, wrap(req => { const o = makeOrder(req.body, true); persist(); return o; }));
app.put('/api/admin/orders/:id', auth, wrap(req => { const o = setStatus(req.params.id, req.body.status); persist(); return o; }));
app.delete('/api/admin/orders/:id', auth, wrap(req => {
  const o = db.orders.find(x => x.id === req.params.id);
  if (o && o.status !== 'cancelado') setStatus(o.id, 'cancelado');
  db.orders = db.orders.filter(x => x.id !== req.params.id); persist(); return { ok: true };
}));
app.post('/api/admin/import', auth, wrap(req => {
  const d = req.body;
  if (!d || !Array.isArray(d.products) || !d.settings) throw new Error('Arquivo de backup inválido');
  db = { ...JSON.parse(JSON.stringify(EMPTY)), ...d }; persist(); return db;
}));

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.listen(PORT, () => console.log(`Loja rodando em http://localhost:${PORT}  (painel: /admin.html)`));
