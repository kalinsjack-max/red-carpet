// ভাষা: ডিফল্ট বাংলা, ইউজার চাইলে ইংরেজি।
const KEY = 'rc_lang';
export let lang = localStorage.getItem(KEY) === 'en' ? 'en' : 'bn';
document.documentElement.lang = lang;

const U = {
  nav_home: ['হোম', 'Home'], nav_about: ['আমাদের সম্পর্কে', 'About'], nav_services: ['সেবাসমূহ', 'Services'],
  nav_menu: ['মেনু', 'Menu'], nav_gallery: ['গ্যালারি', 'Gallery'], nav_booking: ['বুকিং ও যোগাযোগ', 'Booking & Contact'],
  nav_track: ['অর্ডার ট্র্যাক', 'Track order'], order_now: ['এখনই অর্ডার করুন', 'Order now'], book_now: ['বুকিং করুন', 'Book now'],
  view_menu: ['মেনু দেখুন', 'View menu'], view_services: ['সব সেবা দেখুন', 'See all services'], call_us: ['কল করুন', 'Call us'],
  lang_btn: ['English', 'বাংলা'],
  how_title: ['অর্ডার করা খুবই সহজ', 'Ordering is simple'],
  how1_t: ['খাবার বেছে নিন', 'Pick your dishes'], how1_d: ['মেনু থেকে পছন্দের খাবার কার্টে যোগ করুন। লগইন লাগবে না।', 'Add dishes to your cart from the menu. No login needed.'],
  how2_t: ['অর্ডার পাঠান', 'Send the order'], how2_d: ['টেবিল নম্বর বা নাম দিন — অর্ডার সরাসরি কিচেনে চলে যাবে।', 'Enter your table number or name — the order goes straight to the kitchen.'],
  how3_t: ['স্ট্যাটাস দেখুন', 'Follow the status'], how3_d: ['প্রস্তুত হচ্ছে → রেডি → সম্পন্ন। রেডি হলে নিয়ে নিন।', 'Preparing → Ready → Completed. Pick it up when it is ready.'],
  popular: ['জনপ্রিয় খাবার', 'Popular dishes'], services_h: ['আমাদের সেবা', 'What we offer'],
  gallery_h: ['আয়োজনের ঝলক', 'Moments at Red Carpet'], gallery_p: ['বিয়ের সাজ, কনভেনশন হল আর রেস্টুরেন্টের পরিবেশের কিছু ছবি।', 'A few pictures of our weddings, halls and dining room.'],
  menu_h: ['আমাদের মেনু', 'Our menu'], menu_p: ['থাই, চাইনিজ, স্যুপ, সিজলিং, সেট মিল ও ফাস্টফুড — দাম টাকায়।', 'Thai, Chinese, soups, sizzling, set meals and fast food — prices in BDT.'],
  search_ph: ['খাবার খুঁজুন (যেমন: স্যুপ, বিফ, প্রন)', 'Search dishes (e.g. soup, beef, prawn)'], all_cat: ['সব খাবার', 'All dishes'],
  no_results: ['এই নামে কোনো খাবার পাওয়া যায়নি।', 'No dishes match your search.'], add: ['কার্টে যোগ করুন', 'Add to cart'], sold_out: ['আজ শেষ', 'Sold out'],
  cart: ['আপনার কার্ট', 'Your cart'], cart_empty: ['কার্ট খালি। মেনু থেকে খাবার যোগ করুন।', 'Your cart is empty. Add dishes from the menu.'],
  total: ['মোট', 'Total'], place_order: ['অর্ডার পাঠান', 'Place order'], placing: ['পাঠানো হচ্ছে…', 'Sending…'],
  dine_in: ['টেবিলে খাব', 'Dine in'], takeaway: ['নিয়ে যাব', 'Takeaway'], table_no: ['টেবিল নম্বর', 'Table number'], choose_table: ['টেবিল বাছুন', 'Choose table'],
  your_name: ['আপনার নাম', 'Your name'], opt: ['ঐচ্ছিক', 'optional'], phone: ['ফোন নম্বর', 'Phone number'], note: ['কিচেনের জন্য নোট', 'Note for the kitchen'],
  note_ph: ['যেমন: ঝাল কম, পেঁয়াজ ছাড়া', 'e.g. less spicy, no onion'], need_table: ['টেবিল নম্বর বাছুন।', 'Please choose a table.'], need_name: ['নাম লিখুন।', 'Please enter your name.'],
  ordering_closed: ['এই মুহূর্তে অনলাইন অর্ডার বন্ধ আছে।', 'Online ordering is paused right now.'], order_fail: ['অর্ডার পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।', 'Could not send the order. Check your connection and try again.'],
  added: ['কার্টে যোগ হয়েছে', 'Added to cart'], items: ['টি আইটেম', 'items'], view_cart: ['কার্ট দেখুন', 'View cart'], remove: ['সরান', 'Remove'],
  order_no: ['অর্ডার নম্বর', 'Order number'], track_h: ['আপনার অর্ডারের অবস্থা', 'Your order status'], track_none: ['কোনো অর্ডার পাওয়া যায়নি। মেনু থেকে অর্ডার করুন।', 'No order found. Order from the menu first.'],
  st_preparing: ['প্রস্তুত হচ্ছে', 'Preparing'], st_ready: ['রেডি', 'Ready'], st_completed: ['সম্পন্ন', 'Completed'], st_cancelled: ['বাতিল', 'Cancelled'],
  st_preparing_d: ['কিচেন আপনার খাবার বানাচ্ছে।', 'The kitchen is making your food.'], st_ready_d: ['আপনার খাবার রেডি! অর্ডার নম্বর বলে নিয়ে নিন।', 'Your food is ready! Pick it up with your order number.'],
  st_completed_d: ['অর্ডার সম্পন্ন। ধন্যবাদ, আবার আসবেন!', 'Order complete. Thank you — see you again!'], st_cancelled_d: ['এই অর্ডার বাতিল হয়েছে। বিস্তারিত জানতে কাউন্টারে যোগাযোগ করুন।', 'This order was cancelled. Please ask at the counter.'],
  your_items: ['আপনার অর্ডার', 'Your order'], recent_orders: ['আগের অর্ডার', 'Recent orders'], order_more: ['আরও অর্ডার করুন', 'Order more'], for_table: ['টেবিল', 'Table'],
  b_title: ['ইভেন্ট বা টেবিল বুক করুন', 'Book an event or a table'], b_p: ['ফর্ম পূরণ করুন — আপনার তথ্য সরাসরি মালিকের কাছে পৌঁছে যাবে এবং আমরা আপনাকে ফোন করে নিশ্চিত করব।', 'Fill in the form — your details go straight to the owner and we will call to confirm.'],
  b_name: ['আপনার পুরো নাম', 'Your full name'], b_phone: ['ফোন নম্বর', 'Phone number'], b_type: ['কী বুক করতে চান', 'What would you like to book'], b_date: ['তারিখ', 'Preferred date'],
  b_time: ['সময়', 'Time'], b_guests: ['অতিথির সংখ্যা', 'Number of guests'], b_note: ['অতিরিক্ত তথ্য', 'Extra details'], b_send: ['বুকিং অনুরোধ পাঠান', 'Send booking request'],
  b_ok_t: ['আপনার বুকিং অনুরোধ পাঠানো হয়েছে', 'Your booking request is sent'], b_ok_d: ['মালিক আপনার তথ্য দেখতে পাচ্ছেন। শীঘ্রই আপনাকে ফোন করে নিশ্চিত করা হবে।', 'The owner can see your details. We will call you soon to confirm.'],
  b_fail: ['বুকিং পাঠানো যায়নি। আবার চেষ্টা করুন বা সরাসরি কল করুন।', 'Could not send the booking. Try again or call us.'], b_another: ['আরেকটি বুকিং', 'Make another booking'],
  location: ['ঠিকানা', 'Location'], hotline: ['কল / বুকিং হটলাইন', 'Call / booking hotline'], hours: ['খোলা থাকে', 'Opening hours'], whatsapp: ['হোয়াটসঅ্যাপে মেসেজ', 'Message on WhatsApp'],
  t_wedding: ['ডেস্টিনেশন ওয়েডিং', 'Destination Wedding'], t_convention: ['কনভেনশন সেন্টার', 'Convention Centre'], t_corporate: ['কর্পোরেট কনফারেন্স', 'Corporate Conference'],
  t_party: ['পার্টি হল', 'Party Hall'], t_table: ['রেস্টুরেন্ট টেবিল / ফ্যামিলি গেট-টুগেদার', 'Restaurant table / Family get-together'],
  cta_t: ['টেবিলে বসেই অর্ডার করুন', 'Order right from your table'], cta_p: ['কাউন্টারে লাইন নেই — ফোন থেকে অর্ডার দিন, কিচেন সরাসরি দেখবে।', 'No queue at the counter — order from your phone and the kitchen sees it instantly.'],
  quick_links: ['দ্রুত লিংক', 'Quick links'], contact_info: ['যোগাযোগ', 'Contact'], book_events: ['বুকিং ও ইভেন্ট', 'Bookings & events'], book_events_p: ['আপনার ভেন্যু বা টেবিল আজই বুক করুন।', 'Reserve your venue or table today.'],
  rights: ['সর্বস্বত্ব সংরক্ষিত।', 'All rights reserved.'], demo_banner: ['⚠ ডেমো মোড: এই ডেটা শুধু এই ব্রাউজারে থাকছে। লাইভ করতে js/config.js-এ Firebase বসান।', '⚠ Demo mode: data stays in this browser only. Add your Firebase keys in js/config.js to go live.'],
  running_order: ['আপনার চলমান অর্ডার', 'Your running order'], add_to_order: ['এই অর্ডারেই যোগ করুন', 'Add to this order'], new_order: ['নতুন অর্ডার দিন', 'Place a new order'],
  prev_total: ['আগের মোট', 'Previous total'], new_items: ['এইবারের খাবার', 'This time'], new_total: ['নতুন মোট', 'New total'], add_btn: ['অর্ডারে যোগ করুন', 'Add to order'],
  add_hint: ['একই অর্ডার নম্বরে যোগ হবে — আলাদা বিল হবে না।', 'It joins the same order number — one single bill.'],
  add_closed: ['এই অর্ডারটি আর চলমান নেই। নতুন অর্ডার দিন।', 'That order is no longer running. Please place a new order.'],
  pop_tag: ['জনপ্রিয়', 'Popular'], fab_call: ['কল করুন', 'Call'], fab_top: ['উপরে যান', 'Back to top'],
  nf_t: ['পেজটি পাওয়া যায়নি', 'Page not found'], nf_p: ['আপনি যে লিংকে এসেছেন সেটি আর নেই।', 'The link you followed does not exist.'], go_home: ['হোমে ফিরুন', 'Back to home']
};
export const ui = k => (U[k] ? U[k][lang === 'en' ? 1 : 0] : k);
export const tr = v => v == null ? '' : typeof v === 'string' ? v : (v[lang] || v.bn || v.en || '');
export const money = n => '৳' + Number(n || 0).toLocaleString(lang === 'en' ? 'en-US' : 'bn-BD');
export const num = n => Number(n || 0).toLocaleString(lang === 'en' ? 'en-US' : 'bn-BD');
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function setLang(l) { lang = l; localStorage.setItem(KEY, l); document.documentElement.lang = l; location.reload(); }
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = ui(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = ui(e.dataset.i18nPh); });
}
