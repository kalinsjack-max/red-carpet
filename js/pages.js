import * as DB from './db.js';
import { OWNER_NOTIFY_EMAIL } from './config.js';
import { ui, tr, lang, money, num, esc, applyI18n } from './i18n.js';
import { initLayout, Cart, toast, bind, STEPS, stL, sdL, stepAt } from './layout.js';

const $ = (s, r = document) => r.querySelector(s);
const imgOrIcon = (it, cat) => it.image ? `<img src="${esc(it.image)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph'}))">` : `<div class="ph"><i class="fa-solid ${esc(cat?.icon || 'fa-utensils')}"></i></div>`;

/* ---------- Menu ---------- */
function dishCard(it, cat) {
  const vs = it.variants?.length ? it.variants : [{ label: null, price: 0 }], open = DB.settings.ordering.open;
  return `<article class="dish ${it.available === false ? 'off' : ''}" data-id="${esc(it.id)}">
    <div class="dish-img">${imgOrIcon(it, cat)}${it.available === false ? `<span class="tag">${ui('sold_out')}</span>` : it.featured ? `<span class="tag pop"><i class="fa-solid fa-fire"></i> ${ui('pop_tag')}</span>` : ''}</div>
    <div class="dish-b"><h3>${esc(tr(it.name))}</h3><p>${esc(tr(it.desc))}</p>
      ${vs.length > 1 ? `<div class="vars" role="radiogroup">${vs.map((v, i) => `<label><input type="radio" name="v-${esc(it.id)}" value="${i}" ${i === 0 ? 'checked' : ''}><span>${esc(tr(v.label))} <b>${money(v.price)}</b></span></label>`).join('')}</div>`
        : `<div class="price">${money(vs[0].price)}</div>`}
      ${it.available === false || !open ? '' : `<button class="btn btn-sm add" data-id="${esc(it.id)}"><i class="fa-solid fa-plus"></i> ${ui('add')}</button>`}</div></article>`;
}
function pageMenu() {
  let data = { categories: [], items: [] }, active = 'all', q = new URLSearchParams(location.search).get('q') || '';
  const search = $('#search'); search.value = q;
  const render = () => {
    const { categories, items } = data, term = q.trim().toLowerCase();
    $('#pills').innerHTML = [['all', ui('all_cat')], ...categories.map(c => [c.id, tr(c.name)])].map(([id, n]) => `<button class="pill ${active === id ? 'on' : ''}" data-cat="${esc(id)}">${esc(n)}</button>`).join('');
    let html = '', n = 0;
    categories.forEach(c => {
      if (active !== 'all' && active !== c.id) return;
      const its = items.filter(i => i.cat === c.id && (!term || (tr(i.name) + tr(i.desc) + (i.name?.en || '') + (i.name?.bn || '')).toLowerCase().includes(term)));
      if (!its.length) return; n += its.length;
      html += `<section class="mcat" id="c-${esc(c.id)}"><h2><i class="fa-solid ${esc(c.icon || 'fa-utensils')}"></i> ${esc(tr(c.name))}</h2><div class="dishes">${its.map(i => dishCard(i, c)).join('')}</div></section>`;
    });
    $('#menuList').innerHTML = n ? html : `<p class="empty-s">${ui('no_results')}</p>`;
    $('#menuList').querySelectorAll('.add').forEach(b => b.onclick = () => {
      const it = data.items.find(x => x.id === b.dataset.id), r = b.closest('.dish').querySelector('input:checked');
      Cart.add(it, r ? +r.value : 0); toast(ui('added') + ' ✓', 'ok');
    });
    $('#pills').querySelectorAll('.pill').forEach(b => b.onclick = () => { active = b.dataset.cat; render(); });
  };
  search.oninput = () => { q = search.value; render(); };
  DB.watchMenu(d => { data = d; render(); });
}

/* ---------- Home ---------- */
function pageHome() {
  DB.watchMenu(({ categories, items }) => {
    const pick = items.filter(i => i.featured && i.available !== false).slice(0, 6);
    $('#popular').innerHTML = pick.map(i => dishCard(i, categories.find(c => c.id === i.cat))).join('');
    $('#popular').querySelectorAll('.add').forEach(b => b.onclick = () => { const it = items.find(x => x.id === b.dataset.id), r = b.closest('.dish').querySelector('input:checked'); Cart.add(it, r ? +r.value : 0); toast(ui('added') + ' ✓', 'ok'); });
  });
  DB.onSettings(s => { $('#svcGrid').innerHTML = s.services.slice(0, 3).map(svcCard).join(''); });
}
const svcCard = v => `<article class="svc"><span class="ic"><i class="fa-solid ${esc(v.icon || 'fa-star')}"></i></span><h3>${esc(tr(v.title))}</h3><p>${esc(tr(v.text))}</p></article>`;
function pageServices() { DB.onSettings(s => { $('#svcGrid').innerHTML = s.services.map(svcCard).join(''); }); }
function pageAbout() { DB.onSettings(s => { $('#aboutCards').innerHTML = s.about.cards.map(c => `<article class="svc"><h3>${esc(tr(c.title))}</h3><p>${esc(tr(c.text))}</p></article>`).join(''); }); }

