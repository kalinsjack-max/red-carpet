// ⚠ ডেভেলপার ক্রেডিট — এটি ডেটাবেস বা অ্যাডমিন প্যানেল থেকে বদলানো যায় না (কোডে লক করা)।
const TEXT = 'Developed By : AISHORJO';
const html = '<p data-credit class="credit">Developed By : <span><a href="https://www.facebook.com/saim.aishorjo" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">AISHORJO</a></span></p>';
export function mountCredit(host) {
  if (!host) return;
  const ensure = () => {
    const el = host.querySelector('[data-credit]');
    if (el && el.textContent.trim() === TEXT) return;
    el && el.remove();
    host.insertAdjacentHTML('beforeend', html);
  };
  ensure();
  new MutationObserver(ensure).observe(host, { childList: true, subtree: true, characterData: true, attributes: true });
}
