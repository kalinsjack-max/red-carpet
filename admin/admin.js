import { LOGIN_HTML, guard, confirmBox, promptBox } from '../js/staff.js';
import * as DB from '../js/db.js';
import { tr, num, money, esc } from '../js/i18n.js';
import { DEFAULT_SETTINGS, DEFAULT_GALLERY } from '../js/defaults.js';

document.getElementById('loginMount').innerHTML = LOGIN_HTML('অ্যাডমিন প্যানেল');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const S = () => DB.settings;
let st = { orders: [], bookings: [], cats: [], menu: [], gallery: [] }, view = 'dash', ofilter = { status: 'all', day: 'today' }, ready = false;

const NAV = [['dash', 'fa-gauge', 'সারসংক্ষেপ'], ['orders', 'fa-receipt', 'অর্ডার'], ['bookings', 'fa-calendar-check', 'বুকিং'], ['menu', 'fa-utensils', 'মেনু ও দাম'],
  ['content', 'fa-pen-to-square', 'সাইটের লেখা ও সেটিং'], ['services', 'fa-star', 'সেবাসমূহ'], ['gallery', 'fa-images', 'গ্যালারি'], ['qr', 'fa-qrcode', 'টেবিল QR']];
const ST_O = { pending: 'পেন্ডিং', preparing: 'প্রস্তুত হচ্ছে', ready: 'রেডি', completed: 'সম্পন্ন (Done)', cancelled: 'বাতিল' }, ST_B = { new: 'নতুন', confirmed: 'নিশ্চিত', cancelled: 'বাতিল' };
const IND_O = { pending: '⏳ কনফার্ম হয়নি', preparing: '✅ কনফার্ম — প্রস্তুত হচ্ছে', ready: '✅ কনফার্ম — রেডি', completed: '✔ সম্পন্ন', cancelled: '✖ বাতিল' }, IND_B = { new: '⏳ কনফার্ম হয়নি', confirmed: '✅ কনফার্ম হয়েছে', cancelled: '✖ বাতিল' };
const when = ms => ms ? new Date(ms).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }) : '';
const dayStart = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const say = (m, bad) => { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 2400); };
const beep = () => { try { const c = new AudioContext(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 988; g.gain.setValueAtTime(.3, c.currentTime); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + .4); o.start(); o.stop(c.currentTime + .4); } catch {} };
const csv = (name, rows) => { const b = new Blob(['\ufeff' + rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n')], { type: 'text/csv' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); };
const sure = (title, message, ok = 'হ্যাঁ, মুছে ফেলুন') => confirmBox({ icon: 'fa-trash-can', title, message, ok, cancel: 'না, থাক' });
const act = async (fn, ok = 'সেভ হয়েছে ✓') => { try { await fn(); say(ok); } catch (e) { console.error(e); say('হয়নি — ইন্টারনেট/পারমিশন দেখুন', true); } };

/* ---------- image upload (resized, stored inside the database) ---------- */
function pickImage(maxW, cb, q = .78) {
  const f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*';
  f.onchange = () => { const file = f.files[0]; if (!file) return; const img = new Image(); img.onload = () => {
    const k = Math.min(1, maxW / img.width), c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); cb(c.toDataURL('image/jpeg', q)); }; img.src = URL.createObjectURL(file); };
  f.click();
}

/* ---------- generic settings form helpers ---------- */
const val = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const inp = (p, { type = 'text', rows } = {}) => { const v = val(S(), p) ?? ''; return rows ? `<textarea data-path="${p}" rows="${rows}">${esc(v)}</textarea>` : `<input data-path="${p}" type="${type}" value="${esc(v)}">`; };
const bnen = (p, label, rows) => `<div class="fld">${label}<div class="bnen"><div><label>বাংলা</label>${inp(p + '.bn', { rows })}</div><div><label>English</label>${inp(p + '.en', { rows })}</div></div></div>`;
const one = (p, label, type = 'text', hint = '') => `<label class="fld">${label}${hint ? `<small>${hint}</small>` : ''}${inp(p, { type })}</label>`;
const sw = (p, label) => `<label class="sw"><input type="checkbox" data-path="${p}" ${val(S(), p) ? 'checked' : ''}> ${label}</label>`;
const setPath = (o, p, v) => { const k = p.split('.'); k.slice(0, -1).forEach((x, i) => { if (o[x] == null) o[x] = /^\d+$/.test(k[i + 1]) ? [] : {}; o = o[x]; }); o[k.at(-1)] = v; };
const collect = root => { const next = structuredClone(S()); delete next.id; $$('[data-path]', root).forEach(e => setPath(next, e.dataset.path, e.type === 'checkbox' ? e.checked : e.type === 'number' ? +e.value : e.value)); return next; };

const SALES7 = () => { const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 6 + i); return d.getTime(); });
  const v = days.map(t => st.orders.filter(o => o.status !== 'cancelled' && o.createdAt >= t && o.createdAt < t + 864e5).reduce((a, o) => a + o.total, 0)), mx = Math.max(1, ...v);
  return days.map((t, i) => ({ v: v[i], h: Math.max(3, Math.round(v[i] / mx * 100)), l: new Date(t).toLocaleDateString('bn-BD', { weekday: 'short' }) })); };
const TOPDISH = () => { const m = {}; st.orders.filter(o => o.status !== 'cancelled').forEach(o => o.items.forEach(i => { const n = tr(i.name); m[n] = (m[n] || 0) + i.qty; }));
  return Object.entries(m).map(([n, q]) => ({ n, q })).sort((a, b) => b.q - a.q).slice(0, 5); };