/* ---------- Gallery ---------- */
function pageGallery() {
  const lb = $('#lightbox');
  DB.watchGallery(g => {
    $('#galGrid').innerHTML = g.map(x => `<button class="gi" data-src="${esc(x.src)}"><img src="${esc(x.src)}" alt="${esc(tr(x.caption))}" loading="lazy"><span>${esc(tr(x.caption))}</span></button>`).join('');
    $('#galGrid').querySelectorAll('.gi').forEach(b => b.onclick = () => { lb.querySelector('img').src = b.dataset.src; lb.hidden = false; });
  });
  lb.onclick = () => { lb.hidden = true; }; addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });
}

/* ---------- Booking ---------- */
function pageBooking() {
  const f = $('#bkForm'), ok = $('#bkOk'), err = $('#bkErr');
  const d = $('#b-date'); d.min = new Date().toISOString().slice(0, 10);
  const types = [['t_wedding', 'Destination Wedding'], ['t_convention', 'Convention Centre'], ['t_corporate', 'Corporate Conference'], ['t_party', 'Party Hall'], ['t_table', 'Restaurant Table']];
  $('#b-type').innerHTML = types.map(t => `<option value="${t[1]}">${ui(t[0])}</option>`).join('');
  f.onsubmit = async e => {
    e.preventDefault(); if (f.website.value) return; // honeypot
    err.hidden = true; const btn = $('#bkBtn'); btn.disabled = true; btn.textContent = ui('placing');
    const data = { name: f.name.value.trim(), phone: f.phone.value.trim(), type: f.type.value, date: f.date.value, time: f.time.value, guests: +f.guests.value || 0, note: f.note.value.trim(), status: 'new' };
    try {
      await DB.add('bookings', data);
      if (OWNER_NOTIFY_EMAIL) fetch('https://formsubmit.co/ajax/' + encodeURIComponent(OWNER_NOTIFY_EMAIL), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: 'নতুন বুকিং — Red Carpet', Name: data.name, Phone: data.phone, Service: data.type, Date: data.date, Time: data.time, Guests: data.guests, Note: data.note }) }).catch(() => {});
      f.hidden = true; ok.hidden = false; scrollTo({ top: 0, behavior: 'smooth' });
    } catch (ex) { console.error(ex); err.textContent = ui('b_fail'); err.hidden = false; btn.disabled = false; btn.textContent = ui('b_send'); }
  };
  $('#bkAgain').onclick = () => { f.reset(); f.hidden = false; ok.hidden = true; $('#bkBtn').disabled = false; $('#bkBtn').textContent = ui('b_send'); };
}

/* ---------- Order tracking ---------- */
// নতুন ট্র্যাকিং পেজের লেখা (i18n.js-এ হাত দিতে হয় না)  [বাংলা, English]
const TK = {
  live: ['লাইভ আপডেট', 'Live Update'],
  progress: ['অর্ডারের অগ্রগতি', 'Order progress'],
  items: ['আপনার অর্ডার', 'Your order'],
  pay: ['পেমেন্ট কাউন্টারে — অনলাইনে কিছু দিতে হবে না।', 'Pay at the counter — nothing to pay online.'],
  share: ['লিংক শেয়ার', 'Share link'], copied: ['লিংক কপি হয়েছে ✓', 'Link copied ✓'],
  call: ['রেস্টুরেন্টে কল', 'Call restaurant'],
  fail: ['অর্ডারের তথ্য আনা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।', 'Could not load your order. Check your connection and try again.'],
  retry: ['আবার চেষ্টা করুন', 'Try again'],
  now: ['এইমাত্র', 'Just now'], placed: ['অর্ডার করেছেন', 'Ordered'],
  first: ['প্রথম অর্ডার', 'First order'], later: ['আরও যোগ করা হয়েছে', 'Added later'], print: ['রসিদ প্রিন্ট', 'Print receipt']
};
const T = k => TK[k][lang === 'en' ? 1 : 0];

