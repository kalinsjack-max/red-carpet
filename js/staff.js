// অ্যাডমিন ও কিচেনের লগইন গার্ড। আসল নিরাপত্তা firestore.rules দেয়; এটি শুধু স্ক্রিন দেখানো/লুকানোর জন্য।
import * as DB from './db.js';
import { mountCredit } from './credit.js';

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