/* ---------- views ---------- */
const V = {};
V.dash = () => {
  const today = st.orders.filter(o => o.createdAt >= dayStart()), live = today.filter(o => o.status !== 'cancelled');
  const newB = st.bookings.filter(b => b.status === 'new').length;
  return `<h1>সারসংক্ষেপ</h1>
  <div class="stats"><div class="stat"><small>আজকের অর্ডার</small><b>${num(live.length)}</b></div><div class="stat"><small>আজকের বিক্রি</small><b>${money(live.reduce((a, o) => a + o.total, 0))}</b></div>
    <div class="stat"><small>পেন্ডিং (নতুন)</small><b>${num(st.orders.filter(o => o.status === 'pending').length)}</b></div><div class="stat"><small>এখন প্রস্তুত হচ্ছে</small><b>${num(st.orders.filter(o => o.status === 'preparing').length)}</b></div><div class="stat"><small>নতুন বুকিং</small><b>${num(newB)}</b></div></div>
  <div class="grid2"><div class="panel"><h2>গত ৭ দিনের বিক্রি</h2><div class="bars">${SALES7().map(d => `<div class="bar"><b>${d.v ? money(d.v) : ''}</b><span style="height:${d.h}%"></span><small>${d.l}</small></div>`).join('')}</div></div>
  <div class="panel"><h2>সেরা বিক্রিত খাবার <small class="muted">(সাম্প্রতিক অর্ডার থেকে)</small></h2><ul class="toplist">${TOPDISH().map((t, i) => `<li><span><i>${num(i + 1)}</i>${esc(t.n)}</span><b>${num(t.q)}×</b></li>`).join('') || '<li class="muted">এখনো কোনো ডেটা নেই</li>'}</ul></div></div>
  <div class="panel"><h2>অনলাইন অর্ডার</h2><label class="sw"><input type="checkbox" id="qOpen" ${S().ordering.open ? 'checked' : ''}> অনলাইন অর্ডার চালু আছে <small class="muted">(বন্ধ করলে কাস্টমার অর্ডার পাঠাতে পারবে না)</small></label>
    <div class="row"><a class="btn dark" href="../kitchen/" target="_blank"><i class="fa-solid fa-fire-burner"></i> কিচেন ড্যাশবোর্ড খুলুন</a><a class="btn ghost" href="../index.html" target="_blank"><i class="fa-solid fa-globe"></i> ওয়েবসাইট দেখুন</a></div></div>
  <div class="grid2"><div class="panel"><h2>সাম্প্রতিক অর্ডার</h2>${st.orders.slice(0, 6).map(o => `<p>#${num(o.orderNo)} · ${o.type === 'takeaway' ? 'টেকঅ্যাওয়ে' : 'টেবিল ' + num(o.table)} · ${money(o.total)} <span class="pill p-${o.status}">${ST_O[o.status]}</span></p>`).join('') || '<p class="muted">এখনো কোনো অর্ডার নেই</p>'}</div>
  <div class="panel"><h2>সাম্প্রতিক বুকিং</h2>${st.bookings.slice(0, 6).map(b => `<p>${esc(b.name)} · ${esc(b.type)} · ${esc(b.date)} <span class="pill p-${b.status}">${ST_B[b.status] || b.status}</span></p>`).join('') || '<p class="muted">এখনো কোনো বুকিং নেই</p>'}</div></div>`;
};
V.dash.after = () => { const q = $('#qOpen'); if (q) q.onchange = () => act(() => DB.saveSettings({ ordering: { ...S().ordering, open: q.checked } })); };

V.orders = () => {
  let l = st.orders.filter(o => (ofilter.status === 'all' || o.status === ofilter.status) && (ofilter.day === 'all' || o.createdAt >= dayStart()));
  return `<h1>অর্ডার</h1><div class="panel"><div class="row sb"><div class="row"><select id="fSt" style="width:auto"><option value="all">সব স্ট্যাটাস</option>${Object.entries(ST_O).map(([k, v]) => `<option value="${k}" ${ofilter.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <select id="fDay" style="width:auto"><option value="today" ${ofilter.day === 'today' ? 'selected' : ''}>আজ</option><option value="all" ${ofilter.day === 'all' ? 'selected' : ''}>সব সময়</option></select></div>
    <button class="btn ghost sm" id="expO"><i class="fa-solid fa-file-csv"></i> CSV</button></div>
  <div class="tbw"><table class="tb"><thead><tr><th>#</th><th>সময়</th><th>কোথায়</th><th>কাস্টমার</th><th>খাবার</th><th>মোট</th><th>স্ট্যাটাস</th><th></th></tr></thead><tbody>
  ${l.map(o => `<tr data-id="${esc(o.id)}"><td><b>#${num(o.orderNo)}</b>${o.items.some(i => (i.r || 1) > 1) ? '<br><span class="pill p-confirmed" title="একই অর্ডারে আরও খাবার যোগ হয়েছে">+আরও</span>' : ''}</td><td>${when(o.createdAt)}</td><td>${o.type === 'takeaway' ? 'টেকঅ্যাওয়ে' : 'টেবিল ' + num(o.table)}</td><td>${esc(o.name)}${o.phone ? `<br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>` : ''}</td>
    <td>${o.items.map(i => `${(i.r || 1) > 1 ? '<span class="addtag">➕</span> ' : ''}${num(i.qty)}× ${esc(tr(i.name))}${i.variant ? ' (' + esc(tr(i.variant)) + ')' : ''}`).join('<br>')}${o.note ? `<br><em>নোট: ${esc(o.note)}</em>` : ''}</td><td>${money(o.total)}</td>
    <td><div class="stcell"><span class="pill p-${o.status}">${IND_O[o.status] || o.status}</span><select class="oSt" style="width:auto">${Object.entries(ST_O).map(([k, v]) => `<option value="${k}" ${o.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div></td><td><button class="btn bad sm oDel"><i class="fa-solid fa-trash"></i></button></td></tr>`).join('') || '<tr><td colspan="8" class="muted">কোনো অর্ডার নেই</td></tr>'}
  </tbody></table></div></div>`;
};
V.orders.after = () => {
  $('#fSt').onchange = e => { ofilter.status = e.target.value; render(); }; $('#fDay').onchange = e => { ofilter.day = e.target.value; render(); };
  $$('.oSt').forEach(s => s.onchange = () => act(() => DB.update('orders', s.closest('tr').dataset.id, { status: s.value })));
  $$('.oDel').forEach(b => b.onclick = async () => { const id = b.closest('tr').dataset.id, no = b.closest('tr').querySelector('b')?.textContent || '';
    if (await sure(`অর্ডার ${no} মুছে ফেলবেন?`, 'এটি স্থায়ীভাবে মুছে যাবে এবং আর ফেরানো যাবে না।')) act(() => DB.del('orders', id), 'মুছে ফেলা হয়েছে'); });
  $('#expO').onclick = () => csv('orders.csv', [['No', 'Time', 'Type', 'Table', 'Name', 'Phone', 'Items', 'Note', 'Total', 'Status'], ...st.orders.map(o => [o.orderNo, when(o.createdAt), o.type, o.table, o.name, o.phone, o.items.map(i => `${i.qty}x ${i.name?.en || tr(i.name)}`).join('; '), o.note, o.total, o.status])]);
};

V.bookings = () => `<h1>বুকিং</h1><div class="panel"><div class="row sb"><p class="muted">কাস্টমারের পাঠানো তথ্য এখানে সরাসরি আসে।</p><button class="btn ghost sm" id="expB"><i class="fa-solid fa-file-csv"></i> CSV</button></div>
  <div class="tbw"><table class="tb"><thead><tr><th>পাঠানো</th><th>নাম ও ফোন</th><th>কী বুক</th><th>তারিখ ও সময়</th><th>অতিথি</th><th>নোট</th><th>স্ট্যাটাস</th><th></th></tr></thead><tbody>
  ${st.bookings.map(b => { const w = '88' + String(b.phone).replace(/\D/g, '').replace(/^88/, '').replace(/^0?/, '0'); return `<tr data-id="${esc(b.id)}"><td>${when(b.createdAt)}</td><td><b>${esc(b.name)}</b><br><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a> · <a href="https://wa.me/${w}" target="_blank" rel="noopener">WhatsApp</a></td><td>${esc(b.type)}</td><td>${esc(b.date)} ${esc(b.time || '')}</td><td>${b.guests ? num(b.guests) : ''}</td><td>${esc(b.note)}</td>
    <td><div class="stcell"><span class="pill p-${b.status}">${IND_B[b.status] || b.status}</span><select class="bSt" style="width:auto">${Object.entries(ST_B).map(([k, v]) => `<option value="${k}" ${b.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div></td><td><button class="btn bad sm bDel"><i class="fa-solid fa-trash"></i></button></td></tr>`; }).join('') || '<tr><td colspan="8" class="muted">এখনো কোনো বুকিং নেই</td></tr>'}</tbody></table></div></div>`;
V.bookings.after = () => {
  $$('.bSt').forEach(s => s.onchange = () => act(() => DB.update('bookings', s.closest('tr').dataset.id, { status: s.value })));
  $$('.bDel').forEach(b => b.onclick = async () => { const id = b.closest('tr').dataset.id, nm = b.closest('tr').querySelector('b')?.textContent || '';
    if (await sure('এই বুকিং মুছে ফেলবেন?', nm ? `"${nm}"-এর বুকিংটি স্থায়ীভাবে মুছে যাবে।` : 'বুকিংটি স্থায়ীভাবে মুছে যাবে।')) act(() => DB.del('bookings', id), 'মুছে ফেলা হয়েছে'); });
  $('#expB').onclick = () => csv('bookings.csv', [['Received', 'Name', 'Phone', 'Service', 'Date', 'Time', 'Guests', 'Note', 'Status'], ...st.bookings.map(b => [when(b.createdAt), b.name, b.phone, b.type, b.date, b.time, b.guests, b.note, b.status])]);
};

/* ---- menu ---- */
const seedBox = (what, seedFn, flag, extra = '') => `<div class="panel"><h2>${what} এখনো ডেটাবেসে নেই</h2><p>ওয়েবসাইট এখন ডিফল্ট ${what} দেখাচ্ছে। এডিট করতে আগে ডিফল্ট ডেটা ইমপোর্ট করুন (এক ক্লিকে সব আসবে), অথবা খালি থেকে শুরু করুন।</p>
  <div class="row"><button class="btn" id="seed"><i class="fa-solid fa-download"></i> ডিফল্ট ইমপোর্ট করুন</button><button class="btn ghost" id="seedEmpty">খালি থেকে শুরু</button>${extra}</div></div>`;
const IMPORT_BTN = `<button class="btn dark" id="impMenu" type="button"><i class="fa-solid fa-file-import"></i> পুরো মেনু ইমপোর্ট (ফাইল থেকে)</button>`;
/* ---- one-click full menu import from a menu-import.json file ---- */
const inBatches = async (arr, fn, n = 12) => { for (let i = 0; i < arr.length; i += n) await Promise.all(arr.slice(i, i + n).map(fn)); };
const askImportMode = (nc, ni) => new Promise(res => {
  const m = modal(`<h3>মেনু ইমপোর্ট</h3><p style="margin-bottom:14px">ফাইলে <b>${num(nc)}</b>টি ক্যাটাগরি ও <b>${num(ni)}</b>টি খাবার আছে। আপনার বর্তমান মেনুতে ${num(st.cats.length)}টি ক্যাটাগরি ও ${num(st.menu.length)}টি খাবার আছে।</p>
    <div class="row" style="flex-direction:column;align-items:stretch">
    <button class="btn" id="imR" type="button">পুরনো মেনু মুছে নতুন মেনু বসান (সুপারিশ করা হয়)</button>
    <button class="btn ghost" id="imA" type="button">পুরনো মেনু রেখে নতুনগুলো যোগ করুন</button>
    <button class="btn ghost" id="imC" type="button">বাতিল</button></div>`, m => {
    let done = false; const fin = v => { if (!done) { done = true; res(v); } };
    $('#imR', m).onclick = () => { fin('replace'); m.remove(); }; $('#imA', m).onclick = () => { fin('add'); m.remove(); }; $('#imC', m).onclick = () => { fin(null); m.remove(); };
    const mo = new MutationObserver(() => { if (!document.body.contains(m)) { mo.disconnect(); fin(null); } }); mo.observe(document.body, { childList: true });
  });
});
function importMenu() {
  const f = document.createElement('input'); f.type = 'file'; f.accept = '.json,application/json';
  f.onchange = async () => {
    const file = f.files[0]; if (!file) return;
    let data; try { data = JSON.parse(await file.text()); } catch { return say('ফাইলটি পড়া যাচ্ছে না — সঠিক menu-import.json ফাইল দিন', true); }
    const okId = x => typeof x === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(x), str = (x, n) => String(x ?? '').slice(0, n);
    const bnen = o => ({ bn: str(o?.bn ?? o?.en, 200), en: str(o?.en ?? o?.bn, 200) });
    if (!Array.isArray(data.categories) || !Array.isArray(data.items) || !data.categories.length) return say('ফাইলে ক্যাটাগরি/খাবারের তালিকা নেই', true);
    const catIds = new Set(data.categories.map(c => c.id));
    const bad = data.categories.find(c => !okId(c.id) || !(c.name?.bn || c.name?.en)) || data.items.find(i => !okId(i.id) || !catIds.has(i.cat) || !(i.name?.bn || i.name?.en) || !Array.isArray(i.variants) || !i.variants.length || i.variants.some(v => !(+v.price >= 0)));
    if (bad) return say('ফাইলে ভুল আছে: ' + (bad.name?.en || bad.name?.bn || bad.id), true);
    const mode = (st.cats.length || st.menu.length) ? await askImportMode(data.categories.length, data.items.length) : 'replace';
    if (!mode) return;
    const base = mode === 'add' ? Math.max(-1, ...st.cats.map(c => c.order ?? 0)) + 1 : 0, perCat = {};
    const cats = data.categories.map((c, i) => ({ id: c.id, name: bnen(c.name), icon: str(c.icon || 'fa-utensils', 40), order: base + i }));
    const items = data.items.map(i => { const old = st.menu.find(x => x.id === i.id); perCat[i.cat] = (perCat[i.cat] ?? -1) + 1;
      const o = { id: i.id, cat: i.cat, name: bnen(i.name), desc: { bn: str(i.desc?.bn, 400), en: str(i.desc?.en, 400) }, image: old?.image || '', available: old ? old.available !== false : true, featured: !!i.featured, order: perCat[i.cat],
        variants: i.variants.map(v => ({ label: v.label && (v.label.bn || v.label.en) ? bnen(v.label) : null, price: Math.max(0, +v.price || 0) })) };
      return o; });
    if (mode === 'add') { const mx = {}; st.menu.forEach(x => { mx[x.cat] = Math.max(mx[x.cat] ?? -1, x.order ?? 0); }); const seen = {}; items.forEach(o => { seen[o.cat] = (seen[o.cat] ?? -1) + 1; o.order = (mx[o.cat] ?? -1) + 1 + seen[o.cat]; }); }
    const total = (mode === 'replace' ? st.menu.length + st.cats.length : 0) + cats.length + items.length;
    const prog = modal(`<h3>মেনু ইমপোর্ট হচ্ছে…</h3><p id="impP" style="margin-bottom:6px">শুরু হচ্ছে…</p><p class="muted">দয়া করে এই পেজ বন্ধ করবেন না।</p>`); prog.onclick = null;
    let n = 0; const tick = () => { n++; const e = $('#impP', prog); if (e) e.textContent = `${num(Math.min(n, total))} / ${num(total)} সম্পন্ন`; };
    await act(async () => {
      try {
        if (mode === 'replace') {
          await inBatches(st.menu.filter(x => !items.some(i => i.id === x.id)), async x => { await DB.del('menu', x.id); tick(); });
          await inBatches(st.cats.filter(x => !cats.some(c => c.id === x.id)), async x => { await DB.del('categories', x.id); tick(); });
        }
        await inBatches(cats, async c => { await DB.set('categories', c.id, c); tick(); });
        await inBatches(items, async i => { await DB.set('menu', i.id, i); tick(); });
        await DB.saveSettings({ menuSeeded: true });
      } finally { prog.remove(); }
    }, `মেনু ইমপোর্ট সম্পন্ন ✓ (${num(cats.length)}টি ক্যাটাগরি, ${num(items.length)}টি খাবার)`);
  };
  f.click();
}
V.menu = () => {
  if (!S().menuSeeded) return `<h1>মেনু ও দাম</h1>` + seedBox('মেনু', null, null, IMPORT_BTN);
  const cats = [...st.cats].sort((a, b) => a.order - b.order);
  return `<h1>মেনু ও দাম</h1><div class="row" style="margin-bottom:12px"><button class="btn" id="addCat"><i class="fa-solid fa-folder-plus"></i> নতুন ক্যাটাগরি</button>${IMPORT_BTN}</div>
  ${cats.map((c, ci) => { const its = st.menu.filter(i => i.cat === c.id).sort((a, b) => a.order - b.order); return `<div class="panel" data-cat="${esc(c.id)}"><div class="cat-h" style="margin-top:0"><h3><i class="fa-solid ${esc(c.icon || 'fa-utensils')}"></i> ${esc(tr(c.name))} <small class="muted">(${num(its.length)})</small></h3>
    <div class="row"><button class="btn sm" data-addit="${esc(c.id)}"><i class="fa-solid fa-plus"></i> খাবার</button><button class="btn ghost sm" data-mvcat="-1" ${ci === 0 ? 'disabled' : ''}>↑</button><button class="btn ghost sm" data-mvcat="1" ${ci === cats.length - 1 ? 'disabled' : ''}>↓</button><button class="btn ghost sm" data-editcat>এডিট</button><button class="btn bad sm" data-delcat><i class="fa-solid fa-trash"></i></button></div></div>
    ${its.map((i, ii) => `<div class="menu-it ${i.available === false ? 'off' : ''}" data-id="${esc(i.id)}"><div class="th">${i.image ? `<img src="${esc(i.image)}" alt="">` : '<i class="fa-solid fa-utensils"></i>'}</div>
      <div><b>${esc(tr(i.name))}</b> ${i.featured ? '<span class="pill p-confirmed">জনপ্রিয়</span>' : ''} ${i.available === false ? '<span class="pill p-cancelled">শেষ</span>' : ''}<br><small>${(i.variants || []).map(v => (v.label ? esc(tr(v.label)) + ' ' : '') + money(v.price)).join(' · ')}</small></div>
      <div class="row"><button class="btn ghost sm" data-tog title="আজ শেষ / আবার চালু">${i.available === false ? 'চালু করুন' : 'শেষ'}</button><button class="btn ghost sm" data-mvit="-1" ${ii === 0 ? 'disabled' : ''}>↑</button><button class="btn ghost sm" data-mvit="1" ${ii === its.length - 1 ? 'disabled' : ''}>↓</button><button class="btn sm dark" data-edit>এডিট</button><button class="btn bad sm" data-del><i class="fa-solid fa-trash"></i></button></div></div>`).join('') || '<p class="muted">এই ক্যাটাগরিতে কোনো খাবার নেই</p>'}</div>`; }).join('')}`;
};
function modal(html, onMount) { const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div>${html}</div>`; document.body.append(m);
  // FIX: refresh() skips redrawing while a popup is open, so any data that arrived meanwhile was never shown. Redraw as soon as the popup closes.
  const close = m.remove.bind(m); m.remove = () => { close(); refresh(); };
  m.onclick = e => { if (e.target === m) m.remove(); }; onMount?.(m); return m; }
const normalize = async (col, list) => { for (let i = 0; i < list.length; i++) if (list[i].order !== i) await DB.update(col, list[i].id, { order: i }); };
async function swap(col, list, i, d) { const a = [...list]; [a[i], a[i + d]] = [a[i + d], a[i]]; for (let k = 0; k < a.length; k++) await DB.update(col, a[k].id, { order: k }); }

function itemModal(it, catId) {
  const isNew = !it; it = it || { id: DB.uid(), cat: catId, name: { bn: '', en: '' }, desc: { bn: '', en: '' }, variants: [{ label: null, price: 0 }], image: '', available: true, featured: false };
  let img = it.image || '', vs = (it.variants || []).map(v => ({ lb: v.label?.bn || '', le: v.label?.en || '', p: v.price }));
  const m = modal(`<h3>${isNew ? 'নতুন খাবার' : 'খাবার এডিট'}</h3>
    <label class="fld">ক্যাটাগরি<select id="mCat">${st.cats.sort((a, b) => a.order - b.order).map(c => `<option value="${esc(c.id)}" ${c.id === it.cat ? 'selected' : ''}>${esc(tr(c.name))}</option>`).join('')}</select></label>
    <div class="fld">নাম<div class="bnen"><div><label>বাংলা</label><input id="mNb" value="${esc(it.name.bn)}"></div><div><label>English</label><input id="mNe" value="${esc(it.name.en)}"></div></div></div>
    <div class="fld">বিবরণ<div class="bnen"><div><label>বাংলা</label><textarea id="mDb" rows="2">${esc(it.desc.bn)}</textarea></div><div><label>English</label><textarea id="mDe" rows="2">${esc(it.desc.en)}</textarea></div></div></div>
    <div class="fld">দাম (একটি অথবা একাধিক সাইজ/অপশন — যেমন হাফ ৳২৮০, ফুল ৳৫৫০)<div id="vars"></div><button class="btn ghost sm" id="addV" type="button">+ আরেকটি অপশন</button></div>
    <div class="fld">ছবি (ঐচ্ছিক)<div class="imgfld"><img id="mImg" alt="" src="${esc(img)}" ${img ? '' : 'hidden'}><button class="btn ghost sm" id="mUp" type="button">ছবি আপলোড</button><button class="btn bad sm" id="mRm" type="button">ছবি সরান</button></div></div>
    <label class="sw"><input type="checkbox" id="mAv" ${it.available !== false ? 'checked' : ''}> আজ পাওয়া যাচ্ছে</label><label class="sw"><input type="checkbox" id="mFe" ${it.featured ? 'checked' : ''}> হোমপেজে "জনপ্রিয় খাবার"-এ দেখান</label>
    <div class="row"><button class="btn" id="mSave">সেভ করুন</button><button class="btn ghost" id="mCancel">বাতিল</button></div>`, m => {
    const drawV = () => { $('#vars', m).innerHTML = vs.map((v, i) => `<div class="var-r"><input placeholder="নাম (বাংলা) — যেমন হাফ" data-k="lb" data-i="${i}" value="${esc(v.lb)}"><input placeholder="Name (English)" data-k="le" data-i="${i}" value="${esc(v.le)}"><input type="number" min="0" placeholder="দাম ৳" data-k="p" data-i="${i}" value="${v.p}"><button class="btn bad sm" type="button" data-rv="${i}" ${vs.length < 2 ? 'disabled' : ''}>✕</button></div>`).join('');
      $$('[data-k]', m).forEach(e => e.oninput = () => { vs[+e.dataset.i][e.dataset.k] = e.dataset.k === 'p' ? +e.value : e.value; }); $$('[data-rv]', m).forEach(b => b.onclick = () => { vs.splice(+b.dataset.rv, 1); drawV(); }); };
    drawV(); $('#addV', m).onclick = () => { vs.push({ lb: '', le: '', p: 0 }); drawV(); };
    $('#mUp', m).onclick = () => pickImage(640, d => { img = d; $('#mImg', m).src = d; $('#mImg', m).hidden = false; }, .75); $('#mRm', m).onclick = () => { img = ''; $('#mImg', m).hidden = true; };
    $('#mCancel', m).onclick = () => m.remove();
    $('#mSave', m).onclick = async () => {
      if (!$('#mNb', m).value.trim() && !$('#mNe', m).value.trim()) return say('খাবারের নাম দিন', true);
      const cat = $('#mCat', m).value, order = isNew ? Math.max(-1, ...st.menu.filter(x => x.cat === cat).map(x => x.order)) + 1 : it.order;
      const item = { id: it.id, cat, name: { bn: $('#mNb', m).value.trim(), en: $('#mNe', m).value.trim() }, desc: { bn: $('#mDb', m).value.trim(), en: $('#mDe', m).value.trim() },
        variants: vs.map(v => ({ label: (v.lb || v.le) ? { bn: v.lb || v.le, en: v.le || v.lb } : null, price: Math.max(0, +v.p || 0) })), image: img, available: $('#mAv', m).checked, featured: $('#mFe', m).checked, order };
      m.remove(); await act(() => DB.set('menu', item.id, item));
    };
  });
}
function catModal(c) {
  const isNew = !c; c = c || { id: DB.uid(), name: { bn: '', en: '' }, icon: 'fa-utensils' };
  const icons = ['fa-utensils', 'fa-mug-hot', 'fa-plate-wheat', 'fa-fish', 'fa-bowl-food', 'fa-drumstick-bite', 'fa-bowl-rice', 'fa-carrot', 'fa-box-open', 'fa-pizza-slice', 'fa-burger', 'fa-ice-cream', 'fa-cake-candles', 'fa-martini-glass', 'fa-mug-saucer', 'fa-cookie-bite', 'fa-shrimp', 'fa-egg', 'fa-leaf', 'fa-star'];
  modal(`<h3>${isNew ? 'নতুন ক্যাটাগরি' : 'ক্যাটাগরি এডিট'}</h3><div class="fld">নাম<div class="bnen"><div><label>বাংলা</label><input id="cb" value="${esc(c.name.bn)}"></div><div><label>English</label><input id="ce" value="${esc(c.name.en)}"></div></div></div>
    <label class="fld">আইকন<select id="ci">${icons.map(i => `<option value="${i}" ${i === c.icon ? 'selected' : ''}>${i.replace('fa-', '')}</option>`).join('')}</select></label>
    <div class="row"><button class="btn" id="cs">সেভ করুন</button><button class="btn ghost" id="cc">বাতিল</button></div>`, m => {
    $('#cc', m).onclick = () => m.remove();
    $('#cs', m).onclick = async () => { if (!$('#cb', m).value.trim() && !$('#ce', m).value.trim()) return say('নাম দিন', true);
      const data = { id: c.id, name: { bn: $('#cb', m).value.trim(), en: $('#ce', m).value.trim() }, icon: $('#ci', m).value, order: isNew ? st.cats.length : c.order };
      m.remove(); await act(() => DB.set('categories', c.id, data)); };
  });
}
V.menu.after = () => {
  $('#impMenu').onclick = importMenu;
  if (!S().menuSeeded) { $('#seed').onclick = () => act(DB.seedMenu, 'মেনু ইমপোর্ট হয়েছে ✓'); $('#seedEmpty').onclick = () => act(() => DB.saveSettings({ menuSeeded: true })); return; }
  const cats = [...st.cats].sort((a, b) => a.order - b.order);
  $('#addCat').onclick = () => catModal();
  $$('[data-addit]').forEach(b => b.onclick = () => itemModal(null, b.dataset.addit));
  $$('[data-editcat]').forEach(b => b.onclick = () => catModal(st.cats.find(c => c.id === b.closest('.panel').dataset.cat)));
  $$('[data-delcat]').forEach(b => b.onclick = async () => { const id = b.closest('.panel').dataset.cat, c = st.cats.find(x => x.id === id), n = st.menu.filter(i => i.cat === id).length;
    if (await sure(`"${tr(c?.name)}" ক্যাটাগরি মুছে ফেলবেন?`, n ? `এর ভেতরের ${num(n)}টি খাবারও একসাথে মুছে যাবে। এটি আর ফেরানো যাবে না।` : 'ক্যাটাগরিটি স্থায়ীভাবে মুছে যাবে।', 'হ্যাঁ, সব মুছুন')) act(async () => { for (const i of st.menu.filter(i => i.cat === id)) await DB.del('menu', i.id); await DB.del('categories', id); }, 'মুছে ফেলা হয়েছে'); });
  $$('[data-mvcat]').forEach(b => b.onclick = () => { const i = cats.findIndex(c => c.id === b.closest('.panel').dataset.cat); act(() => swap('categories', cats, i, +b.dataset.mvcat), 'সরানো হয়েছে'); });
  $$('.menu-it').forEach(r => { const it = st.menu.find(i => i.id === r.dataset.id), list = st.menu.filter(i => i.cat === it.cat).sort((a, b) => a.order - b.order);
    $('[data-edit]', r).onclick = () => itemModal(it); $('[data-tog]', r).onclick = () => act(() => DB.update('menu', it.id, { available: it.available === false }));
    $('[data-del]', r).onclick = async () => { if (await sure(`"${tr(it.name)}" মুছে ফেলবেন?`, 'খাবারটি মেনু থেকে স্থায়ীভাবে মুছে যাবে।')) act(() => DB.del('menu', it.id), 'মুছে ফেলা হয়েছে'); };
    $$('[data-mvit]', r).forEach(b => b.onclick = () => act(() => swap('menu', list, list.findIndex(x => x.id === it.id), +b.dataset.mvit), 'সরানো হয়েছে')); });
};

/* ---- site content ---- */
V.content = () => `<h1>সাইটের লেখা ও সেটিং</h1><p class="muted" style="margin-bottom:14px">এখানে যা বদলাবেন, "সেভ করুন" চাপলে ওয়েবসাইটে সাথে সাথে বদলে যাবে।</p><div id="cform">
  <div class="panel"><h2>সাধারণ তথ্য</h2>${bnen('brand.name', 'রেস্টুরেন্টের নাম')}${bnen('brand.tagline', 'ট্যাগলাইন')}
    <div class="grid2">${one('contact.phone', 'ফোন নম্বর', 'tel')}${one('contact.whatsapp', 'হোয়াটসঅ্যাপ নম্বর', 'tel', 'দেশের কোডসহ, যেমন 8801XXXXXXXXX')}${one('contact.email', 'ইমেইল', 'email')}${one('contact.facebook', 'ফেসবুক পেজের লিংক', 'url')}</div>
    ${one('contact.map', 'গুগল ম্যাপ লিংক', 'url')}${bnen('contact.address', 'ঠিকানা')}${bnen('contact.hours', 'খোলার সময়')}
    <label class="fld">সাইটের মূল রং<input type="color" data-path="accent" value="${esc(S().accent)}" style="width:90px;height:44px;padding:2px"></label></div>
  <div class="panel"><h2>হোম পেজের ব্যানার</h2>${bnen('hero.badge', 'ছোট ব্যাজ')}${bnen('hero.title', 'বড় শিরোনাম')}${bnen('hero.subtitle', 'বর্ণনা', 3)}
    <div class="fld">ব্যানারের ছবি<input type="hidden" data-path="hero.image" value="${esc(S().hero.image)}"><div class="imgfld"><img id="heroPrev" alt="" src="${esc(S().hero.image)}"><button class="btn ghost sm" id="heroUp" type="button">ছবি আপলোড</button></div></div></div>
  <div class="panel"><h2>আমাদের সম্পর্কে</h2>${bnen('about.title', 'শিরোনাম')}${bnen('about.intro', 'পরিচিতি', 3)}
    ${[0, 1, 2].map(i => `<div class="sv-r">${bnen(`about.cards.${i}.title`, `কার্ড ${num(i + 1)} — শিরোনাম`)}${bnen(`about.cards.${i}.text`, 'লেখা', 2)}</div>`).join('')}</div>
  <div class="panel"><h2>ঘোষণা বার (সাইটের একদম উপরে)</h2>${sw('announcement.enabled', 'ঘোষণা দেখান')}${bnen('announcement.text', 'ঘোষণার লেখা')}</div>
  <div class="panel"><h2>অনলাইন অর্ডার</h2>${sw('ordering.open', 'অনলাইন অর্ডার চালু')}${sw('ordering.takeaway', 'টেকঅ্যাওয়ে (নিয়ে যাব) অপশন দেখান')}${one('ordering.tables', 'টেবিলের সংখ্যা', 'number')}${bnen('ordering.closedMsg', 'অর্ডার বন্ধ থাকলে যে বার্তা দেখাবে', 2)}</div>
  <button class="btn" id="saveC"><i class="fa-solid fa-floppy-disk"></i> সেভ করুন</button></div>`;
V.content.after = () => {
  $('#heroUp').onclick = () => pickImage(1200, d => { $('#heroPrev').src = d; $('[data-path="hero.image"]').value = d; }, .72);
  $('#saveC').onclick = () => { const n = collect($('#cform')); n.ordering.tables = Math.max(1, Math.min(200, +n.ordering.tables || 20)); act(() => DB.saveSettings(n)); };
};

V.services = () => `<h1>সেবাসমূহ</h1><p class="muted" style="margin-bottom:14px">এগুলো হোম ও "সেবাসমূহ" পেজে দেখায়। আইকনের নাম <a href="https://fontawesome.com/search?o=r&m=free&s=solid" target="_blank" rel="noopener">Font Awesome</a> থেকে নিন (যেমন fa-ring, fa-cake-candles)।</p><div id="svList">
  ${S().services.map((s, i) => `<div class="sv-r" data-i="${i}"><div class="row sb"><b>সেবা ${num(i + 1)}</b><div class="row"><button class="btn ghost sm" data-m="-1" ${i === 0 ? 'disabled' : ''}>↑</button><button class="btn ghost sm" data-m="1" ${i === S().services.length - 1 ? 'disabled' : ''}>↓</button><button class="btn bad sm" data-x><i class="fa-solid fa-trash"></i></button></div></div>
    <label class="fld">আইকন<input data-f="icon" value="${esc(s.icon)}"></label><div class="fld">নাম<div class="bnen"><div><input data-f="tb" value="${esc(s.title.bn)}"></div><div><input data-f="te" value="${esc(s.title.en)}"></div></div></div>
    <div class="fld">বর্ণনা<div class="bnen"><div><textarea rows="2" data-f="xb">${esc(s.text.bn)}</textarea></div><div><textarea rows="2" data-f="xe">${esc(s.text.en)}</textarea></div></div></div></div>`).join('')}</div>
  <div class="row"><button class="btn ghost" id="addSv"><i class="fa-solid fa-plus"></i> নতুন সেবা</button><button class="btn" id="saveSv"><i class="fa-solid fa-floppy-disk"></i> সেভ করুন</button></div>`;
V.services.after = () => {
  const read = () => $$('.sv-r').map(r => { const g = k => $(`[data-f="${k}"]`, r).value.trim(); return { icon: g('icon') || 'fa-star', title: { bn: g('tb'), en: g('te') }, text: { bn: g('xb'), en: g('xe') } }; });
  let list = null; const save = async n => { await DB.saveSettings({ services: n }); }; const redraw = n => { DB.settings.services = n; render(); };
  $('#addSv').onclick = () => redraw([...read(), { icon: 'fa-star', title: { bn: '', en: '' }, text: { bn: '', en: '' } }]);
  $('#saveSv').onclick = () => act(() => save(read()));
  $$('[data-x]').forEach(b => b.onclick = () => { const l = read(); l.splice(+b.closest('.sv-r').dataset.i, 1); redraw(l); say('সেভ করতে "সেভ করুন" চাপুন'); });
  $$('[data-m]').forEach(b => b.onclick = () => { const l = read(), i = +b.closest('.sv-r').dataset.i, d = +b.dataset.m; [l[i], l[i + d]] = [l[i + d], l[i]]; redraw(l); });
};

const GLIST = () => S().gallerySeeded ? [...st.gallery].sort((a, b) => a.order - b.order) : DEFAULT_GALLERY;
const GBAR = `<div class="row" style="margin-bottom:14px"><button class="btn" id="gUp"><i class="fa-solid fa-upload"></i> ছবি আপলোড</button><button class="btn ghost" id="gUrl"><i class="fa-solid fa-link"></i> লিংক থেকে ছবি যোগ</button></div>`;
V.gallery = () => {
  return `<h1>গ্যালারি</h1>` + GBAR + `
  <div class="qr-g">${GLIST().map((g, i, a) => `<div class="qr" data-id="${esc(g.id)}"><img src="${esc(g.src)}" alt="" style="width:100%;height:130px;object-fit:cover;border-radius:8px"><input data-cap="bn" placeholder="ক্যাপশন (বাংলা)" value="${esc(g.caption?.bn)}" style="margin-top:8px"><input data-cap="en" placeholder="Caption (English)" value="${esc(g.caption?.en)}" style="margin-top:6px">
    <div class="row" style="margin-top:8px;justify-content:center"><button class="btn ghost sm" data-gm="-1" ${i === 0 ? 'disabled' : ''}>↑</button><button class="btn ghost sm" data-gm="1" ${i === a.length - 1 ? 'disabled' : ''}>↓</button><button class="btn sm" data-gs>সেভ</button><button class="btn bad sm" data-gd><i class="fa-solid fa-trash"></i></button></div></div>`).join('')}</div>`;
};
V.gallery.after = () => {
  const list = GLIST(), base = list.length, ensure = async () => { if (!S().gallerySeeded) await DB.seedGallery(); };   // first edit silently imports the default photos
  const add = src => act(async () => { await ensure(); await DB.set('gallery', DB.uid(), { src, caption: { bn: '', en: '' }, order: base }); });
  $('#gUp').onclick = () => pickImage(1000, add, .75); $('#gUrl').onclick = async () => { const u = await promptBox({ icon: 'fa-link', title: 'লিংক থেকে ছবি যোগ করুন', message: 'ছবির সরাসরি লিংকটি এখানে পেস্ট করুন।', input: { placeholder: 'https://...', validate: v => /^https?:\/\/\S+$/.test(v) ? '' : 'সঠিক লিংক দিন (https:// দিয়ে শুরু)' } }); if (u) add(u); };
  $$('.qr[data-id]').forEach(c => { const id = c.dataset.id, i = list.findIndex(g => g.id === id);
    $('[data-gs]', c).onclick = () => { const caption = { bn: $('[data-cap=bn]', c).value, en: $('[data-cap=en]', c).value }; act(async () => { await ensure(); await DB.update('gallery', id, { caption }); }); };
    $('[data-gd]', c).onclick = async () => { if (await sure('ছবিটি মুছে ফেলবেন?', 'ছবিটি গ্যালারি থেকে স্থায়ীভাবে মুছে যাবে।')) act(async () => { await ensure(); await DB.del('gallery', id); }, 'মুছে ফেলা হয়েছে'); };
    $$('[data-gm]', c).forEach(b => b.onclick = () => act(async () => { await ensure(); await swap('gallery', list, i, +b.dataset.gm); }, 'সরানো হয়েছে')); });
};

V.qr = () => `<h1>টেবিল QR কোড</h1><div class="panel"><p>প্রতিটি টেবিলে একটি QR কোড বসান। কাস্টমার স্ক্যান করলেই মেনু খুলবে এবং টেবিল নম্বর নিজে থেকে বসে যাবে।</p>
  <label class="fld">আপনার ওয়েবসাইটের ঠিকানা<input id="qBase" value="${esc((window.RC && window.RC.site) || location.origin)}"></label><div class="row"><button class="btn" id="qGo">QR বানান</button><button class="btn ghost" onclick="print()"><i class="fa-solid fa-print"></i> প্রিন্ট</button></div></div><div class="qr-g" id="qrs"></div>`;
V.qr.after = async () => {
  if (!window.QRCode) await new Promise(r => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.onload = r; s.onerror = r; document.head.append(s); });
  const go = () => { const box = $('#qrs'); box.innerHTML = ''; const base = $('#qBase').value.replace(/\/$/, ''), n = +S().ordering.tables || 20;
    if (!window.QRCode) return box.innerHTML = '<p class="err">QR লাইব্রেরি লোড হয়নি — ইন্টারনেট দেখুন।</p>';
    for (let i = 1; i <= n; i++) { const d = document.createElement('div'); d.className = 'qr'; d.innerHTML = `<b>টেবিল ${num(i)}</b><div class="q"></div>`; box.append(d); new QRCode($('.q', d), { text: `${base}/menu.html?table=${i}`, width: 150, height: 150 }); } };
  $('#qGo').onclick = go; go();
};

/* ---------- shell ---------- */
function renderNav() {
  const newB = st.bookings.filter(b => b.status === 'new').length, prep = st.orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  $('#side').innerHTML = `<div class="logo"><img src="../assets/logo-512.png" alt="" width="38" height="38"><span>অ্যাডমিন</span></div>
    ${NAV.map(n => `<button class="nv ${view === n[0] ? 'on' : ''}" data-v="${n[0]}"><i class="fa-solid ${n[1]}"></i> ${n[2]}${n[0] === 'bookings' && newB ? `<span class="dot">${num(newB)}</span>` : ''}${n[0] === 'orders' && prep ? `<span class="dot">${num(prep)}</span>` : ''}</button>`).join('')}
    <div class="sp"></div><a class="nv2" href="../kitchen/" target="_blank"><i class="fa-solid fa-fire-burner"></i> কিচেন ড্যাশবোর্ড</a><a class="nv2" href="../index.html" target="_blank"><i class="fa-solid fa-globe"></i> ওয়েবসাইট</a><button class="nv" data-logout><i class="fa-solid fa-right-from-bracket"></i> লগআউট</button>`;
  $$('[data-v]').forEach(b => b.onclick = () => { view = b.dataset.v; $('#side').classList.remove('open'); render(); });
  $$('#side [data-logout]').forEach(b => b.onclick = async () => { await DB.logout(); location.reload(); });
}
function render() { renderNav(); $('#view').innerHTML = V[view](); V[view].after?.(); }
const LIVE = ['dash', 'orders', 'bookings', 'menu', 'gallery'];
const refresh = () => { if (!ready) return; renderNav(); if (LIVE.includes(view) && !document.querySelector('.modal')) { const y = scrollY; $('#view').innerHTML = V[view](); V[view].after?.(); scrollTo(0, y); } };

guard(['admin'], () => {
  DB.setPoll((window.RC && window.RC.poll && window.RC.poll.admin) || 5000);
  $('#menuToggle').onclick = () => $('#side').classList.toggle('open');
  let firstO = true, knownB = null;
  DB.sub('orders', l => { st.orders = l; refresh(); }, { orderBy: 'createdAt', dir: 'desc', limit: 500 });
  DB.sub('bookings', l => { st.bookings = l; const ids = new Set(l.map(b => b.id)); if (knownB && [...ids].some(i => !knownB.has(i))) { beep(); say('🔔 নতুন বুকিং এসেছে!'); } knownB = ids; refresh(); }, { orderBy: 'createdAt', dir: 'desc', limit: 500 });
  DB.sub('categories', l => { st.cats = l; refresh(); }, { orderBy: 'order' }); DB.sub('menu', l => { st.menu = l; refresh(); }, { orderBy: 'order' }); DB.sub('gallery', l => { st.gallery = l; refresh(); }, { orderBy: 'order' });
  DB.onSettings(() => { if (!ready || ['dash', 'menu', 'gallery'].includes(view)) refresh(); });
  ready = true; render();
});

/* ---------- button click ripple (admin) ---------- */
document.addEventListener('pointerdown', e => {
  const b = e.target.closest && e.target.closest('.btn,.dlg-b button'); if (!b || b.disabled) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = document.createElement('span');
  s.className = 'rc-rip'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  b.append(s); setTimeout(() => s.remove(), 650);
}, { passive: true });
