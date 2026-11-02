// অ্যাডমিন ও কিচেনের লগইন গার্ড। আসল নিরাপত্তা firestore.rules দেয়; এটি শুধু স্ক্রিন দেখানো/লুকানোর জন্য।
import * as DB from './db.js';
import { mountCredit } from './credit.js';
import { esc } from './i18n.js';

/* ---------- সুন্দর পপআপ (ব্রাউজারের ডিফল্ট confirm/alert/prompt-এর বদলে) ---------- */
function openDialog({ icon = 'fa-circle-question', tone = 'info', title = '', message = '', ok = 'ঠিক আছে', cancel = 'বাতিল', single = false, input = null }) {
  return new Promise(resolve => {
    const prev = document.activeElement, w = document.createElement('div'); w.className = 'dlg-wrap';
    w.innerHTML = `<div class="dlg ${tone}" role="alertdialog" aria-modal="true" aria-labelledby="dlgT">
      <div class="dlg-ic"><i class="fa-solid ${icon}"></i></div><h3 id="dlgT">${esc(title)}</h3>${message ? `<p>${esc(message)}</p>` : ''}
      ${input ? `<input class="dlg-in" type="${input.type || 'text'}" placeholder="${esc(input.placeholder || '')}" value="${esc(input.value || '')}" autocomplete="off">` : ''}
      <p class="dlg-err" hidden></p>
      <div class="dlg-b">${single ? '' : `<button type="button" class="dlg-c">${esc(cancel)}</button>`}<button type="button" class="dlg-o">${esc(ok)}</button></div></div>`;
    document.body.append(w);
    const box = w.querySelector('.dlg'), inp = w.querySelector('.dlg-in'), okB = w.querySelector('.dlg-o'), cB = w.querySelector('.dlg-c'), er = w.querySelector('.dlg-err');
    const done = v => { document.removeEventListener('keydown', key, true); w.classList.add('out'); setTimeout(() => { w.remove(); prev?.focus?.(); }, 140); resolve(v); };
    const submit = () => {
      if (!input) return done(true);
      const v = inp.value.trim(), bad = input.validate ? input.validate(v) : '';
      if (bad) { er.textContent = bad; er.hidden = false; inp.focus(); return; }
      done(v);
    };
    const cancelIt = () => done(input ? null : single ? true : false);
    function key(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cancelIt(); }
      else if (e.key === 'Enter' && document.activeElement !== cB) { e.preventDefault(); e.stopPropagation(); submit(); }
      else if (e.key === 'Tab') { const f = [...box.querySelectorAll('input,button')]; const i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
    }
    document.addEventListener('keydown', key, true);
    okB.onclick = submit; if (cB) cB.onclick = cancelIt;
    w.onmousedown = e => { if (e.target === w && !single) cancelIt(); };
    (inp || (tone === 'danger' && cB ? cB : okB)).focus();
  });
}
// হ্যাঁ/না জিজ্ঞাসা — true বা false ফেরত দেয়
export const confirmBox = o => openDialog({ tone: 'danger', icon: 'fa-triangle-exclamation', ok: 'হ্যাঁ', cancel: 'না, থাক', ...o });
// শুধু জানানো
export const alertBox = o => openDialog({ tone: 'warn', icon: 'fa-circle-exclamation', single: true, ...o });
// লেখা ইনপুট — লেখা ফেরত দেয়, বাতিল করলে null
export const promptBox = o => openDialog({ tone: 'info', icon: 'fa-link', ok: 'যোগ করুন', ...o });

export function guard(roles, onReady) {
  const $ = id => document.getElementById(id);
  let started = false;
  if (DB.mode === 'demo') $('demoBar').hidden = false;
  mountCredit($('creditHost')); mountCredit($('creditHost2'));
  $('loginForm').onsubmit = async e => {
    e.preventDefault(); const err = $('loginErr'); err.hidden = true; const b = $('loginBtn'); b.disabled = true;
    try { await DB.login($('email').value.trim(), $('password').value); }
    catch (ex) { console.warn(ex); err.textContent = /network/i.test(ex.code || '') ? 'ইন্টারনেট সংযোগ দেখুন।' : 'ইমেইল বা পাসওয়ার্ড ভুল।'; err.hidden = false; }
    b.disabled = false;
  };
  document.querySelectorAll('[data-logout]').forEach(b => b.onclick = async () => { await DB.logout(); location.reload(); });
  DB.onAuth(u => {
    const role = DB.roleOf(u?.email), ok = u && roles.includes(role);
    $('login').hidden = !!ok; $('app').hidden = !ok;
    if (u && !ok) { $('loginErr').textContent = 'এই অ্যাকাউন্টের এই পেজে ঢোকার অনুমতি নেই। অন্য অ্যাকাউন্টে লগইন করুন।'; $('loginErr').hidden = false; DB.logout(); }
    if (ok && !started) { started = true; onReady(u, role); }
  });
}

export const LOGIN_HTML = (title) => `
<div class="demo-bar" id="demoBar" hidden>⚠ ডেমো মোড — টেস্ট লগইন: admin@redcarpet.com / admin123 · kitchen@redcarpet.com / kitchen123</div>
<section id="login" class="login"><form id="loginForm" class="login-card">
  <img src="../assets/logo-512.png" alt="" width="84" height="84"><h1>${title}</h1><p class="muted">স্টাফ লগইন</p>
  <label>ইমেইল<input id="email" type="email" required autocomplete="username"></label>
  <label>পাসওয়ার্ড<input id="password" type="password" required autocomplete="current-password"></label>
  <p class="err" id="loginErr" hidden></p><button class="btn" id="loginBtn">লগইন</button>
  <a class="back" href="../index.html">← ওয়েবসাইটে ফিরুন</a><div id="creditHost2" class="lc"></div></form></section>`;
