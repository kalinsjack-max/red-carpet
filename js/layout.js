import * as DB from './db.js';
import { ui, tr, lang, setLang, applyI18n, money, num, esc } from './i18n.js';
import { mountCredit } from './credit.js';

export const toast = (msg, kind = '') => {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.className = 'show ' + kind; t.textContent = msg; clearTimeout(t._h); t._h = setTimeout(() => t.className = '', 2600);
};

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

  const refresh = () => {
    const c = Cart.count; document.getElementById('cartCount').textContent = num(c); document.getElementById('cartCount').hidden = !c;
    const bar = document.getElementById('cartBar'); bar.hidden = !c || page === 'track';
    document.getElementById('cbCount').textContent = num(c) + ' ' + ui('items'); document.getElementById('cbTotal').textContent = money(Cart.total);
    if (drawer.classList.contains('open')) renderDrawer();
  };
  addEventListener('cartchange', refresh); addEventListener('storage', e => { if (e.key === 'rc_cart') { Cart.items = JSON.parse(e.newValue || '[]'); refresh(); } });
  refresh(); applyI18n(); DB.onSettings(s => { bind(s); applyI18n(); if (drawer.classList.contains('open')) renderDrawer(true); });

  /* --- drawer rendering (cart + checkout) --- */
  let form = { type: 'dine', table: localStorage.getItem('rc_table') || '', name: localStorage.getItem('rc_name') || '', phone: '', note: '' };
  function renderDrawer(keepForm) {
    const body = document.getElementById('drBody');
    if (keepForm) { const f = body.querySelector('form'); if (f) readForm(f); }
    const s = DB.settings, closed = !s.ordering.open;
    if (!Cart.items.length) { body.innerHTML = `<div class="empty"><i class="fa-solid fa-bag-shopping"></i><p>${ui('cart_empty')}</p><a class="btn" href="menu.html">${ui('view_menu')}</a></div>`; return; }
    const tables = Math.max(1, Math.min(200, +s.ordering.tables || 20));
    body.innerHTML = `<ul class="ci-list">${Cart.items.map(i => `<li><div><b>${esc(tr(i.name))}</b>${i.variant ? `<small>${esc(tr(i.variant))}</small>` : ''}<span class="muted">${money(i.price)}</span></div>
        <div class="qty"><button data-d="-1" data-k="${esc(i.key)}" aria-label="-">−</button><b>${num(i.qty)}</b><button data-d="1" data-k="${esc(i.key)}" aria-label="+">+</button></div></li>`).join('')}</ul>
      <div class="tot"><span>${ui('total')}</span><b>${money(Cart.total)}</b></div>
      ${closed ? `<p class="warn">${esc(tr(s.ordering.closedMsg) || ui('ordering_closed'))}</p>` : ''}
      <form id="coForm" novalidate>
        ${s.ordering.takeaway ? `<div class="seg"><label><input type="radio" name="type" value="dine" ${form.type === 'dine' ? 'checked' : ''}><span>${ui('dine_in')}</span></label>
          <label><input type="radio" name="type" value="takeaway" ${form.type === 'takeaway' ? 'checked' : ''}><span>${ui('takeaway')}</span></label></div>` : ''}
        <div class="f-table" ${form.type === 'takeaway' && s.ordering.takeaway ? 'hidden' : ''}><label>${ui('table_no')}</label>
          <select name="table"><option value="">${ui('choose_table')}</option>${Array.from({ length: tables }, (_, k) => `<option ${String(k + 1) === form.table ? 'selected' : ''}>${k + 1}</option>`).join('')}</select></div>
        <div><label>${ui('your_name')} <small class="muted">(${form.type === 'takeaway' ? '' : ui('opt')})</small></label><input name="name" maxlength="60" value="${esc(form.name)}" autocomplete="name"></div>
        <div><label>${ui('phone')} <small class="muted">(${ui('opt')})</small></label><input name="phone" type="tel" maxlength="20" inputmode="tel" value="${esc(form.phone)}"></div>
        <div><label>${ui('note')} <small class="muted">(${ui('opt')})</small></label><textarea name="note" rows="2" maxlength="200" placeholder="${ui('note_ph')}">${esc(form.note)}</textarea></div>
        <p class="err" id="coErr" hidden></p>
        <button class="btn btn-block" id="coBtn" ${closed ? 'disabled' : ''}>${ui('place_order')} · ${money(Cart.total)}</button>
      </form>`;
    body.querySelectorAll('.qty button').forEach(b => b.onclick = () => Cart.change(b.dataset.k, +b.dataset.d));
    const f = body.querySelector('form');
    f.querySelectorAll('input[name=type]').forEach(r => r.onchange = () => { readForm(f); renderDrawer(); });
    f.onsubmit = async e => {
      e.preventDefault(); readForm(f); const err = document.getElementById('coErr'), btn = document.getElementById('coBtn');
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
  function readForm(f) { const d = new FormData(f); form = { type: d.get('type') || form.type, table: d.get('table') ?? form.table, name: d.get('name') ?? '', phone: d.get('phone') ?? '', note: d.get('note') ?? '' }; }
}
