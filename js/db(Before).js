// ডেটা লেয়ার: Firebase কনফিগার করা থাকলে লাইভ ডেটাবেস, না থাকলে DEMO MODE (localStorage)।
import { FIREBASE_CONFIG, STAFF, DEMO_STAFF } from './config.js';
import { DEFAULT_SETTINGS, DEFAULT_CATEGORIES, DEFAULT_MENU, DEFAULT_GALLERY } from './defaults.js';

export const configured = !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
export const mode = configured ? 'firebase' : 'demo';
const clean = x => JSON.parse(JSON.stringify(x));
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(10)), b => b.toString(36).padStart(2, '0')).join('').slice(0, 20);

/* ---------------- Firebase backend ---------------- */
async function firebaseBackend() {
  const base = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const [{ initializeApp }, fs, au] = await Promise.all([
    import(base + 'firebase-app.js'), import(base + 'firebase-firestore.js'), import(base + 'firebase-auth.js')]);
  const app = initializeApp(FIREBASE_CONFIG);
  const db = fs.getFirestore(app), auth = au.getAuth(app);
  const conv = d => { const o = { id: d.id, ...d.data({ serverTimestamps: 'estimate' }) };
    for (const k in o) if (o[k] && typeof o[k].toMillis === 'function') o[k] = o[k].toMillis(); return o; };
  return {
    sub(col, cb, o = {}) {
      const c = []; if (o.orderBy) c.push(fs.orderBy(o.orderBy, o.dir || 'asc')); if (o.limit) c.push(fs.limit(o.limit));
      return fs.onSnapshot(fs.query(fs.collection(db, col), ...c), s => cb(s.docs.map(conv)), e => { console.warn(col, e.code); cb([], e); });
    },
    subDoc(col, id, cb) {
      return fs.onSnapshot(fs.doc(db, col, id), s => cb(s.exists() ? conv(s) : null), e => { console.warn(col, e.code); cb(null, e); });
    },
    async set(col, id, data) { await fs.setDoc(fs.doc(db, col, id), clean(data)); },
    async add(col, data) { const r = await fs.addDoc(fs.collection(db, col), { ...clean(data), createdAt: fs.serverTimestamp() }); return r.id; },
    async update(col, id, data) { await fs.updateDoc(fs.doc(db, col, id), { ...clean(data), updatedAt: fs.serverTimestamp() }); },
    async del(col, id) { await fs.deleteDoc(fs.doc(db, col, id)); },
    async createOrder(order) {
      const ref = fs.doc(fs.collection(db, 'orders')), cref = fs.doc(db, 'counters', 'orders');
      let n = 0;
      await fs.runTransaction(db, async tx => {
        const s = await tx.get(cref); n = s.exists() ? s.data().n + 1 : 1;
        tx.set(cref, { n });
        tx.set(ref, { ...clean(order), orderNo: 100 + n, status: 'pending', createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp() });
      });
      return { id: ref.id, orderNo: 100 + n };
    },
    login: (e, p) => au.signInWithEmailAndPassword(auth, e, p).then(r => ({ email: r.user.email })),
    logout: () => au.signOut(auth),
    onAuth: cb => au.onAuthStateChanged(auth, u => cb(u ? { email: u.email } : null))
  };
}