function pageTrack() {
  DB.setPoll((window.RC && window.RC.poll && window.RC.poll.track) || 4000);
  const loc = lang === 'en' ? 'en-US' : 'bn-BD';
  let mine = []; try { mine = JSON.parse(localStorage.getItem('rc_orders') || '[]'); } catch {}
  const id = new URLSearchParams(location.search).get('o') || mine[0]?.id;
  const box = $('#trackBox');
  const clock = ms => new Date(ms).toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  const ago = ms => {
    const m = Math.max(0, Math.floor((Date.now() - ms) / 60000));
    if (m < 1) return T('now');
    if (m < 60) return lang === 'en' ? `${m} min ago` : `${num(m)} মিনিট আগে`;
    const h = Math.floor(m / 60);
    if (h < 24) return lang === 'en' ? `${h} hr ago` : `${num(h)} ঘণ্টা আগে`;
    return new Date(ms).toLocaleDateString(loc, { day: 'numeric', month: 'short' });
  };
  const empty = (icon, msg, btn) => `<div class="tk-card tk-empty"><i class="fa-solid ${icon}"></i><p>${msg}</p>${btn}</div>`;
  const menuBtn = `<a class="btn" href="menu.html"><i class="fa-solid fa-utensils"></i> ${ui('view_menu')}</a>`;

  if (!id) { box.innerHTML = empty('fa-receipt', ui('track_none'), menuBtn); return; }

  // পুরোনো অর্ডারের তালিকা
  const others = mine.filter(m => m.id !== id);
  if (others.length) $('#trackOthers').innerHTML = `<h3 class="tk-oh">${ui('recent_orders')}</h3><div class="tk-ol">${others.map(m =>
    `<a class="tk-oi" href="track.html?o=${esc(m.id)}"><b>#${num(m.no)}</b>${m.t ? `<small>${ago(m.t)}</small>` : ''}</a>`).join('')}</div>`;

  // লোডিং স্কেলিটন
  box.innerHTML = `<div class="tk"><div class="tk-sk tk-sk-h"></div><div class="tk-sk tk-sk-b"></div><div class="tk-sk tk-sk-b"></div></div>`;

  const ICON = { pending: 'fa-hourglass-half', preparing: 'fa-fire-burner', ready: 'fa-bell-concierge', completed: 'fa-circle-check', cancelled: 'fa-ban' };
  let last = null, cur = null, prevP = 0;

  const itemLi = i => `<li><span class="tk-q">${num(i.qty)}×</span><span class="tk-nm">${esc(tr(i.name))}${i.variant ? `<small>${esc(tr(i.variant))}</small>` : ''}</span><b>${money(i.qty * i.price)}</b></li>`;
  function itemsHtml(items) {
    const g = {}; items.forEach(i => (g[i.r || 1] = g[i.r || 1] || []).push(i));
    const rs = Object.keys(g).map(Number).sort((a, b) => a - b);
    if (rs.length < 2) return items.map(itemLi).join('');
    return rs.map((r, k) => `<li class="tk-round${k ? ' more' : ''}">${k ? '<i class="fa-solid fa-circle-plus"></i> ' + T('later') + ' (' + num(r) + ')' : T('first')}</li>` + g[r].map(itemLi).join('')).join('');
  }
  function draw() {
    const o = cur; if (!o) return;
    const cancelled = o.status === 'cancelled';
    const at = stepAt(o.status);      // সর্বশেষ ধাপ: 0 পেন্ডিং · 1 প্রস্তুত · 2 রেডি · 3 সম্পন্ন
    const created = o.createdAt || Date.now(), upd = o.updatedAt || created;
    const phone = DB.settings.contact?.phone || '';
    const p = at / 3, cnt = o.items.reduce((a, i) => a + i.qty, 0);

    const timeline = cancelled ? '' : `<div class="tk-card"><h3 class="tk-h"><span>${T('progress')}</span></h3>
      <div class="tk-track"><div class="tk-line"><div class="tk-fill" style="--p:${prevP}"></div></div><ol class="tk-steps">
        ${STEPS.map(([k, ic], i) => {
          const st = i < at ? 'done' : i === at ? (o.status === 'completed' ? 'done' : 'now') : '';
          const time = i === 0 ? clock(created) : (i === at ? clock(upd) : '');
          return `<li class="${st}"><span class="tk-dot"><i class="fa-solid ${st === 'done' ? 'fa-check' : ic}"></i></span>${esc(stL(k))}<span class="tk-t">${time}</span></li>`;
        }).join('')}</ol></div></div>`;

    box.innerHTML = `<div class="tk">
      <section class="tk-hero s-${esc(o.status)}" aria-live="polite">
        <span class="tk-live"><i></i>${T('live')}</span>
        <div class="tk-hero-main">
          <div class="tk-ic"><i class="fa-solid ${ICON[o.status] || 'fa-fire-burner'}"></i></div>
          <div><small class="tk-eyebrow">${ui('order_no')}</small><div class="tk-num">#${num(o.orderNo)}</div></div></div>
        <h2 class="tk-st">${stL(o.status)}</h2><p class="tk-sd">${esc(sdL(o.status))}</p>
        <div class="tk-chips">
          <span class="tk-chip">${o.type === 'takeaway' ? `<i class="fa-solid fa-bag-shopping"></i> ${ui('takeaway')}` : `<i class="fa-solid fa-chair"></i> ${ui('for_table')} ${num(o.table)}`}</span>
          ${o.name ? `<span class="tk-chip"><i class="fa-solid fa-user"></i> ${esc(o.name)}</span>` : ''}
          <span class="tk-chip" data-since="${created}"><i class="fa-solid fa-clock"></i> ${T('placed')}: <b>${clock(created)}</b>${['pending', 'preparing', 'ready'].includes(o.status) ? ` · <span data-ago>${ago(created)}</span>` : ''}</span>
        </div></section>
      ${timeline}
      <div class="tk-card"><h3 class="tk-h"><span>${T('items')}</span><small>${num(cnt)} ${lang === 'en' && cnt === 1 ? 'item' : ui('items')}</small></h3>
        <ul class="tk-items">${itemsHtml(o.items)}</ul>
        <div class="tk-sum"><span>${ui('total')}</span><b>${money(o.total)}</b></div>
        ${o.note ? `<p class="tk-note"><i class="fa-solid fa-note-sticky"></i> ${esc(o.note)}</p>` : ''}
        <p class="tk-pay"><i class="fa-solid fa-money-bill-wave"></i> ${T('pay')}</p></div>
      <div class="tk-acts">
        ${phone ? `<a class="btn ${cancelled ? '' : 'btn-ghost'}" href="tel:${esc(phone)}"><i class="fa-solid fa-phone"></i> ${T('call')}</a>` : ''}
        <button class="btn btn-ghost" id="tkPrint" type="button"><i class="fa-solid fa-print"></i> ${T('print')}</button>
        <button class="btn btn-ghost" id="tkShare" type="button"><i class="fa-solid fa-share-nodes"></i> ${T('share')}</button>
        <a class="btn" href="menu.html"><i class="fa-solid fa-plus"></i> ${ui('order_more')}</a></div></div>`;

    // প্রোগ্রেস বার অ্যানিমেশন
    const fill = box.querySelector('.tk-fill');
    if (fill) requestAnimationFrame(() => requestAnimationFrame(() => fill.style.setProperty('--p', p)));
    prevP = p;

    $('#tkPrint').onclick = () => print();
    $('#tkShare').onclick = async () => {
      const url = `${location.origin}${location.pathname}?o=${encodeURIComponent(id)}`;
      try { if (navigator.share) await navigator.share({ title: document.title, url }); else { await navigator.clipboard.writeText(url); toast(T('copied'), 'ok'); } } catch {}
    };
  }

  DB.subDoc('orders', id, (o, err) => {
    if (err) { box.innerHTML = empty('fa-triangle-exclamation', T('fail'), `<button class="btn" type="button" onclick="location.reload()"><i class="fa-solid fa-rotate-right"></i> ${T('retry')}</button>`); cur = null; return; }
    if (!o) { box.innerHTML = empty('fa-receipt', ui('track_none'), menuBtn); cur = null; return; }
    cur = o; draw();
    if (last && last !== o.status && o.status === 'ready') { navigator.vibrate?.([200, 100, 200]); toast(sdL('ready'), 'ok'); }
    last = o.status;
  });
  DB.onSettings(() => draw());                       // ফোন নম্বর পরে লোড হলে বাটন ঠিক হয়ে যাবে
  setInterval(() => { box.querySelectorAll('[data-since]').forEach(e => { const a = e.querySelector('[data-ago]'); if (a) a.textContent = ago(+e.dataset.since); }); }, 20000);
}

const PAGES = { home: pageHome, menu: pageMenu, services: pageServices, about: pageAbout, gallery: pageGallery, booking: pageBooking, track: pageTrack };
export function boot() {
  const page = document.body.dataset.page;
  initLayout(page); applyI18n(); bind();
  try { PAGES[page]?.(); } catch (e) { console.error(e); }
  applyI18n();
}
