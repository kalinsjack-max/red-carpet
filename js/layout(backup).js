import * as DB from './db.js';
import { ui, tr, lang, setLang, applyI18n, money, num, esc } from './i18n.js';
import { mountCredit } from './credit.js';

export const toast = (msg, kind = '') => {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.className = 'show ' + kind; t.textContent = msg; clearTimeout(t._h); t._h = setTimeout(() => t.className = '', 2600);
};

/* ---------- অর্ডারের স্ট্যাটাস: Pending → Preparing → Ready → Done ---------- */
const ST = { pending: ['পেন্ডিং', 'Pending'], preparing: ['প্রস্তুত হচ্ছে', 'Preparing'], ready: ['রেডি', 'Ready'], completed: ['সম্পন্ন', 'Done'], cancelled: ['বাতিল', 'Cancelled'] };
const SD = {
  pending: ['আপনার অর্ডার পাওয়া গেছে। কিচেন কনফার্ম করলেই রান্না শুরু হবে।', 'We have your order. The kitchen will confirm and start cooking shortly.'],
  preparing: ['কিচেন আপনার খাবার বানাচ্ছে।', 'The kitchen is making your food.'],
  ready: ['আপনার খাবার রেডি! অর্ডার নম্বর বলে নিয়ে নিন।', 'Your food is ready! Pick it up with your order number.'],
  completed: ['অর্ডার সম্পন্ন। ধন্যবাদ, আবার আসবেন!', 'Order complete. Thank you — see you again!'],
  cancelled: ['এই অর্ডার বাতিল হয়েছে। বিস্তারিত জানতে কাউন্টারে যোগাযোগ করুন।', 'This order was cancelled. Please ask at the counter.']
};
export const STEPS = [['pending', 'fa-clock'], ['preparing', 'fa-fire-burner'], ['ready', 'fa-bell-concierge'], ['completed', 'fa-circle-check']];
export const stL = k => (ST[k] || ST.pending)[lang === 'en' ? 1 : 0];
export const sdL = k => (SD[k] || SD.pending)[lang === 'en' ? 1 : 0];
export const stepAt = k => ({ pending: 0, preparing: 1, ready: 2, completed: 3 }[k] ?? 0);