/* ---------------- Demo backend (localStorage) ---------------- */
function demoBackend() {
  const KEY = 'rc_demo_db', AKEY = 'rc_demo_auth';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = d => localStorage.setItem(KEY, JSON.stringify(d));
  const subs = new Set(), authSubs = new Set();
  const emit = () => subs.forEach(f => f());
  addEventListener('storage', e => { if (e.key === KEY) emit(); if (e.key === AKEY) authSubs.forEach(f => f()); });
  const list = (col, o = {}) => {
    let a = Object.entries(load()[col] || {}).map(([id, v]) => ({ id, ...v }));
    if (o.orderBy) a.sort((x, y) => ((x[o.orderBy] ?? 0) > (y[o.orderBy] ?? 0) ? 1 : -1) * (o.dir === 'desc' ? -1 : 1));
    return o.limit ? a.slice(0, o.limit) : a;
  };
  const mut = (col, id, fn) => { const d = load(); d[col] = d[col] || {}; fn(d[col], id, d); save(d); emit(); };
  const watch = fn => { subs.add(fn); fn(); return () => subs.delete(fn); };
  const cur = () => { try { return JSON.parse(sessionStorage.getItem(AKEY)); } catch { return null; } };
  return {
    sub: (col, cb, o) => watch(() => cb(list(col, o))),
    subDoc: (col, id, cb) => watch(() => { const v = (load()[col] || {})[id]; cb(v ? { id, ...v } : null); }),
    async set(col, id, data) { mut(col, id, c => { c[id] = clean(data); }); },
    async add(col, data) { const id = rid(); mut(col, id, c => { c[id] = { ...clean(data), createdAt: Date.now() }; }); return id; },
    async update(col, id, data) { mut(col, id, c => { if (c[id]) c[id] = { ...c[id], ...clean(data), updatedAt: Date.now() }; }); },
    async del(col, id) { mut(col, id, c => { delete c[id]; }); },
    async createOrder(order) {
      const id = rid(); let n = 0;
      mut('orders', id, (c, _i, d) => { d.counter = (d.counter || 0) + 1; n = d.counter;
        c[id] = { ...clean(order), orderNo: 100 + n, status: 'pending', createdAt: Date.now(), updatedAt: Date.now() }; });
      return { id, orderNo: 100 + n };
    },
    async login(e, p) {
      if (DEMO_STAFF[e] && DEMO_STAFF[e] === p) { sessionStorage.setItem(AKEY, JSON.stringify({ email: e })); authSubs.forEach(f => f()); return { email: e }; }
      throw Object.assign(new Error('bad'), { code: 'auth/invalid-credential' });
    },
    async logout() { sessionStorage.removeItem(AKEY); authSubs.forEach(f => f()); },
    onAuth: cb => { const f = () => cb(cur()); authSubs.add(f); f(); return () => authSubs.delete(f); }
  };
}

const B = configured ? await firebaseBackend() : demoBackend();
export const { sub, subDoc, set, add, update, del, createOrder, login, logout, onAuth } = B;

export const roleOf = email => !email ? null
  : STAFF.admin.map(s => s.toLowerCase()).includes(email.toLowerCase()) ? 'admin'
  : STAFF.kitchen.map(s => s.toLowerCase()).includes(email.toLowerCase()) ? 'kitchen' : null;

/* ---------------- Settings (merged with defaults) ---------------- */
const merge = (d, s) => { if (Array.isArray(d) || typeof d !== 'object' || d === null) return s === undefined ? d : s;
  const o = { ...d }; for (const k in (s || {})) o[k] = (k in d) ? merge(d[k], s[k]) : s[k]; return o; };
export let settings = clean(DEFAULT_SETTINGS);
let settingsRaw = null; const sl = new Set();
B.subDoc('settings', 'site', d => { settingsRaw = d; settings = merge(DEFAULT_SETTINGS, d || {}); sl.forEach(f => f(settings)); });
export const onSettings = cb => { sl.add(cb); cb(settings); return () => sl.delete(cb); };
export const getRawSettings = () => settingsRaw;
export const saveSettings = data => B.set('settings', 'site', merge(settingsRaw || {}, data));

/* ---------------- Public menu & gallery (fall back to defaults until seeded) ---------------- */
function watchPair(colA, colB, build, cb) {
  let a = [], b = []; const run = () => cb(build(a, b));
  const u = [B.sub(colA, x => { a = x; run(); }, { orderBy: 'order' }), colB && B.sub(colB, x => { b = x; run(); }, { orderBy: 'order' }), onSettings(run)];
  return () => u.forEach(f => f && f());
}
export const watchMenu = cb => watchPair('categories', 'menu', (cats, items) => settings.menuSeeded
  ? { categories: cats, items } : { categories: DEFAULT_CATEGORIES, items: DEFAULT_MENU }, cb);
export const watchGallery = cb => watchPair('gallery', null, g => settings.gallerySeeded ? g : DEFAULT_GALLERY, cb);

export async function seedMenu() {
  for (const c of DEFAULT_CATEGORIES) await B.set('categories', c.id, c);
  for (const m of DEFAULT_MENU) await B.set('menu', m.id, m);
  await saveSettings({ menuSeeded: true });
}
export async function seedGallery() {
  for (const g of DEFAULT_GALLERY) await B.set('gallery', g.id, g);
  await saveSettings({ gallerySeeded: true });
}
export const uid = rid;
