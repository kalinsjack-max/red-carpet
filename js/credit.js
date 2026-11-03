// ⚠ ডেভেলপার ক্রেডিট — এটি ডেটাবেস বা অ্যাডমিন প্যানেল থেকে বদলানো যায় না (কোডে লক করা)।
const TEXT = 'Developed By : AISHORJO';
const FB = 'https://www.facebook.com/saim.aishorjo'; // ← এখানে আপনার ফেসবুক লিংক বসান
const FB_ICON = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>';
const html = `<p data-credit class="credit">Developed By : <span><a class="credit-link" href="${FB}" target="_blank" rel="noopener" aria-label="AISHORJO on Facebook"><i>${FB_ICON}</i>AISHORJO</a></span></p>`;
const CSS = `
.credit-link{position:relative;display:inline-flex;align-items:center;color:inherit;text-decoration:none;padding:2px 2px 3px;border-radius:6px;cursor:pointer;transition:transform .35s cubic-bezier(.2,1.2,.4,1),text-shadow .35s ease,letter-spacing .35s ease}
.credit-link i{display:inline-grid;place-items:center;width:0;opacity:0;overflow:hidden;margin-right:0;color:#4c8dff;transform:translateX(-8px) rotate(-25deg) scale(.4);transition:width .35s ease,margin .35s ease,opacity .3s ease,transform .45s cubic-bezier(.2,1.4,.4,1)}
.credit-link::after{content:"";position:absolute;left:2px;right:2px;bottom:0;height:2px;border-radius:2px;background:linear-gradient(90deg,currentColor,#4c8dff);transform:scaleX(0);transform-origin:right;transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.credit-link:hover,.credit-link:focus-visible{transform:translateY(-2px);letter-spacing:.06em;text-shadow:0 0 14px currentColor;outline:none}
.credit-link:hover i,.credit-link:focus-visible i{width:16px;margin-right:6px;opacity:1;transform:none}
.credit-link:hover::after,.credit-link:focus-visible::after{transform:scaleX(1);transform-origin:left}
@media(prefers-reduced-motion:reduce){.credit-link,.credit-link i,.credit-link::after{transition:none}}`;
export function mountCredit(host) {
  if (!host) return;
  if (!document.getElementById('credit-css')) { const s = document.createElement('style'); s.id = 'credit-css'; s.textContent = CSS; document.head.append(s); }
  const ensure = () => {
    const el = host.querySelector('[data-credit]');
    if (el && el.textContent.trim() === TEXT && el.querySelector('a.credit-link')) return;
    el && el.remove();
    host.insertAdjacentHTML('beforeend', html);
  };
  ensure();
  new MutationObserver(ensure).observe(host, { childList: true, subtree: true, characterData: true, attributes: true });
}