/* ---------- ভাসমান অর্ডার কার্ড (সব পেজে, নিচে ডানে) ---------- */
function initOrderWidget(page) {
  if (page === 'track') return;
  let mine = []; try { mine = JSON.parse(localStorage.getItem('rc_orders') || '[]'); } catch {}
  const id = mine[0]?.id; if (!id) return;
  if (!document.querySelector('link[href*="css/track.css"]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'css/track.css'; document.head.append(l); }
  const host = document.createElement('div'); host.id = 'owHost'; document.body.append(host);
  const W = { more: ['আরও যোগ করুন', 'Add something else'], details: ['বিস্তারিত দেখুন', 'View details'], close: ['বন্ধ করুন', 'Close'], mini: ['ছোট করুন', 'Minimize'], open: ['অর্ডারের অবস্থা দেখুন', 'Show order status'] };
  const w = k => W[k][lang === 'en' ? 1 : 0];
  const IC = { pending: 'fa-clock', preparing: 'fa-fire-burner', ready: 'fa-bell-concierge', completed: 'fa-circle-check', cancelled: 'fa-ban' };
  const MK = 'rc_ow_m';                      // "id|status" while the tracker is minimized into a bubble (re-opens by itself when the status changes)
  let last = null, cur = null;
  const draw = () => {
    const o = cur; if (!o) { host.innerHTML = ''; return; }
    const x = localStorage.getItem('rc_ow_x'), ready = o.status === 'ready';
    const closed = ready ? x === id + '|r' : (x === id || x === id + '|r');       // রেডি হলে আবার দেখাবে
    const old = Date.now() - (o.createdAt || Date.now()) > 6 * 3600 * 1000;
    if (closed || old) { host.innerHTML = ''; return; }
    if (localStorage.getItem(MK) === id + '|' + o.status) {                         // ---- minimized bubble
      host.innerHTML = `<button class="ow-bub s-${esc(o.status)}" type="button" aria-label="${w('open')}" title="${w('open')}"><i class="fa-solid ${IC[o.status] || 'fa-clock'}"></i><b>#${num(o.orderNo)}</b></button>`;
      host.querySelector('.ow-bub').onclick = () => { localStorage.removeItem(MK); draw(); };
      return;
    }
    const at = stepAt(o.status), cancelled = o.status === 'cancelled', fin = o.status === 'completed';
    host.innerHTML = `<aside class="ow s-${esc(o.status)}" role="status" aria-live="polite">
      <header><b>${esc(o.name || ui('order_no'))}</b><span>#${num(o.orderNo)}</span><button class="ow-mn" type="button" aria-label="${w('mini')}" title="${w('mini')}"><i class="fa-solid fa-minus"></i></button><button class="ow-x" type="button" aria-label="${w('close')}" title="${w('close')}"><i class="fa-solid fa-xmark"></i></button></header>
      <div class="ow-b"><div class="ow-r"><b>${money(o.total)}</b><span class="ow-pill">${stL(o.status)}</span></div>
        ${cancelled ? `<p class="ow-c">${esc(sdL('cancelled'))}</p>` : `<div class="ow-steps" style="--p:${at / 3}"><i class="ow-fill"></i>${STEPS.map(([k, ic], i) =>
          `<span class="${i < at || (i === at && fin) ? 'done' : i === at ? 'now' : ''}"><em><i class="fa-solid ${i < at || (i === at && fin) ? 'fa-check' : ic}"></i></em><small>${stL(k)}</small></span>`).join('')}</div>`}
        <div class="ow-a"><a class="ow-d" href="track.html?o=${esc(id)}">${w('details')}</a><a class="ow-m" href="menu.html" ${page === 'menu' ? 'data-min' : ''}><i class="fa-solid fa-plus"></i> ${w('more')}</a></div></div></aside>`;
    host.querySelector('.ow-x').onclick = () => { localStorage.setItem('rc_ow_x', ready ? id + '|r' : id); host.innerHTML = ''; };
    host.querySelector('.ow-mn').onclick = () => { localStorage.setItem(MK, id + '|' + o.status); draw(); };
    const m = host.querySelector('[data-min]'); if (m) m.onclick = e => { e.preventDefault(); localStorage.setItem(MK, id + '|' + o.status); draw(); };
  };
  DB.subDoc('orders', id, (o, err) => {
    if (err || !o) { cur = null; host.innerHTML = ''; return; }
    if (last && last !== o.status && o.status === 'ready') { navigator.vibrate?.([200, 100, 200]); toast(sdL('ready'), 'ok'); }
    last = o.status; cur = o; draw();
  });
}

/* ---------- চলমান অর্ডার (একই ডিভাইন থেকে আরও অর্ডার = একই অর্ডার) ---------- */
const Active = { order: null, loaded: true };

/* ---------- Cart ---------- */
export const Cart = {
  items: (() => { try { return JSON.parse(localStorage.getItem('rc_cart')) || []; } catch { return []; } })(),
  save() { localStorage.setItem('rc_cart', JSON.stringify(this.items)); dispatchEvent(new Event('cartchange')); },
  add(item, vi = 0, qty = 1) {
    const v = item.variants[vi] || item.variants[0], key = item.id + '|' + vi, ex = this.items.find(i => i.key === key);
    if (ex) ex.qty += qty; else this.items.push({ key, id: item.id, name: item.name, variant: v.label || null, price: v.price, qty });
    this.save();
  },
  change(key, d) { const i = this.items.find(x => x.key === key); if (!i) return; i.qty += d; if (i.qty < 1) this.items = this.items.filter(x => x !== i); this.save(); },
  clear() { this.items = []; this.save(); },
  get count() { return this.items.reduce((a, i) => a + i.qty, 0); },
  get total() { return this.items.reduce((a, i) => a + i.qty * i.price, 0); }
};

/* ---------- Content binding (data-c attributes) ---------- */
const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
export function bind(s = DB.settings, root = document) {
  document.documentElement.style.setProperty('--red', /^#[0-9a-f]{6}$/i.test(s.accent) ? s.accent : '#b3171c');
  root.querySelectorAll('[data-c]').forEach(e => { e.textContent = tr(get(s, e.dataset.c)); });
  root.querySelectorAll('[data-c-src]').forEach(e => { const v = get(s, e.dataset.cSrc); e.onerror = () => { e.onerror = null; e.src = 'assets/logo-512.png'; e.style.objectFit = 'contain'; e.style.background = '#fff'; }; if (v && e.getAttribute('src') !== v) e.src = v; });
  root.querySelectorAll('[data-c-bg]').forEach(e => { const v = get(s, e.dataset.cBg); if (v) e.style.setProperty('--bg', `url("${v}")`); });
  root.querySelectorAll('[data-c-tel]').forEach(e => { e.href = 'tel:' + s.contact.phone; });
  root.querySelectorAll('[data-c-wa]').forEach(e => { const w = (s.contact.whatsapp || '').replace(/\D/g, ''); e.hidden = !w; e.href = 'https://wa.me/' + w; });
  root.querySelectorAll('[data-c-link]').forEach(e => { const v = get(s, e.dataset.cLink); e.hidden = !v; if (v) e.href = v; });
  const a = document.getElementById('announce');
  if (a) { const on = s.announcement.enabled && tr(s.announcement.text); a.hidden = !on; a.querySelector('span').textContent = tr(s.announcement.text); }
  document.title = tr(s.brand.name) + ' — ' + tr(s.brand.tagline);
}

/* ---------- Header / footer / cart drawer ---------- */
const LINKS = [['index.html', 'nav_home', 'home'], ['about.html', 'nav_about', 'about'], ['services.html', 'nav_services', 'services'],
  ['menu.html', 'nav_menu', 'menu'], ['gallery.html', 'nav_gallery', 'gallery'], ['booking.html', 'nav_booking', 'booking']];

export function initLayout(page) {
  const top = document.getElementById('top'), bottom = document.getElementById('bottom');
  top.innerHTML = `
    ${DB.mode === 'demo' ? `<div class="demo-bar" data-i18n="demo_banner"></div>` : ''}
    <div id="announce" class="announce" hidden><i class="fa-solid fa-bullhorn"></i> <span></span></div>
    <header class="hdr"><div class="wrap hdr-in">
      <a class="brand" href="index.html"><img src="assets/logo-512.png" alt="" width="46" height="46">
        <span><b data-c="brand.name"></b><small data-c="brand.tagline"></small></span></a>
      <nav id="nav" aria-label="Main">${LINKS.map(l => `<a href="${l[0]}" data-i18n="${l[1]}" ${l[2] === page ? 'aria-current="page"' : ''}></a>`).join('')}
        <a href="track.html" data-i18n="nav_track" ${page === 'track' ? 'aria-current="page"' : ''}></a></nav>
      <div class="hdr-act">
        <button class="btn-lang" id="langBtn" data-i18n="lang_btn" aria-label="Language"></button>
        <button class="cartbtn" id="cartBtn" aria-label="Cart"><i class="fa-solid fa-bag-shopping"></i><b id="cartCount">0</b></button>
        <button class="burger" id="burger" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
      </div></div></header>`;
  bottom.innerHTML = `
    <footer class="ftr"><div class="wrap ftr-grid">
      <div><div class="brand brand-f"><img src="assets/logo-512.png" alt="" width="52" height="52"><span><b data-c="brand.name"></b><small data-c="brand.tagline"></small></span></div>
        <p class="muted" data-c="hero.badge"></p></div>
      <div><h4 data-i18n="quick_links"></h4><ul>${LINKS.map(l => `<li><a href="${l[0]}" data-i18n="${l[1]}"></a></li>`).join('')}<li><a href="track.html" data-i18n="nav_track"></a></li></ul></div>
      <div><h4 data-i18n="contact_info"></h4><ul class="ci">
        <li><i class="fa-solid fa-location-dot"></i><span data-c="contact.address"></span></li>
        <li><i class="fa-solid fa-phone"></i><a data-c-tel data-c="contact.phone"></a></li>
        <li><i class="fa-solid fa-clock"></i><span data-c="contact.hours"></span></li>
        <li><i class="fa-brands fa-facebook"></i><a data-c-link="contact.facebook" target="_blank" rel="noopener">Facebook</a></li></ul></div>
      <div><h4 data-i18n="book_events"></h4><p class="muted" data-i18n="book_events_p"></p><a class="btn btn-gold" href="booking.html" data-i18n="book_now"></a></div>
    </div><div class="wrap ftr-bot"><p>&copy; ${new Date().getFullYear()} <span data-c="brand.name"></span>. <span data-i18n="rights"></span></p><div id="creditHost"></div></div></footer>
    <a class="cartbar" id="cartBar" href="#" hidden><span><i class="fa-solid fa-bag-shopping"></i> <b id="cbCount"></b></span><b id="cbTotal"></b><span data-i18n="view_cart"></span></a>
    <div class="scrim" id="scrim" hidden></div>
    <aside class="drawer" id="drawer" aria-label="Cart" aria-hidden="true">
      <div class="dr-h"><h3 data-i18n="cart"></h3><button class="x" id="drClose" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>
      <div class="dr-b" id="drBody"></div></aside>`;
  mountCredit(document.getElementById('creditHost'));
  /* floating quick actions: call · WhatsApp · back-to-top */
  const fab = document.createElement('div'); fab.className = 'fab';
  fab.innerHTML = `<a class="f-wa" data-c-wa target="_blank" rel="noopener" aria-label="WhatsApp" hidden><i class="fa-brands fa-whatsapp"></i></a><a class="f-call" data-c-tel aria-label="${ui('fab_call')}"><i class="fa-solid fa-phone"></i></a><button class="f-top" type="button" aria-label="${ui('fab_top')}"><i class="fa-solid fa-chevron-up"></i></button>`;
  document.body.append(fab);
  const HOW = { t: ['কীভাবে অর্ডার করবেন?', 'How to order?'], lead: ['লগইন ছাড়াই মাত্র ১ মিনিটে অর্ডার করুন — এভাবে:', 'Order in about a minute — no login needed:'],
    steps: [
      ['fa-qrcode', ['টেবিলের QR স্ক্যান করুন (বা মেনু খুলুন)', 'Scan the table QR (or open the menu)'], ['টেবিলে থাকা QR কোড স্ক্যান করলে মেনু খুলবে এবং আপনার টেবিল নম্বর নিজে থেকেই বসে যাবে।', 'Scanning the QR on your table opens the menu with your table number already selected.']],
      ['fa-utensils', ['পছন্দের খাবার বেছে নিন', 'Pick your dishes'], ['ক্যাটাগরি বা সার্চ ব্যবহার করুন। হাফ/ফুল থাকলে সাইজ বেছে "কার্টে যোগ করুন" চাপুন।', 'Use the categories or search. If a dish has Half/Full, choose the size and tap "Add to cart".']],
      ['fa-bag-shopping', ['কার্ট খুলে অর্ডার পাঠান', 'Open the cart and send the order'], ['কার্ট বাটনে চাপ দিন। টেবিলে খেলে টেবিল নম্বর, নিয়ে যেতে চাইলে নাম দিন। ঝাল কম/পেঁয়াজ ছাড়া — এমন কিছু থাকলে নোটে লিখুন, তারপর "অর্ডার পাঠান"।', 'Tap the cart. Choose your table (dine in) or enter your name (takeaway). Add a note like "less spicy", then tap "Place order".']],
      ['fa-bell-concierge', ['লাইভ স্ট্যাটাস দেখুন', 'Follow the live status'], ['পেন্ডিং → প্রস্তুত হচ্ছে → রেডি → সম্পন্ন। পাতার নিচের ডানে ভাসমান ট্র্যাকারেও দেখা যাবে; ছোট করে বাবল বানাতে পারবেন, বাবলে চাপ দিলে আবার খুলবে।', 'Pending → Preparing → Ready → Done. A floating tracker shows it on every page; minimize it into a bubble and tap the bubble to open it again.']],
      ['fa-circle-plus', ['আরও খাবার লাগলে?', 'Want more food?'], ['আবার মেনু থেকে যোগ করে কার্টে "এই অর্ডারেই যোগ করুন" বেছে নিন — একই অর্ডার নম্বর ও একটাই বিল হবে, কিচেন বুঝে যাবে।', 'Add dishes again and choose "Add to this order" in the cart — same order number, one bill, and the kitchen is told.']],
      ['fa-money-bill-wave', ['রেডি হলে নিন, কাউন্টারে পেমেন্ট', 'Collect when ready, pay at the counter'], ['অনলাইনে কোনো টাকা দিতে হবে না। অর্ডার নম্বর বলে খাবার নিন এবং কাউন্টারে পেমেন্ট করুন।', 'Nothing to pay online. Quote your order number and pay at the counter.']]
    ], menu: ['মেনু দেখুন', 'View menu'], track: ['আমার অর্ডার ট্র্যাক', 'Track my order'], close: ['বন্ধ করুন', 'Close'] };
  const hw = k => HOW[k][lang === 'en' ? 1 : 0];
  const howBtn = document.createElement('button'); howBtn.type = 'button'; howBtn.className = 'howfab'; howBtn.setAttribute('aria-label', hw('t'));
  howBtn.innerHTML = `<i class="fa-solid fa-circle-question"></i><span>${hw('t')}</span>`; document.body.append(howBtn);
  const openHow = () => {
    const m = document.createElement('div'); m.className = 'howm'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = `<div class="howm-box"><button class="howm-x" type="button" aria-label="${hw('close')}"><i class="fa-solid fa-xmark"></i></button>
      <h3><i class="fa-solid fa-circle-question"></i> ${hw('t')}</h3><p class="howm-lead">${hw('lead')}</p>
      <ol class="howm-list">${HOW.steps.map((st, i) => `<li><span class="n">${num(i + 1)}</span><div><b><i class="fa-solid ${st[0]}"></i> ${st[1][lang === 'en' ? 1 : 0]}</b><p>${st[2][lang === 'en' ? 1 : 0]}</p></div></li>`).join('')}</ol>
      <div class="howm-a"><a class="btn" href="menu.html"><i class="fa-solid fa-utensils"></i> ${hw('menu')}</a><a class="btn btn-ghost" href="track.html"><i class="fa-solid fa-receipt"></i> ${hw('track')}</a></div></div>`;
    document.body.append(m); document.body.style.overflow = 'hidden';
    const close = () => { m.remove(); document.body.style.overflow = ''; removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', key); m.onclick = e => { if (e.target === m) close(); }; m.querySelector('.howm-x').onclick = close; m.querySelector('.howm-x').focus();
  };
  howBtn.onclick = openHow;
  try { if (!sessionStorage.getItem('rc_how_seen')) { howBtn.classList.add('wide'); setTimeout(() => howBtn.classList.remove('wide'), 6000); sessionStorage.setItem('rc_how_seen', '1'); } } catch {}
  const hdr = document.querySelector('.hdr'), topBtn = fab.querySelector('.f-top');
  topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  let tick = false;
  const onScroll = () => { if (tick) return; tick = true; requestAnimationFrame(() => { tick = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    hdr.classList.toggle('scrolled', y > 24); hdr.style.setProperty('--sp', h > 0 ? Math.min(1, y / h).toFixed(3) : 0); topBtn.classList.toggle('show', y > 500); }); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  document.getElementById('langBtn').onclick = () => setLang(lang === 'bn' ? 'en' : 'bn');
  document.getElementById('burger').onclick = () => document.getElementById('nav').classList.toggle('open');
  const open = () => { renderDrawer(); drawer.classList.add('open'); scrim.hidden = false; drawer.setAttribute('aria-hidden', 'false'); };
  const close = () => { drawer.classList.remove('open'); scrim.hidden = true; drawer.setAttribute('aria-hidden', 'true'); };
  const drawer = document.getElementById('drawer'), scrim = document.getElementById('scrim');
  document.getElementById('cartBtn').onclick = open; document.getElementById('drClose').onclick = close; scrim.onclick = close;
  document.getElementById('cartBar').onclick = e => { e.preventDefault(); open(); };
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('openCart', open);

  const q = new URLSearchParams(location.search).get('table');
  if (q && /^\d{1,3}$/.test(q)) localStorage.setItem('rc_table', q);

  let prevC = Cart.count;
  const refresh = () => {
    const c = Cart.count; if (c > prevC) { const b = document.getElementById('cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } prevC = c; document.getElementById('cartCount').textContent = num(c); document.getElementById('cartCount').hidden = !c;
    const bar = document.getElementById('cartBar'); bar.hidden = !c || page === 'track';
    document.getElementById('cbCount').textContent = num(c) + ' ' + ui('items'); document.getElementById('cbTotal').textContent = money(Cart.total);
    if (drawer.classList.contains('open')) renderDrawer();
  };
  addEventListener('cartchange', refresh); addEventListener('storage', e => { if (e.key === 'rc_cart') { Cart.items = JSON.parse(e.newValue || '[]'); refresh(); } });
  refresh(); applyI18n(); DB.onSettings(s => { bind(s); applyI18n(); if (drawer.classList.contains('open')) renderDrawer(true); });

  initOrderWidget(page);
  try { const m0 = JSON.parse(localStorage.getItem('rc_orders') || '[]')[0];
    if (m0?.id) { Active.loaded = false;
      const ready = () => { if (!Active.loaded) { Active.loaded = true; if (drawer.classList.contains('open')) renderDrawer(true); } };
      DB.subDoc('orders', m0.id, o => { Active.order = o; Active.loaded = true; if (drawer.classList.contains('open')) renderDrawer(true); });
      setTimeout(ready, 4000); } } catch {}

  /* --- drawer rendering (cart + checkout) --- */
  let form = { mode: 'add', type: 'dine', table: localStorage.getItem('rc_table') || '', name: localStorage.getItem('rc_name') || '', phone: '', note: '' };
  function renderDrawer(keepForm) {
    const body = document.getElementById('drBody');
    if (keepForm) { const f = body.querySelector('form'); if (f) readForm(f); }
    const s = DB.settings, closed = !s.ordering.open;
    if (!Cart.items.length) { body.innerHTML = `<div class="empty"><i class="fa-solid fa-bag-shopping"></i><p>${ui('cart_empty')}</p><a class="btn" href="menu.html">${ui('view_menu')}</a></div>`; return; }
    const tables = Math.max(1, Math.min(200, +s.ordering.tables || 20));
    const ao = Active.order, waiting = !Active.loaded;
    const canAdd = !!(ao && ((['pending', 'preparing', 'ready'].includes(ao.status) && Date.now() - (ao.createdAt || 0) < 6 * 3600 * 1000) || (ao.status === 'completed' && ao.type === 'dine' && Date.now() - (ao.updatedAt || 0) < 3 * 3600 * 1000)));
    const adding = canAdd && form.mode !== 'new';
    body.innerHTML = `<ul class="ci-list">${Cart.items.map(i => `<li><div><b>${esc(tr(i.name))}</b>${i.variant ? `<small>${esc(tr(i.variant))}</small>` : ''}<span class="muted">${money(i.price)}</span></div>
        <div class="qty"><button data-d="-1" data-k="${esc(i.key)}" aria-label="-">−</button><b>${num(i.qty)}</b><button data-d="1" data-k="${esc(i.key)}" aria-label="+">+</button></div></li>`).join('')}</ul>
      ${adding ? `<div class="sumbox"><div><span>${ui('prev_total')} · #${num(ao.orderNo)}</span><b>${money(ao.total)}</b></div><div><span>${ui('new_items')}</span><b>+ ${money(Cart.total)}</b></div><div class="g"><span>${ui('new_total')}</span><b>${money(ao.total + Cart.total)}</b></div></div>`
        : `<div class="tot"><span>${ui('total')}</span><b>${money(Cart.total)}</b></div>`}
      ${closed ? `<p class="warn">${esc(tr(s.ordering.closedMsg) || ui('ordering_closed'))}</p>` : ''}
      <form id="coForm" novalidate>
        ${canAdd ? `<div class="addbox"><div class="addbox-h"><i class="fa-solid fa-receipt"></i><b>${ui('running_order')} #${num(ao.orderNo)}</b><span class="ow-pill">${stL(ao.status)}</span></div>
          <div class="seg"><label><input type="radio" name="mode" value="add" ${adding ? 'checked' : ''}><span>${ui('add_to_order')}</span></label>
          <label><input type="radio" name="mode" value="new" ${adding ? '' : 'checked'}><span>${ui('new_order')}</span></label></div>
          ${adding ? `<p class="muted addhint">${ui('add_hint')}</p>` : ''}</div>` : ''}
        ${adding ? '' : `${s.ordering.takeaway ? `<div class="seg"><label><input type="radio" name="type" value="dine" ${form.type === 'dine' ? 'checked' : ''}><span>${ui('dine_in')}</span></label>
          <label><input type="radio" name="type" value="takeaway" ${form.type === 'takeaway' ? 'checked' : ''}><span>${ui('takeaway')}</span></label></div>` : ''}
        <div class="f-table" ${form.type === 'takeaway' && s.ordering.takeaway ? 'hidden' : ''}><label>${ui('table_no')}</label>
          <select name="table"><option value="">${ui('choose_table')}</option>${Array.from({ length: tables }, (_, k) => `<option ${String(k + 1) === form.table ? 'selected' : ''}>${k + 1}</option>`).join('')}</select></div>
        <div><label>${ui('your_name')} <small class="muted">(${form.type === 'takeaway' ? '' : ui('opt')})</small></label><input name="name" maxlength="60" value="${esc(form.name)}" autocomplete="name"></div>
        <div><label>${ui('phone')} <small class="muted">(${ui('opt')})</small></label><input name="phone" type="tel" maxlength="20" inputmode="tel" value="${esc(form.phone)}"></div>`}
        <div><label>${ui('note')} <small class="muted">(${ui('opt')})</small></label><textarea name="note" rows="2" maxlength="200" placeholder="${ui('note_ph')}">${esc(form.note)}</textarea></div>
        <p class="err" id="coErr" hidden></p>
        <button class="btn btn-block" id="coBtn" ${closed || waiting ? 'disabled' : ''}>${adding ? ui('add_btn') + ' · +' + money(Cart.total) : ui('place_order') + ' · ' + money(Cart.total)}</button>
      </form>`;
    body.querySelectorAll('.qty button').forEach(b => b.onclick = () => Cart.change(b.dataset.k, +b.dataset.d));
    const f = body.querySelector('form');
    f.querySelectorAll('input[name=type],input[name=mode]').forEach(r => r.onchange = () => { readForm(f); renderDrawer(); });
    f.onsubmit = async e => {
      e.preventDefault(); readForm(f); const err = document.getElementById('coErr'), btn = document.getElementById('coBtn');
      if (adding) {
        err.hidden = true; btn.disabled = true; btn.textContent = ui('placing');
        try {
          await DB.addToOrder(ao.id, { items: Cart.items.map(i => ({ name: i.name, variant: i.variant, price: i.price, qty: i.qty })), note: form.note.trim() });
          Cart.clear(); form.note = ''; location.href = 'track.html?o=' + ao.id;
        } catch (ex) {
          console.error(ex);
          if (ex.code === 'order-closed' || ex.code === 'not-found') { form.mode = 'new'; renderDrawer(); const e2 = document.getElementById('coErr'); if (e2) { e2.textContent = ui('add_closed'); e2.hidden = false; } return; }
          err.textContent = ui('order_fail'); err.hidden = false; btn.disabled = false; btn.textContent = ui('add_btn');
        }
        return;
      }
      const takeaway = form.type === 'takeaway' && s.ordering.takeaway;
      const bad = takeaway ? (!form.name.trim() && ui('need_name')) : (!form.table && ui('need_table'));
      if (bad) { err.textContent = bad; err.hidden = false; return; }
      err.hidden = true; btn.disabled = true; btn.textContent = ui('placing');
      try {
        const order = { type: takeaway ? 'takeaway' : 'dine', table: takeaway ? '' : form.table, name: form.name.trim(), phone: form.phone.trim(), note: form.note.trim(),
          items: Cart.items.map(i => ({ name: i.name, variant: i.variant, price: i.price, qty: i.qty })), total: Cart.total };
        const r = await DB.createOrder(order);
        localStorage.setItem('rc_name', form.name.trim()); if (form.table) localStorage.setItem('rc_table', form.table);
        const mine = JSON.parse(localStorage.getItem('rc_orders') || '[]'); mine.unshift({ id: r.id, no: r.orderNo, t: Date.now() });
        localStorage.setItem('rc_orders', JSON.stringify(mine.slice(0, 12)));
        Cart.clear(); location.href = 'track.html?o=' + r.id;
      } catch (ex) { console.error(ex); err.textContent = ui('order_fail'); err.hidden = false; btn.disabled = false; btn.textContent = ui('place_order'); }
    };
  }
  function readForm(f) { const d = new FormData(f); form = { mode: d.get('mode') || form.mode, type: d.get('type') || form.type, table: d.get('table') ?? form.table, name: d.get('name') ?? '', phone: d.get('phone') ?? '', note: d.get('note') ?? '' }; }
}
