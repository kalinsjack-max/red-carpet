import * as DB from './db.js';
import { OWNER_NOTIFY_EMAIL } from './config.js';
import { ui, tr, money, num, esc, applyI18n } from './i18n.js';
import { initLayout, Cart, toast, bind } from './layout.js';

const $ = (s, r = document) => r.querySelector(s);
const imgOrIcon = (it, cat) => it.image ? `<img src="${esc(it.image)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph'}))">` : `<div class="ph"><i class="fa-solid ${esc(cat?.icon || 'fa-utensils')}"></i></div>`;

/* ---------- Menu ---------- */
function dishCard(it, cat) {
  const vs = it.variants?.length ? it.variants : [{ label: null, price: 0 }], open = DB.settings.ordering.open;
  return `<article class="dish ${it.available === false ? 'off' : ''}" data-id="${esc(it.id)}">
    <div class="dish-img">${imgOrIcon(it, cat)}${it.available === false ? `<span class="tag">${ui('sold_out')}</span>` : ''}</div>
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
function pageTrack() {
  const mine = JSON.parse(localStorage.getItem('rc_orders') || '[]');
  const id = new URLSearchParams(location.search).get('o') || mine[0]?.id;
  const box = $('#trackBox');
  if (!id) { box.innerHTML = `<div class="empty"><i class="fa-solid fa-receipt"></i><p>${ui('track_none')}</p><a class="btn" href="menu.html">${ui('view_menu')}</a></div>`; return; }
  const steps = ['preparing', 'ready', 'completed']; let last = null;
  DB.subDoc('orders', id, o => {
    if (!o) { box.innerHTML = `<div class="empty"><i class="fa-solid fa-receipt"></i><p>${ui('track_none')}</p><a class="btn" href="menu.html">${ui('view_menu')}</a></div>`; return; }
    const cancelled = o.status === 'cancelled', idx = steps.indexOf(o.status);
    box.innerHTML = `<div class="tk-top"><div><small>${ui('order_no')}</small><div class="tk-no">#${num(o.orderNo)}</div></div>
        <div class="tk-meta">${o.type === 'takeaway' ? `<i class="fa-solid fa-bag-shopping"></i> ${ui('takeaway')}` : `<i class="fa-solid fa-chair"></i> ${ui('for_table')} ${num(o.table)}`}${o.name ? `<br>${esc(o.name)}` : ''}</div></div>
      <div class="tk-state s-${o.status}"><b>${ui('st_' + o.status)}</b><p>${ui('st_' + o.status + '_d')}</p></div>
      ${cancelled ? '' : `<ol class="steps">${steps.map((s, i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}"><span>${i < idx ? '<i class="fa-solid fa-check"></i>' : num(i + 1)}</span>${ui('st_' + s)}</li>`).join('')}</ol>`}
      <h3>${ui('your_items')}</h3><ul class="tk-items">${o.items.map(i => `<li><span>${num(i.qty)} × ${esc(tr(i.name))}${i.variant ? ` <small>(${esc(tr(i.variant))})</small>` : ''}</span><b>${money(i.qty * i.price)}</b></li>`).join('')}</ul>
      <div class="tot"><span>${ui('total')}</span><b>${money(o.total)}</b></div>${o.note ? `<p class="muted">“${esc(o.note)}”</p>` : ''}
      <a class="btn btn-ghost" href="menu.html">${ui('order_more')}</a>`;
    if (last && last !== o.status && o.status === 'ready') { navigator.vibrate?.([200, 100, 200]); toast(ui('st_ready_d'), 'ok'); }
    last = o.status;
  });
  const others = mine.filter(m => m.id !== id);
  if (others.length) $('#trackOthers').innerHTML = `<h3>${ui('recent_orders')}</h3>` + others.map(m => `<a class="btn btn-sm btn-ghost" href="track.html?o=${esc(m.id)}">#${num(m.no)}</a>`).join(' ');
}

const PAGES = { home: pageHome, menu: pageMenu, services: pageServices, about: pageAbout, gallery: pageGallery, booking: pageBooking, track: pageTrack };
export function boot() {
  const page = document.body.dataset.page;
  initLayout(page); applyI18n(); bind();
  try { PAGES[page]?.(); } catch (e) { console.error(e); }
  applyI18n();
}
